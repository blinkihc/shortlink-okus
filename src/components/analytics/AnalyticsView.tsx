import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../../stores/useAnalyticsStore';
import { useLinkStore } from '../../stores/useLinkStore';
import { BarChart } from './BarChart';
import { MousePointerClick, QrCode, TrendingUp, Sparkles, Smartphone } from 'lucide-react';

export function AnalyticsView() {
  const { 
    events, 
    initializeAnalytics, 
    recordClick, 
    recordScan, 
    getDailyStats, 
    getReferrerBreakdown, 
    getOsBreakdown, 
    getTotalMetrics 
  } = useAnalyticsStore();

  const { links, showToast } = useLinkStore();
  const [simulationLoading, setSimulationLoading] = useState(false);

  useEffect(() => {
    initializeAnalytics();
  }, [initializeAnalytics]);

  const totals = getTotalMetrics();
  const dailyStats = getDailyStats(7);
  const referrerData = getReferrerBreakdown();
  const osData = getOsBreakdown();

  // Handler simulasi event agar pengguna dapat menguji interaksi langsung
  const handleSimulateClick = async () => {
    if (links.length === 0) return;
    setSimulationLoading(true);
    const randomLink = links[Math.floor(Math.random() * links.length)];
    const referrers = ['WhatsApp', 'Instagram', 'TikTok', 'Browser Langsung'] as const;
    const ref = referrers[Math.floor(Math.random() * referrers.length)];
    const osList = ['Android', 'iOS'] as const;
    const os = osList[Math.floor(Math.random() * osList.length)];

    await recordClick(randomLink.id, ref, os);
    showToast(`Simulasi: 1 Klik tercatat dari ${ref} (${os})!`);
    setSimulationLoading(false);
  };

  const handleSimulateScan = async () => {
    if (links.length === 0) return;
    setSimulationLoading(true);
    const randomLink = links[Math.floor(Math.random() * links.length)];
    const referrers = ['WhatsApp', 'Instagram', 'Browser Langsung'] as const;
    const ref = referrers[Math.floor(Math.random() * referrers.length)];
    const osList = ['Android', 'iOS'] as const;
    const os = osList[Math.floor(Math.random() * osList.length)];

    await recordScan(randomLink.id, ref, os);
    showToast(`Simulasi: 1 Scan QR tercatat via ${ref} (${os})!`);
    setSimulationLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-snip-ink dark:text-white tracking-tight flex items-center gap-1.5">
            Pulse Analytics
            <span className="bg-snip-accent text-snip-ink text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-snip-ink">
              LIVE
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Metrik performa klik tautan dan scan QR (Quick Response) luring.
          </p>
        </div>
      </div>

      {/* Action Bar Simulasi Uji Coba Cepat */}
      <div className="card-neo bg-slate-50 dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 flex items-center justify-between p-3 gap-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-snip-ink dark:text-slate-100">
          <Sparkles className="w-4 h-4 text-snip-primary dark:text-sky-400" />
          <span>Uji Coba Metrik:</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleSimulateClick}
            disabled={simulationLoading || links.length === 0}
            className="btn-neo-surface text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
            title="Kirim 1 simulasi klik pengunjung"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>+1 Klik</span>
          </button>
          <button
            onClick={handleSimulateScan}
            disabled={simulationLoading || links.length === 0}
            className="btn-neo-surface text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
            title="Kirim 1 simulasi pemindaian QR"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>+1 Scan QR</span>
          </button>
        </div>
      </div>

      {/* Top 2 Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card-neo flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL KLIK</span>
            <MousePointerClick className="w-4 h-4 text-snip-primary dark:text-sky-400" />
          </div>
          <span className="text-2xl font-extrabold text-snip-primary dark:text-sky-400 tracking-tight">
            {totals.totalClicks.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-snip-ink dark:border-emerald-600 rounded px-1.5 py-0.5 w-fit">
            <TrendingUp className="w-3 h-3 inline" />
            <span>+24% Minggu Ini</span>
          </div>
        </div>

        <div className="card-neo flex flex-col gap-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL SCAN QR</span>
            <QrCode className="w-4 h-4 text-snip-danger dark:text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-snip-danger dark:text-rose-400 tracking-tight">
            {totals.totalScans.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-snip-ink dark:border-emerald-600 rounded px-1.5 py-0.5 w-fit">
            <TrendingUp className="w-3 h-3 inline" />
            <span>+18% Minggu Ini</span>
          </div>
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
      </section>
    </div>
  );
}
