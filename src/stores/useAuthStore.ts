import { create } from 'zustand';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  guestToken: string;

  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (mockProfile?: { email: string; name: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isLogoutConfirmOpen: boolean;
  openLogoutConfirm: () => void;
  closeLogoutConfirm: () => void;
  mustSetPassword: boolean;
  setPassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

function getStoredGuestToken(): string {
  if (typeof window === 'undefined') return 'guest-token-ssr';
  let token = localStorage.getItem('sniplink_guest_token');
  if (!token) {
    token = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('sniplink_guest_token', token);
  }
  return token;
}

async function parseResponseSafe(res: Response): Promise<{ success: boolean; data?: any; message?: string }> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return { success: res.ok && data.success !== false, data, message: data.message };
    } catch {
      return { success: false, message: 'Gagal memproses data JSON dari peladen.' };
    }
  }

  const rawText = await res.text().catch(() => '');
  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, message: 'Layanan autentikasi peladen (404) belum dimuat. Pastikan peladen backend berjalan versi terbaru.' };
    }
    return { success: false, message: rawText || `Kesalahan HTTP ${res.status}` };
  }

  return { success: true, message: rawText };
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sniplink_token');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: 'login',
  isLogoutConfirmOpen: false,
  mustSetPassword: false,
  guestToken: getStoredGuestToken(),

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const parsed = await parseResponseSafe(res);
        if (parsed.success && parsed.data?.user) {
          set({ 
            user: parsed.data.user, 
            mustSetPassword: Boolean(parsed.data.user.mustSetPassword),
            isLoading: false 
          });
          return;
        }
      } else if (token) {
        // Jika token tidak valid / kadaluwarsa, bersihkan token lokal
        localStorage.removeItem('sniplink_token');
      }
    } catch (err) {
      console.warn('Gagal memverifikasi sesi pengguna:', err);
    }
    set({ user: null, mustSetPassword: false, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          guestToken: get().guestToken
        })
      });

      const parsed = await parseResponseSafe(res);
      if (!parsed.success || !parsed.data?.user) {
        set({ isLoading: false });
        return { success: false, message: parsed.message || 'Gagal masuk akun.' };
      }

      if (parsed.data?.token) {
        localStorage.setItem('sniplink_token', parsed.data.token);
      }

      set({ 
        user: parsed.data.user, 
        mustSetPassword: Boolean(parsed.data.user.mustSetPassword),
        isAuthModalOpen: false, 
        isLoading: false 
      });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message || 'Koneksi ke peladen terputus.' };
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name,
          guestToken: get().guestToken
        })
      });

      const parsed = await parseResponseSafe(res);
      if (!parsed.success || !parsed.data?.user) {
        set({ isLoading: false });
        return { success: false, message: parsed.message || 'Gagal mendaftar akun baru.' };
      }

      if (parsed.data?.token) {
        localStorage.setItem('sniplink_token', parsed.data.token);
      }

      set({ user: parsed.data.user, isAuthModalOpen: false, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message || 'Koneksi ke peladen terputus.' };
    }
  },

  loginWithGoogle: async (mockProfile) => {
    set({ isLoading: true });
    try {
      const email = mockProfile?.email || 'user.google@gmail.com';
      const name = mockProfile?.name || 'Pengguna Google';

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          name,
          googleId: `goog-${Date.now()}`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          guestToken: get().guestToken
        })
      });

      const parsed = await parseResponseSafe(res);
      if (!parsed.success || !parsed.data?.user) {
        set({ isLoading: false });
        return { success: false, message: parsed.message || 'Gagal masuk lewat Google.' };
      }

      if (parsed.data?.token) {
        localStorage.setItem('sniplink_token', parsed.data.token);
      }

      set({ user: parsed.data.user, isAuthModalOpen: false, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message || 'Koneksi ke peladen terputus.' };
    }
  },


  logout: async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    } catch {}
    localStorage.removeItem('sniplink_token');
    set({ user: null, mustSetPassword: false });
  },

  setPassword: async (newPassword: string) => {
    set({ isLoading: true });
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ password: newPassword })
      });

      const parsed = await parseResponseSafe(res);
      if (!parsed.success || !parsed.data?.user) {
        set({ isLoading: false });
        return { success: false, message: parsed.message || 'Gagal menyimpan kata sandi.' };
      }

      set({
        user: parsed.data.user,
        mustSetPassword: false,
        isLoading: false
      });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message || 'Koneksi ke peladen terputus.' };
    }
  },

  openAuthModal: (tab = 'login') => {
    set({ isAuthModalOpen: true, authModalTab: tab });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },

  openLogoutConfirm: () => {
    set({ isLogoutConfirmOpen: true });
  },

  closeLogoutConfirm: () => {
    set({ isLogoutConfirmOpen: false });
  }
}));
