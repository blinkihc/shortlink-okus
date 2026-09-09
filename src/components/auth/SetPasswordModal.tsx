import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLinkStore } from '../../stores/useLinkStore';

export function SetPasswordModal() {
  const { user, mustSetPassword, setPassword, isLoading } = useAuthStore();
  const { showToast } = useLinkStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal ini wajib dan terkunci: hanya muncul saat mustSetPassword bernilai true
  if (!user || !mustSetPassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const res = await setPassword(newPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Gagal menyimpan kata sandi baru.');
      return;
    }

    showToast('Kata sandi berhasil dibuat! Akun Anda kini terlindungi.');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 rounded-xl p-5 shadow-[6px_6px_0px_#131B2E] dark:shadow-[6px_6px_0px_#000000] relative flex flex-col gap-4 text-snip-ink dark:text-slate-100">
        
        {/* Header Ikon & Judul */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-950/80 border-2 border-snip-ink dark:border-slate-600 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-neo-low">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 id="set-password-title" className="text-base font-black text-snip-ink dark:text-slate-100">
              Aktivasi: Buat Kata Sandi
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Halo, <span className="font-bold text-snip-primary dark:text-sky-400">{user.name}</span>! Akun ini belum memiliki kata sandi. Silakan buat kata sandi baru untuk mengamankan akses ke depan.
            </p>
          </div>
        </div>

        {/* Pesan Kesalahan */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Pembuatan Kata Sandi Baru */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wide">
              Kata Sandi Baru
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                disabled={isLoading}
                autoFocus
                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer rounded focus:outline-none"
                title={showNewPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wide">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                required
                minLength={6}
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer rounded focus:outline-none"
                title={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Sandi dienkripsi aman dengan standar hashing Argon2id.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-snip-primary hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs rounded-lg border-2 border-snip-ink dark:border-slate-500 shadow-neo-low cursor-pointer active:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi & Lanjutkan'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
