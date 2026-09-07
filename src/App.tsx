import { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  QrCode, 
  BarChart3, 
  Home, 
  Smartphone, 
  RotateCcw,
  Sparkles,
  Clipboard,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLinkStore } from './stores/useLinkStore';
import { ShortenerCard } from './components/shortener/ShortenerCard';
import { ResultCard } from './components/shortener/ResultCard';
import { QRStudioCanvas } from './components/qr/QRStudioCanvas';
import { LinksView } from './components/links/LinksView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LinkItemCard } from './components/links/LinkItemCard';
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

  const [isFullMode, setIsFullMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);
  const [showClipboardBanner, setShowClipboardBanner] = useState<boolean>(true);

  useEffect(() => {
    initializeStore();

    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [initializeStore]);

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

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center p-4 gap-4">
      {/* Top Controller Bar */}
      <header className="w-full max-w-[420px] bg-snip-surface border-2 border-snip-ink rounded-md p-2.5 shadow-neo flex items-center justify-between gap-2">
        <div className="bg-snip-accent text-snip-ink text-[10px] font-extrabold px-2 py-0.5 rounded-sm border border-snip-ink tracking-wider">
          REACT 19 + BUN MVP
        </div>
        <div className="text-xs font-bold text-snip-ink flex-1 truncate">
          SnipLink Mobile
        </div>
        <div className="flex gap-1.5">
          <button 
            type="button"
            onClick={() => setIsFullMode(!isFullMode)}
            className="bg-snip-muted border border-snip-ink rounded-sm px-2 py-1 text-[11px] font-bold text-snip-ink inline-flex items-center gap-1 shadow-[1.5px_1.5px_0px_#131B2E] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none"
            title="Ganti Mode Tampilan"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isFullMode ? 'Layar Penuh' : 'Mode HP'}</span>
          </button>
          <button 
            type="button"
            onClick={() => resetToDefault()}
            className="bg-snip-muted border border-snip-ink rounded-sm px-2 py-1 text-[11px] font-bold text-snip-ink inline-flex items-center gap-1 shadow-[1.5px_1.5px_0px_#131B2E] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none"
            title="Reset Data ke Nilai Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Mobile Device Frame */}
      <main 
        className={`w-full bg-snip-bg border-3 border-snip-ink shadow-neo-deep flex flex-col overflow-hidden transition-all duration-200 ${
          isFullMode 
            ? 'max-w-[640px] min-h-[90vh] rounded-lg' 
            : 'max-w-[420px] h-[860px] rounded-[36px]'
        }`}
      >
        {/* Status Bar */}
        <div className="h-10 bg-snip-surface border-b border-snip-ink flex items-center justify-between px-4 text-xs font-bold select-none shrink-0">
          <span>{currentTime}</span>
          <div className="w-24 h-4 bg-snip-ink rounded-b-xl flex items-center justify-center">
            <div className="w-2 h-2 bg-[#273142] rounded-full"></div>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Header Bar */}
        <header className="bg-snip-surface border-b-2 border-snip-ink px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-snip-primary border-2 border-snip-ink rounded-sm shadow-[2px_2px_0px_#131B2E] flex items-center justify-center text-white">
              <LinkIcon className="w-4 h-4" strokeWidth={3} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-snip-ink">SnipLink</span>
          </div>
          <div className="bg-snip-muted border border-snip-ink rounded-sm px-2 py-0.5 text-[10px] font-extrabold text-snip-primary tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>V1.0 MVP</span>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <div id="screen-viewport" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {activeTab === 'home' && (
            <div className="flex flex-col gap-3.5">
              {/* Clipboard Detected Banner */}
              {showClipboardBanner && (
                <div className="bg-snip-accent border-2 border-snip-ink rounded-md p-2.5 shadow-neo flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 bg-white border border-snip-ink rounded flex items-center justify-center shrink-0">
                      <Clipboard className="w-4 h-4 text-snip-ink" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] font-extrabold uppercase">Tautan di Clipboard</div>
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
                  <div className="text-xl font-extrabold text-snip-primary">{links.length}</div>
                  <div className="text-[11px] font-bold text-slate-600">Tautan Aktif</div>
                </div>
                <div className="border-x-2 border-snip-ink">
                  <div className="text-xl font-extrabold text-snip-primary">{totalClicks.toLocaleString()}</div>
                  <div className="text-[11px] font-bold text-slate-600">Total Klik</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-snip-primary">{totalScans.toLocaleString()}</div>
                  <div className="text-[11px] font-bold text-slate-600">Scan QR</div>
                </div>
              </div>

              {/* Recent Links Section */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-snip-ink">Tautan Terbaru</h3>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('links')}
                    className="text-xs font-bold text-snip-primary underline underline-offset-2"
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
            <QRStudioCanvas />
          )}

          {activeTab === 'links' && (
            <LinksView onOpenQR={handleOpenQR} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="h-16 bg-snip-surface border-t-2 border-snip-ink flex items-center justify-around px-2 shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'home' ? 'text-snip-primary' : 'text-slate-500'
            }`}
          >
            <div className={`p-1 rounded ${activeTab === 'home' ? 'bg-snip-muted border border-snip-ink shadow-[1px_1px_0px_#131B2E]' : ''}`}>
              <Home className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold">Home</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'qr' ? 'text-snip-primary' : 'text-slate-500'
            }`}
          >
            <div className={`p-1 rounded ${activeTab === 'qr' ? 'bg-snip-muted border border-snip-ink shadow-[1px_1px_0px_#131B2E]' : ''}`}>
              <QrCode className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold">QR Studio</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'links' ? 'text-snip-primary' : 'text-slate-500'
            }`}
          >
            <div className={`p-1 rounded ${activeTab === 'links' ? 'bg-snip-muted border border-snip-ink shadow-[1px_1px_0px_#131B2E]' : ''}`}>
              <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold">Tautan</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'analytics' ? 'text-snip-primary' : 'text-slate-500'
            }`}
          >
            <div className={`p-1 rounded ${activeTab === 'analytics' ? 'bg-snip-muted border border-snip-ink shadow-[1px_1px_0px_#131B2E]' : ''}`}>
              <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold">Analitik</span>
          </button>
        </nav>

        {/* Phone Bottom Home Bar */}
        <div className="h-5 bg-snip-surface flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-snip-ink rounded-full"></div>
        </div>
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
    </div>
  );
}

export default App;
