import { useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(showId) {
  const socketRef = useRef(null);

  useEffect(() => {
    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnectionAttempts: 1,
        timeout: 2000,
      });

      socketRef.current.connect();

      socketRef.current.on('connect_error', () => {
        // Handled silently when backend socket is offline
      });
    } catch (_) {}

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (_) {}
      }
    };
  }, []);

  const socketWrapper = useMemo(() => {
    return {
      emit: (event, ...args) => {
        try {
          if (socketRef.current?.connected) {
            socketRef.current.emit(event, ...args);
          }
        } catch (_) {}
      },
      on: (event, handler) => {
        try {
          if (socketRef.current) {
            socketRef.current.on(event, handler);
          }
        } catch (_) {}
      },
      off: (event, handler) => {
        try {
          if (socketRef.current) {
            socketRef.current.off(event, handler);
          }
        } catch (_) {}
      },
      socket: socketRef,
    };
  }, []);

  return socketWrapper;
}
