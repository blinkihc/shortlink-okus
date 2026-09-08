import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { 
  detectDevice, 
  getDeferredPrompt, 
  setDeferredPrompt, 
  triggerNativeInstallPrompt,
  type BeforeInstallPromptEvent,
  type DeviceInfo 
} from '../../utils/pwaHelper';

interface InstallPromptModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ isOpen: controlledOpen, onClose: controlledClose }) => {
  const [device, setDevice] = useState<DeviceInfo>({
    isMobileOrTablet: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    platform: 'desktop'
  });

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    const devInfo = detectDevice();
    setDevice(devInfo);

    // Tangkap event beforeinstallprompt (khusus peramban berbasis Chromium / Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Jika diakses dari HP atau Tablet dan belum terpasang, otomatis tampilkan prompt
      const dismissed = sessionStorage.getItem('sniplink_install_dismissed');
      if (!dismissed && !devInfo.isStandalone) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Untuk iOS atau Android yang mengakses dari mobile/tablet tapi tanpa event deferred
    if (devInfo.isMobileOrTablet && !devInfo.isStandalone) {
      const dismissed = sessionStorage.getItem('sniplink_install_dismissed');
      if (!dismissed) {
        // Tampilkan setelah delay halus 1.2 detik agar UI utama termuat dulu
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const open = controlledOpen !== undefined ? controlledOpen : isVisible;

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('sniplink_install_dismissed', 'true');
    if (controlledClose) controlledClose();
  };

  const handleInstallClick = async () => {
    if (getDeferredPrompt()) {
      const outcome = await triggerNativeInstallPrompt();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1800);
      }
    } else {
      // Fallback jika browser belum memicu event tapi pengguna menekan tombol
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-snip-surface dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-700 rounded-xl p-5 shadow-neo dark:shadow-neo-dark flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Dialog Pasang Aplikasi PWA"
      >
        {/* Tombol Tutup Silang */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-7 h-7 bg-slate-100 dark:bg-slate-800 border border-snip-ink dark:border-slate-600 rounded-full flex items-center justify-center text-snip-ink dark:text-slate-200 shadow-neo-low cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Dialog */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-snip-primary border-2 border-snip-ink dark:border-slate-700 rounded-lg flex items-center justify-center shadow-neo-low shrink-0 text-white">
            <Smartphone className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-snip-ink dark:text-white">Pasang SnipLink</span>
              <span className="bg-snip-accent text-snip-ink text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-snip-ink">
                PWA
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Aplikasi Ringan & 100% Luring
            </span>
          </div>
        </div>

        {/* Konten Khusus iOS Safari */}
        {device.isIOS ? (
          <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-snip-ink dark:border-slate-700 rounded-lg p-3.5 flex flex-col gap-2.5">
            <div className="text-xs font-extrabold text-snip-ink dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-snip-accent" />
              <span>Panduan Pasang di iPhone / iPad:</span>
            </div>
            <ol className="text-xs text-slate-700 dark:text-slate-300 font-bold flex flex-col gap-2 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-snip-muted dark:bg-slate-700 border border-snip-ink dark:border-slate-600 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold">1</span>
                <span>Ketuk ikon <Share className="w-3.5 h-3.5 inline mx-0.5 text-snip-primary" /> <strong>Bagikan (Share)</strong> di bilah bawah Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-snip-muted dark:bg-slate-700 border border-snip-ink dark:border-slate-600 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold">2</span>
                <span>Pilih <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-snip-primary" /> <strong>Tambahkan ke Layar Utama</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-snip-muted dark:bg-slate-700 border border-snip-ink dark:border-slate-600 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold">3</span>
                <span>Ketuk <strong>Tambah</strong> di pojok kanan atas. Selesai!</span>
              </li>
            </ol>
          </div>
        ) : (
          /* Konten Android / Tablet / Desktop */
          <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-snip-ink dark:border-slate-700 rounded-lg p-3 flex flex-col gap-1.5">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
              Pasang SnipLink langsung ke layar utama ponselmu! Buka aplikasi tanpa peramban, hemat kuota, dan tetap bisa generate QR saat luring.
            </p>
          </div>
        )}

        {/* Tombol Aksi */}
        {installSuccess ? (
          <div className="bg-emerald-100 border-2 border-snip-ink text-emerald-800 font-extrabold text-xs py-2.5 px-3 rounded-md flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Aplikasi Berhasil Dipasang!</span>
          </div>
        ) : device.isIOS ? (
          <button
            onClick={handleClose}
            className="btn-neo-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Saya Mengerti</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="btn-neo-surface flex-1 py-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <span>Nanti Saja</span>
            </button>
            <button
              onClick={handleInstallClick}
              className="btn-neo-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
