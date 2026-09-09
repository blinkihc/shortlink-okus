import React from 'react';
import { 
  User, 
  Crown, 
  Sparkles, 
  Link as LinkIcon, 
  QrCode, 
  BarChart3, 
  ChevronRight, 
  Download, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn, 
  HelpCircle, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLinkStore } from '../../stores/useLinkStore';
import { useThemeStore } from '../../stores/useThemeStore';

interface ProfileDashboardProps {
  onOpenInstallModal?: () => void;
  onOpenOnboarding?: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  onOpenInstallModal,
  onOpenOnboarding
}) => {
  const { user, openAuthModal, openLogoutConfirm } = useAuthStore();
  const { links, setActiveTab } = useLinkStore();
  const { theme, toggleTheme } = useThemeStore();

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalScans = links.reduce((sum, l) => sum + l.scans, 0);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0].slice(0, 2).toUpperCase();
  };

  const isGuest = !user;
  const isAdmin = user?.role === 'admin';

  return (
    <div 
      id="profile-dashboard-view" 
      className="animate-fade-slide-up flex flex-col gap-4 pb-4 select-none"
    >
      {/* 1. Split Header & Profile Card (NeedMCP Wireframe: split-header + user-greeting) */}
      <div className="card-neo p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar Area with Edit/Role Ring */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-snip-primary text-white border-2 border-snip-ink dark:border-slate-500 shadow-neo-low dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-xl">
              {user ? (
                user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover rounded-[10px]" 
                  />
                ) : (
                  getInitials(user.name)
                )
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>

            {/* Badge Icon on Avatar */}
            <div 
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-snip-ink dark:border-slate-600 flex items-center justify-center text-[10px] ${
                isAdmin 
                  ? 'bg-amber-400 text-slate-950' 
                  : user 
                  ? 'bg-sky-400 text-slate-950' 
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
              title={isAdmin ? 'Administrator VIP' : user ? 'Member Terdaftar' : 'Pengunjung Tamu'}
            >
              {isAdmin ? (
                <Crown className="w-3 h-3 stroke-[2.5]" />
              ) : user ? (
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <Clock className="w-3 h-3 stroke-[2.5]" />
              )}
            </div>
          </div>

          {/* User Info & Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-snip-ink dark:text-white truncate">
                {user ? user.name : 'Pengunjung Tamu'}
              </h2>
              <span 
                className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-amber-300 text-slate-950 border-snip-ink dark:border-amber-500 shadow-[1px_1px_0px_#131B2E]' 
                    : user 
                    ? 'bg-blue-100 text-blue-900 border-snip-ink dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700' 
                    : 'bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                }`}
              >
                {isAdmin ? 'ADMIN VIP' : user ? 'MEMBER' : 'MODE TAMU'}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {user ? user.email : 'Tautan sementara berlaku 5 hari'}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid (NeedMCP Wireframe: quick-stats) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-snip-ink/10 dark:border-slate-700/60 text-center">
          <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-snip-ink/20 dark:border-slate-700 p-2 rounded-lg">
            <div className="text-lg font-black text-snip-primary dark:text-sky-400">
              {links.length}
            </div>
            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              Tautan Aktif
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-snip-ink/20 dark:border-slate-700 p-2 rounded-lg">
            <div className="text-lg font-black text-snip-primary dark:text-sky-400">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              Total Klik
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-snip-ink/20 dark:border-slate-700 p-2 rounded-lg">
            <div className="text-lg font-black text-snip-primary dark:text-sky-400">
              {totalScans.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              Scan QR
            </div>
          </div>
        </div>
      </div>

      {/* 2. SnipLink Creator Pass Card (NeedMCP Wireframe: miles-card-section) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#131B2E] to-blue-950 text-white border-2 border-snip-ink dark:border-slate-600 rounded-xl p-4 shadow-neo dark:shadow-[3px_3px_0px_#000000]">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-snip-accent text-snip-ink flex items-center justify-center font-black text-xs">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              SnipLink Creator Pass
            </span>
          </div>

          <span className="text-[10px] font-extrabold bg-white/10 px-2 py-0.5 rounded border border-white/20 text-slate-200">
            okus.me
          </span>
        </div>

        {/* Card Center Info */}
        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Nomor Akun / Lisensi
            </div>
            <div className="font-mono text-sm font-bold tracking-widest text-slate-200 mt-0.5">
              {user ? `•••• ${user.id.slice(-4).toUpperCase()}` : '•••• GUEST-PASS'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Status Kuota
            </div>
            <div className={`text-xs font-black tracking-tight mt-0.5 ${isGuest ? 'text-amber-300' : 'text-emerald-400'}`}>
              {isGuest ? 'Maks 1 Tautan (5 Hari)' : 'Tautan Permanen'}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-300">
            {isAdmin ? 'Hak Penuh Administrator' : user ? 'Pengguna Terdaftar' : 'Mode Tamu Publik'}
          </span>

          {isGuest ? (
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="bg-snip-accent hover:bg-amber-300 text-snip-ink font-black text-[10px] px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <span>Klaim Permanen</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Akses Aktif</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Navigation Section 1: Data & Link Management (NeedMCP Wireframe: links-section-1) */}
      <div className="card-neo p-3 flex flex-col gap-1">
        <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 px-2 py-1 tracking-wider">
          Manajemen Tautan & Fitur
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-950/70 text-snip-primary dark:text-sky-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white group-hover:text-snip-primary dark:group-hover:text-sky-400 transition-colors">
                Kelola Semua Tautan
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Daftar tautan aktif, kustom alias, dan proteksi PIN
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Pantau Analitik Riil
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Grafik klik 7 hari, pemindai QR, dan perangkat pengunjung
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                QR Studio & Ekspor
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Kustom warna matriks dan unduh resolusi tinggi PNG/SVG
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4. Navigation Section 2: Preferences & Settings (NeedMCP Wireframe: links-section-2) */}
      <div className="card-neo p-3 flex flex-col gap-1">
        <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 px-2 py-1 tracking-wider">
          Pengaturan & Aplikasi
        </div>

        {/* Theme Switch Row */}
        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white">
                Tema Antarmuka
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Mode saat ini: {theme === 'dark' ? 'Gelap (Dark Mode)' : 'Terang (Light Mode)'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleTheme()}
            className="border-2 border-snip-ink dark:border-slate-600 bg-snip-muted dark:bg-slate-800 px-2.5 py-1 rounded text-[11px] font-extrabold text-snip-ink dark:text-slate-200 shadow-neo-low cursor-pointer active:scale-95 transition-transform"
          >
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </div>

        {/* Install PWA Option */}
        <button
          type="button"
          onClick={onOpenInstallModal}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white group-hover:text-snip-primary dark:group-hover:text-sky-400 transition-colors">
                Pasang Aplikasi PWA
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Tambahkan SnipLink ke layar utama ponsel pintar Anda
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Feature Onboarding Re-tour */}
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-snip-ink/20 dark:border-slate-700">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-snip-ink dark:text-white group-hover:text-snip-primary dark:group-hover:text-sky-400 transition-colors">
                Panduan Fitur & Onboarding
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Buka kembali tur pengenalan 3 fitur utama aplikasi
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Auth Action (Login / Logout) */}
        {user ? (
          <button
            type="button"
            onClick={() => {
              openLogoutConfirm();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer group mt-1 border-t border-snip-ink/10 dark:border-slate-700"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-red-600 dark:text-red-400">
                  Keluar dari Akun
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Hapus sesi aktif dari peramban ini
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 transition-colors text-left cursor-pointer group mt-1 border border-snip-primary/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-snip-primary text-white flex items-center justify-center border border-snip-ink">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-snip-primary dark:text-sky-400">
                  Masuk atau Daftar Akun
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                  Simpan tautan permanen & buka analitik riil
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-snip-primary dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Footer Branding Info */}
      <div className="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 py-1">
        SnipLink v2.0 • Domain Resmi: <span className="text-snip-ink dark:text-slate-300 font-black">okus.me</span>
      </div>
    </div>
  );
};
