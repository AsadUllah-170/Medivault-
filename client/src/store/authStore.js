import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthChange, getUserProfile } from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      initialize: () => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const profile = await getUserProfile(firebaseUser.uid);
              set({ user: firebaseUser, profile, loading: false, initialized: true });
            } catch (err) {
              set({ user: firebaseUser, profile: null, loading: false, initialized: true });
            }
          } else {
            set({ user: null, profile: null, loading: false, initialized: true });
          }
        });
        return unsubscribe;
      },

      logout: () => set({ user: null, profile: null }),

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        const profile = await getUserProfile(user.uid);
        set({ profile });
      },
    }),
    {
      name: 'medivault-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

export default useAuthStore;
