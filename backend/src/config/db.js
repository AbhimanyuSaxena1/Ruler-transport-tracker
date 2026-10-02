import mongoose from 'mongoose';
import config from './config.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name} (port: ${conn.connection.port})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error on ${config.mongo.uri}: ${error.message}`);
    console.warn(`[MongoDB] Note: Please ensure MongoDB is running locally on port ${config.mongo.uri.split(':').pop().split('/')[0] || '27107'}.`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to database.');
});

export default connectDB;
