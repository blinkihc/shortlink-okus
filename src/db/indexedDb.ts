import Dexie, { type Table } from 'dexie';
import type { LinkItem, ClickEvent } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export class SnipLinkDatabase extends Dexie {
  links!: Table<LinkItem, string>;
  events!: Table<ClickEvent, string>;

  constructor() {
    super('SnipLinkDB');
    this.version(1).stores({
      links: 'id, shortSlug, category, isPinned, isActive, createdAt',
      events: 'id, linkId, timestamp, referrer, os, isQrScan'
    });
  }
}

let dbInstance: SnipLinkDatabase | null = null;

export function getDb(): SnipLinkDatabase {
  if (!dbInstance) {
    dbInstance = new SnipLinkDatabase();
  }
  return dbInstance;
}

export const INITIAL_SEED_LINKS: LinkItem[] = [
  {
    id: 'link-seed-1',
    originalUrl: 'https://tokopedia.com/kopikenangan/promo-senin-ceria',
    shortSlug: 'promo-kopi',
    shortUrl: APP_CONFIG.formatShortUrl('promo-kopi'),
    category: 'Promo',
    isActive: true,
    isPinned: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    clicks: 0,
    scans: 0,
    qrConfig: {
      moduleStyle: 'chunky',
      fgColor: '#0058BE',
      bgColor: '#FFFFFF',
      frameType: 'scan-me',
      frameText: 'SCAN ME!',
      hasLogo: true,
      ecLevel: 'H'
    }
  },
  {
    id: 'link-seed-2',
    originalUrl: 'https://instagram.com/rakacreative/portfolio',
    shortSlug: 'bio-creator',
    shortUrl: APP_CONFIG.formatShortUrl('bio-creator'),
    category: 'Sosial Media',
    isActive: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    clicks: 0,
    scans: 0
  },
  {
    id: 'link-seed-3',
    originalUrl: 'https://cindycoffee.menu/standing-tent-qr',
    shortSlug: 'menu-resto',
    shortUrl: APP_CONFIG.formatShortUrl('menu-resto'),
    category: 'Produk',
    isActive: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    clicks: 0,
    scans: 0
  }
];
