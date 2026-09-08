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
          <span className="text-xs font-extrabold text-snip-ink dark:text-white">Aktivitas 7 Hari Terakhir</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Klik Tautan vs Pindai Kode QR</span>
        </div>
        {activeDay && (
          <div className="text-[10px] font-bold bg-snip-ink text-white dark:bg-slate-800 dark:border dark:border-slate-600 px-2 py-0.5 rounded shadow-neo-low dark:shadow-[1px_1px_0px_#000000]">
            {activeDay.day}: {activeDay.clicks} Klik, {activeDay.scans} Scan
          </div>
        )}
      </div>

      {/* Kanvas Grafik Batang Neo-Pop */}
      <div 
        className="h-44 border-b-2 border-snip-ink dark:border-slate-600 flex items-end justify-between px-2 gap-2 pt-6 bg-slate-50/70 dark:bg-slate-800/80 rounded-t-lg"
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
                  className={`flex-1 bg-snip-primary border-t-2 border-x-2 border-snip-ink dark:border-slate-600 rounded-t-xs transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-snip-ink dark:ring-white' : ''
                  }`}
                  style={{ height: `${clickPercent}%` }}
                >
                  {isSelected && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-extrabold text-snip-primary dark:text-sky-400">
                      {item.clicks}
                    </span>
                  )}
                </div>

                {/* Batang Scan (Neo Coral) */}
                <div
                  className={`flex-1 bg-snip-danger border-t-2 border-x-2 border-snip-ink dark:border-slate-600 rounded-t-xs transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-snip-ink dark:ring-white' : ''
                  }`}
                  style={{ height: `${scanPercent}%` }}
                >
                  {isSelected && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-extrabold text-snip-danger dark:text-rose-400">
                      {item.scans}
                    </span>
                  )}
                </div>
              </div>

              {/* Label Hari */}
              <span className={`text-[10px] font-extrabold ${isSelected ? 'text-snip-primary dark:text-sky-400 underline' : 'text-slate-600 dark:text-slate-400'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keterangan Warna (Legend) */}
      <div className="flex gap-5 justify-center text-xs font-extrabold pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-snip-ink dark:border-slate-600 rounded-xs bg-snip-primary shadow-neo-low dark:shadow-[1px_1px_0px_#000000]"></span>
          <span className="text-slate-700 dark:text-slate-300">Klik Tautan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-snip-ink dark:border-slate-600 rounded-xs bg-snip-danger shadow-neo-low dark:shadow-[1px_1px_0px_#000000]"></span>
          <span className="text-slate-700 dark:text-slate-300">Scan Kode QR</span>
        </div>
      </div>
    </div>
  );
};
