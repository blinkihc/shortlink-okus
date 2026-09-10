import React, { useState } from 'react';
import { X, Lock, Mail, User, LogIn, UserPlus, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLinkStore } from '../../stores/useLinkStore';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    openAuthModal, 
    closeAuthModal, 
    login, 
    register, 
    isLoading 
  } = useAuthStore();

  const { initializeStore, showToast } = useLinkStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authModalTab === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal masuk.');
        return;
      }
      showToast('Berhasil masuk! Tautan Anda telah dimuat.');
    } else {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      const res = await register(email, password, name);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal mendaftar.');
        return;
      }
      showToast('Pendaftaran sukses! Tautan tamu otomatis diklaim ke akun Anda.');
    }

    await initializeStore();
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 rounded-xl p-5 shadow-[6px_6px_0px_#131B2E] dark:shadow-[6px_6px_0px_#000000] relative flex flex-col gap-4 text-snip-ink dark:text-slate-100">
        
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-snip-ink dark:border-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          title="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Navigasi Masuk vs Daftar */}
        <div className="flex border-2 border-snip-ink dark:border-slate-600 rounded-lg p-1 bg-slate-100 dark:bg-slate-800 gap-1">
          <button
            type="button"
            onClick={() => { openAuthModal('login'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-black rounded flex items-center justify-center gap-1.5 transition-all ${
              authModalTab === 'login'
                ? 'bg-snip-primary text-white border-2 border-snip-ink dark:border-slate-500 shadow-neo-low'
                : 'text-slate-600 dark:text-slate-300 hover:text-snip-ink'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => { openAuthModal('register'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-black rounded flex items-center justify-center gap-1.5 transition-all ${
              authModalTab === 'register'
                ? 'bg-snip-accent text-snip-ink border-2 border-snip-ink dark:border-slate-500 shadow-neo-low'
                : 'text-slate-600 dark:text-slate-300 hover:text-snip-ink'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Banner Auto-Claim Tamu */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/60 rounded-lg p-2.5 text-[11px] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-900 dark:text-amber-200 leading-snug font-medium">
            Tautan mode tamu yang telah Anda buat otomatis tersimpan permanen ke akun baru!
          </p>
        </div>

        {/* Pesan Kesalahan */}
        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-950/60 border-2 border-red-500 text-red-800 dark:text-red-200 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {authModalTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wide">Nama Lengkap</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bang Ucup"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wide">Alamat Surel (Email)</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wide">Kata Sandi</label>
              {authModalTab === 'login' && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">(Kosongkan jika aktivasi awal)</span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authModalTab === 'login' ? "Kata sandi (kosongkan jika aktivasi)" : "Minimal 6 karakter"}
                required={authModalTab === 'register'}
                minLength={authModalTab === 'register' ? 6 : undefined}
                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer rounded focus:outline-none"
                title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2.5 bg-snip-primary text-white hover:bg-blue-700 border-2 border-snip-ink dark:border-slate-500 rounded-lg text-xs font-black shadow-neo-low active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : authModalTab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Sekarang (Gratis)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
