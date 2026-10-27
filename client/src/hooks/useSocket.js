import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket(showId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!showId) return;

    socketRef.current = io('/', {
      query: { showId },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-show', showId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-show', showId);
        socketRef.current.disconnect();
      }
    };
  }, [showId]);

  const onSeatUpdate = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-update', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('seat-update', callback);
      }
    };
  }, []);

  const onSeatLocked = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-locked', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('seat-locked', callback);
      }
    };
  }, []);

  const onSeatUnlocked = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-unlocked', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('seat-unlocked', callback);
      }
    };
  }, []);

  return { socket: socketRef, onSeatUpdate, onSeatLocked, onSeatUnlocked };
}
