import app from './app.js';
import config from './config/config.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import autoSeedAdmin from './config/autoSeed.js';
import http from 'http';

const startServer = () => {
  // Create HTTP server manually to pass to Socket.IO
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  initSocket(server);

  const HOST = '0.0.0.0';
  const PORT = config.port;

  server.listen(PORT, HOST, () => {
    console.log(`===============================================`);
    console.log(`  Bus Tracking Backend Server (ES Modules)`);
    console.log(`  Environment: ${config.env}`);
    console.log(`  Host:        ${HOST}`);
    console.log(`  Port:        ${PORT}`);
    console.log(`  Listening on: http://${HOST}:${PORT}`);
    console.log(`  MongoDB:     ${config.mongo.uri}`);
    console.log(`===============================================`);
  });

  server.on('error', (error) => {
    console.error(`[Server Error] Failed to bind to ${HOST}:${PORT}:`, error);
    process.exit(1);
  });

  // Initiate MongoDB connection and ensure Admin exists
  connectDB().then((conn) => {
    if (conn) {
      autoSeedAdmin();
    } else {
      console.warn('⚠️ [MongoDB] Backend is active, but running without active database connection.');
      console.warn('   Please ensure MONGO_URI is set correctly in your Render dashboard environment variables.');
    }
  }).catch((err) => {
    console.error('⚠️ [MongoDB] Startup connection error:', err.message);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

