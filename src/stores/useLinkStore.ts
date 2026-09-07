import { create } from 'zustand';
import type { LinkItem, LinkCategory, QrStudioConfig } from '../types';
import { INITIAL_SEED_LINKS, getDb } from '../db/indexedDb';

interface LinkStoreState {
  links: LinkItem[];
  activeTab: 'home' | 'qr' | 'links' | 'analytics';
  selectedCategory: LinkCategory | 'all';
  searchQuery: string;
  qrActiveUrl: string;
  qrConfig: QrStudioConfig;
  toastMessage: string | null;
  toastSuccess: boolean;

  // Actions
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
  setActiveTab: (tab: 'home' | 'qr' | 'links' | 'analytics') => void;
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

export const useLinkStore = create<LinkStoreState>((set, get) => ({
  links: [...INITIAL_SEED_LINKS],
  activeTab: 'home',
  selectedCategory: 'all',
  searchQuery: '',
  qrActiveUrl: INITIAL_SEED_LINKS[0].shortUrl,
  qrConfig: { ...DEFAULT_QR_CONFIG },
  toastMessage: null,
  toastSuccess: true,

  initializeStore: async () => {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = getDb();
        const storedLinks = await db.links.toArray();
        if (storedLinks.length > 0) {
          set({ links: storedLinks, qrActiveUrl: storedLinks[0].shortUrl });
        } else {
          await db.links.bulkAdd(INITIAL_SEED_LINKS);
          set({ links: [...INITIAL_SEED_LINKS] });
        }
      }
    } catch (err) {
      console.warn('Gagal membaca IndexedDB, menggunakan data in-memory:', err);
    }
  },

  addLink: async (data) => {
    const now = new Date().toISOString();
    const newLink: LinkItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalUrl: data.originalUrl,
      shortSlug: data.shortSlug,
      shortUrl: `https://snip.link/${data.shortSlug}`,
      category: data.category,
      isActive: true,
      isPinned: false,
      pinCode: data.pinCode,
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

    get().showToast('Tautan ringkas berhasil dibuat!');
    return newLink;
  },

  togglePin: async (id: string) => {
    const updated = get().links.map(item => {
      if (item.id === id) {
        return { ...item, isPinned: !item.isPinned, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    set({ links: updated });

    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const target = updated.find(l => l.id === id);
        if (target) await getDb().links.put(target);
      }
    } catch (e) {
      console.error('Gagal memperbarui pin:', e);
    }
  },

  deleteLink: async (id: string) => {
    const updated = get().links.filter(l => l.id !== id);
    set({ links: updated });

    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await getDb().links.delete(id);
      }
    } catch (e) {
      console.error('Gagal menghapus tautan dari Dexie:', e);
    }
    get().showToast('Tautan berhasil dihapus.');
  },

  incrementClicks: async (id: string) => {
    const updated = get().links.map(l => l.id === id ? { ...l, clicks: l.clicks + 1 } : l);
    set({ links: updated });
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const target = updated.find(l => l.id === id);
        if (target) await getDb().links.put(target);
      }
    } catch (e) {
      console.error('Gagal update clicks:', e);
    }
  },

  incrementScans: async (id: string) => {
    const updated = get().links.map(l => l.id === id ? { ...l, scans: l.scans + 1 } : l);
    set({ links: updated });
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
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
    set({ links: [...INITIAL_SEED_LINKS], qrActiveUrl: INITIAL_SEED_LINKS[0].shortUrl });
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = getDb();
        await db.links.clear();
        await db.links.bulkAdd(INITIAL_SEED_LINKS);
      }
    } catch (e) {
      console.error('Gagal reset data:', e);
    }
    get().showToast('Data diatur ulang ke nilai awal.');
  }
}));
