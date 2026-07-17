import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  const baseUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(baseUrl, {
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const subscribeToSymbols = (symbols = []) => {
  if (!socket?.connected) return;
  socket.emit('subscribe', symbols);
};

export const unsubscribeFromSymbols = (symbols = []) => {
  if (!socket?.connected) return;
  socket.emit('unsubscribe', symbols);
};
