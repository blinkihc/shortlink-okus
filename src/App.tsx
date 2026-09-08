import { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  QrCode, 
  BarChart3, 
  Home, 
  RotateCcw,
  Clipboard,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Download
} from 'lucide-react';
import { useLinkStore } from './stores/useLinkStore';
import { useThemeStore } from './stores/useThemeStore';
import { ShortenerCard } from './components/shortener/ShortenerCard';
import { ResultCard } from './components/shortener/ResultCard';
import { QRStudioCanvas } from './components/qr/QRStudioCanvas';
import { LinksView } from './components/links/LinksView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LinkItemCard } from './components/links/LinkItemCard';
import { InstallPromptModal } from './components/common/InstallPromptModal';
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
    initializeStore,
    resetToDefault 
  } = useLinkStore();

  const { theme, toggleTheme, initializeTheme } = useThemeStore();

  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);
  const [showClipboardBanner, setShowClipboardBanner] = useState<boolean>(true);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    initializeStore();
    initializeTheme();
  }, [initializeStore, initializeTheme]);

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

  const handleConfirmReset = async () => {
    await resetToDefault();
    setShowResetConfirm(false);
    showToast('Data berhasil direset ke nilai awal.');
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#E8EEF9] dark:bg-[#070D1E] flex items-center justify-center p-0 sm:p-4 md:p-6 transition-colors overflow-x-hidden">
      {/* Kontainer Aplikasi Multi-Viewport (Desktop: Terpusat 480px, Tablet: 620px, Mobile: 100% Layar Penuh) */}
      <main className="w-full sm:max-w-[620px] lg:max-w-[480px] h-[100dvh] sm:h-[88vh] sm:max-h-[860px] bg-snip-bg dark:bg-[#0B132B] flex flex-col overflow-hidden sm:rounded-2xl sm:border-3 sm:border-snip-ink sm:dark:border-slate-600 sm:shadow-neo-deep sm:dark:shadow-[8px_8px_0px_#000000] transition-all relative">
        
        {/* Header Resmi Aplikasi SnipLink */}
        <header className="bg-snip-surface dark:bg-slate-900 border-b-2 border-snip-ink dark:border-slate-600 px-3.5 sm:px-4 py-3 flex items-center justify-between shrink-0 pt-safe z-10 select-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-snip-primary border-2 border-snip-ink dark:border-slate-600 rounded-md shadow-[2px_2px_0px_#131B2E] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-white shrink-0">
              <LinkIcon className="w-4 h-4" strokeWidth={3} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-snip-ink dark:text-slate-100">SnipLink</span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                LIVE
              </span>
            </div>
          </div>

          {/* Kontrol Utama: PWA, Ganti Tema, & Reset Aman */}
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="bg-snip-accent hover:bg-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 border-2 border-snip-ink dark:border-slate-600 rounded-md px-2 py-1 text-[11px] font-extrabold text-snip-ink inline-flex items-center gap-1 shadow-neo-low dark:shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-transform cursor-pointer"
              title="Pasang Aplikasi PWA ke Layar Utama"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PWA</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTheme()}
              className="w-8 h-8 bg-snip-muted dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-md flex items-center justify-center text-snip-ink dark:text-slate-200 shadow-neo-low dark:shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-transform cursor-pointer"
              title="Ganti Tema Gelap/Terang"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-8 h-8 bg-snip-muted dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-neo-low dark:shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-transform cursor-pointer"
              title="Kembalikan data ke nilai awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Modal Konfirmasi Reset Data */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-slide-up">
            <div className="bg-snip-surface dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 rounded-xl p-4 w-full max-w-[320px] shadow-neo-deep dark:shadow-[6px_6px_0px_#000000] flex flex-col gap-3 text-snip-ink dark:text-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="font-extrabold text-sm">Reset Data Awal?</div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Seluruh tautan dan log analitik akan dikembalikan ke data percontohan awal bawaan sistem.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-neo-surface btn-neo-sm px-3 py-1.5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="btn-neo bg-snip-danger text-white btn-neo-sm px-3 py-1.5 rounded-md active:scale-95"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Viewport Konten dengan Pengguliran Halus & Transisi Tab */}
        <div id="screen-viewport" className="flex-1 overflow-y-auto p-3.5 sm:p-4 flex flex-col gap-4">
          {activeTab === 'home' && (
            <div key="home-view" className="animate-fade-slide-up flex flex-col gap-3.5">
              {/* Clipboard Detected Banner */}
              {showClipboardBanner && (
                <div className="bg-snip-accent border-2 border-snip-ink dark:border-slate-600 rounded-md p-2.5 shadow-neo dark:shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 bg-white border border-snip-ink rounded flex items-center justify-center shrink-0">
                      <Clipboard className="w-4 h-4 text-snip-ink" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] font-extrabold uppercase text-snip-ink">Tautan di Clipboard</div>
                      <div className="text-xs font-bold truncate text-snip-ink">https://shopee.co.id/flash-sale/diskon-spesial</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowClipboardBanner(false);
                      showToast('Tautan clipboard siap dipotong.');
                    }}
                    className="btn-neo-surface btn-neo-sm px-2 py-1 shrink-0"
                  >
                    Gunakan
                  </button>
                </div>
              )}

              {/* Master Shorten Form */}
              <ShortenerCard onCreated={link => setCreatedResult(link)} />

              {/* Created Result Popup Card */}
              {createdResult && (
                <ResultCard 
                  link={createdResult}
                  onClose={() => setCreatedResult(null)}
                  onOpenQR={handleOpenQR}
                  onCopy={handleCopyLink}
                />
              )}

              {/* Quick Summary Stats Bar */}
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

              {/* Recent Links Section */}
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
        </div>

        {/* Bilah Navigasi Bawah Multi-Perangkat */}
        <nav className="h-16 bg-snip-surface dark:bg-slate-900 border-t-2 border-snip-ink dark:border-slate-600 flex items-center justify-around px-2 shrink-0 pb-safe z-10">
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
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
            className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
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
            className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
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
            className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded transition-transform cursor-pointer active:scale-95 ${
              activeTab === 'analytics' ? 'text-snip-primary dark:text-sky-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className={`p-1 rounded transition-all ${activeTab === 'analytics' ? 'bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 shadow-[1.5px_1.5px_0px_#131B2E] dark:shadow-[1.5px_1.5px_0px_#000000]' : ''}`}>
              <BarChart3 className="w-4 h-4" strokeWidth={activeTab === 'analytics' ? 3 : 2} />
            </div>
            <span className="text-[10px]">Analitik</span>
          </button>
        </nav>
      </main>

      {/* Floating Toast Notification */}
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

      {/* Modal Dialog Pasang Aplikasi PWA */}
      <InstallPromptModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />
    </div>
  );
}

export default App;
