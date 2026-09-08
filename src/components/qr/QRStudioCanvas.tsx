import { useEffect, useRef, useState } from 'react';
import { Download, FileCode, Camera, Check, Link as LinkIcon } from 'lucide-react';
import { useLinkStore } from '../../stores/useLinkStore';
import { renderQRToCanvas, downloadCanvasAsPng, generateQRSvgString, downloadSvgString } from '../../utils/qrGenerator';
import { calculateContrastAgainstWhite } from '../../utils/contrastChecker';
import { APP_CONFIG } from '../../config/appConfig';
import { QRScannerModal } from './QRScannerModal';
import type { QRModuleStyle, QRFrameType } from '../../types';

export function QRStudioCanvas() {
  const { qrActiveUrl, qrConfig, updateQrConfig, setQrActiveUrl, showToast } = useLinkStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const contrastInfo = calculateContrastAgainstWhite(qrConfig.fgColor);

  useEffect(() => {
    if (canvasRef.current) {
      renderQRToCanvas(canvasRef.current, qrActiveUrl, qrConfig);
    }
  }, [qrActiveUrl, qrConfig]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, `sniplink-qr-${Date.now()}.png`);
    showToast('Berkas PNG resolusi tinggi berhasil diunduh!');
  };

  const handleDownloadSvg = () => {
    const svg = generateQRSvgString(qrActiveUrl, qrConfig);
    downloadSvgString(svg, `sniplink-vector-${Date.now()}.svg`);
    showToast('Berkas SVG vektor murni berhasil diunduh!');
  };

  const SOLID_PALETTE = [
    { hex: '#0058BE', name: 'Royal Blue' },
    { hex: '#131B2E', name: 'Ink Navy' },
    { hex: '#D6393D', name: 'Pop Coral' },
    { hex: '#FEA619', name: 'Sunshine Yellow' },
    { hex: '#10B981', name: 'Mint Light' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-snip-ink dark:text-white tracking-tight">Playful QR Studio</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Kustomisasi kode QR visual dengan warna solid dan frame stiker siap cetak.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setIsScannerOpen(true)}
          className="btn-neo-surface btn-neo-sm flex items-center gap-1.5 shrink-0"
          title="Buka Kamera Pemindai"
        >
          <Camera className="w-3.5 h-3.5 text-snip-primary" />
          <span>Pindai</span>
        </button>
      </div>

      {/* QR Canvas Stage Card */}
      <section className="card-neo flex flex-col items-center p-4 bg-white dark:bg-slate-900">
        <div className="w-full flex items-center justify-between mb-3">
          <div className={`px-2 py-0.5 rounded border text-[11px] font-extrabold flex items-center gap-1.5 ${contrastInfo.bgColorClass}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{contrastInfo.label}</span>
          </div>
          <div className="bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-600 rounded px-2 py-0.5 text-[10px] font-extrabold text-snip-ink dark:text-slate-200">
            300 DPI Ready
          </div>
        </div>

        {/* Frame Outer Wrapper - Tetap putih agar pembacaan kamera fisik 100% akurat */}
        <div className="bg-white border-3 border-snip-ink dark:border-slate-300 rounded-lg shadow-neo-deep dark:shadow-[4px_4px_0px_#000000] p-4 pb-3 flex flex-col items-center gap-2 relative">
          {qrConfig.frameType === 'wifi' && (
            <div className="bg-snip-accent text-snip-ink border-2 border-snip-ink rounded-sm text-xs font-extrabold px-3 py-1 shadow-[2px_2px_0px_#131B2E]">
              FREE WI-FI
            </div>
          )}

          <div className="relative flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              width={220} 
              height={220} 
              className="block rounded-md" 
            />

            {qrConfig.hasLogo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 bg-white border-2 border-snip-ink rounded-lg shadow-[2px_2px_0px_#131B2E] flex items-center justify-center text-snip-primary">
                  <LinkIcon className="w-6 h-6" strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {qrConfig.frameType !== 'none' && (
            <div className="bg-snip-accent text-snip-ink border-2 border-snip-ink rounded-sm text-xs font-extrabold px-3 py-1 shadow-[2px_2px_0px_#131B2E] uppercase">
              {qrConfig.frameType === 'scan-me' && 'SCAN ME!'}
              {qrConfig.frameType === 'menu' && 'LIHAT MENU'}
              {qrConfig.frameType === 'wifi' && 'SCAN TO CONNECT'}
            </div>
          )}
        </div>

        {/* Target URL Pill */}
        <div className="mt-3 bg-snip-bg dark:bg-slate-800 border border-snip-ink dark:border-slate-600 rounded-md px-3 py-1.5 text-xs max-w-full truncate flex items-center gap-1.5">
          <span className="font-extrabold text-snip-ink dark:text-slate-200 shrink-0">Target:</span>
          <span className="font-bold text-snip-primary dark:text-sky-400 truncate">{qrActiveUrl}</span>
        </div>
      </section>

      {/* QR Controls Card */}
      <section className="card-neo flex flex-col gap-4">
        {/* 1. Tautan Target */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
            1. Tautan Target QR
          </label>
          <input 
            type="text" 
            value={qrActiveUrl} 
            onChange={e => setQrActiveUrl(e.target.value.trim() || APP_CONFIG.baseUrl)}
            placeholder="https://..."
            className="input-neo text-xs"
          />
        </div>

        {/* 2. Warna Modul Solid (Anti-Gradient & Anti-Kamuflase Dark Mode) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
            2. Warna Modul Solid (Anti-Gradient)
          </label>
          <div className="flex gap-2.5">
            {SOLID_PALETTE.map(c => {
              const isSelected = qrConfig.fgColor === c.hex;
              const isDarkColor = c.hex === '#131B2E';
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => updateQrConfig({ fgColor: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  className={`w-10 h-10 rounded-md border-2 transition-all flex items-center justify-center text-white cursor-pointer ${
                    isDarkColor
                      ? 'border-snip-ink dark:border-white dark:ring-2 dark:ring-white/80'
                      : 'border-snip-ink dark:border-slate-300'
                  } shadow-[2px_2px_0px_#131B2E] dark:shadow-[2px_2px_0px_#000000] ${
                    isSelected 
                      ? '-translate-y-1 ring-2 ring-snip-primary dark:ring-[#FEA619] dark:ring-offset-2 dark:ring-offset-slate-900' 
                      : 'hover:opacity-90'
                  }`}
                >
                  {isSelected && <Check className="w-5 h-5 font-extrabold drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Bentuk Modul Pixel */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
            3. Bentuk Modul Pixel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['chunky', 'squircle', 'dot'] as QRModuleStyle[]).map(style => (
              <button
                key={style}
                type="button"
                onClick={() => updateQrConfig({ moduleStyle: style })}
                className={`text-xs font-bold py-2 px-2.5 rounded-md border-2 border-snip-ink dark:border-slate-500 shadow-neo-low dark:shadow-none capitalize cursor-pointer transition-colors ${
                  qrConfig.moduleStyle === style 
                    ? 'bg-snip-primary text-white translate-x-[1px] translate-y-[1px]' 
                    : 'bg-white dark:bg-slate-800 text-snip-ink dark:text-slate-200 hover:dark:bg-slate-700'
                }`}
              >
                {style === 'chunky' ? 'Chunky Block' : style === 'squircle' ? 'Squircle' : 'Round Dot'}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Frame Stiker CTA */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
            4. Frame Stiker Aksi (CTA)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['scan-me', 'menu', 'wifi', 'none'] as QRFrameType[]).map(frame => (
              <button
                key={frame}
                type="button"
                onClick={() => updateQrConfig({ frameType: frame })}
                className={`text-xs font-bold py-2 px-2.5 rounded-md border-2 border-snip-ink dark:border-slate-500 shadow-neo-low dark:shadow-none cursor-pointer transition-colors ${
                  qrConfig.frameType === frame 
                    ? 'bg-snip-primary text-white translate-x-[1px] translate-y-[1px]' 
                    : 'bg-white dark:bg-slate-800 text-snip-ink dark:text-slate-200 hover:dark:bg-slate-700'
                }`}
              >
                {frame === 'scan-me' && '"SCAN ME!"'}
                {frame === 'menu' && '"LIHAT MENU"'}
                {frame === 'wifi' && '"FREE WI-FI"'}
                {frame === 'none' && 'Tanpa Frame'}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Center Logo Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-extrabold text-snip-ink dark:text-slate-100">Sematan Logo di Tengah</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Mempertahankan error correction 30% (Level H)</div>
          </div>
          <input 
            type="checkbox"
            checked={qrConfig.hasLogo}
            onChange={e => updateQrConfig({ hasLogo: e.target.checked })}
            className="w-5 h-5 accent-snip-primary cursor-pointer"
          />
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-snip-ink dark:border-slate-700">
          <button 
            type="button" 
            onClick={handleDownloadPng}
            className="btn-neo-accent btn-neo-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PNG (HD)</span>
          </button>
          <button 
            type="button" 
            onClick={handleDownloadSvg}
            className="btn-neo-surface btn-neo-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Ekspor SVG</span>
          </button>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(text) => {
          setQrActiveUrl(text);
          showToast(`QR terbaca: ${text}`);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );
}
