import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection
    const socketInstance = io('http://192.168.1.113:3000'); // Change to 'http://your-ip-address:3000
    // const socketInstance = io('http://127.0.0.1:3000'); // Change to 'http://your-ip-address:3000
    setSocket(socketInstance);

    // Log connection status
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Clean up on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

