import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { LinkItem, LinkCategory, QrStudioConfig } from '../src/types';

export function resolveDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  const env = (process.env.NODE_ENV || process.env.APP_ENV || 'development').toLowerCase();
  if (env === 'production') {
    return './data/sniplink-production.db';
  }
  if (env === 'staging') {
    return './data/sniplink-staging.db';
  }
  if (env === 'test') {
    return './data/sniplink-test.db';
  }
  return './data/sniplink-dev.db';
}

export const DB_PATH = resolveDatabasePath();

// Pastikan folder penyimpanan data tersedia sebelum inisialisasi SQLite
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH, { create: true });

// Aktifkan mode WAL (Write-Ahead Logging) untuk konkurensi tinggi & performa baca-tulis optimal
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA synchronous = NORMAL;');

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  auth_provider: 'local' | 'google';
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppSettingRecord {
  key: string;
  value: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  nama: string;
  is_active: number;
  created_at: string;
}

export interface FrameAksiRecord {
  id: string;
  nama: string;
  teks_cta: string;
  kode: string;
  is_active: number;
  created_at: string;
}

export function initDatabase() {
  // 1. Skema Tabel Pengguna (users)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      auth_provider TEXT NOT NULL DEFAULT 'local',
      google_id TEXT UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Skema Tabel Tautan (links)
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      guest_token TEXT,
      is_claimed INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT,
      original_url TEXT NOT NULL,
      short_slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL DEFAULT 'Promo',
      pin_code TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      scans INTEGER NOT NULL DEFAULT 0,
      qr_config TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Migrasi aman untuk menambahkan kolom jika tabel links sudah dibuat sebelumnya
  try { db.run('ALTER TABLE links ADD COLUMN user_id TEXT;'); } catch {}
  try { db.run('ALTER TABLE links ADD COLUMN guest_token TEXT;'); } catch {}
  try { db.run('ALTER TABLE links ADD COLUMN is_claimed INTEGER NOT NULL DEFAULT 0;'); } catch {}
  try { db.run('ALTER TABLE links ADD COLUMN expires_at TEXT;'); } catch {}

  // 3. Skema Tabel Analitik (analytics_events)
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      link_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      referrer TEXT NOT NULL,
      os TEXT NOT NULL,
      ip_hash TEXT,
      FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
    );
  `);

  // 4. Skema Tabel Pengaturan Aplikasi (app_settings)
  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 5. Skema Tabel Kategori (kategori)
  db.run(`
    CREATE TABLE IF NOT EXISTS kategori (
      id TEXT PRIMARY KEY,
      nama TEXT UNIQUE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // 6. Skema Tabel Frame Stiker Aksi CTA (frame_aksi)
  db.run(`
    CREATE TABLE IF NOT EXISTS frame_aksi (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      teks_cta TEXT NOT NULL,
      kode TEXT UNIQUE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // Indeks untuk performa kueri
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_links_short_slug ON links(short_slug);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_links_guest_token ON links(guest_token);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links(expires_at);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON analytics_events(link_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_kategori_nama ON kategori(nama);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_frame_aksi_kode ON frame_aksi(kode);`);

  // Inisialisasi data master & admin default
  seedDefaultAdmin();
  seedDefaultSettings();
  seedDefaultCategories();
  seedDefaultFrames();

  // Data percontohan (seed dummy) HANYA diizinkan di lingkungan lokal/development jika tabel kosong.
  // Lingkungan production & staging DIJAMIN 100% bersih tanpa data tes percontohan.
  const currentEnv = (process.env.NODE_ENV || process.env.APP_ENV || 'development').toLowerCase();
  const isProductionOrStaging = currentEnv === 'production' || currentEnv === 'staging';

  if (!isProductionOrStaging) {
    const countRow = db.query('SELECT COUNT(*) as count FROM links').get() as { count: number };
    if (countRow.count === 0) {
      seedInitialLinks();
    }
  }
}

function seedDefaultSettings() {
  const now = new Date().toISOString();
  db.run(`
    INSERT OR IGNORE INTO app_settings (key, value, updated_at)
    VALUES ('guest_link_expiry_days', '5', ?)
  `, [now]);
}

