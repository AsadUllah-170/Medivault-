import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, profile, loading, initialized, initialize, logout, refreshProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return { user, profile, loading, initialized, logout, refreshProfile };
};
