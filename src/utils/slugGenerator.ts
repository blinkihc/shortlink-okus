/**
 * Utility untuk membuat slug acak dan sanitasi alias kustom
 */

const SAFE_ALPHANUM = 'abcdefghjkmnpqrstuvwxyz23456789';

export function generateRandomSlug(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += SAFE_ALPHANUM.charAt(Math.floor(Math.random() * SAFE_ALPHANUM.length));
  }
  return result;
}

export function sanitizeCustomSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

export function resolveSlug(customSlug?: string, existingSlugs: string[] = []): string {
  let slug = customSlug ? sanitizeCustomSlug(customSlug) : '';
  if (!slug) {
    slug = generateRandomSlug(6);
  }

  // Handle collision
  if (existingSlugs.map(s => s.toLowerCase()).includes(slug.toLowerCase())) {
    slug = `${slug}-${Math.floor(10 + Math.random() * 90)}`;
  }

  return slug;
}
