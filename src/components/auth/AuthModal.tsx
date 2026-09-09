import React, { useState } from 'react';
import { X, Lock, Mail, User, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';
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
    loginWithGoogle, 
    isLoading 
  } = useAuthStore();

  const { initializeStore, showToast } = useLinkStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const res = await loginWithGoogle();
    if (res.success) {
      showToast('Berhasil masuk dengan Google!');
      await initializeStore();
    } else {
      setErrorMessage(res.message || 'Gagal masuk dengan Google.');
    }
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
            <label className="text-[11px] font-extrabold uppercase tracking-wide">Kata Sandi</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:border-snip-primary"
              />
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

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase">atau</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* Tombol Masuk dengan Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-snip-ink dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 shadow-neo-low cursor-pointer active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Masuk Cepat lewat Google</span>
        </button>
      </div>
    </div>
  );
}
