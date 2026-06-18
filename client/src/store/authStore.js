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
              // Always re-fetch profile from Firestore on auth state change
              // so we never serve stale role/data from localStorage
              const profile = await getUserProfile(firebaseUser.uid);
              set({ user: firebaseUser, profile, loading: false, initialized: true });
            } catch (err) {
              console.error('Failed to fetch user profile:', err);
              set({ user: firebaseUser, profile: null, loading: false, initialized: true });
            }
          } else {
            set({ user: null, profile: null, loading: false, initialized: true });
          }
        });
        return unsubscribe;
      },

      logout: async () => {
        set({ user: null, profile: null });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const profile = await getUserProfile(user.uid);
          set({ profile });
        } catch (err) {
          console.error('Failed to refresh profile:', err);
        }
      },
    }),
    {
      name: 'medivault-auth',
      // Only persist the minimal role info — always verify from Firestore on init
      partialize: (state) => ({
        profile: state.profile
          ? { role: state.profile.role, name: state.profile.name }
          : null,
      }),
    }
  )
);

export default useAuthStore;
