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
    <section className="bg-[#EBF3FF] border-2 border-snip-primary rounded-lg p-4 shadow-neo flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="bg-snip-success text-white text-[10px] font-extrabold px-2 py-0.5 rounded border border-snip-ink tracking-wider flex items-center gap-1">
          <Check className="w-3 h-3" strokeWidth={3} />
          <span>SUKSES DIBUAT</span>
        </div>
        <button 
          type="button" 
          onClick={onClose}
          className="text-snip-ink p-1 hover:bg-white/60 rounded"
          title="Tutup Kartu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="text-base font-extrabold text-snip-primary break-all">
          {link.shortUrl}
        </div>
        <div className="text-xs text-slate-500 truncate mt-0.5" title={link.originalUrl}>
          {link.originalUrl}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button 
          type="button" 
          onClick={() => onCopy(link.shortUrl)}
          className="btn-neo-accent btn-neo-sm flex items-center justify-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Salin Tautan</span>
        </button>
        <button 
          type="button" 
          onClick={() => onOpenQR(link.shortUrl)}
          className="btn-neo-surface btn-neo-sm flex items-center justify-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Buka di QR</span>
        </button>
      </div>
    </section>
  );
}
