import config from '../../config/config.js';
import busRepository from '../buses/bus.repository.js';
import incidentRepository from '../incidents/incident.repository.js';
import { getIO } from '../../config/socket.js';

class OfflineMonitoringService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    // Dynamic runtime configuration with defaults from config.js
    this.timeouts = {
      interruptedTimeoutSeconds: config.offlineMonitoring.interruptedTimeoutSeconds || 30,
      offlineTimeoutSeconds: config.offlineMonitoring.offlineTimeoutSeconds || 120,
      checkIntervalSeconds: config.offlineMonitoring.checkIntervalSeconds || 10,
      recoveryFreshnessSeconds: config.offlineMonitoring.recoveryFreshnessSeconds || 60,
    };
    // Cache of tracking status per bus to detect actual transitions: busId -> 'ONLINE' | 'SUSPECTED_OFFLINE' | 'OFFLINE' | 'INACTIVE'
    this.statusCache = new Map();
  }

  /**
   * Return current configurable timeout settings
   */
  getConfig() {
    return { ...this.timeouts };
  }

  /**
   * Update configurable timeout settings at runtime
   */
  updateConfig(newConfig = {}) {
    if (newConfig.interruptedTimeoutSeconds !== undefined) {
      this.timeouts.interruptedTimeoutSeconds = Math.max(5, parseInt(newConfig.interruptedTimeoutSeconds, 10));
    }
    if (newConfig.offlineTimeoutSeconds !== undefined) {
      this.timeouts.offlineTimeoutSeconds = Math.max(10, parseInt(newConfig.offlineTimeoutSeconds, 10));
    }
    if (newConfig.checkIntervalSeconds !== undefined) {
      this.timeouts.checkIntervalSeconds = Math.max(2, parseInt(newConfig.checkIntervalSeconds, 10));
      // Restart timer with new interval if already running
      if (this.isRunning) {
        this.stop();
        this.start();
      }
    }
    if (newConfig.recoveryFreshnessSeconds !== undefined) {
      this.timeouts.recoveryFreshnessSeconds = Math.max(5, parseInt(newConfig.recoveryFreshnessSeconds, 10));
    }
    return this.getConfig();
  }

  /**
   * Starts the centralized monitoring worker
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[OfflineMonitor] Service started. Scanning fleet every ${this.timeouts.checkIntervalSeconds}s ` +
      `(Interrupted: ${this.timeouts.interruptedTimeoutSeconds}s, Offline: ${this.timeouts.offlineTimeoutSeconds}s)`);

    // Reconstruct state immediately on startup/restart
    try {
      await this.reconstructStateOnStartup();
    } catch (err) {
      console.error('[OfflineMonitor] Error during startup state reconstruction:', err.message);
    }

    // Single efficient periodic scheduled check across all active buses
    this.timer = setInterval(() => {
      this.checkFleetOffline().catch((err) => {
        console.error('[OfflineMonitor] Error during fleet offline check:', err.message);
      });
    }, this.timeouts.checkIntervalSeconds * 1000);
  }

  /**
   * Stops the monitoring worker gracefully
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[OfflineMonitor] Service stopped.');
  }

  /**
   * Reconstructs offline state from persisted timestamps and open incidents on server start/restart
   */
  async reconstructStateOnStartup() {
    console.log('[OfflineMonitor] Reconstructing fleet offline state on startup...');
    const buses = await busRepository.findTrackableBuses();
    const now = Date.now();

    for (const bus of buses) {
      const busId = String(bus._id);
      const lastSeenTime = bus.lastLocationUpdate ? new Date(bus.lastLocationUpdate).getTime() : new Date(bus.createdAt).getTime();
      const ageSeconds = Math.floor((now - lastSeenTime) / 1000);

      if (ageSeconds >= this.timeouts.offlineTimeoutSeconds) {
        this.statusCache.set(busId, 'OFFLINE');
        await busRepository.updateTrackingStatus(busId, 'OFFLINE');

        // Ensure an open incident exists in DB without duplicates
        const openIncident = await incidentRepository.findOpenIncidentByBusId(busId);
        if (!openIncident) {
          const deduplicationKey = `BUS_OFFLINE_${busId}_OPEN`;
          await incidentRepository.createIncident({
            organizationId: bus.organizationId || 'default_org',
            busId: bus._id,
            busNumber: bus.busNumber,
            licensePlate: bus.licensePlate || '',
            driverId: bus.assignedDriver?._id || null,
            driverName: bus.assignedDriver?.name || 'Unassigned',
            routeId: bus.assignedRoute?._id || null,
            routeName: bus.assignedRoute?.routeName || 'Unassigned',
            type: 'BUS_OFFLINE',
            status: 'OPEN',
            severity: 'HIGH',
            reason: 'NO_RECENT_LOCATION',
            lastLocationAt: bus.lastLocationUpdate || bus.createdAt,
            lastKnownLocation: {
              latitude: bus.currentLocation?.latitude ?? null,
              longitude: bus.currentLocation?.longitude ?? null,
            },
            detectedAt: new Date(),
            deduplicationKey,
          });
          console.log(`[OfflineMonitor] Reconstructed open offline incident for Bus ${bus.busNumber}`);
        }
      } else if (ageSeconds >= this.timeouts.interruptedTimeoutSeconds) {
        this.statusCache.set(busId, 'SUSPECTED_OFFLINE');
        await busRepository.updateTrackingStatus(busId, 'SUSPECTED_OFFLINE');
      } else {
        this.statusCache.set(busId, 'ONLINE');
        await busRepository.updateTrackingStatus(busId, 'ONLINE');
      }
    }
  }

  /**
   * Central scheduled fleet evaluation cycle
   */
  async checkFleetOffline() {
    const buses = await busRepository.findTrackableBuses();
    const now = Date.now();

    for (const bus of buses) {
      const busId = String(bus._id);
      const currentStatus = this.statusCache.get(busId) || bus.trackingStatus || 'ONLINE';

      // Use server's last successfully received location timestamp
      const lastLocationAt = bus.lastLocationUpdate || bus.createdAt;
      const ageSeconds = Math.floor((now - new Date(lastLocationAt).getTime()) / 1000);

      if (ageSeconds >= this.timeouts.offlineTimeoutSeconds) {
        // Transition to OFFLINE if not already OFFLINE
        if (currentStatus !== 'OFFLINE') {
          await this.handleTransitionToOffline(bus, ageSeconds, lastLocationAt);
        }
      } else if (ageSeconds >= this.timeouts.interruptedTimeoutSeconds) {
        // Transition to SUSPECTED_OFFLINE if currently ONLINE
        if (currentStatus === 'ONLINE') {
          await this.handleTransitionToInterrupted(bus, ageSeconds, lastLocationAt);
        }
      } else {
        // Bus is receiving fresh pings
        if (currentStatus !== 'ONLINE') {
          this.statusCache.set(busId, 'ONLINE');
          await busRepository.updateTrackingStatus(busId, 'ONLINE');
        }
      }
    }
  }

  /**
   * Handles transition to OFFLINE: creates persistent incident, emits socket event only on transition
   */
  async handleTransitionToOffline(bus, ageSeconds, lastLocationAt) {
    const busId = String(bus._id);
    this.statusCache.set(busId, 'OFFLINE');

    // 1. Update bus tracking status in MongoDB
    await busRepository.updateTrackingStatus(busId, 'OFFLINE');

    // 2. Create persistent incident with deduplicationKey to guarantee no duplicates
    const deduplicationKey = `BUS_OFFLINE_${busId}_OPEN`;
    let incident;
    try {
      incident = await incidentRepository.createIncident({
        organizationId: bus.organizationId || 'default_org',
        busId: bus._id,
        busNumber: bus.busNumber,
        licensePlate: bus.licensePlate || '',
        driverId: bus.assignedDriver?._id || null,
        driverName: bus.assignedDriver?.name || 'Unassigned',
        routeId: bus.assignedRoute?._id || null,
        routeName: bus.assignedRoute?.routeName || 'Unassigned',
        type: 'BUS_OFFLINE',
        status: 'OPEN',
        severity: 'HIGH',
        reason: 'NO_RECENT_LOCATION',
        lastLocationAt,
        lastKnownLocation: {
          latitude: bus.currentLocation?.latitude ?? null,
          longitude: bus.currentLocation?.longitude ?? null,
        },
        detectedAt: new Date(),
        deduplicationKey,
      });
    } catch (e) {
      console.warn('[OfflineMonitor] Error creating incident or already exists:', e.message);
      incident = await incidentRepository.findOpenIncidentByBusId(busId);
    }

    if (incident) {
      await busRepository.update(busId, { lastOfflineIncident: incident._id });
    }

    // 3. Construct real-time alert payload
    const alertPayload = {
      incidentId: incident?._id || null,
      busId: bus._id,
      busNumber: bus.busNumber,
      licensePlate: bus.licensePlate || 'N/A',
      driver: bus.assignedDriver?.name || 'Unassigned',
      driverId: bus.assignedDriver?._id || null,
      route: bus.assignedRoute?.routeName || 'Unassigned',
      routeId: bus.assignedRoute?._id || null,
      lastLocationReceived: new Date(lastLocationAt).toLocaleTimeString(),
      lastLocationAt,
      timeSinceLastUpdateSeconds: ageSeconds,
      timeSinceLastUpdateFormatted: `${Math.floor(ageSeconds / 60)}m ${ageSeconds % 60}s`,
      status: 'OFFLINE',
      reason: 'No location received within timeout',
      reasonCode: 'NO_RECENT_LOCATION',
      lastKnownLocation: {
        latitude: bus.currentLocation?.latitude ?? null,
        longitude: bus.currentLocation?.longitude ?? null,
      },
      isStale: true,
      timestamp: new Date().toISOString(),
    };

    console.log(`🔴 [OfflineMonitor] Bus ${bus.busNumber} transitioned to OFFLINE (No ping for ${ageSeconds}s)`);

    // 4. Emit real-time event through existing Socket.IO infrastructure
    try {
      const io = getIO();
      // Broadcast to both admin room and global
      io.to('admin_room').emit('bus:offline', alertPayload);
      io.emit('bus:offline', alertPayload);
      io.to(`bus_${busId}`).emit('bus:offline', alertPayload);
    } catch (error) {
      console.error('[OfflineMonitor] Failed to emit bus:offline socket event:', error.message);
    }
  }

  /**
   * Handles transition to SUSPECTED_OFFLINE / INTERRUPTED
   */
  async handleTransitionToInterrupted(bus, ageSeconds, lastLocationAt) {
    const busId = String(bus._id);
    this.statusCache.set(busId, 'SUSPECTED_OFFLINE');

    await busRepository.updateTrackingStatus(busId, 'SUSPECTED_OFFLINE');

    const interruptedPayload = {
      busId: bus._id,
      busNumber: bus.busNumber,
      licensePlate: bus.licensePlate || 'N/A',
      driver: bus.assignedDriver?.name || 'Unassigned',
      driverId: bus.assignedDriver?._id || null,
      route: bus.assignedRoute?.routeName || 'Unassigned',
      lastLocationReceived: new Date(lastLocationAt).toLocaleTimeString(),
      lastLocationAt,
      timeSinceLastUpdateSeconds: ageSeconds,
      timeSinceLastUpdateFormatted: `${ageSeconds}s`,
      status: 'INTERRUPTED',
      reason: 'No location received within warning timeout',
      reasonCode: 'NO_RECENT_LOCATION',
      lastKnownLocation: {
        latitude: bus.currentLocation?.latitude ?? null,
        longitude: bus.currentLocation?.longitude ?? null,
      },
      isStale: true,
      timestamp: new Date().toISOString(),
    };

    console.log(`⚠️ [OfflineMonitor] Bus ${bus.busNumber} tracking INTERRUPTED (${ageSeconds}s without ping)`);

    try {
      const io = getIO();
      io.to('admin_room').emit('bus:tracking_interrupted', interruptedPayload);
      io.emit('bus:tracking_interrupted', interruptedPayload);
      io.to(`bus_${busId}`).emit('bus:tracking_interrupted', interruptedPayload);
    } catch (error) {
      console.error('[OfflineMonitor] Failed to emit bus:tracking_interrupted socket event:', error.message);
    }
  }

  /**
   * Called when fresh GPS update is received from the bus
   * Detects recovery, resolves incident, updates status, and emits bus:back_online
   *
   * @param {String|ObjectId} busId
   * @param {Object} updatedBus
   * @param {Object} user Authenticated user
   * @param {Object} pingData { latitude, longitude, speed, recordedAt }
   */
  async handleBusOnline(busId, updatedBus, user, { recordedAt = null } = {}) {
    const idStr = String(busId);
    const prevStatus = this.statusCache.get(idStr) || updatedBus.trackingStatus || 'ONLINE';

    // 1. Offline Queue / Historical Protection:
    // If location is stamped older than recoveryFreshnessSeconds, it cannot trigger online recovery
    if (recordedAt) {
      const recordedTime = new Date(recordedAt).getTime();
      const ageSeconds = Math.floor((Date.now() - recordedTime) / 1000);
      if (ageSeconds > this.timeouts.recoveryFreshnessSeconds) {
        console.log(`[OfflineMonitor] Received queued historical location for Bus ${updatedBus.busNumber} (${ageSeconds}s old). Ignoring for live recovery.`);
        return { recovered: false, reason: 'HISTORICAL_QUEUE_SYNC' };
      }
    }

    // 2. Mark bus ONLINE in cache and DB
    this.statusCache.set(idStr, 'ONLINE');

    // 3. If bus was previously OFFLINE or SUSPECTED_OFFLINE, trigger recovery!
    if (prevStatus === 'OFFLINE' || prevStatus === 'SUSPECTED_OFFLINE') {
      console.log(`🟢 [OfflineMonitor] Bus ${updatedBus.busNumber} has RECOVERED and is BACK ONLINE`);

      // Resolve open incidents for this bus in MongoDB
      const resolvedIncidents = await incidentRepository.resolveOpenIncidentsForBus(idStr, new Date());

      const recoveryPayload = {
        busId: updatedBus._id,
        busNumber: updatedBus.busNumber,
        licensePlate: updatedBus.licensePlate || 'N/A',
        driver: user?.name || updatedBus.assignedDriver?.name || 'Driver',
        status: 'ONLINE',
        trackingStatus: 'ONLINE',
        recoveredAt: new Date().toISOString(),
        currentLocation: updatedBus.currentLocation,
        speed: updatedBus.speed,
        resolvedIncidentsCount: resolvedIncidents.length,
        timestamp: new Date().toISOString(),
      };

      try {
        const io = getIO();
        io.to('admin_room').emit('bus:back_online', recoveryPayload);
        io.emit('bus:back_online', recoveryPayload);
        io.to(`bus_${idStr}`).emit('bus:back_online', recoveryPayload);
      } catch (error) {
        console.error('[OfflineMonitor] Failed to emit bus:back_online socket event:', error.message);
      }

      return { recovered: true, resolvedCount: resolvedIncidents.length };
    }

    return { recovered: false };
  }

  /**
   * Called when tracking is legitimately ended or disabled by driver/admin
   */
  async handleTrackingStopped(busId) {
    const idStr = String(busId);
    this.statusCache.set(idStr, 'INACTIVE');
    await busRepository.updateTrackingStatus(idStr, 'INACTIVE');

    // Resolve any open incident without alerting offline
    await incidentRepository.resolveOpenIncidentsForBus(idStr, new Date());
  }
}

export default new OfflineMonitoringService();
