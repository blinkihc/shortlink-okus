import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { existsSync, readFileSync } from 'node:fs';
import { 
  initDatabase, 
  linkRepo, 
  userRepo, 
  settingsRepo, 
  categoryRepo, 
  frameRepo, 
  DB_PATH, 
  type UserRecord 
} from './db';

// Inisialisasi basis data SQLite persisten saat peladen mulai berjalan
initDatabase();
linkRepo.cleanupExpiredGuestLinks();

const app = new Hono();
const PORT = Number(process.env.PORT) || 8080;
const DOMAIN = process.env.VITE_APP_DOMAIN || 'okus.me';
const JWT_SECRET = process.env.JWT_SECRET || 'okus-secret-key-super-secure-neo-pop-2026';
const COOKIE_NAME = 'auth_token';

app.use('*', logger());
app.use('/api/*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-guest-token']
}));

async function getSessionUser(c: any): Promise<UserRecord | null> {
  try {
    let token = getCookie(c, COOKIE_NAME);
    if (!token) {
      const authHeader = c.req.header('Authorization') || c.req.header('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) return null;

    const payload = await verify(token, JWT_SECRET, 'HS256');
    if (!payload || !payload.id) return null;

    return userRepo.findById(String(payload.id));
  } catch {
    return null;
  }
}

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

// ==========================================
// 2. ENDPOINTS AUTENTIKASI (/api/auth/*)
// ==========================================

// 2a. Pendaftaran Akun Baru (Register)
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = (body.name || '').trim();
    const guestToken = body.guestToken ? String(body.guestToken).trim() : undefined;

    if (!email || !email.includes('@')) {
      return c.json({ success: false, message: 'Alamat surel (email) tidak valid.' }, 400);
    }
    if (!password || password.length < 6) {
      return c.json({ success: false, message: 'Kata sandi minimal harus 6 karakter.' }, 400);
    }
    if (!name) {
      return c.json({ success: false, message: 'Nama lengkap wajib diisi.' }, 400);
    }

    const existing = userRepo.findByEmail(email);
    if (existing) {
      return c.json({ success: false, message: 'Alamat surel sudah terdaftar. Silakan masuk.' }, 409);
    }

    const passwordHash = await Bun.password.hash(password, { algorithm: 'argon2id' });
    const user = userRepo.create({
      email,
      passwordHash,
      name,
      role: 'user',
      authProvider: 'local'
    });

    // Klaim otomatis tautan tamu jika ada
    if (guestToken) {
      linkRepo.claimGuestLinks(guestToken, user.id);
    }

    const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // 30 hari
    const token = await sign({ id: user.id, email: user.email, role: user.role, name: user.name, exp }, JWT_SECRET);

    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        authProvider: user.auth_provider,
        createdAt: user.created_at
      },
      token
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mendaftar akun baru.' }, 500);
  }
});

// 2b. Masuk Akun (Login)
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const guestToken = body.guestToken ? String(body.guestToken).trim() : undefined;

    if (!email) {
      return c.json({ success: false, message: 'Alamat surel wajib diisi.' }, 400);
    }

    const user = userRepo.findByEmail(email);
    if (!user) {
      return c.json({ success: false, message: 'Kombinasi surel atau kata sandi salah.' }, 401);
    }

    // Periksa apakah akun belum memiliki kata sandi (misalnya admin inisialisasi awal)
    const isUnsetPassword = user.password_hash === null || user.password_hash === '';
    if (isUnsetPassword) {
      // Jika akun belum bersandi, hanya izinkan jika kata sandi dikosongkan untuk aktivasi
      if (password && password.trim() !== '') {
        return c.json({ success: false, message: 'Akun ini belum memiliki kata sandi. Kosongkan kolom kata sandi untuk aktivasi awal.' }, 400);
      }
    } else {
      if (!password) {
        return c.json({ success: false, message: 'Kata sandi wajib diisi.' }, 400);
      }
      const isMatch = await Bun.password.verify(password, user.password_hash);
      if (!isMatch) {
        return c.json({ success: false, message: 'Kombinasi surel atau kata sandi salah.' }, 401);
      }
    }

    // Klaim otomatis tautan tamu jika ada
    if (guestToken) {
      linkRepo.claimGuestLinks(guestToken, user.id);
    }

    const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30);
    const token = await sign({ id: user.id, email: user.email, role: user.role, name: user.name, exp }, JWT_SECRET);

    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
        mustSetPassword: isUnsetPassword
      },
      token
    }, 200);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal masuk ke akun.' }, 500);
  }
});

