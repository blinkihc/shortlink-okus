import { useEffect } from 'react';
import { useAnalyticsStore } from '../../stores/useAnalyticsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { BarChart } from './BarChart';
import { MousePointerClick, QrCode, Smartphone, RotateCw, Lock, UserPlus } from 'lucide-react';

export function AnalyticsView() {
  const { 
    events, 
    initializeAnalytics, 
    getDailyStats, 
    getReferrerBreakdown, 
    getOsBreakdown, 
    getTotalMetrics 
  } = useAnalyticsStore();

  const { user, openAuthModal } = useAuthStore();

  useEffect(() => {
    if (user) {
      initializeAnalytics();
    }
  }, [user, initializeAnalytics]);

  if (!user) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <div className="card-neo bg-amber-50 dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 p-5 flex flex-col items-center text-center gap-3 shadow-[5px_5px_0px_#131B2E] dark:shadow-[5px_5px_0px_#000000]">
          <div className="w-12 h-12 rounded-xl bg-amber-200 dark:bg-amber-900/60 border-2 border-snip-ink dark:border-amber-500 flex items-center justify-center text-amber-900 dark:text-amber-200 shadow-neo-low">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-snip-ink dark:text-white">
              Analitik Riil Khusus Pengguna Terdaftar
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Statistik klik riil, grafik 7 hari, pemindaian QR, perangkat, dan perujuk hanya tersedia bagi akun terdaftar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-2.5 bg-snip-primary hover:bg-blue-700 text-white font-black rounded-lg border-2 border-snip-ink dark:border-slate-500 shadow-neo-low cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Buka Akses Analitik (Masuk / Daftar Akun)</span>
          </button>
        </div>
      </div>
    );
  }


  const totals = getTotalMetrics();
  const dailyStats = getDailyStats(7);
  const referrerData = getReferrerBreakdown();
  const osData = getOsBreakdown();

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-snip-ink dark:text-white tracking-tight flex items-center gap-1.5">
            Pulse Analytics
            <span className="bg-snip-accent text-snip-ink text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-snip-ink">
              REAL-TIME
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Metrik performa riil dari kunjungan tautan pendek dan pemindaian kode QR.
          </p>
        </div>
      </div>

      {/* Status Bar Sinkronisasi Riil */}
      <div className="card-neo bg-slate-50 dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 flex items-center justify-between p-3 gap-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-snip-ink dark:text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-snip-ink inline-block" />
          <span>Pelacakan Kunjungan Riil Aktif</span>
        </div>
        <button
          onClick={() => initializeAnalytics()}
          className="btn-neo-surface text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
          title="Segarkan data analitik dari server"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Top 2 Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card-neo flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL KLIK RIIL</span>
            <MousePointerClick className="w-4 h-4 text-snip-primary dark:text-sky-400" />
          </div>
          <span className="text-2xl font-extrabold text-snip-primary dark:text-sky-400 tracking-tight">
            {totals.totalClicks.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Kunjungan URL Langsung
          </span>
        </div>

        <div className="card-neo flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL SCAN QR RIIL</span>
            <QrCode className="w-4 h-4 text-snip-danger dark:text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-snip-danger dark:text-rose-400 tracking-tight">
            {totals.totalScans.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Pemindaian Kamera QR
          </span>
        </div>
      </div>

      {/* 7 Days Bar Chart */}
      <section className="card-neo">
        <BarChart data={dailyStats} />
      </section>

      {/* Referral Breakdown */}
      <section className="card-neo flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-snip-ink dark:text-white">Sumber Kanal Teratas (Referrer)</h3>
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-snip-ink dark:border-slate-600 rounded">
            {events.length} Sesi Terdata
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center flex flex-col items-center gap-1 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum Ada Sesi Kunjungan</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Data kanal (WhatsApp, Instagram, TikTok, Browser) akan terdata otomatis saat tautan dikunjungi.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {referrerData.map((item) => (
              <div key={item.referrer} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-snip-ink dark:text-slate-200">{item.referrer}</span>
                  <span className="text-slate-700 dark:text-slate-400">
                    {item.count} Interaksi ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-full overflow-hidden shadow-neo-low dark:shadow-[2px_2px_0px_#000000]">
                  <div
                    className={`h-full ${item.colorClass} border-r-2 border-snip-ink dark:border-slate-600 transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OS Platform Split */}
      <section className="card-neo flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-snip-ink dark:text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-snip-primary dark:text-sky-400" />
            <span>Sistem Operasi Pengunjung</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Android vs iOS</span>
        </div>

        {events.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center flex flex-col items-center gap-1 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Menunggu Deteksi Perangkat</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Statistik sistem operasi akan direkam otomatis dari header User-Agent pengunjung.
            </span>
          </div>
        ) : (
          <>
            {/* Dual Split Bar */}
            <div className="flex h-8 border-2 border-snip-ink dark:border-slate-600 rounded-md overflow-hidden text-[11px] font-extrabold text-white text-center shadow-neo-low dark:shadow-[2px_2px_0px_#000000]">
              <div
                className="bg-snip-success flex items-center justify-center transition-all duration-300 gap-1 text-snip-ink"
                style={{ width: `${osData.androidPct}%` }}
                title={`Android: ${osData.android} pengguna (${osData.androidPct}%)`}
              >
                <span>Android</span>
                <span className="bg-white/80 dark:bg-slate-900/80 text-snip-ink dark:text-slate-100 border border-snip-ink dark:border-slate-600 rounded px-1 text-[9px]">
                  {osData.androidPct}%
                </span>
              </div>
              <div
                className="bg-snip-primary flex items-center justify-center border-l-2 border-snip-ink dark:border-slate-600 transition-all duration-300 gap-1"
                style={{ width: `${osData.iosPct}%` }}
                title={`iOS: ${osData.ios} pengguna (${osData.iosPct}%)`}
              >
                <span>iOS</span>
                <span className="bg-white/80 dark:bg-slate-900/80 text-snip-ink dark:text-slate-100 border border-snip-ink dark:border-slate-600 rounded px-1 text-[9px]">
                  {osData.iosPct}%
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1">
              <span>Android: {osData.android} perangkat</span>
              <span>iOS: {osData.ios} perangkat</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

