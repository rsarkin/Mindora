import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initializeSocket = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('Cannot initialize socket: No auth token found');
        return null;
    }

    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
