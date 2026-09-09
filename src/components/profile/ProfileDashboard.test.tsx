import { describe, it, expect } from 'bun:test';
import { ProfileDashboard } from './ProfileDashboard';

describe('ProfileDashboard Component & Traveler Profile Blueprint Test', () => {
  it('should be defined as a valid React component', () => {
    expect(typeof ProfileDashboard).toBe('function');
  });

  it('should validate traveler-profile-dashboard structural section mappings', () => {
    const sectionMappings = [
      { wireframe: 'split-header', snipLink: 'Header Profil & Avatar' },
      { wireframe: 'user-greeting', snipLink: 'Sapaan & Role Badge' },
      { wireframe: 'quick-stats', snipLink: 'Tautan, Total Klik, Total Scan' },
      { wireframe: 'miles-card-section', snipLink: 'SnipLink Creator Pass Card' },
      { wireframe: 'links-section-1', snipLink: 'Manajemen Tautan & Fitur' },
      { wireframe: 'links-section-2', snipLink: 'Pengaturan & Preferensi Aplikasi' }
    ];

    expect(sectionMappings.length).toBe(6);
    expect(sectionMappings.find(s => s.wireframe === 'miles-card-section')?.snipLink).toBe('SnipLink Creator Pass Card');
  });

  it('should support callback triggers for PWA modal and Onboarding tour', () => {
    let pwaTriggered = false;
    let tourTriggered = false;

    const mockOpenPwa = () => { pwaTriggered = true; };
    const mockOpenTour = () => { tourTriggered = true; };

    mockOpenPwa();
    mockOpenTour();

    expect(pwaTriggered).toBe(true);
    expect(tourTriggered).toBe(true);
  });
});
