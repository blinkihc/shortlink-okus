import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { existsSync } from 'node:fs';
import { initDatabase, linkRepo } from './db';

// Inisialisasi basis data SQLite persisten saat peladen mulai berjalan
initDatabase();

const app = new Hono();
const PORT = Number(process.env.PORT) || 8080;
const DOMAIN = process.env.VITE_APP_DOMAIN || 'okus.me';

app.use('*', logger());
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

function parseOs(ua: string | undefined): 'Android' | 'iOS' | 'Desktop' {
  if (!ua) return 'Desktop';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  return 'Desktop';
}

function parseReferrer(ref: string | undefined): 'WhatsApp' | 'Instagram' | 'TikTok' | 'Browser Langsung' {
  if (!ref) return 'Browser Langsung';
  if (/whatsapp|wa\.me/i.test(ref)) return 'WhatsApp';
  if (/instagram/i.test(ref)) return 'Instagram';
  if (/tiktok/i.test(ref)) return 'TikTok';
  return 'Browser Langsung';
}

function renderPinPage(slug: string, shortUrl: string, error?: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tautan Dilindungi PIN — SnipLink</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background-color: #0B132B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background-color: #131B2E; border: 3px solid #60A5FA; border-radius: 16px; padding: 28px; width: 100%; max-width: 400px; box-shadow: 6px 6px 0px #000000; text-align: center; }
    .icon { width: 52px; height: 52px; background: #1E293B; border: 2px solid #60A5FA; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #93C5FD; }
    p { font-size: 13px; color: #94A3B8; margin-bottom: 20px; line-height: 1.5; }
    .url-badge { background: #0B132B; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #38BDF8; display: inline-block; margin-bottom: 20px; }
    input { width: 100%; padding: 12px 16px; font-size: 18px; font-weight: 700; text-align: center; letter-spacing: 6px; border: 2px solid #475569; border-radius: 8px; background: #070D1E; color: #FFFFFF; outline: none; margin-bottom: 16px; transition: border-color 0.2s; }
    input:focus { border-color: #38BDF8; }
    button { width: 100%; padding: 12px; font-size: 14px; font-weight: 800; background: #0058BE; color: white; border: 2px solid #FFFFFF; border-radius: 8px; cursor: pointer; box-shadow: 3px 3px 0px #000000; transition: transform 0.1s; }
    button:active { transform: scale(0.98); }
    .error { background: rgba(239, 68, 68, 0.2); border: 1px solid #EF4444; color: #FCA5A5; font-size: 12px; font-weight: 700; padding: 8px; border-radius: 6px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>Tautan Dilindungi PIN</h1>
    <p>Masukkan 4 digit PIN keamanan untuk melanjutkan ke alamat URL tujuan.</p>
    <div class="url-badge">${shortUrl}</div>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/${slug}/verify">
      <input type="password" name="pin" maxlength="6" placeholder="••••" autofocus required />
      <button type="submit">Buka Tautan Sekarang →</button>
    </form>
  </div>
</body>
</html>`;
}

// 1. Endpoint Pemeriksaan Kesehatan (Health Check)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    domain: DOMAIN,
    timestamp: new Date().toISOString(),
    service: 'SnipLink Centralized Backend'
  });
});

// 2. Endpoint REST API: Mengambil Seluruh Tautan
app.get('/api/links', (c) => {
  const links = linkRepo.getAll(DOMAIN);
  return c.json({ success: true, count: links.length, data: links });
});

// 3. Endpoint REST API: Membuat Tautan Baru
app.post('/api/links', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.originalUrl || !body.originalUrl.startsWith('http')) {
      return c.json({ success: false, message: 'URL tidak valid. Harus diawali http:// atau https://' }, 400);
    }

    let slug = (body.shortSlug || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!slug) {
      slug = Math.random().toString(36).substring(2, 8);
    }

    // Periksa apakah slug sudah dipakai
    const existing = linkRepo.getBySlug(slug, DOMAIN);
    if (existing) {
      return c.json({ success: false, message: `Slug '${slug}' sudah digunakan. Silakan pilih slug lain.` }, 409);
    }

    const created = linkRepo.create({
      originalUrl: body.originalUrl,
      shortSlug: slug,
      category: body.category || 'Promo',
      pinCode: body.pinCode || undefined,
      qrConfig: body.qrConfig
    }, DOMAIN);

    return c.json({ success: true, data: created }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menyimpan tautan ke basis data.' }, 500);
  }
});

// 4. Endpoint REST API: Hapus Tautan
app.delete('/api/links/:id', (c) => {
  const id = c.req.param('id');
  const deleted = linkRepo.delete(id);
  if (!deleted) {
    return c.json({ success: false, message: 'Tautan tidak ditemukan' }, 404);
  }
  return c.json({ success: true, message: 'Tautan berhasil dihapus.' });
});

// 5. Endpoint REST API: Sematkan / Lepas Sematan Tautan (Toggle Pin)
app.patch('/api/links/:id/pin', (c) => {
  const id = c.req.param('id');
  const updated = linkRepo.togglePin(id, DOMAIN);
  if (!updated) {
    return c.json({ success: false, message: 'Tautan tidak ditemukan' }, 404);
  }
  return c.json({ success: true, data: updated });
});

// 6. Endpoint REST API: Ringkasan Analitik Global
app.get('/api/analytics', (c) => {
  const summary = linkRepo.getAnalyticsSummary();
  return c.json({ success: true, data: summary });
});

// 6a. Endpoint REST API: Mengambil Daftar Event Analitik Riil
app.get('/api/events', (c) => {
  const events = linkRepo.getEvents();
  return c.json({ success: true, count: events.length, data: events });
});

// 6b. Endpoint REST API: Reset Analitik ke Nol
app.post('/api/analytics/reset', (c) => {
  linkRepo.resetAnalytics();
  return c.json({ success: true, message: 'Data analitik berhasil dibersihkan ke 0.' });
});

// 7. Endpoint Verifikasi PIN via Form POST
app.post('/:slug/verify', async (c) => {
  const slug = c.req.param('slug');
  const link = linkRepo.getBySlug(slug, DOMAIN);
  if (!link || !link.isActive) {
    return c.html('<h1>404 — Tautan Tidak Ditemukan</h1>', 404);
  }

  const body = await c.req.parseBody();
  const inputPin = String(body.pin || '').trim();

  if (link.pinCode && inputPin !== link.pinCode) {
    return c.html(renderPinPage(slug, link.shortUrl, 'PIN yang Anda masukkan salah. Coba lagi.'), 401);
  }

  const ua = c.req.header('user-agent');
  const ref = c.req.header('referer');
  linkRepo.recordClick(link.id, parseReferrer(ref), parseOs(ua));

  return c.redirect(link.originalUrl, 302);
});

// 8. Rute Publik: Pemindaian QR Code (/qr/:slug)
app.get('/qr/:slug', (c) => {
  const slug = c.req.param('slug');
  const link = linkRepo.getBySlug(slug, DOMAIN);

  if (!link || !link.isActive) {
    return c.html('<h1>404 — Tautan QR Tidak Ditemukan</h1>', 404);
  }

  const ua = c.req.header('user-agent');
  const ref = c.req.header('referer');
  linkRepo.recordScan(link.id, parseReferrer(ref), parseOs(ua));

  if (link.pinCode) {
    return c.html(renderPinPage(slug, link.shortUrl));
  }

  return c.redirect(link.originalUrl, 302);
});

// 9. Rute Publik: Pengalihan Tautan Utama (/:slug)
app.get('/:slug', (c, next) => {
  const slug = c.req.param('slug');

  // Abaikan berkas statis atau rute internal SPA
  const reservedPaths = ['api', 'health', 'assets', 'favicon.ico', 'manifest.webmanifest', 'sw.js', 'robots.txt'];
  if (reservedPaths.includes(slug) || slug.includes('.')) {
    return next();
  }

  const link = linkRepo.getBySlug(slug, DOMAIN);
  if (!link) {
    // Jika bukan slug tautan, teruskan ke penyaji frontend SPA
    return next();
  }

  if (!link.isActive) {
    return c.html('<h1>403 — Tautan Ini Telah Dinonaktifkan</h1>', 403);
  }

  // Jika dilindungi PIN, tampilkan halaman input PIN
  if (link.pinCode) {
    return c.html(renderPinPage(slug, link.shortUrl));
  }

  const ua = c.req.header('user-agent');
  const ref = c.req.header('referer');
  linkRepo.recordClick(link.id, parseReferrer(ref), parseOs(ua));

  return c.redirect(link.originalUrl, 302);
});

// 10. Penyajian Berkas Frontend Statis (Production Static Files & SPA Fallback)
if (existsSync('./dist')) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', serveStatic({ path: './dist/index.html' }));
}

console.log(`[SnipLink Peladen] Berjalan di port ${PORT} pada domain ${DOMAIN}`);

export default {
  port: PORT,
  fetch: app.fetch
};
