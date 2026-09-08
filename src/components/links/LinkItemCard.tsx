import { Pin, Copy, QrCode, Trash2, Share2, Shield } from 'lucide-react';
import type { LinkItem } from '../../types';
import { shareLink } from '../../utils/shareHelper';
import { useLinkStore } from '../../stores/useLinkStore';

interface LinkItemCardProps {
  link: LinkItem;
  onOpenQR: (url: string) => void;
}

export function LinkItemCard({ link, onOpenQR }: LinkItemCardProps) {
  const { togglePin, deleteLink, showToast } = useLinkStore();

  const handleCopy = () => {
    navigator.clipboard?.writeText(link.shortUrl);
    showToast(`Tersalin: ${link.shortUrl}`);
  };

  const handleShare = async () => {
    const res = await shareLink({
      title: `SnipLink: ${link.shortSlug}`,
      url: link.shortUrl
    });
    if (res === 'shared') {
      showToast('Tautan berhasil dibagikan!');
    } else if (res === 'copied') {
      showToast(`Tersalin ke clipboard: ${link.shortUrl}`);
    }
  };

  let badgeColor = 'bg-snip-muted text-snip-ink dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
  if (link.category === 'Promo') badgeColor = 'bg-snip-accent text-snip-ink dark:bg-amber-400 dark:text-slate-900';
  if (link.category === 'Sosial Media') badgeColor = 'bg-[#E2E7FF] text-snip-primary dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-600';
  if (link.category === 'Produk') badgeColor = 'bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-600';
  if (link.category === 'Kontak') badgeColor = 'bg-[#FFE4E6] text-[#9F1239] dark:bg-rose-950 dark:text-rose-200 dark:border-rose-600';

  return (
    <div className="bg-snip-surface dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 rounded-lg p-3.5 shadow-neo dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-2.5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-snip-ink uppercase tracking-wider shrink-0 ${badgeColor}`}>
            {link.category}
          </span>
          <a 
            href={link.shortUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm font-extrabold text-snip-primary dark:text-sky-400 hover:underline truncate"
          >
            {link.shortUrl}
          </a>
        </div>

        <button 
          type="button" 
          onClick={() => togglePin(link.id)}
          className="p-1 border border-snip-ink dark:border-slate-500 rounded-sm shadow-[1px_1px_0px_#131B2E] dark:shadow-[1px_1px_0px_#000000] text-snip-ink dark:text-slate-200 hover:bg-snip-muted dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title={link.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
        >
          <Pin className={`w-3.5 h-3.5 ${link.isPinned ? 'fill-snip-accent text-snip-ink dark:fill-amber-400 dark:text-amber-400' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={link.originalUrl}>
          {link.originalUrl}
        </div>
        <div className="bg-snip-bg dark:bg-slate-800 border border-snip-ink dark:border-slate-600 rounded px-2 py-0.5 text-[10px] font-extrabold text-snip-ink dark:text-slate-200 shrink-0 flex items-center gap-1 shadow-neo-low dark:shadow-[1px_1px_0px_#000000]">
          {link.pinCode && <Shield className="w-2.5 h-2.5 text-snip-accent dark:text-amber-400" />}
          <span>{link.clicks} Klik • {link.scans} Scan</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
        <div className="flex gap-1.5">
          <button 
            type="button" 
            onClick={handleCopy}
            className="btn-neo-surface px-2.5 py-1 text-[11px] font-bold shadow-neo-low dark:shadow-[2px_2px_0px_#000000] flex items-center gap-1"
            title="Salin Tautan"
          >
            <Copy className="w-3 h-3" />
            <span>Salin</span>
          </button>

          <button 
            type="button" 
            onClick={() => onOpenQR(link.shortUrl)}
            className="btn-neo-surface px-2.5 py-1 text-[11px] font-bold shadow-neo-low dark:shadow-[2px_2px_0px_#000000] flex items-center gap-1"
            title="Kustomisasi QR"
          >
            <QrCode className="w-3 h-3" />
            <span>QR</span>
          </button>

          <button 
            type="button" 
            onClick={handleShare}
            className="btn-neo-surface px-2.5 py-1 text-[11px] font-bold shadow-neo-low dark:shadow-[2px_2px_0px_#000000] flex items-center gap-1"
            title="Bagikan Tautan"
          >
            <Share2 className="w-3 h-3" />
            <span>Bagikan</span>
          </button>
        </div>

        <button 
          type="button" 
          onClick={() => deleteLink(link.id)}
          className="p-1 text-snip-danger hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
          title="Hapus Tautan"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
