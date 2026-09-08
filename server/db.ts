import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { LinkItem, LinkCategory, QrStudioConfig } from '../src/types';

const DB_PATH = process.env.DATABASE_PATH || './data/sniplink.db';

// Pastikan folder penyimpanan data tersedia sebelum inisialisasi SQLite
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH, { create: true });

// Aktifkan mode WAL (Write-Ahead Logging) untuk konkurensi tinggi & performa baca-tulis optimal
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA synchronous = NORMAL;');

export function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
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
      updated_at TEXT NOT NULL
    );
  `);

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

  db.run(`CREATE INDEX IF NOT EXISTS idx_links_short_slug ON links(short_slug);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON analytics_events(link_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);`);

  // Periksa apakah tabel links masih kosong. Jika ya, masukkan data percontohan awal.
  const countRow = db.query('SELECT COUNT(*) as count FROM links').get() as { count: number };
  if (countRow.count === 0) {
    seedInitialLinks();
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
  const now = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO links (id, original_url, short_slug, category, pin_code, is_active, is_pinned, clicks, scans, qr_config, created_at, updated_at)
    VALUES ($id, $original_url, $short_slug, $category, $pin_code, $is_active, $is_pinned, $clicks, $scans, $qr_config, $created_at, $updated_at)
  `);

  const initialSeeds = [
    {
      $id: 'link-seed-1',
      $original_url: 'https://tokopedia.com/kopikenangan/promo-senin-ceria',
      $short_slug: 'promo-kopi',
      $category: 'Promo',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 1,
      $clicks: 420,
      $scans: 140,
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
      $original_url: 'https://instagram.com/rakacreative/portfolio',
      $short_slug: 'bio-creator',
      $category: 'Sosial Media',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 0,
      $clicks: 610,
      $scans: 210,
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
      $original_url: 'https://cindycoffee.menu/standar-menu',
      $short_slug: 'menu-resto',
      $category: 'Produk',
      $pin_code: null,
      $is_active: 1,
      $is_pinned: 0,
      $clicks: 250,
      $scans: 112,
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

export const linkRepo = {
  getAll: (domain: string): LinkItem[] => {
    const rows = db.query('SELECT * FROM links ORDER BY is_pinned DESC, created_at DESC').all();
    return rows.map(r => formatRowToLink(r, domain));
  },

  getBySlug: (slug: string, domain: string): LinkItem | null => {
    const row = db.query('SELECT * FROM links WHERE short_slug = ?').get(slug);
    return row ? formatRowToLink(row, domain) : null;
  },

  getById: (id: string, domain: string): LinkItem | null => {
    const row = db.query('SELECT * FROM links WHERE id = ?').get(id);
    return row ? formatRowToLink(row, domain) : null;
  },

  create: (data: {
    originalUrl: string;
    shortSlug: string;
    category: LinkCategory;
    pinCode?: string;
    qrConfig?: QrStudioConfig;
  }, domain: string): LinkItem => {
    const now = new Date().toISOString();
    const id = `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const qrConfigStr = data.qrConfig ? JSON.stringify(data.qrConfig) : null;

    db.run(
      `INSERT INTO links (id, original_url, short_slug, category, pin_code, is_active, is_pinned, clicks, scans, qr_config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, 0, 0, ?, ?, ?)`,
      [id, data.originalUrl, data.shortSlug, data.category, data.pinCode || null, qrConfigStr, now, now]
    );

    return linkRepo.getById(id, domain)!;
  },

  delete: (id: string): boolean => {
    const res = db.run('DELETE FROM links WHERE id = ?', [id]);
    return res.changes > 0;
  },

  togglePin: (id: string, domain: string): LinkItem | null => {
    const existing = db.query('SELECT is_pinned FROM links WHERE id = ?').get(id) as { is_pinned: number } | null;
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

  getAnalyticsSummary: () => {
    const totalLinks = (db.query('SELECT COUNT(*) as count FROM links').get() as { count: number }).count;
    const totals = db.query('SELECT SUM(clicks) as totalClicks, SUM(scans) as totalScans FROM links').get() as { totalClicks: number | null; totalScans: number | null };

    // Breakdown Referrer
    const referrerRows = db.query(`
      SELECT referrer, COUNT(*) as count 
      FROM analytics_events 
      GROUP BY referrer 
      ORDER BY count DESC
    `).all() as { referrer: string; count: number }[];

    // Breakdown OS
    const osRows = db.query(`
      SELECT os, COUNT(*) as count 
      FROM analytics_events 
      GROUP BY os 
      ORDER BY count DESC
    `).all() as { os: string; count: number }[];

    return {
      totalLinks,
      totalClicks: totals.totalClicks || 0,
      totalScans: totals.totalScans || 0,
      referrers: referrerRows,
      os: osRows
    };
  }
};
