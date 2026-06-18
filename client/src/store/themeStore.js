import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newDark = !state.darkMode;
          if (newDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDark };
        }),
      initTheme: () =>
        set((state) => {
          if (state.darkMode) {
            document.documentElement.classList.add('dark');
          }
          return state;
        }),
    }),
    { name: 'medivault-theme' }
  )
);

export default useThemeStore;
