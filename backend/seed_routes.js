import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stop from './src/features/routes/stop.model.js';
import Route from './src/features/routes/route.model.js';
import Bus from './src/features/buses/bus.model.js';
import connectDB from './src/config/db.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('Seeding Routes and Stops...');

  // Create Stops in New Delhi (Connaught Place area)
  const stop1 = await Stop.create({
    name: 'Connaught Place',
    location: { type: 'Point', coordinates: [77.2167, 28.6315] }
  });

  const stop2 = await Stop.create({
    name: 'India Gate',
    location: { type: 'Point', coordinates: [77.2295, 28.6129] }
  });

  const stop3 = await Stop.create({
    name: 'Lodi Gardens',
    location: { type: 'Point', coordinates: [77.2197, 28.5933] }
  });

  // Create Route
  const route = await Route.create({
    routeName: 'Route 1: CP to Lodi',
    origin: 'Connaught Place',
    destination: 'Lodi Gardens',
    stops: [stop1._id, stop2._id, stop3._id],
    path: {
      type: 'LineString',
      coordinates: [
        [77.2167, 28.6315],
        [77.2200, 28.6250],
        [77.2295, 28.6129],
        [77.2250, 28.6050],
        [77.2197, 28.5933]
      ]
    }
  });

  console.log('Created Route:', route.routeName);

  console.log('Seeding Complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
