export const APP_CONFIG = {
  appName: 'SnipLink',
  appVersion: '1.0.0',
  defaultDomain: (import.meta.env?.VITE_APP_DOMAIN as string) || 'okus.me',
  get baseUrl(): string {
    return `https://${this.defaultDomain}`;
  },
  formatShortUrl(slug: string): string {
    return `https://${this.defaultDomain}/${slug}`;
  }
};
