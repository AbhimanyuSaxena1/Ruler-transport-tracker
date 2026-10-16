import http from 'http';
import mongoose from 'mongoose';
import app from './src/app.js';
import config from './src/config/config.js';
import { initSocket, getIO } from './src/config/socket.js';
import Bus from './src/features/buses/bus.model.js';
import User from './src/features/users/user.model.js';
import Incident from './src/features/incidents/incident.model.js';
import trackingService from './src/features/tracking/tracking.service.js';
import offlineMonitoringService from './src/features/tracking/offlineMonitoring.service.js';
import incidentRepository from './src/features/incidents/incident.repository.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 Starting Offline Detection & Incident Monitoring Tests');
  console.log('========================================================\n');

  // 1. Setup in-memory/test server & database connection
  const server = http.createServer(app);
  initSocket(server);

  const testMongoUri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/bus_tracking_test';
  try {
    await mongoose.connect(testMongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('Connected to MongoDB for testing at:', testMongoUri);
  } catch (err) {
    console.warn('Could not connect to MongoDB server at', testMongoUri);
    console.warn('Error:', err.message);
    process.exit(1);
  }

  // Clean test fixtures
  await Bus.deleteMany({ busNumber: { $regex: /^TEST-BUS-/ } });
  await Incident.deleteMany({ busNumber: { $regex: /^TEST-BUS-/ } });
  await User.deleteMany({ email: { $in: ['test_driver_offline@test.com', 'test_admin_offline@test.com'] } });

  // Create test driver & admin
  const driver = await User.create({
    name: 'Test Driver',
    email: 'test_driver_offline@test.com',
    password: 'Password123!',
    role: 'driver',
  });

  const admin = await User.create({
    name: 'Test Admin',
    email: 'test_admin_offline@test.com',
    password: 'Password123!',
    role: 'admin',
  });

  // Track socket events emitted
  const emittedEvents = [];
  const io = getIO();
  const origEmit = io.emit.bind(io);
  const origTo = io.to.bind(io);

  io.emit = (event, data) => {
    emittedEvents.push({ event, data, target: 'global' });
    return origEmit(event, data);
  };
  io.to = (room) => {
    return {
      emit: (event, data) => {
        emittedEvents.push({ event, data, target: room });
      },
    };
  };

  try {
    // -------------------------------------------------------------
    // Criterion 1: Configurable timeouts & defaults
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Configurable Thresholds ---');
    const initialConfig = offlineMonitoringService.getConfig();
    assert(initialConfig.interruptedTimeoutSeconds === 30, 'Default interrupted timeout is 30s');
    assert(initialConfig.offlineTimeoutSeconds === 120, 'Default offline timeout is 120s');

    offlineMonitoringService.updateConfig({
      interruptedTimeoutSeconds: 30,
      offlineTimeoutSeconds: 120,
      recoveryFreshnessSeconds: 60,
    });
    assert(offlineMonitoringService.getConfig().offlineTimeoutSeconds === 120, 'Runtime configuration updated successfully');

    // -------------------------------------------------------------
    // Criterion 2: Active bus with fresh location updates stays ONLINE
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Active Bus Online Tracking ---');
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-101',
      licensePlate: 'MP09 AB 1010',
      status: 'active',
      trackingEnabled: true,
      trackingStatus: 'INACTIVE',
      assignedDriver: driver._id,
    });

    driver.assignedBus = bus._id;
    await driver.save();

    await trackingService.processLocationUpdate(driver, {
      latitude: 28.6139,
      longitude: 77.2090,
      speed: 40,
      heading: 90,
    });

    const updatedBus1 = await Bus.findById(bus._id);
    assert(updatedBus1.trackingStatus === 'ONLINE', 'Bus trackingStatus is set to ONLINE on fresh ping');
    assert(updatedBus1.lastLocationUpdate !== null, 'Bus lastLocationUpdate timestamp is saved');

    // Run checkFleetOffline: should remain ONLINE
    await offlineMonitoringService.checkFleetOffline();
    assert(offlineMonitoringService.statusCache.get(String(bus._id)) === 'ONLINE', 'Active bus remains ONLINE during monitoring sweep');

    // -------------------------------------------------------------
    // Criterion 3: Warning/Interrupted transition (> 30s)
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Tracking Interrupted / Suspected Offline ---');
    emittedEvents.length = 0;
    // Simulate 35 seconds elapsed since last ping
    await Bus.findByIdAndUpdate(bus._id, {
      lastLocationUpdate: new Date(Date.now() - 35 * 1000),
    });

    await offlineMonitoringService.checkFleetOffline();
    const updatedBus2 = await Bus.findById(bus._id);
    assert(updatedBus2.trackingStatus === 'SUSPECTED_OFFLINE', 'Bus transitions to SUSPECTED_OFFLINE after 35s');
    assert(emittedEvents.some(e => e.event === 'bus:tracking_interrupted'), 'Socket event bus:tracking_interrupted was emitted');

    // -------------------------------------------------------------
    // Criterion 4: Offline Outage (> 120s) and Persistent Incident Creation
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Offline Transition & Incident Creation ---');
    emittedEvents.length = 0;
    // Simulate 125 seconds elapsed since last ping
    await Bus.findByIdAndUpdate(bus._id, {
      lastLocationUpdate: new Date(Date.now() - 125 * 1000),
    });

    await offlineMonitoringService.checkFleetOffline();
    const updatedBus3 = await Bus.findById(bus._id);
    assert(updatedBus3.trackingStatus === 'OFFLINE', 'Bus transitions to OFFLINE after 125s');
    
    const offlineEvent = emittedEvents.find(e => e.event === 'bus:offline');
    assert(offlineEvent !== undefined, 'Socket event bus:offline was emitted');
    assert(offlineEvent.data.status === 'OFFLINE', 'Offline alert payload contains status: OFFLINE');
    assert(offlineEvent.data.isStale === true, 'Offline alert payload labels location as isStale: true');
    assert(offlineEvent.data.busNumber === 'TEST-BUS-101', 'Offline alert payload contains busNumber');
    assert(offlineEvent.data.reasonCode === 'NO_RECENT_LOCATION', 'Uses neutral reason code NO_RECENT_LOCATION');

    // Verify persistent incident in MongoDB
    const openIncident = await Incident.findOne({ busId: bus._id, status: 'OPEN' });
    assert(openIncident !== null, 'Persistent Incident document was created in MongoDB');
    assert(openIncident.deduplicationKey === `BUS_OFFLINE_${bus._id}_OPEN`, 'Deduplication key matches open session');

    // -------------------------------------------------------------
    // Criterion 5: Duplicate Prevention on Repeated Monitoring Cycles
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Duplicate Prevention ---');
    emittedEvents.length = 0;
    // Run monitoring sweep again while still offline
    await offlineMonitoringService.checkFleetOffline();
    await offlineMonitoringService.checkFleetOffline();

    const incidentCount = await Incident.countDocuments({ busId: bus._id });
    assert(incidentCount === 1, 'Repeated monitoring cycles do NOT create duplicate incidents');
    assert(!emittedEvents.some(e => e.event === 'bus:offline'), 'Repeated monitoring cycles do NOT re-emit bus:offline');

    // -------------------------------------------------------------
    // Criterion 6: Incident Acknowledgment by Administrator
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Acknowledge Incident ---');
    const ackIncident = await incidentRepository.acknowledgeIncident(openIncident._id, admin._id, 'Confirmed driver cell unreachable');
    assert(ackIncident.status === 'ACKNOWLEDGED', 'Incident status updated to ACKNOWLEDGED');
    assert(ackIncident.acknowledgedBy !== null, 'Incident records acknowledgedBy');

    // -------------------------------------------------------------
    // Criterion 7: Queued Historical GPS Points Do NOT Trigger Recovery
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Historical Queue Sync Rejection ---');
    emittedEvents.length = 0;
    // Driver syncs queued offline point from 5 minutes ago
    const stalePing = await trackingService.processLocationUpdate(driver, {
      latitude: 28.6140,
      longitude: 77.2095,
      speed: 35,
      recordedAt: new Date(Date.now() - 300 * 1000).toISOString(),
    });

    assert(stalePing.queued === true, 'Historical queued point detected and tagged as queued: true');
    const stillOfflineBus = await Bus.findById(bus._id);
    assert(stillOfflineBus.trackingStatus === 'OFFLINE', 'Bus remains OFFLINE when processing historical queued GPS data');
    const stillAckIncident = await Incident.findById(openIncident._id);
    assert(stillAckIncident.status === 'ACKNOWLEDGED', 'Incident remains unrecovered after historical queued GPS data');

    // -------------------------------------------------------------
    // Criterion 8: Fresh Live Location Triggers Recovery & Resolves Incident
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Live Recovery & Incident Resolution ---');
    emittedEvents.length = 0;
    const freshPing = await trackingService.processLocationUpdate(driver, {
      latitude: 28.6150,
      longitude: 77.2100,
      speed: 45,
    });

    const recoveredBus = await Bus.findById(bus._id);
    assert(recoveredBus.trackingStatus === 'ONLINE', 'Bus returns to ONLINE on fresh live location update');
    
    const backOnlineEvent = emittedEvents.find(e => e.event === 'bus:back_online');
    assert(backOnlineEvent !== undefined, 'Socket event bus:back_online was emitted on recovery');
    assert(backOnlineEvent.data.status === 'ONLINE', 'Recovery payload contains status: ONLINE');

    const resolvedIncident = await Incident.findById(openIncident._id);
    assert(resolvedIncident.status === 'RESOLVED', 'Incident status transitioned to RESOLVED');
    assert(resolvedIncident.recoveredAt !== null, 'Incident recorded recoveredAt timestamp');
    assert(resolvedIncident.deduplicationKey.includes('RESOLVED'), 'Deduplication key updated to release open slot');

    // -------------------------------------------------------------
    // Criterion 9: Subsequent Outage Creates A New Incident
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Subsequent Outage Creates New Incident ---');
    // Fast-forward again to 130s offline
    await Bus.findByIdAndUpdate(bus._id, {
      lastLocationUpdate: new Date(Date.now() - 130 * 1000),
    });

    await offlineMonitoringService.checkFleetOffline();
    const newIncidents = await Incident.find({ busId: bus._id });
    assert(newIncidents.length === 2, 'Subsequent outage creates a second incident while retaining the first');
    const openIncidents = newIncidents.filter(i => i.status === 'OPEN');
    assert(openIncidents.length === 1, 'Only one incident is currently OPEN');

    // -------------------------------------------------------------
    // Criterion 10: Legitimate Inactivity / Tracking Disabled Does NOT Alert
    // -------------------------------------------------------------
    console.log('\n--- Test 10: Legitimate Inactivity & Disabled Tracking ---');
    emittedEvents.length = 0;
    // Driver calls stop tracking
    await trackingService.stopLocationTracking(driver);
    const stoppedBus = await Bus.findById(bus._id);
    assert(stoppedBus.status === 'inactive', 'Bus status is inactive');
    assert(stoppedBus.trackingStatus === 'INACTIVE', 'Bus trackingStatus is INACTIVE');

    // Run checkFleetOffline on stopped bus: should NOT create offline alert
    await offlineMonitoringService.checkFleetOffline();
    assert(!emittedEvents.some(e => e.event === 'bus:offline'), 'No offline alert emitted for legitimately stopped bus');

    // -------------------------------------------------------------
    // Criterion 11: Startup State Reconstruction
    // -------------------------------------------------------------
    console.log('\n--- Test 11: Startup State Reconstruction ---');
    // Create an active bus that was already past timeout before server started
    const unmonitoredBus = await Bus.create({
      busNumber: 'TEST-BUS-999',
      licensePlate: 'MP09 AB 9999',
      status: 'active',
      trackingEnabled: true,
      lastLocationUpdate: new Date(Date.now() - 200 * 1000),
    });

    offlineMonitoringService.statusCache.clear();
    await offlineMonitoringService.reconstructStateOnStartup();

    const reconstructedBus = await Bus.findById(unmonitoredBus._id);
    assert(reconstructedBus.trackingStatus === 'OFFLINE', 'Startup reconstruction sets outdated active bus to OFFLINE');
    const reconstructedIncident = await Incident.findOne({ busId: unmonitoredBus._id, status: 'OPEN' });
    assert(reconstructedIncident !== null, 'Startup reconstruction creates open incident for offline bus');

    // Cleanup test artifacts
    await Bus.deleteMany({ busNumber: { $regex: /^TEST-BUS-/ } });
    await Incident.deleteMany({ busNumber: { $regex: /^TEST-BUS-/ } });
    await User.deleteMany({ email: { $in: ['test_driver_offline@test.com', 'test_admin_offline@test.com'] } });

    console.log('\n========================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