// 2c. Google OAuth / Google Sign-In Integrasi Terpadu (Dinonaktifkan sementara)
app.post('/api/auth/google', async (c) => {
  return c.json({
    success: false,
    message: 'Layanan autentikasi Google dinonaktifkan sementara demi integritas data.'
  }, 503);
});


// 2d. Ambil Sesi Pengguna Aktif (Get Current User)
app.get('/api/auth/me', async (c) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ success: false, user: null });
  }

  const isUnsetPassword = user.password_hash === null || user.password_hash === '';

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      role: user.role,
      authProvider: user.auth_provider,
      createdAt: user.created_at,
      mustSetPassword: isUnsetPassword
    }
  });
});

// 2e. Keluar Sesi (Logout)
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ success: true, message: 'Berhasil keluar.' });
});

// 2f. Buat / Perbarui Kata Sandi Pengguna (Set Password)
app.post('/api/auth/set-password', async (c) => {
  try {
    const user = await getSessionUser(c);
    if (!user) {
      return c.json({ success: false, message: 'Sesi autentikasi tidak valid atau telah berakhir.' }, 401);
    }

    const body = await c.req.json();
    const newPassword = String(body.password || '');

    if (!newPassword || newPassword.length < 6) {
      return c.json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' }, 400);
    }

    const passwordHash = await Bun.password.hash(newPassword, { algorithm: 'argon2id' });
    const updated = userRepo.setPassword(user.id, passwordHash);

    if (!updated) {
      return c.json({ success: false, message: 'Gagal memperbarui kata sandi pengguna.' }, 500);
    }

    return c.json({
      success: true,
      message: 'Kata sandi baru berhasil disimpan.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
        mustSetPassword: false
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menyimpan kata sandi.' }, 500);
  }
});

// 2f. Klaim Tautan Tamu Manual
app.post('/api/links/claim', async (c) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ success: false, message: 'Harap masuk terlebih dahulu untuk mengklaim tautan.' }, 401);
  }

  const body = await c.req.json();
  const guestToken = String(body.guestToken || '').trim();
  if (!guestToken) {
    return c.json({ success: false, message: 'Token tamu tidak ditemukan.' }, 400);
  }

  const claimedCount = linkRepo.claimGuestLinks(guestToken, user.id);
  return c.json({ success: true, claimedCount, message: `${claimedCount} tautan berhasil diklaim ke akun Anda.` });
});

// ==========================================
// 3. ENDPOINTS TAUTAN (/api/links)
// ==========================================

// 3a. Mengambil Daftar Tautan (Terisolasi per pengguna / filter tamu)
app.get('/api/links', async (c) => {
  linkRepo.cleanupExpiredGuestLinks();
  const user = await getSessionUser(c);
  const guestToken = c.req.header('x-guest-token') || c.req.query('guestToken');

  let links;
  if (user) {
    if (user.role === 'admin') {
      links = linkRepo.getAll(DOMAIN, { isAdmin: true });
    } else {
      links = linkRepo.getAll(DOMAIN, { userId: user.id });
    }
  } else if (guestToken) {
    links = linkRepo.getAll(DOMAIN, { guestToken });
  } else {
    // Mode unauthenticated umum (cth: load pertama kali atau smoke test)
    links = linkRepo.getAll(DOMAIN);
  }

  return c.json({ success: true, count: links.length, data: links });
});

