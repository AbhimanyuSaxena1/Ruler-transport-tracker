import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  query: { role: 'admin' },
  auth: { role: 'admin' },
});

// Join the administrative monitoring room upon connecting or reconnecting
socket.on('connect', () => {
  console.log('[Admin Socket.IO] Connected to server with ID:', socket.id);
  socket.emit('joinAdminRoom');
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`[Admin Socket.IO] Reconnected after ${attemptNumber} attempts`);
  socket.emit('joinAdminRoom');
});

export default socket;
