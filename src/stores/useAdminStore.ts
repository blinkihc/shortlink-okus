import { create } from 'zustand';
import type { CategoryItem, FrameAksiItem } from '../types';
import { getAuthToken } from './useAuthStore';

interface AdminStoreState {
  guestLinkExpiryDays: number;
  categories: CategoryItem[];
  frames: FrameAksiItem[];
  isLoading: boolean;
  isSavingSettings: boolean;

  fetchPublicSettings: () => Promise<void>;
  fetchPublicCategories: () => Promise<void>;
  fetchPublicFrames: () => Promise<void>;

  fetchAdminCategories: () => Promise<void>;
  fetchAdminFrames: () => Promise<void>;

  updateGuestExpiryDays: (days: number) => Promise<{ success: boolean; message: string }>;
  addCategory: (nama: string) => Promise<{ success: boolean; message: string }>;
  updateCategory: (id: string, data: { nama?: string; isActive?: boolean }) => Promise<{ success: boolean; message: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message: string }>;

  addFrame: (data: { nama: string; teksCta: string; kode?: string }) => Promise<{ success: boolean; message: string }>;
  updateFrame: (id: string, data: { nama?: string; teksCta?: string; kode?: string; isActive?: boolean }) => Promise<{ success: boolean; message: string }>;
  deleteFrame: (id: string) => Promise<{ success: boolean; message: string }>;
}

function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  guestLinkExpiryDays: 5,
  categories: [],
  frames: [],
  isLoading: false,
  isSavingSettings: false,

  fetchPublicSettings: async () => {
    try {
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.guestLinkExpiryDays) {
          set({ guestLinkExpiryDays: body.data.guestLinkExpiryDays });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil pengaturan publik:', err);
    }
  },

  fetchPublicCategories: async () => {
    try {
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          set({ categories: body.data });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil kategori publik:', err);
    }
  },

  fetchPublicFrames: async () => {
    try {
      const res = await fetch('/api/frames', { credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          set({ frames: body.data });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil frame publik:', err);
    }
  },

  fetchAdminCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/categories', {
        credentials: 'include',
        headers: getAuthHeader()
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          set({ categories: body.data });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori admin:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAdminFrames: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/frames', {
        credentials: 'include',
        headers: getAuthHeader()
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          set({ frames: body.data });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data frame admin:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateGuestExpiryDays: async (days: number) => {
    set({ isSavingSettings: true });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeader(),
        body: JSON.stringify({ guestLinkExpiryDays: days })
      });
      const body = await res.json();
      if (res.ok && body.success) {
        set({ guestLinkExpiryDays: body.data?.guestLinkExpiryDays || days });
        return { success: true, message: body.message || 'Batas hari berhasil diperbarui.' };
      }
      return { success: false, message: body.message || 'Gagal memperbarui batas hari.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    } finally {
      set({ isSavingSettings: false });
    }
  },

  addCategory: async (nama: string) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeader(),
        body: JSON.stringify({ nama })
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminCategories();
        return { success: true, message: body.message || 'Kategori berhasil ditambahkan.' };
      }
      return { success: false, message: body.message || 'Gagal menambahkan kategori.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  },

  updateCategory: async (id: string, data: { nama?: string; isActive?: boolean }) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminCategories();
        return { success: true, message: body.message || 'Kategori berhasil diperbarui.' };
      }
      return { success: false, message: body.message || 'Gagal memperbarui kategori.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeader()
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminCategories();
        return { success: true, message: body.message || 'Kategori berhasil dihapus.' };
      }
      return { success: false, message: body.message || 'Gagal menghapus kategori.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  },

  addFrame: async (data: { nama: string; teksCta: string; kode?: string }) => {
    try {
      const res = await fetch('/api/admin/frames', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminFrames();
        return { success: true, message: body.message || 'Frame aksi berhasil ditambahkan.' };
      }
      return { success: false, message: body.message || 'Gagal menambahkan frame aksi.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  },

  updateFrame: async (id: string, data: { nama?: string; teksCta?: string; kode?: string; isActive?: boolean }) => {
    try {
      const res = await fetch(`/api/admin/frames/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminFrames();
        return { success: true, message: body.message || 'Frame aksi berhasil diperbarui.' };
      }
      return { success: false, message: body.message || 'Gagal memperbarui frame aksi.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  },

  deleteFrame: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/frames/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeader()
      });
      const body = await res.json();
      if (res.ok && body.success) {
        await get().fetchAdminFrames();
        return { success: true, message: body.message || 'Frame aksi berhasil dihapus.' };
      }
      return { success: false, message: body.message || 'Gagal menghapus frame aksi.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan jaringan.' };
    }
  }
}));
