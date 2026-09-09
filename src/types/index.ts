/**
 * SnipLink MVP Domain Interfaces & Types
 */

export type LinkCategory = 'Promo' | 'Sosial Media' | 'Produk' | 'Kontak';

export interface UtmConfig {
  id?: string;
  linkId?: string;
  source: string;     // utm_source (cth: instagram, whatsapp)
  medium: string;     // utm_medium (cth: bio, story, broadcast)
  campaign: string;   // utm_campaign (cth: promo_kemerdekaan)
  term?: string;      // utm_term (kata kunci opsional)
  content?: string;   // utm_content (varian iklan opsional)
}

export type QRModuleStyle = 'chunky' | 'squircle' | 'dot';
export type QRFrameType = 'scan-me' | 'menu' | 'wifi' | 'none';

export interface QrStudioConfig {
  id?: string;
  linkId?: string;
  moduleStyle: QRModuleStyle;
  fgColor: string;
  bgColor: string;
  frameType: QRFrameType;
  frameText?: string;
  hasLogo: boolean;
  ecLevel: 'L' | 'M' | 'Q' | 'H';
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  authProvider: 'local' | 'google';
  createdAt: string;
  mustSetPassword?: boolean;
}

export interface LinkItem {
  id: string;
  userId?: string;
  guestToken?: string;
  isClaimed?: boolean;
  originalUrl: string;
  shortSlug: string;
  shortUrl: string;
  category: LinkCategory;
  isActive: boolean;
  isPinned: boolean;
  pinCode?: string;       // 4 digit PIN jika link diproteksi
  expiresAt?: string;     // Tanggal kedaluwarsa ISO (5 hari untuk tamu)
  createdAt: string;      // Tanggal pembuatan ISO
  updatedAt: string;
  clicks: number;
  scans: number;
  utm?: UtmConfig;
  qrConfig?: QrStudioConfig;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: string;
  referrer: 'WhatsApp' | 'Instagram' | 'TikTok' | 'Browser Langsung';
  os: 'Android' | 'iOS' | 'Desktop';
  isQrScan: boolean;
}

export type TabType = 'home' | 'qr' | 'links' | 'analytics' | 'profile';

