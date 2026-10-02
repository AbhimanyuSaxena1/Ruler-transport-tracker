import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For development, allow all origins
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Optional: Clients can join a room specific to a bus ID
    socket.on('subscribeToBus', (busId) => {
      socket.join(`bus_${busId}`);
      console.log(`[Socket.IO] Client ${socket.id} subscribed to bus_${busId}`);
    });

    // Echo location updates for simulation purposes
    socket.on('locationUpdate', (data) => {
      socket.broadcast.emit('locationUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};
