import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(endTime, onExpire) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!endTime) {
      setRemaining(0);
      return;
    }

    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(intervalRef.current);
        if (onExpire) onExpire();
      }
    };

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => clearInterval(intervalRef.current);
  }, [endTime, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return {
    remaining,
    minutes,
    seconds,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    isExpired: endTime ? remaining <= 0 : false,
  };
}
