import React, { useState } from 'react';
import {
  Link2,
  ShieldCheck,
  Sparkles,
  QrCode,
  Palette,
  BarChart3,
  Activity,
  ArrowRight,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

interface OnboardingHeroProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  tag: string;
  title: string;
  description: string;
  pills: string[];
  mainIcon: React.ReactNode;
  overlayIcon: React.ReactNode;
  mainColor: string;
  overlayColor: string;
}

export const OnboardingHero: React.FC<OnboardingHeroProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      tag: 'FITUR 01 / 03',
      title: 'Pendekkan Tautan dengan okus.me',
      description: 'Ubah URL panjang jadi ringkas, mudah dibagikan, dan aman dengan proteksi kode sandi PIN 4-digit.',
      pills: ['Domain okus.me', 'Kustom Alias Unik', 'Proteksi Sandi PIN'],
      mainIcon: <Link2 className="w-12 h-12 text-white stroke-[2.5]" />,
      overlayIcon: <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />,
      mainColor: 'bg-blue-600 dark:bg-blue-500',
      overlayColor: 'bg-amber-400 dark:bg-amber-300'
    },
    {
      tag: 'FITUR 02 / 03',
      title: 'QR Studio Kustom Siap Cetak',
      description: 'Hasilkan kode QR interaktif, sesuaikan warna matriks serta frame label, lalu unduh format resolusi tinggi PNG/SVG.',
      pills: ['Ekspor PNG & SVG', 'Kustom Warna & Frame', 'Preset Siap Cetak'],
      mainIcon: <QrCode className="w-12 h-12 text-white stroke-[2.5]" />,
      overlayIcon: <Palette className="w-6 h-6 text-slate-950 stroke-[2.5]" />,
      mainColor: 'bg-indigo-600 dark:bg-indigo-500',
      overlayColor: 'bg-emerald-400 dark:bg-emerald-300'
    },
    {
      tag: 'FITUR 03 / 03',
      title: 'Analitik Riil & Pelacakan Akurat',
      description: 'Pantau statistik klik dan pemindaian QR secara riil tanpa bot, lengkap dengan grafik 7 hari dan rincian perangkat.',
      pills: ['Grafik Klik 7 Hari', 'Pemilah OS & Device', 'Statistik Murni Riil'],
      mainIcon: <BarChart3 className="w-12 h-12 text-white stroke-[2.5]" />,
      overlayIcon: <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />,
      mainColor: 'bg-emerald-600 dark:bg-emerald-500',
      overlayColor: 'bg-sky-400 dark:bg-sky-300'
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div
      id="onboarding-screen"
      className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-snip-bg dark:bg-[#0B132B] transition-colors relative select-none animate-fade-slide-up"
    >
      {/* Top Bar: Brand & Lewati Button */}
      <div className="flex items-center justify-between pt-safe z-20">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-snip-primary border-2 border-snip-ink dark:border-slate-600 rounded-md shadow-[2px_2px_0px_#131B2E] dark:shadow-[2px_2px_0px_#000000] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-tight text-snip-ink dark:text-slate-100">Onboarding</span>
        </div>
      </div>

      {/* Hero Visual Area (NeedMCP Wireframe: hero-image-area) */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-auto">
          {/* Main Hero Circle */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full ${slide.mainColor} border-3 border-snip-ink dark:border-slate-400 flex items-center justify-center shadow-neo dark:shadow-[4px_4px_0px_#000000] transition-all duration-300 transform scale-100`}
          >
            {slide.mainIcon}
          </div>

          {/* Overlay Hero Badge (NeedMCP Wireframe: overlay-hero-image) */}
          <div
            className={`absolute right-1 bottom-4 sm:right-2 sm:bottom-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full ${slide.overlayColor} border-3 border-snip-ink dark:border-slate-400 flex items-center justify-center shadow-neo-low dark:shadow-[2px_2px_0px_#000000] animate-bounce-subtle`}
          >
            {slide.overlayIcon}
          </div>
        </div>

        {/* Content Area (NeedMCP Wireframe: content-area) */}
        <div className="w-full text-center flex flex-col items-center gap-2.5 max-w-sm mx-auto mt-2">
          <span className="inline-block bg-snip-accent dark:bg-amber-400 text-snip-ink border-2 border-snip-ink text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#131B2E]">
            {slide.tag}
          </span>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-snip-ink dark:text-white leading-snug">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed px-2">
            {slide.description}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
            {slide.pills.map((pill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white dark:bg-slate-800 text-snip-ink dark:text-slate-200 border border-snip-ink dark:border-slate-600 px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#131B2E] dark:shadow-[1px_1px_0px_#000000]"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>{pill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar (NeedMCP Wireframe: bottom-bar) */}
      <div className="w-full bg-snip-surface dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 rounded-xl p-3 shadow-neo dark:shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3 pb-safe z-20">
        {/* Back / Skip Link */}
        <div className="w-24 flex items-center">
          {currentSlide > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1 text-xs font-black text-snip-ink dark:text-slate-300 hover:text-snip-primary dark:hover:text-sky-400 cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-snip-ink dark:hover:text-slate-200 cursor-pointer"
            >
              Lewati Tur
            </button>
          )}
        </div>

        {/* Slider Dots (NeedMCP Wireframe: slider-dots) */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx
                  ? 'w-6 bg-snip-primary dark:bg-sky-400 border border-snip-ink dark:border-white/40'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              title={`Buka Fitur ${idx + 1}`}
              aria-label={`Buka Fitur ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next / Finish Button (NeedMCP Wireframe: next-button) */}
        <div className="w-24 flex justify-end">
          {currentSlide < slides.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 bg-snip-primary hover:bg-blue-700 text-white border-2 border-snip-ink dark:border-slate-500 rounded-lg flex items-center justify-center shadow-neo-low cursor-pointer active:scale-95 transition-transform"
              title="Fitur Selanjutnya"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="bg-snip-accent hover:bg-amber-300 text-snip-ink border-2 border-snip-ink font-black text-xs px-3 py-2 rounded-lg shadow-neo-low cursor-pointer active:scale-95 transition-transform flex items-center gap-1"
            >
              <span>Mulai</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
