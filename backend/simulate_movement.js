import io from 'socket.io-client';
import axios from 'axios';
import { getDistanceMeters, calculateETAMinutes } from './src/utils/geoUtils.js';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function startSimulation() {
  console.log('Fetching active buses & routes...');
  const [busesRes, routesRes] = await Promise.all([
    axios.get(`${API_URL}/buses`),
    axios.get(`${API_URL}/routes`),
  ]);

  const buses = busesRes.data.data;
  const routes = routesRes.data.data;

  if (buses.length === 0) {
    console.log('No buses found in DB.');
    return;
  }

  const bus = buses[0];
  const route = routes[0];
  console.log(`Simulating movement for Bus: ${bus.busNumber}`);

  const socket = io(SOCKET_URL);

  const path = route?.path?.coordinates || [
    [77.2167, 28.6315],
    [77.2200, 28.6250],
    [77.2295, 28.6129],
    [77.2250, 28.6050],
    [77.2197, 28.5933]
  ];

  let currentStep = 0;

  setInterval(() => {
    if (currentStep >= path.length) {
      currentStep = 0;
    }

    const [longitude, latitude] = path[currentStep];
    const speed = Math.round(35 + Math.random() * 10);

    // Calculate live ETAs for stops along route
    const stopETAs = (route?.stops || []).map((stop) => {
      const stopLat = stop.location.coordinates[1];
      const stopLng = stop.location.coordinates[0];
      const dist = getDistanceMeters(latitude, longitude, stopLat, stopLng);
      const eta = calculateETAMinutes(dist, speed);
      return {
        stopId: stop._id,
        stopName: stop.name,
        distanceMeters: dist,
        etaMinutes: eta,
        isArrived: dist <= 200,
      };
    });

    socket.emit('locationUpdate', {
      busId: bus._id,
      busNumber: bus.busNumber,
      latitude,
      longitude,
      speed,
      heading: 180,
      lastLocationUpdate: new Date(),
      stopETAs,
    });

    console.log(`[SIMULATION] Bus ${bus.busNumber} at [${latitude}, ${longitude}] | Speed: ${speed}km/h`);
    currentStep++;
  }, 2500);
}

startSimulation().catch(console.error);
