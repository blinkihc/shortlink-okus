import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeStoreState {
  theme: ThemeMode;
  initializeTheme: () => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: 'light',

  initializeTheme: () => {
    let initialTheme: ThemeMode = 'light';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sniplink_theme') as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') {
        initialTheme = stored;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }

      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: initialTheme });
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  setTheme: (mode: ThemeMode) => {
    set({ theme: mode });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sniplink_theme', mode);
      } catch (e) {
        console.warn('Gagal menyimpan tema ke localStorage:', e);
      }

      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}));
