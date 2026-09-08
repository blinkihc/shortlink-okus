import type { LinkItem } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export function exportLinksToJson(links: LinkItem[]): string {
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    itemCount: links.length,
    links
  };
  return JSON.stringify(payload, null, 2);
}

export function exportLinksToCsv(links: LinkItem[]): string {
  const headers = ['ID', 'ShortSlug', 'ShortUrl', 'OriginalUrl', 'Category', 'Clicks', 'Scans', 'IsPinned', 'CreatedAt'];
  const rows = links.map(l => [
    `"${l.id}"`,
    `"${l.shortSlug}"`,
    `"${l.shortUrl}"`,
    `"${l.originalUrl.replace(/"/g, '""')}"`,
    `"${l.category}"`,
    l.clicks,
    l.scans,
    l.isPinned ? '1' : '0',
    `"${l.createdAt}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function parseAndValidateJsonBackup(jsonString: string): { success: boolean; data?: LinkItem[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.links)) {
      return { success: false, error: 'Format berkas tidak valid: Properti links harus berupa array.' };
    }

    const validLinks: LinkItem[] = [];
    for (const item of parsed.links) {
      if (item && item.id && item.shortSlug && item.originalUrl && item.category) {
        validLinks.push({
          id: item.id,
          originalUrl: item.originalUrl,
          shortSlug: item.shortSlug,
          shortUrl: item.shortUrl || APP_CONFIG.formatShortUrl(item.shortSlug),
          category: item.category,
          isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
          isPinned: !!item.isPinned,
          pinCode: item.pinCode,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          clicks: Number(item.clicks) || 0,
          scans: Number(item.scans) || 0,
          qrConfig: item.qrConfig
        });
      }
    }

    if (validLinks.length === 0) {
      return { success: false, error: 'Tidak ada data tautan valid yang ditemukan dalam berkas.' };
    }

    return { success: true, data: validLinks };
  } catch {
    return { success: false, error: 'Berkas JSON rusak atau tidak dapat diurai.' };
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
