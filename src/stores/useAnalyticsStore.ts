import { create } from 'zustand';
import type { ClickEvent } from '../types';
import { getDb } from '../db/indexedDb';
import { useLinkStore } from './useLinkStore';

export interface DayMetric {
  day: string;
  dateStr: string;
  clicks: number;
  scans: number;
}

export interface ReferrerMetric {
  referrer: ClickEvent['referrer'];
  count: number;
  percentage: number;
  colorClass: string;
}

export interface OsMetric {
  android: number;
  ios: number;
  desktop: number;
  total: number;
  androidPct: number;
  iosPct: number;
}

interface AnalyticsStoreState {
  events: ClickEvent[];
  isLoading: boolean;

  // Actions
  initializeAnalytics: () => Promise<void>;
  recordEvent: (eventData: {
    linkId: string;
    referrer?: ClickEvent['referrer'];
    os?: ClickEvent['os'];
    isQrScan?: boolean;
  }) => Promise<ClickEvent>;
  recordClick: (linkId: string, referrer?: ClickEvent['referrer'], os?: ClickEvent['os']) => Promise<ClickEvent>;
  recordScan: (linkId: string, referrer?: ClickEvent['referrer'], os?: ClickEvent['os']) => Promise<ClickEvent>;
  clearEvents: () => Promise<void>;

  // Metric Selectors / Calculators
  getDailyStats: (daysCount?: number) => DayMetric[];
  getReferrerBreakdown: () => ReferrerMetric[];
  getOsBreakdown: () => OsMetric;
  getTotalMetrics: () => { totalClicks: number; totalScans: number; totalAll: number };
}

// Data awal realistis untuk 7 hari terakhir
export function generateSeedEvents(): ClickEvent[] {
  const referrers: ClickEvent['referrer'][] = ['WhatsApp', 'Instagram', 'TikTok', 'Browser Langsung'];
  const osList: ClickEvent['os'][] = ['Android', 'iOS', 'Desktop'];
  const seedEvents: ClickEvent[] = [];
  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  // Distribusi jumlah event per hari mundur dari 6 hari lalu sampai hari ini
  const dailyCounts = [
    { dayOffset: 6, clicks: 55, scans: 25 },
    { dayOffset: 5, clicks: 70, scans: 40 },
    { dayOffset: 4, clicks: 85, scans: 50 },
    { dayOffset: 3, clicks: 65, scans: 35 },
    { dayOffset: 2, clicks: 90, scans: 60 },
    { dayOffset: 1, clicks: 110, scans: 75 },
    { dayOffset: 0, clicks: 80, scans: 45 },
  ];

  let idCounter = 1;
  for (const item of dailyCounts) {
    const targetDate = new Date(now - item.dayOffset * ONE_DAY_MS);
    
    // Generate Clicks
    for (let i = 0; i < item.clicks; i++) {
      const refIndex = (i % 10 < 5) ? 0 : (i % 10 < 8) ? 1 : (i % 10 < 9) ? 2 : 3;
      const osIndex = (i % 10 < 6) ? 0 : 1; // 60% Android, 40% iOS
      seedEvents.push({
        id: `event-seed-${idCounter++}`,
        linkId: 'link-seed-1',
        timestamp: new Date(targetDate.getTime() + (i * 360000) % 86400000).toISOString(),
        referrer: referrers[refIndex],
        os: osList[osIndex],
        isQrScan: false,
      });
    }

    // Generate Scans
    for (let j = 0; j < item.scans; j++) {
      const refIndex = (j % 5 < 3) ? 0 : 1;
      const osIndex = (j % 10 < 7) ? 0 : 1; // 70% Android, 30% iOS
      seedEvents.push({
        id: `event-seed-${idCounter++}`,
        linkId: 'link-seed-2',
        timestamp: new Date(targetDate.getTime() + (j * 400000) % 86400000).toISOString(),
        referrer: referrers[refIndex],
        os: osList[osIndex],
        isQrScan: true,
      });
    }
  }

  return seedEvents;
}

const INITIAL_EVENTS = generateSeedEvents();

