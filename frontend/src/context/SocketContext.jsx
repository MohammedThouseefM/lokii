import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Get the base URL from the same logic as api.js but without the /api suffix
        let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        if (apiUrl && !apiUrl.startsWith('http')) {
            apiUrl = `https://${apiUrl}`;
        }
        
        // Remove /api if it exists at the end
        const socketUrl = apiUrl.replace(/\/api$/, '');

        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('⚡ Socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
