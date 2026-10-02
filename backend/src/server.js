import app from './app.js';
import config from './config/config.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import http from 'http';

const startServer = () => {
  // Create HTTP server manually to pass to Socket.IO
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`  Bus Tracking Backend Server (ES Modules)`);
    console.log(`  Environment: ${config.env}`);
    console.log(`  Port:        ${config.port}`);
    console.log(`  URL:         http://localhost:${config.port}`);
    console.log(`  MongoDB:     ${config.mongo.uri}`);
    console.log(`===============================================`);
  });

  // Initiate MongoDB connection (logs connection state or helpful diagnostic)
  connectDB();

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

