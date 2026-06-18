import { useState, useEffect, useCallback, useRef } from 'react';

export const useSessionTimeout = (warningMinutes = 25, timeoutMinutes = 30) => {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef(null);
  const timeoutTimer = useRef(null);

  const reset = useCallback(() => {
    setShowWarning(false);
    clearTimeout(warningTimer.current);
    clearTimeout(timeoutTimer.current);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, warningMinutes * 60 * 1000);

    timeoutTimer.current = setTimeout(() => {
      // Firebase handles actual session expiry; just clear local state
      setShowWarning(false);
    }, timeoutMinutes * 60 * 1000);
  }, [warningMinutes, timeoutMinutes]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(warningTimer.current);
      clearTimeout(timeoutTimer.current);
    };
  }, [reset]);

  return { showWarning, dismissWarning: () => setShowWarning(false) };
};