export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => ({
  events: [...INITIAL_EVENTS],
  isLoading: false,

  initializeAnalytics: async () => {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = getDb();
        const stored = await db.events.toArray();
        if (stored.length > 0) {
          set({ events: stored });
        } else {
          await db.events.bulkAdd(INITIAL_EVENTS);
          set({ events: [...INITIAL_EVENTS] });
        }
      }
    } catch (err) {
      console.warn('Gagal membaca event dari IndexedDB, memakai data memori:', err);
    }
  },

  recordEvent: async ({ linkId, referrer = 'Browser Langsung', os = 'Android', isQrScan = false }) => {
    const newEvent: ClickEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      linkId,
      timestamp: new Date().toISOString(),
      referrer,
      os,
      isQrScan,
    };

    const updated = [...get().events, newEvent];
    set({ events: updated });

    // Sinkronisasi ke IndexedDB Dexie
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = getDb();
        await db.events.add(newEvent);
      }
    } catch (e) {
      console.error('Gagal mencatat event ke Dexie:', e);
    }

    // Sinkronisasi ke link clicks/scans di useLinkStore
    const linkStore = useLinkStore.getState();
    if (isQrScan) {
      await linkStore.incrementScans(linkId);
    } else {
      await linkStore.incrementClicks(linkId);
    }

    return newEvent;
  },

  recordClick: async (linkId, referrer = 'Browser Langsung', os = 'Android') => {
    return get().recordEvent({ linkId, referrer, os, isQrScan: false });
  },

  recordScan: async (linkId, referrer = 'WhatsApp', os = 'Android') => {
    return get().recordEvent({ linkId, referrer, os, isQrScan: true });
  },

  clearEvents: async () => {
    set({ events: [] });
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await getDb().events.clear();
      }
    } catch (e) {
      console.error('Gagal membersihkan tabel events:', e);
    }
  },

  getDailyStats: (daysCount = 7): DayMetric[] => {
    const events = get().events;
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result: DayMetric[] = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${date}`;
      const dayLabel = dayNames[d.getDay()];

      let dayClicks = 0;
      let dayScans = 0;

      for (const ev of events) {
        if (ev.timestamp.startsWith(dateKey)) {
          if (ev.isQrScan) {
            dayScans++;
          } else {
            dayClicks++;
          }
        }
      }

      result.push({
        day: dayLabel,
        dateStr: dateKey,
        clicks: dayClicks,
        scans: dayScans,
      });
    }

    return result;
  },

  getReferrerBreakdown: (): ReferrerMetric[] => {
    const events = get().events;
    const total = events.length || 1;

    const countMap: Record<ClickEvent['referrer'], number> = {
      WhatsApp: 0,
      Instagram: 0,
      TikTok: 0,
      'Browser Langsung': 0,
    };

    for (const ev of events) {
      if (ev.referrer in countMap) {
        countMap[ev.referrer]++;
      } else {
        countMap['Browser Langsung']++;
      }
    }

    const configs: { referrer: ClickEvent['referrer']; colorClass: string }[] = [
      { referrer: 'WhatsApp', colorClass: 'bg-snip-success' },
      { referrer: 'Instagram', colorClass: 'bg-snip-danger' },
      { referrer: 'TikTok', colorClass: 'bg-snip-ink' },
      { referrer: 'Browser Langsung', colorClass: 'bg-snip-accent' },
    ];

    return configs.map(c => {
      const count = countMap[c.referrer];
      const percentage = Math.round((count / total) * 100);
      return {
        referrer: c.referrer,
        count,
        percentage,
        colorClass: c.colorClass,
      };
    });
  },

  getOsBreakdown: (): OsMetric => {
    const events = get().events;
    let android = 0;
    let ios = 0;
    let desktop = 0;

    for (const ev of events) {
      if (ev.os === 'Android') android++;
      else if (ev.os === 'iOS') ios++;
      else desktop++;
    }

    const total = android + ios + desktop || 1;
    const androidPct = Math.round((android / total) * 100);
    const iosPct = Math.round((ios / total) * 100);

    return {
      android,
      ios,
      desktop,
      total,
      androidPct,
      iosPct,
    };
  },

  getTotalMetrics: () => {
    const events = get().events;
    let clicks = 0;
    let scans = 0;

    for (const ev of events) {
      if (ev.isQrScan) scans++;
      else clicks++;
    }

    return {
      totalClicks: clicks,
      totalScans: scans,
      totalAll: events.length,
    };
  },
}));
