import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function setupTestDriver() {
  try {
    console.log('1. Registering an Admin to perform setup...');
    // We need an admin to create buses and assign drivers. 
    // We will register a temporary admin just for this script.
    const adminEmail = `admin_${Date.now()}@bus.com`;
    let adminToken;
    try {
      const adminRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Setup Admin',
        email: adminEmail,
        password: 'password123',
        role: 'admin'
      });
      adminToken = adminRes.data.data.accessToken;
      console.log('Admin registered successfully.');
    } catch (e) {
      console.error('Failed to register admin:', e.response?.data || e.message);
      return;
    }

    console.log('\n2. Registering a Driver (driver1@bus.com)...');
    let driverId;
    try {
      const driverRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Driver',
        email: 'driver4@bus.com',
        password: 'password123',
        role: 'driver' // Default is driver
      });
      driverId = driverRes.data.data.user.id;
      console.log('Driver registered successfully! (ID:', driverId, ')');
    } catch (e) {
      if (e.response?.data?.message?.includes('already exists')) {
        console.log('Driver driver1@bus.com already exists. Please log in with driver1@bus.com / password123');
        // We'd need to fetch the ID if we wanted to assign a bus, but let's assume it's fresh for now.
        return;
      }
      console.error('Failed to register driver:', e.response?.data || e.message);
      return;
    }

    console.log('\n3. Creating a Bus (BUS-101)...');
    let busId;
    try {
      const busRes = await axios.post(
        `${API_URL}/buses`,
        { busNumber: 'BUS-101', capacity: 40 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      busId = busRes.data.data._id;
      console.log('Bus created successfully! (ID:', busId, ')');
    } catch (e) {
      console.error('Failed to create bus:', e.response?.data || e.message);
      return;
    }

    console.log('\n4. Assigning Driver to Bus...');
    try {
      await axios.patch(
        `${API_URL}/buses/${busId}/assign-driver`,
        { driverId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('Driver successfully assigned to Bus!');
    } catch (e) {
      console.error('Failed to assign driver:', e.response?.data || e.message);
      return;
    }

    console.log('\n=========================================');
    console.log('✅ SETUP COMPLETE');
    console.log('You can now log into the Mobile App with:');
    console.log('Email:    driver1@bus.com');
    console.log('Password: password123');
    console.log('Assigned: BUS-101');
    console.log('=========================================');

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

setupTestDriver();
