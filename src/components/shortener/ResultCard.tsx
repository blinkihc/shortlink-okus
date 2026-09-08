import { Check, Copy, QrCode, X } from 'lucide-react';
import type { LinkItem } from '../../types';

interface ResultCardProps {
  link: LinkItem;
  onClose: () => void;
  onOpenQR: (url: string) => void;
  onCopy: (text: string) => void;
}

export function ResultCard({ link, onClose, onOpenQR, onCopy }: ResultCardProps) {
  return (
    <section className="bg-[#EBF3FF] dark:bg-slate-900 border-2 border-snip-primary dark:border-sky-500 rounded-lg p-4 shadow-neo dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-2.5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="bg-snip-success text-white text-[10px] font-extrabold px-2 py-0.5 rounded border border-snip-ink tracking-wider flex items-center gap-1">
          <Check className="w-3 h-3" strokeWidth={3} />
          <span>SUKSES DIBUAT</span>
        </div>
        <button 
          type="button" 
          onClick={onClose}
          className="text-snip-ink dark:text-slate-200 p-1 hover:bg-white/60 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Tutup Kartu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="text-base font-extrabold text-snip-primary dark:text-sky-400 break-all">
          {link.shortUrl}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-300 truncate mt-0.5" title={link.originalUrl}>
          {link.originalUrl}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button 
          type="button" 
          onClick={() => onCopy(link.shortUrl)}
          className="btn-neo-accent btn-neo-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Salin Tautan</span>
        </button>
        <button 
          type="button" 
          onClick={() => onOpenQR(link.shortUrl)}
          className="btn-neo-surface btn-neo-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Buka di QR</span>
        </button>
      </div>
    </section>
  );
}
