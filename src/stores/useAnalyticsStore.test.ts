import { describe, it, expect, beforeEach } from 'bun:test';
import { useAnalyticsStore } from './useAnalyticsStore';

describe('Zustand useAnalyticsStore Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    const store = useAnalyticsStore.getState();
    store.clearEvents();
  });

  it('should start with empty events after clearEvents', () => {
    const { events } = useAnalyticsStore.getState();
    expect(events.length).toBe(0);
  });

  it('should record a click event properly', async () => {
    const store = useAnalyticsStore.getState();
    const event = await store.recordClick('link-seed-1', 'WhatsApp', 'Android');

    expect(event.id).toBeDefined();
    expect(event.linkId).toBe('link-seed-1');
    expect(event.isQrScan).toBe(false);
    expect(event.referrer).toBe('WhatsApp');
    expect(event.os).toBe('Android');

    const updatedEvents = useAnalyticsStore.getState().events;
    expect(updatedEvents.length).toBe(1);
    expect(updatedEvents[0].id).toBe(event.id);
  });

  it('should record a QR scan event properly', async () => {
    const store = useAnalyticsStore.getState();
    const scanEvent = await store.recordScan('link-seed-2', 'Instagram', 'iOS');

    expect(scanEvent.isQrScan).toBe(true);
    expect(scanEvent.linkId).toBe('link-seed-2');
    expect(scanEvent.referrer).toBe('Instagram');
    expect(scanEvent.os).toBe('iOS');

    const updated = useAnalyticsStore.getState().events;
    expect(updated.length).toBe(1);
  });

  it('should calculate accurate total metrics for clicks and scans', async () => {
    const store = useAnalyticsStore.getState();
    await store.recordClick('link-1');
    await store.recordClick('link-1');
    await store.recordScan('link-1');

    const totals = store.getTotalMetrics();
    expect(totals.totalClicks).toBe(2);
    expect(totals.totalScans).toBe(1);
    expect(totals.totalAll).toBe(3);
  });

  it('should compute 7-day daily stats array', async () => {
    const store = useAnalyticsStore.getState();
    await store.recordClick('link-1');
    await store.recordScan('link-1');

    const dailyStats = store.getDailyStats(7);
    expect(dailyStats.length).toBe(7);

    // Hari ini adalah item terakhir
    const todayStat = dailyStats[dailyStats.length - 1];
    expect(todayStat.clicks).toBe(1);
    expect(todayStat.scans).toBe(1);
  });

  it('should compute referrer breakdown with correct percentages', async () => {
    const store = useAnalyticsStore.getState();
    await store.recordClick('link-1', 'WhatsApp');
    await store.recordClick('link-1', 'WhatsApp');
    await store.recordClick('link-1', 'Instagram');
    await store.recordClick('link-1', 'TikTok');

    const breakdown = store.getReferrerBreakdown();
    expect(breakdown.length).toBe(4);

    const wa = breakdown.find(b => b.referrer === 'WhatsApp');
    expect(wa?.count).toBe(2);
    expect(wa?.percentage).toBe(50); // 2 dari 4 = 50%
  });

  it('should compute OS breakdown accurately', async () => {
    const store = useAnalyticsStore.getState();
    await store.recordClick('link-1', 'WhatsApp', 'Android');
    await store.recordClick('link-1', 'WhatsApp', 'Android');
    await store.recordClick('link-1', 'WhatsApp', 'Android');
    await store.recordClick('link-1', 'WhatsApp', 'iOS');

    const osBreakdown = store.getOsBreakdown();
    expect(osBreakdown.android).toBe(3);
    expect(osBreakdown.ios).toBe(1);
    expect(osBreakdown.total).toBe(4);
    expect(osBreakdown.androidPct).toBe(75);
    expect(osBreakdown.iosPct).toBe(25);
  });
});
