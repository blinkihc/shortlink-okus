import { describe, it, expect, beforeEach } from 'bun:test';
import { db, initDatabase, linkRepo } from './db';
import app from './index';

describe('SnipLink Centralized Backend & Database Tests', () => {
  beforeEach(() => {
    initDatabase();
  });

  it('should respond to /health check with status ok', async () => {
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toContain('SnipLink');
  });

  it('should fetch all links via GET /api/links', async () => {
    const res = await app.fetch(new Request('http://localhost/api/links'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should create a new shortlink via POST /api/links', async () => {
    const newSlug = `test-${Date.now()}`;
    const payload = {
      originalUrl: 'https://tokopedia.com/promo-spesial-kemilau',
      shortSlug: newSlug,
      category: 'Promo'
    };

    const res = await app.fetch(new Request('http://localhost/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.shortSlug).toBe(newSlug);
    expect(body.data.originalUrl).toBe(payload.originalUrl);

    // Pastikan tersimpan di database SQLite
    const fetched = linkRepo.getBySlug(newSlug, 'okus.me');
    expect(fetched).not.toBeNull();
    expect(fetched?.shortSlug).toBe(newSlug);
  });

  it('should reject duplicate slugs with 409 Conflict', async () => {
    const duplicateSlug = 'promo-kopi';
    const payload = {
      originalUrl: 'https://example.com/another-coffee',
      shortSlug: duplicateSlug,
      category: 'Promo'
    };

    const res = await app.fetch(new Request('http://localhost/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('should perform public 302 redirect on GET /:slug and record click analytics', async () => {
    const targetSlug = 'promo-kopi';
    const beforeLink = linkRepo.getBySlug(targetSlug, 'okus.me');
    const clicksBefore = beforeLink?.clicks || 0;

    const res = await app.fetch(new Request(`http://localhost/${targetSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': 'https://instagram.com/stories'
      },
      redirect: 'manual'
    }));

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('https://tokopedia.com/kopikenangan/promo-senin-ceria');

    const afterLink = linkRepo.getBySlug(targetSlug, 'okus.me');
    expect(afterLink?.clicks).toBe(clicksBefore + 1);
  });

  it('should perform QR scan tracking and redirect on GET /qr/:slug', async () => {
    const targetSlug = 'promo-kopi';
    const beforeLink = linkRepo.getBySlug(targetSlug, 'okus.me');
    const scansBefore = beforeLink?.scans || 0;

    const res = await app.fetch(new Request(`http://localhost/qr/${targetSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G998B)',
        'Referer': 'https://web.whatsapp.com/'
      },
      redirect: 'manual'
    }));

    expect(res.status).toBe(302);
    const afterLink = linkRepo.getBySlug(targetSlug, 'okus.me');
    expect(afterLink?.scans).toBe(scansBefore + 1);
  });

  it('should toggle pin status via PATCH /api/links/:id/pin', async () => {
    const link = linkRepo.getBySlug('promo-kopi', 'okus.me')!;
    const initialPin = link.isPinned;

    const res = await app.fetch(new Request(`http://localhost/api/links/${link.id}/pin`, {
      method: 'PATCH'
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isPinned).toBe(!initialPin);
  });

  it('should delete a link via DELETE /api/links/:id', async () => {
    // Buat link sementara
    const tempSlug = `del-${Date.now()}`;
    const created = linkRepo.create({
      originalUrl: 'https://example.com/delete-me',
      shortSlug: tempSlug,
      category: 'Promo'
    }, 'okus.me');

    const res = await app.fetch(new Request(`http://localhost/api/links/${created.id}`, {
      method: 'DELETE'
    }));

    expect(res.status).toBe(200);
    expect(linkRepo.getById(created.id, 'okus.me')).toBeNull();
  });

  it('should fetch real analytics events via GET /api/events', async () => {
    const res = await app.fetch(new Request('http://localhost/api/events'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should reset all analytics to 0 via POST /api/analytics/reset', async () => {
    const res = await app.fetch(new Request('http://localhost/api/analytics/reset', {
      method: 'POST'
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const summaryRes = await app.fetch(new Request('http://localhost/api/analytics'));
    const summaryBody = await summaryRes.json();
    expect(summaryBody.data.totalClicks).toBe(0);
    expect(summaryBody.data.totalScans).toBe(0);
  });
});
