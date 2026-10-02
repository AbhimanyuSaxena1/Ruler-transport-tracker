import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/features/users/user.model.js';
import Bus from '../src/features/buses/bus.model.js';
import Route from '../src/features/routes/route.model.js';
import Stop from '../src/features/routes/stop.model.js';
import Schedule from '../src/features/schedules/schedule.model.js';
import LocationHistory from '../src/features/tracking/tracking.model.js';
import connectDB from '../src/config/db.js';

dotenv.config();

async function cleanAndSeedAdmin() {
  await connectDB();

  console.log('🧹 Clearing all dummy data from database...');
  await Promise.all([
    User.deleteMany({}),
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Stop.deleteMany({}),
    Schedule.deleteMany({}),
    LocationHistory.deleteMany({}),
  ]);

  console.log('✅ Database wiped clean.');

  console.log('👤 Creating single production Admin account...');
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@bustracker.com',
    password: 'AdminPassword123!',
    role: 'admin',
  });

  console.log('==================================================');
  console.log('🎉 PRODUCTION RESET COMPLETE');
  console.log('==================================================');
  console.log('Admin Email:    admin@bustracker.com');
  console.log('Admin Password: AdminPassword123!');
  console.log('==================================================');

  process.exit(0);
}

cleanAndSeedAdmin().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
