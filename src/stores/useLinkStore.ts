import { create } from 'zustand';
import type { LinkItem, LinkCategory, QrStudioConfig, TabType } from '../types';
import { getDb } from '../db/indexedDb';
import { APP_CONFIG } from '../config/appConfig';
import { useAuthStore, getAuthToken } from './useAuthStore';

interface LinkStoreState {
  links: LinkItem[];
  activeTab: TabType;
  selectedCategory: LinkCategory | 'all';
  searchQuery: string;
  qrActiveUrl: string;
  qrConfig: QrStudioConfig;
  toastMessage: string | null;
  toastSuccess: boolean;

  initializeStore: () => Promise<void>;
  addLink: (linkData: {
    originalUrl: string;
    shortSlug: string;
    category: LinkCategory;
    pinCode?: string;
    qrConfig?: QrStudioConfig;
  }) => Promise<LinkItem>;
  togglePin: (id: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  incrementClicks: (id: string) => Promise<void>;
  incrementScans: (id: string) => Promise<void>;
  setActiveTab: (tab: TabType) => void;
  setSelectedCategory: (category: LinkCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setQrActiveUrl: (url: string) => void;
  updateQrConfig: (config: Partial<QrStudioConfig>) => void;
  showToast: (message: string, isSuccess?: boolean) => void;
  hideToast: () => void;
  resetToDefault: () => Promise<void>;
}

const DEFAULT_QR_CONFIG: QrStudioConfig = {
  moduleStyle: 'chunky',
  fgColor: '#0058BE',
  bgColor: '#FFFFFF',
  frameType: 'scan-me',
  frameText: 'SCAN ME!',
  hasLogo: true,
  ecLevel: 'H'
};

function checkIsMember(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(useAuthStore.getState().user || getAuthToken());
}

function getGuestToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('sniplink_guest_token');
  if (!token) {
    token = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('sniplink_guest_token', token);
  }
  return token;
}

export const useLinkStore = create<LinkStoreState>((set, get) => ({
  links: [],
  activeTab: 'home',
  selectedCategory: 'all',
  searchQuery: '',
  qrActiveUrl: '',
  qrConfig: { ...DEFAULT_QR_CONFIG },
  toastMessage: null,
  toastSuccess: true,

  initializeStore: async () => {
    const isMember = checkIsMember();
    const guestToken = !isMember ? getGuestToken() : '';
    const authToken = getAuthToken();

    const headers: Record<string, string> = {};
    if (guestToken) headers['x-guest-token'] = guestToken;
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
      const res = await fetch('/api/links', {
        credentials: 'include',
        headers
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          set({ links: body.data, qrActiveUrl: body.data.length > 0 ? body.data[0].shortUrl : '' });

          if (typeof window !== 'undefined' && 'indexedDB' in window) {
            try {
              const db = getDb();
              if (isMember) {
                // Member: data tersimpan permanen di database server, JANGAN disimpan di IndexedDB device
                await db.links.clear();
              } else {
                // Non-member: sinkronkan ke IndexedDB device lokal (maksimal 5 hari)
                await db.links.clear();
                const now = Date.now();
                const validLinks = body.data.filter((l: LinkItem) => {
                  if (l.expiresAt) return new Date(l.expiresAt).getTime() > now;
                  return true;
                });
                if (validLinks.length > 0) {
                  await db.links.bulkAdd(validLinks);
                }
              }
            } catch (err) {
              console.warn('Gagal sinkronisasi IndexedDB:', err);
            }
          }
          return;
        }
      }
    } catch {
      // API tidak terjangkau (offline / dev standalone)
    }

    // Fallback saat offline: hanya non-member yang membaca dari IndexedDB lokal device (maksimal 5 hari)
    if (!isMember) {
      try {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          const db = getDb();
          const storedLinks = await db.links.toArray();
          const now = Date.now();
          const validLinks = storedLinks.filter(l => {
            if (l.expiresAt) {
              return new Date(l.expiresAt).getTime() > now;
            }
            if (l.createdAt) {
              const age = now - new Date(l.createdAt).getTime();
              return age <= 5 * 24 * 60 * 60 * 1000;
            }
            return true;
          });

          // Bersihkan tautan kadaluwarsa (> 5 hari) dari IndexedDB lokal
          const expiredIds = storedLinks.filter(l => !validLinks.includes(l)).map(l => l.id);
          for (const expId of expiredIds) {
            await db.links.delete(expId);
          }

          set({ links: validLinks, qrActiveUrl: validLinks.length > 0 ? validLinks[0].shortUrl : '' });
        }
      } catch (err) {
        console.warn('Gagal membaca IndexedDB, menggunakan data in-memory:', err);
      }
    } else {
      // Member tidak membaca dari IndexedDB lokal
      set({ links: [], qrActiveUrl: '' });
    }
  },

  addLink: async (data) => {
    const isMember = checkIsMember();
    const guestToken = !isMember ? getGuestToken() : '';
    const authToken = getAuthToken();

    const headers: Record<string, string> = { 
      'Content-Type': 'application/json'
    };
    if (guestToken) headers['x-guest-token'] = guestToken;
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const created = body.data;
          set({ links: [created, ...get().links] });

          if (!isMember && typeof window !== 'undefined' && 'indexedDB' in window) {
            // Hanya non-member yang disimpan ke IndexedDB device lokal (maksimal 5 hari)
            try { await getDb().links.add(created); } catch {}
          }

          get().showToast('Tautan ringkas berhasil dibuat!');
          return created;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || 'Gagal menyimpan tautan.';
        get().showToast(msg, false);
        throw new Error(msg);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Mode Tamu')) {
        throw err;
      }
      // Fallback ke penyimpanan lokal jika non-member dan offline
      if (!isMember) {
        const now = new Date().toISOString();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 5);
        const newLink: LinkItem = {
          id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          originalUrl: data.originalUrl,
          shortSlug: data.shortSlug,
          shortUrl: APP_CONFIG.formatShortUrl(data.shortSlug),
          category: data.category,
          isActive: true,
          isPinned: false,
          pinCode: data.pinCode,
          expiresAt: expiryDate.toISOString(),
          createdAt: now,
          updatedAt: now,
          clicks: 0,
          scans: 0,
          qrConfig: data.qrConfig || { ...get().qrConfig }
        };

        const updated = [newLink, ...get().links];
        set({ links: updated });

        try {
          if (typeof window !== 'undefined' && 'indexedDB' in window) {
            const db = getDb();
            await db.links.add(newLink);
          }
        } catch (e) {
          console.error('Gagal menyimpan ke Dexie:', e);
        }

        get().showToast('Tautan ringkas tersimpan di perangkat lokal.');
        return newLink;
      }
      throw err;
    }
  },

  togglePin: async (id: string) => {
    const isMember = checkIsMember();
    const authToken = getAuthToken();
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const updated = get().links.map(item => {
      if (item.id === id) {
        return { ...item, isPinned: !item.isPinned, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    set({ links: updated });

    try {
      fetch(`/api/links/${id}/pin`, { method: 'PATCH', headers, credentials: 'include' }).catch(() => {});
      if (!isMember && typeof window !== 'undefined' && 'indexedDB' in window) {
        const target = updated.find(l => l.id === id);
        if (target) await getDb().links.put(target);
      }
    } catch (e) {
      console.error('Gagal memperbarui pin:', e);
    }
  },

  deleteLink: async (id: string) => {
    const isMember = checkIsMember();
    const authToken = getAuthToken();
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const updated = get().links.filter(l => l.id !== id);
    set({ links: updated });

    try {
      fetch(`/api/links/${id}`, { method: 'DELETE', headers, credentials: 'include' }).catch(() => {});
      if (!isMember && typeof window !== 'undefined' && 'indexedDB' in window) {
        await getDb().links.delete(id);
      }
    } catch (e) {
      console.error('Gagal menghapus tautan dari Dexie:', e);
    }
    get().showToast('Tautan berhasil dihapus.');
  },

  incrementClicks: async (id: string) => {
    const isMember = checkIsMember();
    const updated = get().links.map(l => l.id === id ? { ...l, clicks: l.clicks + 1 } : l);
    set({ links: updated });
    try {
      if (!isMember && typeof window !== 'undefined' && 'indexedDB' in window) {
        const target = updated.find(l => l.id === id);
        if (target) await getDb().links.put(target);
      }
    } catch (e) {
      console.error('Gagal update clicks:', e);
    }
  },

  incrementScans: async (id: string) => {
    const isMember = checkIsMember();
    const updated = get().links.map(l => l.id === id ? { ...l, scans: l.scans + 1 } : l);
    set({ links: updated });
    try {
      if (!isMember && typeof window !== 'undefined' && 'indexedDB' in window) {
        const target = updated.find(l => l.id === id);
        if (target) await getDb().links.put(target);
      }
    } catch (e) {
      console.error('Gagal update scans:', e);
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setQrActiveUrl: (url) => set({ qrActiveUrl: url }),
  updateQrConfig: (config) => set({ qrConfig: { ...get().qrConfig, ...config } }),

  showToast: (message, isSuccess = true) => {
    set({ toastMessage: message, toastSuccess: isSuccess });
    setTimeout(() => {
      if (get().toastMessage === message) {
        set({ toastMessage: null });
      }
    }, 2800);
  },

  hideToast: () => set({ toastMessage: null }),

  resetToDefault: async () => {
    const isMember = checkIsMember();
    if (!isMember) {
      try {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          const db = getDb();
          await db.links.clear();
        }
      } catch (e) {
        console.error('Gagal reset data:', e);
      }
    }
    set({ links: [], qrActiveUrl: '' });
    get().showToast('Data tautan berhasil dibersihkan.');
  }
}));

