import { useState, useEffect, useRef } from 'react';
import { 
  Link as LinkIcon, 
  QrCode, 
  BarChart3, 
  Home, 
  Check, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  User,
  Settings
} from 'lucide-react';
import { useLinkStore } from './stores/useLinkStore';
import { useThemeStore } from './stores/useThemeStore';
import { useAuthStore } from './stores/useAuthStore';
import { ShortenerCard } from './components/shortener/ShortenerCard';
import { ResultCard } from './components/shortener/ResultCard';
import { QRStudioCanvas } from './components/qr/QRStudioCanvas';
import { LinksView } from './components/links/LinksView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LinkItemCard } from './components/links/LinkItemCard';
import { InstallPromptModal } from './components/common/InstallPromptModal';
import { AuthModal } from './components/auth/AuthModal';
import { LogoutConfirmModal } from './components/auth/LogoutConfirmModal';
import { SetPasswordModal } from './components/auth/SetPasswordModal';
import { OnboardingHero } from './components/onboarding/OnboardingHero';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import type { LinkItem } from './types';


export function App() {
  const { 
    links, 
    activeTab, 
    setActiveTab, 
    setQrActiveUrl, 
    toastMessage, 
    toastSuccess, 
    showToast, 
    initializeStore 
  } = useLinkStore();

  const { initializeTheme } = useThemeStore();
  const { user, openAuthModal, openLogoutConfirm, initAuth } = useAuthStore();

  const [createdResult, setCreatedResult] = useState<LinkItem | null>(() => {
    try {
      const saved = sessionStorage.getItem('sniplink_last_created_result');
      if (saved) {
        const item: LinkItem = JSON.parse(saved);
        if (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now()) {
          return item;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleCreated = (link: LinkItem) => {
    setCreatedResult(link);
    try {
      sessionStorage.setItem('sniplink_last_created_result', JSON.stringify(link));
    } catch {}
  };

  const handleCloseCreated = () => {
    setCreatedResult(null);
    try {
      sessionStorage.removeItem('sniplink_last_created_result');
    } catch {}
  };
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sniplink_onboarded') !== 'true';
    } catch {
      return false;
    }
  });

  const handleFinishOnboarding = () => {
    try {
      localStorage.setItem('sniplink_onboarded', 'true');
    } catch {}
    setShowOnboarding(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Inisialisasi tema, autentikasi sesi, dan tautan secara sekuensial
  useEffect(() => {
    initializeTheme();
    const initApp = async () => {
      await initAuth();
      await initializeStore();
    };
    initApp();
  }, [initAuth, initializeStore, initializeTheme]);

  // Ambil ulang tautan saat status user (login/logout) berubah
  useEffect(() => {
    initializeStore();
  }, [user, initializeStore]);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalScans = links.reduce((sum, l) => sum + l.scans, 0);

  const handleOpenQR = (url: string) => {
    setQrActiveUrl(url);
    setActiveTab('qr');
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Tersalin ke clipboard: ${text}`);
  };

  if (showOnboarding) {
    return (
      <div className="w-full h-[100dvh] min-h-[100dvh] bg-[#E8EEF9] dark:bg-[#070D1E] flex justify-center p-0 m-0 overflow-hidden transition-colors">
        <main className="w-full max-w-[480px] h-[100dvh] bg-snip-bg dark:bg-[#0B132B] flex flex-col overflow-hidden transition-colors relative">
          <OnboardingHero onComplete={handleFinishOnboarding} />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-[#E8EEF9] dark:bg-[#070D1E] flex justify-center p-0 m-0 overflow-hidden transition-colors">
      <main className="w-full max-w-[480px] h-[100dvh] bg-snip-bg dark:bg-[#0B132B] flex flex-col overflow-hidden transition-colors relative">
        <header className="bg-snip-surface dark:bg-slate-900 border-b-2 border-snip-ink dark:border-slate-600 px-3.5 sm:px-4 py-2.5 flex items-center justify-between shrink-0 pt-safe z-30 select-none">
          {/* Sisi Kiri: Logo SnipLink + Teks + Titik Hijau LIVE (Klik kembali ke Home) */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group text-left"
            title="Kembali ke Beranda SnipLink"
          >
            <div className="w-8 h-8 bg-snip-primary border-2 border-snip-ink dark:border-slate-600 rounded-md shadow-[2px_2px_0px_#131B2E] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <LinkIcon className="w-4 h-4" strokeWidth={3} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-snip-ink dark:text-slate-100">
                SnipLink
              </span>
              {/* Titik hijau menyala tanpa kotak pembungkus */}
              <span className="relative flex h-2 w-2" title="Sistem LIVE & Terhubung">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </button>

          {/* Sisi Kanan: Avatar Pengguna (dengan dropdown 2 kolom) atau Tombol Masuk */}
          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="w-9 h-9 rounded-full bg-snip-primary hover:bg-blue-700 text-white border-2 border-snip-ink dark:border-slate-500 shadow-neo-low dark:shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center font-black text-xs cursor-pointer active:scale-95 transition-all relative"
                  title="Menu Pengguna"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                  {/* Cincin status peran kecil */}
                  <span 
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-snip-ink ${
                      user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    title={user.role === 'admin' ? 'Administrator' : 'Member'}
                  />
                </button>

                {/* Dropdown 2 Opsi: Profil Saya & Keluar */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-snip-surface dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 rounded-lg shadow-neo dark:shadow-[3px_3px_0px_#000000] py-1 z-50 animate-fade-slide-up flex flex-col">
                    <div className="px-3 py-1.5 border-b border-snip-ink/10 dark:border-slate-800">
                      <div className="text-[11px] font-black text-snip-ink dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        {user.role === 'admin' ? 'Administrator VIP' : 'Member Terdaftar'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-black text-snip-ink dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-snip-primary dark:text-sky-400" />
                      <span>Profil Saya</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin-settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer border-t border-snip-ink/10 dark:border-slate-800"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                    )}

                    <div className="h-[1px] bg-snip-ink/10 dark:bg-slate-800" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openLogoutConfirm();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="bg-snip-primary hover:bg-blue-700 border-2 border-snip-ink dark:border-slate-500 rounded-md px-3 py-1.5 text-xs font-black text-white inline-flex items-center gap-1.5 shadow-neo-low cursor-pointer active:scale-95 transition-transform"
                title="Masuk atau Buat Akun"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </header>


        <div id="screen-viewport" className="flex-1 overflow-y-auto p-3.5 sm:p-4 flex flex-col gap-4">
          {activeTab === 'home' && (
            <div key="home-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <ShortenerCard onCreated={handleCreated} />

              {createdResult && (
                <ResultCard 
                  link={createdResult}
                  onClose={handleCloseCreated}
                  onOpenQR={handleOpenQR}
                  onCopy={handleCopyLink}
                />
              )}

              {user && (
                <div className="card-neo grid grid-cols-3 text-center p-3">
                  <div>
                    <div className="text-xl font-extrabold text-snip-primary dark:text-sky-400">{links.length}</div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tautan Aktif</div>
                  </div>
                  <div className="border-x-2 border-snip-ink dark:border-slate-600">
                    <div className="text-xl font-extrabold text-snip-primary dark:text-sky-400">{totalClicks.toLocaleString()}</div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Klik</div>
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-snip-primary dark:text-sky-400">{totalScans.toLocaleString()}</div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Scan QR</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-snip-ink dark:text-white">Tautan Terbaru</h3>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('links')}
                    className="text-xs font-bold text-snip-primary dark:text-sky-400 underline underline-offset-2 cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {links.slice(0, 3).map(link => (
                    <LinkItemCard 
                      key={link.id} 
                      link={link} 
                      onOpenQR={handleOpenQR} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div key="qr-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <QRStudioCanvas />
            </div>
          )}

          {activeTab === 'links' && (
            <div key="links-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <LinksView onOpenQR={handleOpenQR} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div key="analytics-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <AnalyticsView />
            </div>
          )}

          {activeTab === 'profile' && (
            <div key="profile-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <ProfileDashboard 
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
                onOpenOnboarding={() => setShowOnboarding(true)}
              />
            </div>
          )}

          {activeTab === 'admin-settings' && (
            <div key="admin-settings-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              <AdminSettingsView onBack={() => setActiveTab('home')} />
            </div>
          )}
        </div>

        <nav className="h-16 bg-snip-surface dark:bg-slate-900 border-t-2 border-snip-ink dark:border-slate-600 flex items-center justify-around px-1.5 sm:px-2 shrink-0 pb-safe z-10">
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-w-[48px] sm:min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'home' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'home' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <Home className="w-4 h-4" strokeWidth={activeTab === 'home' ? 3 : 2} />
            </div>
            <span className="text-[10px]">Home</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`min-w-[48px] sm:min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'qr' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'qr' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <QrCode className="w-4 h-4" strokeWidth={activeTab === 'qr' ? 3 : 2} />
            </div>
            <span className="text-[10px]">QR Studio</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('links')}
            className={`min-w-[48px] sm:min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'links' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'links' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <LinkIcon className="w-4 h-4" strokeWidth={activeTab === 'links' ? 3 : 2} />
            </div>
            <span className="text-[10px]">Tautan</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`min-w-[48px] sm:min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'analytics' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'analytics' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <BarChart3 className="w-4 h-4" strokeWidth={activeTab === 'analytics' ? 3 : 2} />
            </div>
            <span className="text-[10px]">Analitik</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`min-w-[48px] sm:min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'profile' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'profile' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <User className="w-4 h-4" strokeWidth={activeTab === 'profile' ? 3 : 2} />
            </div>
            <span className="text-[10px]">Profil</span>
          </button>
        </nav>
      </main>

      {toastMessage && (
        <aside className="fixed bottom-6 bg-snip-ink text-white border-2 border-white rounded-md shadow-neo-deep px-4 py-2.5 text-xs font-bold flex items-center gap-2 z-50 animate-bounce">
          {toastSuccess ? (
            <Check className="w-4 h-4 text-snip-success shrink-0" strokeWidth={3} />
          ) : (
            <AlertCircle className="w-4 h-4 text-snip-danger shrink-0" strokeWidth={3} />
          )}
          <span>{toastMessage}</span>
        </aside>
      )}

      <InstallPromptModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />

      <AuthModal />
      <LogoutConfirmModal />
      <SetPasswordModal />
    </div>
  );
}

export default App;

