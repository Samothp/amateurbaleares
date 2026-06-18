import { useState, useEffect, useCallback } from 'react';

export function useMessage(duration = 4000) {
  const [message, setMessage] = useState(null);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  return { message, showMessage, clearMessage };
}