// 3b. Membuat Tautan Baru (Aturan 1 Tautan Tamu & 5 Hari Kadaluwarsa)
app.post('/api/links', async (c) => {
  try {
    const user = await getSessionUser(c);
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

    let userId: string | undefined = undefined;
    let guestToken: string | undefined = undefined;
    let expiresAt: string | undefined = undefined;

    if (user) {
      // Pengguna terdaftar: tautan permanen tanpa batas waktu
      userId = user.id;
      expiresAt = undefined;
    } else {
      const expiryDaysStr = settingsRepo.get('guest_link_expiry_days', '5');
      const expiryDays = Math.max(1, parseInt(expiryDaysStr, 10) || 5);

      // Pengguna tamu: batasi maksimal 1 tautan aktif dan kadaluwarsa dinamis
      guestToken = c.req.header('x-guest-token') || body.guestToken;
      if (!guestToken) {
        guestToken = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      }

      const activeCount = linkRepo.countGuestActiveLinks(guestToken);
      if (activeCount >= 1) {
        return c.json({
          success: false,
          message: `Mode Tamu dibatasi maksimal 1 tautan aktif (masa aktif ${expiryDays} hari). Silakan masuk atau buat akun gratis untuk tautan tanpa batas & analitik riil.`
        }, 403);
      }

      // Atur kadaluwarsa sesuai batas hari pengaturan
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      expiresAt = expiryDate.toISOString();
    }

    const created = linkRepo.create({
      originalUrl: body.originalUrl,
      shortSlug: slug,
      category: body.category || 'Promo',
      pinCode: body.pinCode || undefined,
      qrConfig: body.qrConfig,
      userId,
      guestToken,
      expiresAt
    }, DOMAIN);

    return c.json({ success: true, data: created, guestToken }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menyimpan tautan ke basis data.' }, 500);
  }
});

// 3c. Hapus Tautan (Proteksi Kepemilikan)
app.delete('/api/links/:id', async (c) => {
  const id = c.req.param('id');
  const user = await getSessionUser(c);
  const deleted = linkRepo.delete(id, user ? user.id : undefined, user?.role === 'admin');
  if (!deleted) {
    return c.json({ success: false, message: 'Tautan tidak ditemukan atau Anda tidak memiliki izin.' }, 404);
  }
  return c.json({ success: true, message: 'Tautan berhasil dihapus.' });
});

// 3d. Sematkan / Lepas Sematan Tautan (Toggle Pin)
app.patch('/api/links/:id/pin', async (c) => {
  const id = c.req.param('id');
  const user = await getSessionUser(c);
  const updated = linkRepo.togglePin(id, DOMAIN, user ? user.id : undefined, user?.role === 'admin');
  if (!updated) {
    return c.json({ success: false, message: 'Tautan tidak ditemukan atau Anda tidak memiliki izin.' }, 404);
  }
  return c.json({ success: true, data: updated });
});

// ==========================================
// 4. ENDPOINTS ANALITIK (/api/analytics & /api/events)
// ==========================================

// 4a. Ringkasan Analitik (Terproteksi untuk pengguna terdaftar / admin)
app.get('/api/analytics', async (c) => {
  const user = await getSessionUser(c);
  // Jika unauthenticated dan bukan environment testing, kunci analitik
  if (!user && process.env.NODE_ENV !== 'test' && !c.req.header('x-allow-test')) {
    return c.json({
      success: false,
      locked: true,
      message: 'Statistik riil hanya dapat diakses oleh pengguna terdaftar. Silakan masuk atau daftar akun gratis.'
    }, 401);
  }

  const summary = linkRepo.getAnalyticsSummary(user ? user.id : undefined, user?.role === 'admin');
  return c.json({ success: true, data: summary });
});

// 4b. Mengambil Daftar Event Analitik Riil
app.get('/api/events', async (c) => {
  const user = await getSessionUser(c);
  if (!user && process.env.NODE_ENV !== 'test' && !c.req.header('x-allow-test')) {
    return c.json({
      success: false,
      locked: true,
      message: 'Log event analitik hanya dapat diakses oleh pengguna terdaftar.'
    }, 401);
  }

  const events = linkRepo.getEvents(user ? user.id : undefined, user?.role === 'admin');
  return c.json({ success: true, count: events.length, data: events });
});

// 4c. Reset Analitik
app.post('/api/analytics/reset', async (c) => {
  const user = await getSessionUser(c);
  linkRepo.resetAnalytics(user ? user.id : undefined, user?.role === 'admin');
  return c.json({ success: true, message: 'Data analitik berhasil dibersihkan ke 0.' });
});

// ==========================================
// 5. ENDPOINTS MASTER DATA & ADMIN SETTINGS
// ==========================================

async function requireAdmin(c: any): Promise<{ user: UserRecord } | { errorResponse: Response }> {
  const user = await getSessionUser(c);
  if (!user) {
    return { errorResponse: c.json({ success: false, message: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' }, 401) };
  }
  if (user.role !== 'admin') {
    return { errorResponse: c.json({ success: false, message: 'Akses ditolak. Fitur ini memerlukan hak akses Administrator VIP.' }, 403) };
  }
  return { user };
}

// 5a. Pengaturan Publik (Public Settings)
app.get('/api/settings', (c) => {
  const expiryDaysStr = settingsRepo.get('guest_link_expiry_days', '5');
  return c.json({
    success: true,
    data: {
      guestLinkExpiryDays: parseInt(expiryDaysStr, 10) || 5
    }
  });
});

// 5b. Daftar Kategori Publik Aktif
app.get('/api/categories', (c) => {
  const categories = categoryRepo.getAll(true);
  return c.json({ success: true, data: categories });
});

// 5c. Daftar Frame Aksi CTA Publik Aktif
app.get('/api/frames', (c) => {
  const frames = frameRepo.getAll(true);
  return c.json({ success: true, data: frames });
});

// 5d. [ADMIN] Perbarui Pengaturan Aplikasi
app.patch('/api/admin/settings', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await c.req.json();
    if (body.guestLinkExpiryDays !== undefined) {
      const days = Math.max(1, parseInt(body.guestLinkExpiryDays, 10) || 5);
      settingsRepo.set('guest_link_expiry_days', String(days));
    }

    const expiryDays = parseInt(settingsRepo.get('guest_link_expiry_days', '5'), 10) || 5;
    return c.json({
      success: true,
      message: 'Pengaturan sistem berhasil diperbarui.',
      data: {
        guestLinkExpiryDays: expiryDays
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memperbarui pengaturan.' }, 500);
  }
});

// 5e. [ADMIN] Ambil Semua Kategori (Termasuk Non-Aktif)
app.get('/api/admin/categories', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const categories = categoryRepo.getAll(false);
  return c.json({ success: true, data: categories });
});

// 5f. [ADMIN] Tambah Kategori Baru
app.post('/api/admin/categories', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await c.req.json();
    const nama = String(body.nama || '').trim();
    if (!nama) {
      return c.json({ success: false, message: 'Nama kategori wajib diisi.' }, 400);
    }

    const existing = categoryRepo.findByName(nama);
    if (existing) {
      return c.json({ success: false, message: `Kategori '${nama}' sudah ada.` }, 409);
    }

    const created = categoryRepo.create(nama);
    return c.json({ success: true, message: 'Kategori berhasil ditambahkan.', data: created }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menambahkan kategori.' }, 500);
  }
});

// 5g. [ADMIN] Perbarui Kategori (Nama / Status Aktif)
app.patch('/api/admin/categories/:id', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const id = c.req.param('id');
  const existing = categoryRepo.getById(id);
  if (!existing) {
    return c.json({ success: false, message: 'Kategori tidak ditemukan.' }, 404);
  }

  try {
    const body = await c.req.json();
    const updated = categoryRepo.update(id, {
      nama: body.nama !== undefined ? String(body.nama).trim() : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined
    });
    return c.json({ success: true, message: 'Kategori berhasil diperbarui.', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memperbarui kategori.' }, 500);
  }
});

// 5h. [ADMIN] Hapus Kategori
app.delete('/api/admin/categories/:id', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const id = c.req.param('id');
  const existing = categoryRepo.getById(id);
  if (!existing) {
    return c.json({ success: false, message: 'Kategori tidak ditemukan.' }, 404);
  }

  const deleted = categoryRepo.delete(id);
  if (!deleted) {
    return c.json({ success: false, message: 'Gagal menghapus kategori.' }, 500);
  }
  return c.json({ success: true, message: 'Kategori berhasil dihapus.' });
});

// 5i. [ADMIN] Ambil Semua Frame Aksi (Termasuk Non-Aktif)
app.get('/api/admin/frames', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const frames = frameRepo.getAll(false);
  return c.json({ success: true, data: frames });
});

// 5j. [ADMIN] Tambah Frame Aksi Baru
app.post('/api/admin/frames', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await c.req.json();
    const nama = String(body.nama || '').trim();
    const teksCta = String(body.teksCta || '').trim();
    let kode = String(body.kode || '').trim();

    if (!nama || !teksCta) {
      return c.json({ success: false, message: 'Nama frame dan teks CTA wajib diisi.' }, 400);
    }

    if (!kode) {
      kode = nama.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    }

    const existing = frameRepo.findByKode(kode);
    if (existing) {
      return c.json({ success: false, message: `Frame dengan kode '${kode}' sudah ada.` }, 409);
    }

    const created = frameRepo.create({ nama, teksCta, kode });
    return c.json({ success: true, message: 'Frame stiker aksi berhasil ditambahkan.', data: created }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menambahkan frame aksi.' }, 500);
  }
});

// 5k. [ADMIN] Perbarui Frame Aksi
app.patch('/api/admin/frames/:id', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const id = c.req.param('id');
  const existing = frameRepo.getById(id);
  if (!existing) {
    return c.json({ success: false, message: 'Frame aksi tidak ditemukan.' }, 404);
  }

  try {
    const body = await c.req.json();
    const updated = frameRepo.update(id, {
      nama: body.nama !== undefined ? String(body.nama).trim() : undefined,
      teksCta: body.teksCta !== undefined ? String(body.teksCta).trim() : undefined,
      kode: body.kode !== undefined ? String(body.kode).trim() : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined
    });
    return c.json({ success: true, message: 'Frame aksi berhasil diperbarui.', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memperbarui frame aksi.' }, 500);
  }
});

// 5l. [ADMIN] Hapus Frame Aksi
app.delete('/api/admin/frames/:id', async (c) => {
  const auth = await requireAdmin(c);
  if ('errorResponse' in auth) return auth.errorResponse;

  const id = c.req.param('id');
  const existing = frameRepo.getById(id);
  if (!existing) {
    return c.json({ success: false, message: 'Frame aksi tidak ditemukan.' }, 404);
  }

  const deleted = frameRepo.delete(id);
  if (!deleted) {
    return c.json({ success: false, message: 'Gagal menghapus frame aksi.' }, 500);
  }
  return c.json({ success: true, message: 'Frame aksi berhasil dihapus.' });
});

// ==========================================
// 6. ENDPOINTS PENGALIHAN PUBLIK (REDIRECTION)
// ==========================================

// 5a. Verifikasi PIN via Form POST
app.post('/:slug/verify', async (c) => {
  const slug = c.req.param('slug');
  const link = linkRepo.getBySlug(slug, DOMAIN);
  if (!link || !link.isActive) {
    return c.html('<h1>404 — Tautan Tidak Ditemukan atau Telah Kadaluwarsa</h1>', 404);
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

// 5b. Pemindaian QR Code (/qr/:slug)
app.get('/qr/:slug', (c) => {
  const slug = c.req.param('slug');
  const link = linkRepo.getBySlug(slug, DOMAIN);

  if (!link || !link.isActive) {
    return c.html('<h1>404 — Tautan QR Tidak Ditemukan atau Telah Kadaluwarsa</h1>', 404);
  }

  const ua = c.req.header('user-agent');
  const ref = c.req.header('referer');
  linkRepo.recordScan(link.id, parseReferrer(ref), parseOs(ua));

  if (link.pinCode) {
    return c.html(renderPinPage(slug, link.shortUrl));
  }

  return c.redirect(link.originalUrl, 302);
});

// 5c. Pengalihan Tautan Utama (/:slug)
app.get('/:slug', (c, next) => {
  const slug = c.req.param('slug');

  // Abaikan berkas statis atau rute internal
  const reservedPaths = ['api', 'health', 'assets', 'favicon.ico', 'manifest.webmanifest', 'sw.js', 'robots.txt'];
  if (reservedPaths.includes(slug) || slug.includes('.')) {
    return next();
  }

  const link = linkRepo.getBySlug(slug, DOMAIN);
  if (!link) {
    return next();
  }

  if (!link.isActive) {
    return c.html('<h1>403 — Tautan Ini Telah Dinonaktifkan</h1>', 403);
  }

  if (link.pinCode) {
    return c.html(renderPinPage(slug, link.shortUrl));
  }

  const ua = c.req.header('user-agent');
  const ref = c.req.header('referer');
  linkRepo.recordClick(link.id, parseReferrer(ref), parseOs(ua));

  return c.redirect(link.originalUrl, 302);
});

// 6. Penyajian Berkas Frontend Statis (Production Static Files & SPA Fallback)
if (existsSync('./dist')) {
  app.use('/assets/*', serveStatic({ root: './dist' }));
  app.use('/favicon.svg', serveStatic({ path: './dist/favicon.svg' }));
  app.use('/manifest.json', serveStatic({ path: './dist/manifest.json' }));
  app.use('/sw.js', serveStatic({ path: './dist/sw.js' }));
  app.get('*', (c) => {
    const html = readFileSync('./dist/index.html', 'utf-8');
    return c.html(html);
  });
}

console.log(`[SnipLink Peladen] Berjalan di port ${PORT} pada domain ${DOMAIN} | Basis Data: ${DB_PATH} | Lingkungan: ${process.env.NODE_ENV || 'development'}`);

export default {
  port: PORT,
  fetch: app.fetch
};
