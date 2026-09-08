/**
 * PWA (Progressive Web Application) & Device Detection Helper
 */

export interface DeviceInfo {
  isMobileOrTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  platform: 'android' | 'ios' | 'desktop';
}

export function detectDevice(userAgentString?: string, innerWidth?: number, maxTouchPoints?: number): DeviceInfo {
  const ua = userAgentString !== undefined 
    ? userAgentString 
    : (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  const width = innerWidth !== undefined 
    ? innerWidth 
    : (typeof window !== 'undefined' ? window.innerWidth : 1024);

  const touch = maxTouchPoints !== undefined 
    ? maxTouchPoints 
    : (typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0);

  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && touch > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Tablet|Touch/i.test(ua);
  
  const isMobileOrTablet = isIOS || isAndroid || isMobileUA || (width <= 820 && touch > 0);

  let isStandalone = false;
  if (typeof window !== 'undefined') {
    const isMediaStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    isStandalone = isMediaStandalone || isNavigatorStandalone;
  }

  let platform: 'android' | 'ios' | 'desktop' = 'desktop';
  if (isAndroid) platform = 'android';
  else if (isIOS) platform = 'ios';

  return {
    isMobileOrTablet,
    isIOS,
    isAndroid,
    isStandalone,
    platform
  };
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function setDeferredPrompt(event: BeforeInstallPromptEvent | null) {
  deferredPrompt = event;
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export async function triggerNativeInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return choice.outcome;
  } catch (err) {
    console.error('Gagal memicu install prompt native:', err);
    return 'unavailable';
  }
}
