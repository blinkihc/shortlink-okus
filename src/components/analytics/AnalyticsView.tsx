import { useLinkStore } from '../../stores/useLinkStore';

export function AnalyticsView() {
  const { links } = useLinkStore();

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalScans = links.reduce((sum, l) => sum + l.scans, 0);

  const daysData = [
    { day: 'Sen', clicks: 60, scans: 35 },
    { day: 'Sel', clicks: 75, scans: 45 },
    { day: 'Rab', clicks: 90, scans: 60 },
    { day: 'Kam', clicks: 50, scans: 30 },
    { day: 'Jum', clicks: 95, scans: 70 },
    { day: 'Sab', clicks: 100, scans: 85 },
    { day: 'Min', clicks: 80, scans: 50 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-snip-ink tracking-tight">Pulse Analytics</h2>
        <p className="text-xs text-slate-600 mt-0.5">Metrik performa klik dan scan QR terupdate dari tautan aktifmu.</p>
      </div>

      {/* Top 2 Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card-neo flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">TOTAL KLIK</span>
          <span className="text-2xl font-extrabold text-snip-primary">{totalClicks.toLocaleString()}</span>
          <span className="text-[9px] font-extrabold text-snip-success bg-green-100 border border-snip-ink rounded px-1.5 py-0.5 w-fit">
            +24% Minggu Ini
          </span>
        </div>

        <div className="card-neo flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">TOTAL SCAN QR</span>
          <span className="text-2xl font-extrabold text-snip-primary">{totalScans.toLocaleString()}</span>
          <span className="text-[9px] font-extrabold text-snip-success bg-green-100 border border-snip-ink rounded px-1.5 py-0.5 w-fit">
            +18% Minggu Ini
          </span>
        </div>
      </div>

      {/* 7 Days Bar Chart */}
      <section className="card-neo flex flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-extrabold text-snip-ink">Aktivitas 7 Hari Terakhir</h3>
          <span className="text-[11px] text-slate-500">Klik vs Pindai QR</span>
        </div>

        <div className="h-40 border-b-2 border-snip-ink flex items-end justify-between px-2 gap-1.5 pt-4">
          {daysData.map(item => (
            <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end gap-1">
              <div className="w-full max-w-[28px] h-full flex items-end gap-0.5">
                <div 
                  className="flex-1 bg-snip-primary border-t-2 border-x-2 border-snip-ink rounded-t-sm transition-all duration-300"
                  style={{ height: `${item.clicks}%` }}
                  title={`${item.day}: ${item.clicks} Klik`}
                />
                <div 
                  className="flex-1 bg-snip-accent border-t-2 border-x-2 border-snip-ink rounded-t-sm transition-all duration-300"
                  style={{ height: `${item.scans}%` }}
                  title={`${item.day}: ${item.scans} Scan`}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center text-xs font-bold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 border border-snip-ink rounded-xs bg-snip-primary"></span>
            <span>Klik Tautan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 border border-snip-ink rounded-xs bg-snip-accent"></span>
            <span>Scan Kode QR</span>
          </div>
        </div>
      </section>

      {/* Referral Breakdown */}
      <section className="card-neo flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-snip-ink">Sumber Kanal Teratas (Referrer)</h3>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span>WhatsApp Chat</span>
            <span className="text-snip-primary">580 Klik (45%)</span>
          </div>
          <div className="w-full h-3 bg-snip-muted border border-snip-ink rounded-full overflow-hidden">
            <div className="h-full bg-snip-success border-r border-snip-ink" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span>Instagram Bio & Story</span>
            <span className="text-snip-primary">390 Klik (30%)</span>
          </div>
          <div className="w-full h-3 bg-snip-muted border border-snip-ink rounded-full overflow-hidden">
            <div className="h-full bg-snip-danger border-r border-snip-ink" style={{ width: '30%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span>TikTok Profile</span>
            <span className="text-snip-primary">195 Klik (15%)</span>
          </div>
          <div className="w-full h-3 bg-snip-muted border border-snip-ink rounded-full overflow-hidden">
            <div className="h-full bg-snip-ink border-r border-snip-ink" style={{ width: '15%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span>Browser Langsung</span>
            <span className="text-snip-primary">115 Klik (10%)</span>
          </div>
          <div className="w-full h-3 bg-snip-muted border border-snip-ink rounded-full overflow-hidden">
            <div className="h-full bg-snip-accent border-r border-snip-ink" style={{ width: '10%' }}></div>
          </div>
        </div>
      </section>

      {/* OS Platform Split */}
      <section className="card-neo flex flex-col gap-2">
        <h3 className="text-sm font-extrabold text-snip-ink">Sistem Operasi Pengunjung</h3>
        <div className="flex h-7 border-2 border-snip-ink rounded-md overflow-hidden text-[11px] font-extrabold text-white text-center shadow-neo-low">
          <div className="bg-snip-success flex items-center justify-center" style={{ width: '64%' }}>
            Android 64%
          </div>
          <div className="bg-snip-primary flex items-center justify-center border-l-2 border-snip-ink" style={{ width: '36%' }}>
            iOS 36%
          </div>
        </div>
      </section>
    </div>
  );
}
