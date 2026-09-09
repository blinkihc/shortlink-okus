import React, { useEffect } from 'react';
import { X, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLinkStore } from '../../stores/useLinkStore';

export function LogoutConfirmModal() {
  const { isLogoutConfirmOpen, closeLogoutConfirm, logout, user } = useAuthStore();
  const { showToast } = useLinkStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogoutConfirmOpen) {
        closeLogoutConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoutConfirmOpen, closeLogoutConfirm]);

  if (!isLogoutConfirmOpen) return null;

  const handleConfirmLogout = async () => {
    await logout();
    closeLogoutConfirm();
    showToast('Berhasil keluar dari akun.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLogoutConfirm();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 rounded-xl p-5 shadow-[6px_6px_0px_#131B2E] dark:shadow-[6px_6px_0px_#000000] relative flex flex-col gap-4 text-snip-ink dark:text-slate-100">
        
        {/* Tombol Tutup Silang */}
        <button
          type="button"
          onClick={closeLogoutConfirm}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-snip-ink dark:border-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          title="Tutup Dialog"
          aria-label="Tutup Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Konten Peringatan Keluar */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-red-100 dark:bg-red-950/80 border-2 border-snip-ink dark:border-slate-600 flex items-center justify-center text-red-600 dark:text-red-400 shadow-neo-low">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 id="logout-dialog-title" className="text-base font-black text-snip-ink dark:text-slate-100">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Yakin ingin keluar dari akun{user?.name ? ` ${user.name}` : ''}? Sesi login aktif Anda pada peramban ini akan diakhiri.
            </p>
          </div>
        </div>

        {/* Indikator Keamanan Tambahan */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-[11px] font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Tautan tersimpan Anda tetap aman di basis data peladen.</span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={closeLogoutConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-snip-ink dark:border-slate-500 text-xs font-black text-snip-ink dark:text-slate-200 cursor-pointer transition-colors shadow-neo-low active:translate-y-0.5"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 border-2 border-snip-ink dark:border-slate-500 text-xs font-black text-white cursor-pointer transition-colors shadow-neo-low active:translate-y-0.5 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>

      </div>
    </div>
  );
}