function seedDefaultCategories() {
  const countRow = db.query('SELECT COUNT(*) as count FROM kategori').get() as { count: number };
  if (countRow.count === 0) {
    const now = new Date().toISOString();
    const defaultCategories = ['Promo', 'Sosial Media', 'Produk', 'Kontak'];
    const insertStmt = db.prepare('INSERT OR IGNORE INTO kategori (id, nama, is_active, created_at) VALUES (?, ?, 1, ?)');
    for (const cat of defaultCategories) {
      const id = `cat-${cat.toLowerCase().replace(/\s+/g, '-')}`;
      insertStmt.run(id, cat, now);
    }
  }
}

function seedDefaultFrames() {
  const countRow = db.query('SELECT COUNT(*) as count FROM frame_aksi').get() as { count: number };
  if (countRow.count === 0) {
    const now = new Date().toISOString();
    const defaultFrames = [
      { id: 'frm-scan-me', nama: 'Scan Me', teks_cta: 'SCAN ME!', kode: 'scan-me' },
      { id: 'frm-menu', nama: 'Menu Resto', teks_cta: 'LIHAT MENU', kode: 'menu' },
      { id: 'frm-wifi', nama: 'Koneksi WiFi', teks_cta: 'FREE WI-FI', kode: 'wifi' },
      { id: 'frm-promo', nama: 'Promo Diskon', teks_cta: 'DISKON SPESIAL', kode: 'promo' }
    ];
    const insertStmt = db.prepare('INSERT OR IGNORE INTO frame_aksi (id, nama, teks_cta, kode, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)');
    for (const f of defaultFrames) {
      insertStmt.run(f.id, f.nama, f.teks_cta, f.kode, now);
    }
  }
}

function seedDefaultAdmin() {
  const adminRow = db.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
  if (!adminRow) {
    const now = new Date().toISOString();
    db.run(`
      INSERT INTO users (id, email, password_hash, name, avatar_url, role, auth_provider, google_id, created_at, updated_at)
      VALUES (?, ?, NULL, ?, ?, 'admin', 'local', NULL, ?, ?)
    `, [
      'usr-admin-ucup',
      'admin@okus.me',
      'Bang Ucup (Admin)',
      'https://api.dicebear.com/7.x/bottts/svg?seed=UcupAdmin',
      now,
      now
    ]);
  }
}

