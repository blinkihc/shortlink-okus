import React, { useState } from 'react';
import type { DayMetric } from '../../stores/useAnalyticsStore';

interface BarChartProps {
  data: DayMetric[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const [activeDay, setActiveDay] = useState<DayMetric | null>(null);

  // Cari nilai maksimum untuk penskalaan tinggi batang
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.clicks, d.scans)),
    10 // Minimal skala agar tidak pembagian nol
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-snip-ink">Aktivitas 7 Hari Terakhir</span>
          <span className="text-[10px] text-slate-500">Klik Tautan vs Pindai Kode QR</span>
        </div>
        {activeDay && (
          <div className="text-[10px] font-bold bg-snip-ink text-white px-2 py-0.5 rounded shadow-neo-low">
            {activeDay.day}: {activeDay.clicks} Klik, {activeDay.scans} Scan
          </div>
        )}
      </div>

      {/* Kanvas Grafik Batang Neo-Pop */}
      <div 
        className="h-44 border-b-2 border-snip-ink flex items-end justify-between px-2 gap-2 pt-6 bg-slate-50/70 rounded-t-lg"
        role="region"
        aria-label="Grafik batang aktivitas 7 hari"
      >
        {data.map((item) => {
          const clickPercent = Math.max(Math.round((item.clicks / maxVal) * 100), 4);
          const scanPercent = Math.max(Math.round((item.scans / maxVal) * 100), 4);
          const isSelected = activeDay?.dateStr === item.dateStr;

          return (
            <div
              key={item.dateStr}
              className={`flex-1 flex flex-col items-center h-full justify-end gap-1 cursor-pointer transition-transform ${
                isSelected ? 'scale-105' : 'hover:opacity-90'
              }`}
              onClick={() => setActiveDay(isSelected ? null : item)}
              title={`${item.day} (${item.dateStr}): ${item.clicks} Klik, ${item.scans} Scan`}
            >
              <div className="w-full max-w-[28px] h-full flex items-end gap-1">
                {/* Batang Klik (Royal Blue) */}
                <div
                  className={`flex-1 bg-snip-primary border-t-2 border-x-2 border-snip-ink rounded-t-xs transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-snip-ink' : ''
                  }`}
                  style={{ height: `${clickPercent}%` }}
                >
                  {isSelected && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-extrabold text-snip-primary">
                      {item.clicks}
                    </span>
                  )}
                </div>

                {/* Batang Scan (Neo Coral) */}
                <div
                  className={`flex-1 bg-snip-danger border-t-2 border-x-2 border-snip-ink rounded-t-xs transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-snip-ink' : ''
                  }`}
                  style={{ height: `${scanPercent}%` }}
                >
                  {isSelected && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-extrabold text-snip-danger">
                      {item.scans}
                    </span>
                  )}
                </div>
              </div>

              {/* Label Hari */}
              <span className={`text-[10px] font-extrabold ${isSelected ? 'text-snip-primary underline' : 'text-slate-600'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keterangan Warna (Legend) */}
      <div className="flex gap-5 justify-center text-xs font-extrabold pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-snip-ink rounded-xs bg-snip-primary shadow-neo-low"></span>
          <span className="text-slate-700">Klik Tautan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-snip-ink rounded-xs bg-snip-danger shadow-neo-low"></span>
          <span className="text-slate-700">Scan Kode QR</span>
        </div>
      </div>
    </div>
  );
};
