import type { UtmConfig } from '../types';

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function appendUtmParameters(baseUrl: string, utm?: UtmConfig): string {
  if (!utm || (!utm.source && !utm.medium && !utm.campaign)) {
    return baseUrl.trim();
  }

  try {
    const url = new URL(baseUrl.trim());
    if (utm.source) url.searchParams.set('utm_source', utm.source.trim());
    if (utm.medium) url.searchParams.set('utm_medium', utm.medium.trim());
    if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign.trim());
    if (utm.term) url.searchParams.set('utm_term', utm.term.trim());
    if (utm.content) url.searchParams.set('utm_content', utm.content.trim());
    return url.toString();
  } catch {
    return baseUrl.trim();
  }
}
