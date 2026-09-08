import { describe, it, expect, beforeEach } from 'bun:test';
import { 
  detectDevice, 
  setDeferredPrompt, 
  getDeferredPrompt, 
  triggerNativeInstallPrompt,
  type BeforeInstallPromptEvent
} from './pwaHelper';

describe('PWA & Device Detection Tests', () => {
  beforeEach(() => {
    setDeferredPrompt(null);
  });

  it('should accurately detect Android mobile devices', () => {
    const androidUA = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const result = detectDevice(androidUA, 393, 5);

    expect(result.isAndroid).toBe(true);
    expect(result.isIOS).toBe(false);
    expect(result.isMobileOrTablet).toBe(true);
    expect(result.platform).toBe('android');
  });

  it('should accurately detect iOS iPhone devices', () => {
    const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    const result = detectDevice(iphoneUA, 390, 5);

    expect(result.isIOS).toBe(true);
    expect(result.isAndroid).toBe(false);
    expect(result.isMobileOrTablet).toBe(true);
    expect(result.platform).toBe('ios');
  });

  it('should accurately identify Desktop browser', () => {
    const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const result = detectDevice(desktopUA, 1440, 0);

    expect(result.isAndroid).toBe(false);
    expect(result.isIOS).toBe(false);
    expect(result.isMobileOrTablet).toBe(false);
    expect(result.platform).toBe('desktop');
  });

  it('should detect tablet viewport with touch points', () => {
    const tabletUA = 'Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const result = detectDevice(tabletUA, 800, 5);

    expect(result.isMobileOrTablet).toBe(true);
  });

  it('should manage deferred install prompt state correctly', async () => {
    expect(getDeferredPrompt()).toBeNull();

    let prompted = false;
    const fakePromptEvent = {
      preventDefault: () => {},
      prompt: async () => { prompted = true; },
      userChoice: Promise.resolve({ outcome: 'accepted' as const })
    } as unknown as BeforeInstallPromptEvent;

    setDeferredPrompt(fakePromptEvent);
    expect(getDeferredPrompt()).toBe(fakePromptEvent);

    const outcome = await triggerNativeInstallPrompt();
    expect(outcome).toBe('accepted');
    expect(prompted).toBe(true);
    expect(getDeferredPrompt()).toBeNull();
  });

  it('should return unavailable when prompt is not ready', async () => {
    const outcome = await triggerNativeInstallPrompt();
    expect(outcome).toBe('unavailable');
  });
});
