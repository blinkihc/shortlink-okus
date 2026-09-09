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

  describe('Multi-User Auth & Guest Link Rules', () => {
    const testEmail = `user-${Date.now()}@example.com`;
    const testPassword = 'rahasiaPassword123';
    let userToken = '';
    const guestToken = `test-guest-${Date.now()}`;

    it('should register a new user successfully via POST /api/auth/register', async () => {
      const res = await app.fetch(new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Budi Santoso'
        })
      }));

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe(testEmail);
      expect(body.user.role).toBe('user');
      expect(typeof body.token).toBe('string');
      userToken = body.token;
    });

    it('should reject login with wrong password via POST /api/auth/login', async () => {
      const res = await app.fetch(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongPassword'
        })
      }));

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it('should login successfully with correct password', async () => {
      const res = await app.fetch(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      }));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.name).toBe('Budi Santoso');
    });

    it('should fetch current user profile via GET /api/auth/me', async () => {
      const res = await app.fetch(new Request('http://localhost/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe(testEmail);
    });

    it('should allow guest to create 1 link with 5 days expiry', async () => {
      const guestSlug = `guest-${Date.now()}`;
      const res = await app.fetch(new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-token': guestToken
        },
        body: JSON.stringify({
          originalUrl: 'https://example.com/guest-link',
          shortSlug: guestSlug,
          category: 'Produk'
        })
      }));

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.shortSlug).toBe(guestSlug);
      expect(body.data.expiresAt).toBeDefined();

      // Validasi masa aktif sekitar 5 hari ke depan
      const expiry = new Date(body.data.expiresAt).getTime();
      const diffDays = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(4.9);
      expect(diffDays).toBeLessThanOrEqual(5.1);
    });

    it('should block guest from creating a 2nd link (403 Forbidden)', async () => {
      const res = await app.fetch(new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-token': guestToken
        },
        body: JSON.stringify({
          originalUrl: 'https://example.com/guest-link-two',
          shortSlug: `guest-two-${Date.now()}`,
          category: 'Promo'
        })
      }));

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('1 tautan aktif');
    });


    it('should auto-claim guest link when registering with guestToken', async () => {
      const claimEmail = `claim-${Date.now()}@example.com`;
      const res = await app.fetch(new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: claimEmail,
          password: 'claimPassword123',
          name: 'Klaim User',
          guestToken: guestToken
        })
      }));

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);

      // Verifikasi bahwa tautan tamu tadi sudah menjadi milik pengguna baru dan expiresAt menjadi null
      const userLinksRes = await app.fetch(new Request('http://localhost/api/links', {
        headers: { 'Authorization': `Bearer ${body.token}` }
      }));
      const userLinks = await userLinksRes.json();
      expect(userLinks.data.length).toBeGreaterThanOrEqual(1);
      const claimed = userLinks.data.find((l: any) => l.guestToken === guestToken);
      expect(claimed).toBeDefined();
      expect(claimed.expiresAt).toBeUndefined();
      expect(claimed.isClaimed).toBe(true);
    });
  });
});