function formatRowToLink(row: any, domain: string): LinkItem {
  let parsedQrConfig: QrStudioConfig | undefined = undefined;
  if (row.qr_config) {
    try {
      parsedQrConfig = JSON.parse(row.qr_config);
    } catch {
      parsedQrConfig = undefined;
    }
  }

  return {
    id: row.id,
    userId: row.user_id || undefined,
    guestToken: row.guest_token || undefined,
    isClaimed: Boolean(row.is_claimed),
    expiresAt: row.expires_at || undefined,
    originalUrl: row.original_url,
    shortSlug: row.short_slug,
    shortUrl: `https://${domain}/${row.short_slug}`,
    category: row.category as LinkCategory,
    isActive: Boolean(row.is_active),
    isPinned: Boolean(row.is_pinned),
    pinCode: row.pin_code || undefined,
    clicks: Number(row.clicks) || 0,
    scans: Number(row.scans) || 0,
    qrConfig: parsedQrConfig,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function seedInitialLinks() {
  const insertStmt = db.prepare(`
    INSERT INTO links (id, user_id, guest_token, is_claimed, expires_at, original_url, short_slug, category, pin_code, is_active, is_pinned, clicks, scans, qr_config, created_at, updated_at)
    VALUES ($id, $user_id, NULL, 1, NULL, $original_url, $short_slug, $category, $pin_code, $is_active, $is_pinned, $clicks, $scans, $qr_config, $created_at, $updated_at)
  `);

  const initialSeeds = [
    {
      $id: 'link-seed-1',
      $user_id: 'usr-admin-ucup',
      $original_url: 'https://tokopedia.com/kopikenangan/promo-senin-ceria',
      $short_slug: 'promo-kopi',
      $category: 'Promo',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 1,
      $clicks: 0,
      $scans: 0,
      $qr_config: JSON.stringify({
        moduleStyle: 'chunky',
        fgColor: '#0058BE',
        bgColor: '#FFFFFF',
        frameType: 'scan-me',
        frameText: 'SCAN ME!',
        hasLogo: true,
        ecLevel: 'H'
      }),
      $created_at: new Date(Date.now() - 7200000).toISOString(),
      $updated_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      $id: 'link-seed-2',
      $user_id: 'usr-admin-ucup',
      $original_url: 'https://instagram.com/rakacreative/portfolio',
      $short_slug: 'bio-creator',
      $category: 'Sosial Media',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 0,
      $clicks: 0,
      $scans: 0,
      $qr_config: JSON.stringify({
        moduleStyle: 'squircle',
        fgColor: '#FF5733',
        bgColor: '#FFFFFF',
        frameType: 'none',
        hasLogo: false,
        ecLevel: 'M'
      }),
      $created_at: new Date(Date.now() - 86400000).toISOString(),
      $updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      $id: 'link-seed-3',
      $user_id: 'usr-admin-ucup',
      $original_url: 'https://cindycoffee.menu/standar-menu',
      $short_slug: 'menu-resto',
      $category: 'Produk',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 0,
      $clicks: 0,
      $scans: 0,
      $qr_config: JSON.stringify({
        moduleStyle: 'chunky',
        fgColor: '#00875A',
        bgColor: '#FFFFFF',
        frameType: 'menu',
        frameText: 'MENU KAMI',
        hasLogo: false,
        ecLevel: 'Q'
      }),
      $created_at: new Date(Date.now() - 172800000).toISOString(),
      $updated_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const seed of initialSeeds) {
    insertStmt.run(seed);
  }
}

export const userRepo = {
  create: (data: {
    email: string;
    passwordHash?: string | null;
    name: string;
    avatarUrl?: string;
    role?: 'admin' | 'user';
    authProvider?: 'local' | 'google';
    googleId?: string | null;
  }): UserRecord => {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const role = data.role || 'user';
    const provider = data.authProvider || 'local';
    const avatar = data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`;

    db.run(`
      INSERT INTO users (id, email, password_hash, name, avatar_url, role, auth_provider, google_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.email.toLowerCase().trim(),
      data.passwordHash || null,
      data.name.trim(),
      avatar,
      role,
      provider,
      data.googleId || null,
      now,
      now
    ]);

    return userRepo.findById(id)!;
  },

  findById: (id: string): UserRecord | null => {
    return (db.query('SELECT * FROM users WHERE id = ?').get(id) as UserRecord) || null;
  },

  findByEmail: (email: string): UserRecord | null => {
    return (db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as UserRecord) || null;
  },

  findByGoogleId: (googleId: string): UserRecord | null => {
    return (db.query('SELECT * FROM users WHERE google_id = ?').get(googleId) as UserRecord) || null;
  },

  getAllUsers: (): Omit<UserRecord, 'password_hash'>[] => {
    return db.query('SELECT id, email, name, avatar_url, role, auth_provider, google_id, created_at, updated_at FROM users ORDER BY created_at DESC').all() as any[];
  },

  setPassword: (id: string, passwordHash: string): boolean => {
    const now = new Date().toISOString();
    const result = db.run(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, now, id]
    );
    return result.changes > 0;
  }
};

export const linkRepo = {
  getAll: (domain: string, filter?: { userId?: string; isAdmin?: boolean; guestToken?: string }): LinkItem[] => {
    let rows: any[] = [];
    if (filter?.isAdmin) {
      rows = db.query('SELECT * FROM links ORDER BY is_pinned DESC, created_at DESC').all();
    } else if (filter?.userId) {
      rows = db.query('SELECT * FROM links WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC').all(filter.userId);
    } else if (filter?.guestToken) {
      rows = db.query(`
        SELECT * FROM links 
        WHERE guest_token = ? AND is_claimed = 0 AND (expires_at IS NULL OR expires_at > datetime('now'))
        ORDER BY is_pinned DESC, created_at DESC
      `).all(filter.guestToken);
    } else {
      // Fallback: tampilkan semua tautan aktif
      rows = db.query('SELECT * FROM links ORDER BY is_pinned DESC, created_at DESC').all();
    }
    return rows.map(r => formatRowToLink(r, domain));
  },

  getBySlug: (slug: string, domain: string): LinkItem | null => {
    const row = db.query('SELECT * FROM links WHERE short_slug = ?').get(slug) as any;
    if (!row) return null;

    // Periksa apakah tautan tamu sudah kadaluwarsa
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      return null;
    }

    return formatRowToLink(row, domain);
  },

  getById: (id: string, domain: string): LinkItem | null => {
    const row = db.query('SELECT * FROM links WHERE id = ?').get(id);
    return row ? formatRowToLink(row, domain) : null;
  },

  countGuestActiveLinks: (guestToken: string): number => {
    const row = db.query(`
      SELECT COUNT(*) as count FROM links 
      WHERE guest_token = ? AND is_claimed = 0 AND (expires_at IS NULL OR expires_at > datetime('now'))
    `).get(guestToken) as { count: number };
    return row?.count || 0;
  },

  claimGuestLinks: (guestToken: string, userId: string): number => {
    const now = new Date().toISOString();
    const res = db.run(`
      UPDATE links 
      SET user_id = ?, expires_at = NULL, is_claimed = 1, updated_at = ?
      WHERE guest_token = ? AND (is_claimed = 0 OR user_id IS NULL)
    `, [userId, now, guestToken]);
    return res.changes;
  },

  cleanupExpiredGuestLinks: (): number => {
    const res = db.run(`
      DELETE FROM links 
      WHERE user_id IS NULL 
        AND expires_at IS NOT NULL 
        AND expires_at < datetime('now')
    `);
    return res.changes;
  },

  create: (data: {
    originalUrl: string;
    shortSlug: string;
    category: LinkCategory;
    pinCode?: string;
    qrConfig?: QrStudioConfig;
    userId?: string;
    guestToken?: string;
    expiresAt?: string;
  }, domain: string): LinkItem => {
    const now = new Date().toISOString();
    const id = `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const qrConfigStr = data.qrConfig ? JSON.stringify(data.qrConfig) : null;

    db.run(
      `INSERT INTO links (id, user_id, guest_token, is_claimed, expires_at, original_url, short_slug, category, pin_code, is_active, is_pinned, clicks, scans, qr_config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, ?, ?, ?)`,
      [
        id,
        data.userId || null,
        data.guestToken || null,
        data.userId ? 1 : 0,
        data.expiresAt || null,
        data.originalUrl,
        data.shortSlug,
        data.category,
        data.pinCode || null,
        qrConfigStr,
        now,
        now
      ]
    );

    return linkRepo.getById(id, domain)!;
  },

  delete: (id: string, requesterUserId?: string, isAdmin?: boolean): boolean => {
    if (isAdmin) {
      const res = db.run('DELETE FROM links WHERE id = ?', [id]);
      return res.changes > 0;
    }
    if (requesterUserId) {
      const res = db.run('DELETE FROM links WHERE id = ? AND user_id = ?', [id, requesterUserId]);
      return res.changes > 0;
    }
    // Jika penghapusan umum / tamu
    const res = db.run('DELETE FROM links WHERE id = ?', [id]);
    return res.changes > 0;
  },

  togglePin: (id: string, domain: string, requesterUserId?: string, isAdmin?: boolean): LinkItem | null => {
    let existing: { is_pinned: number } | null = null;
    if (isAdmin || !requesterUserId) {
      existing = db.query('SELECT is_pinned FROM links WHERE id = ?').get(id) as { is_pinned: number } | null;
    } else {
      existing = db.query('SELECT is_pinned FROM links WHERE id = ? AND user_id = ?').get(id, requesterUserId) as { is_pinned: number } | null;
    }

    if (!existing) return null;

    const newPinned = existing.is_pinned === 1 ? 0 : 1;
    db.run('UPDATE links SET is_pinned = ?, updated_at = ? WHERE id = ?', [newPinned, new Date().toISOString(), id]);
    return linkRepo.getById(id, domain);
  },

  recordClick: (linkId: string, referrer: string, os: string, ipHash?: string) => {
    const now = new Date().toISOString();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.transaction(() => {
      db.run('UPDATE links SET clicks = clicks + 1, updated_at = ? WHERE id = ?', [now, linkId]);
      db.run(
        `INSERT INTO analytics_events (id, link_id, event_type, timestamp, referrer, os, ip_hash)
         VALUES (?, ?, 'click', ?, ?, ?, ?)`,
        [eventId, linkId, now, referrer, os, ipHash || '']
      );
    })();
  },

  recordScan: (linkId: string, referrer: string, os: string, ipHash?: string) => {
    const now = new Date().toISOString();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.transaction(() => {
      db.run('UPDATE links SET scans = scans + 1, updated_at = ? WHERE id = ?', [now, linkId]);
      db.run(
        `INSERT INTO analytics_events (id, link_id, event_type, timestamp, referrer, os, ip_hash)
         VALUES (?, ?, 'qr_scan', ?, ?, ?, ?)`,
        [eventId, linkId, now, referrer, os, ipHash || '']
      );
    })();
  },

  getAnalyticsSummary: (userId?: string, isAdmin?: boolean) => {
    let totalLinks = 0;
    let totals = { totalClicks: 0, totalScans: 0 };
    let referrerRows: { referrer: string; count: number }[] = [];
    let osRows: { os: string; count: number }[] = [];

    if (isAdmin || !userId) {
      totalLinks = (db.query('SELECT COUNT(*) as count FROM links').get() as { count: number }).count;
      const res = db.query('SELECT SUM(clicks) as totalClicks, SUM(scans) as totalScans FROM links').get() as any;
      totals.totalClicks = res?.totalClicks || 0;
      totals.totalScans = res?.totalScans || 0;

      referrerRows = db.query(`
        SELECT referrer, COUNT(*) as count 
        FROM analytics_events 
        GROUP BY referrer 
        ORDER BY count DESC
      `).all() as { referrer: string; count: number }[];

      osRows = db.query(`
        SELECT os, COUNT(*) as count 
        FROM analytics_events 
        GROUP BY os 
        ORDER BY count DESC
      `).all() as { os: string; count: number }[];
    } else {
      totalLinks = (db.query('SELECT COUNT(*) as count FROM links WHERE user_id = ?').get(userId) as { count: number }).count;
      const res = db.query('SELECT SUM(clicks) as totalClicks, SUM(scans) as totalScans FROM links WHERE user_id = ?').get(userId) as any;
      totals.totalClicks = res?.totalClicks || 0;
      totals.totalScans = res?.totalScans || 0;

      referrerRows = db.query(`
        SELECT ae.referrer, COUNT(*) as count 
        FROM analytics_events ae
        JOIN links l ON ae.link_id = l.id
        WHERE l.user_id = ?
        GROUP BY ae.referrer 
        ORDER BY count DESC
      `).all(userId) as { referrer: string; count: number }[];

      osRows = db.query(`
        SELECT ae.os, COUNT(*) as count 
        FROM analytics_events ae
        JOIN links l ON ae.link_id = l.id
        WHERE l.user_id = ?
        GROUP BY ae.os 
        ORDER BY count DESC
      `).all(userId) as { os: string; count: number }[];
    }

    return {
      totalLinks,
      totalClicks: totals.totalClicks,
      totalScans: totals.totalScans,
      referrers: referrerRows,
      os: osRows
    };
  },

  getEvents: (userId?: string, isAdmin?: boolean) => {
    let rows: any[] = [];
    if (isAdmin || !userId) {
      rows = db.query(`
        SELECT id, link_id, event_type, timestamp, referrer, os 
        FROM analytics_events 
        ORDER BY timestamp DESC
      `).all();
    } else {
      rows = db.query(`
        SELECT ae.id, ae.link_id, ae.event_type, ae.timestamp, ae.referrer, ae.os 
        FROM analytics_events ae
        JOIN links l ON ae.link_id = l.id
        WHERE l.user_id = ?
        ORDER BY ae.timestamp DESC
      `).all(userId);
    }

    return rows.map(r => ({
      id: r.id,
      linkId: r.link_id,
      timestamp: r.timestamp,
      referrer: r.referrer,
      os: r.os,
      isQrScan: r.event_type === 'qr_scan'
    }));
  },

  resetAnalytics: (userId?: string, isAdmin?: boolean) => {
    db.transaction(() => {
      if (isAdmin || !userId) {
        db.run('UPDATE links SET clicks = 0, scans = 0');
        db.run('DELETE FROM analytics_events');
      } else {
        db.run('UPDATE links SET clicks = 0, scans = 0 WHERE user_id = ?', [userId]);
        db.run(`
          DELETE FROM analytics_events 
          WHERE link_id IN (SELECT id FROM links WHERE user_id = ?)
        `, [userId]);
      }
    })();
  }
};

export const settingsRepo = {
  get: (key: string, defaultValue = ''): string => {
    const row = db.query('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | null;
    return row ? row.value : defaultValue;
  },

  getAll: (): Record<string, string> => {
    const rows = db.query('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  },

  set: (key: string, value: string): void => {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, String(value), now]
    );
  }
};

export const categoryRepo = {
  getAll: (onlyActive = false): { id: string; nama: string; isActive: boolean; createdAt: string }[] => {
    const query = onlyActive 
      ? 'SELECT * FROM kategori WHERE is_active = 1 ORDER BY created_at ASC' 
      : 'SELECT * FROM kategori ORDER BY created_at ASC';
    const rows = db.query(query).all() as CategoryRecord[];
    return rows.map(r => ({
      id: r.id,
      nama: r.nama,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    }));
  },

  getById: (id: string) => {
    const r = db.query('SELECT * FROM kategori WHERE id = ?').get(id) as CategoryRecord | null;
    if (!r) return null;
    return {
      id: r.id,
      nama: r.nama,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    };
  },

  findByName: (nama: string) => {
    const r = db.query('SELECT * FROM kategori WHERE LOWER(nama) = LOWER(?)').get(nama.trim()) as CategoryRecord | null;
    if (!r) return null;
    return {
      id: r.id,
      nama: r.nama,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    };
  },

  create: (nama: string) => {
    const trimmed = nama.trim();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    db.run('INSERT INTO kategori (id, nama, is_active, created_at) VALUES (?, ?, 1, ?)', [id, trimmed, now]);
    return categoryRepo.getById(id)!;
  },

  update: (id: string, data: { nama?: string; isActive?: boolean }) => {
    const existing = categoryRepo.getById(id);
    if (!existing) return null;
    const newNama = data.nama !== undefined ? data.nama.trim() : existing.nama;
    const newActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
    db.run('UPDATE kategori SET nama = ?, is_active = ? WHERE id = ?', [newNama, newActive, id]);
    return categoryRepo.getById(id);
  },

  delete: (id: string): boolean => {
    const res = db.run('DELETE FROM kategori WHERE id = ?', [id]);
    return res.changes > 0;
  }
};

export const frameRepo = {
  getAll: (onlyActive = false): { id: string; nama: string; teksCta: string; kode: string; isActive: boolean; createdAt: string }[] => {
    const query = onlyActive 
      ? 'SELECT * FROM frame_aksi WHERE is_active = 1 ORDER BY created_at ASC' 
      : 'SELECT * FROM frame_aksi ORDER BY created_at ASC';
    const rows = db.query(query).all() as FrameAksiRecord[];
    return rows.map(r => ({
      id: r.id,
      nama: r.nama,
      teksCta: r.teks_cta,
      kode: r.kode,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    }));
  },

  getById: (id: string) => {
    const r = db.query('SELECT * FROM frame_aksi WHERE id = ?').get(id) as FrameAksiRecord | null;
    if (!r) return null;
    return {
      id: r.id,
      nama: r.nama,
      teksCta: r.teks_cta,
      kode: r.kode,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    };
  },

  findByKode: (kode: string) => {
    const r = db.query('SELECT * FROM frame_aksi WHERE LOWER(kode) = LOWER(?)').get(kode.trim()) as FrameAksiRecord | null;
    if (!r) return null;
    return {
      id: r.id,
      nama: r.nama,
      teksCta: r.teks_cta,
      kode: r.kode,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    };
  },

  create: (data: { nama: string; teksCta: string; kode?: string }) => {
    const id = `frm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const cleanKode = (data.kode || data.nama).toLowerCase().replace(/[^a-z0-9-_]/g, '-') || `frm-${Date.now()}`;
    db.run(
      'INSERT INTO frame_aksi (id, nama, teks_cta, kode, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [id, data.nama.trim(), data.teksCta.trim(), cleanKode, now]
    );
    return frameRepo.getById(id)!;
  },

  update: (id: string, data: { nama?: string; teksCta?: string; kode?: string; isActive?: boolean }) => {
    const existing = frameRepo.getById(id);
    if (!existing) return null;
    const newNama = data.nama !== undefined ? data.nama.trim() : existing.nama;
    const newCta = data.teksCta !== undefined ? data.teksCta.trim() : existing.teksCta;
    const newKode = data.kode !== undefined ? data.kode.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : existing.kode;
    const newActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
    db.run(
      'UPDATE frame_aksi SET nama = ?, teks_cta = ?, kode = ?, is_active = ? WHERE id = ?',
      [newNama, newCta, newKode, newActive, id]
    );
    return frameRepo.getById(id);
  },

  delete: (id: string): boolean => {
    const res = db.run('DELETE FROM frame_aksi WHERE id = ?', [id]);
    return res.changes > 0;
  }
};
