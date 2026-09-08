import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { UtmConfig } from '../../types';

interface UtmBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: UtmConfig) => void;
  initialConfig?: UtmConfig;
}

export function UtmBuilderModal({ isOpen, onClose, onSave, initialConfig }: UtmBuilderModalProps) {
  const [source, setSource] = useState(initialConfig?.source || 'instagram');
  const [medium, setMedium] = useState(initialConfig?.medium || 'bio');
  const [campaign, setCampaign] = useState(initialConfig?.campaign || 'promo_ramadhan');
  const [term, setTerm] = useState(initialConfig?.term || '');
  const [content, setContent] = useState(initialConfig?.content || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      source: source.trim(),
      medium: medium.trim(),
      campaign: campaign.trim(),
      term: term.trim() || undefined,
      content: content.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-snip-ink/70 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-snip-surface dark:bg-slate-900 border-3 border-snip-ink dark:border-slate-500 rounded-lg shadow-neo-deep dark:shadow-[6px_6px_0px_#000000] w-full max-w-[380px] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-snip-ink dark:border-slate-700 pb-2">
          <div className="font-extrabold text-sm text-snip-ink dark:text-white">Pembangun Parameter UTM</div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-snip-ink dark:text-slate-200 hover:bg-snip-muted dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          <div>
            <label className="font-bold block mb-1 text-snip-ink dark:text-slate-200">UTM Source (Sumber Kampanye)</label>
            <input 
              type="text" 
              value={source} 
              onChange={e => setSource(e.target.value)}
              placeholder="instagram, whatsapp, tiktok"
              className="input-neo text-xs py-1.5"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-snip-ink dark:text-slate-200">UTM Medium (Media Tautan)</label>
            <input 
              type="text" 
              value={medium} 
              onChange={e => setMedium(e.target.value)}
              placeholder="bio, story, broadcast, banner"
              className="input-neo text-xs py-1.5"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-snip-ink dark:text-slate-200">UTM Campaign (Nama Kampanye)</label>
            <input 
              type="text" 
              value={campaign} 
              onChange={e => setCampaign(e.target.value)}
              placeholder="diskon_lebaran_2026"
              className="input-neo text-xs py-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1 text-snip-ink dark:text-slate-200">UTM Term (Opsional)</label>
              <input 
                type="text" 
                value={term} 
                onChange={e => setTerm(e.target.value)}
                placeholder="kopi+susu"
                className="input-neo text-xs py-1.5"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-snip-ink dark:text-slate-200">UTM Content (Opsional)</label>
              <input 
                type="text" 
                value={content} 
                onChange={e => setContent(e.target.value)}
                placeholder="cta_button_top"
                className="input-neo text-xs py-1.5"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t-2 border-snip-ink dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-neo-surface btn-neo-sm cursor-pointer">
            Batal
          </button>
          <button type="button" onClick={handleApply} className="btn-neo-primary btn-neo-sm cursor-pointer">
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan UTM</span>
          </button>
        </div>
      </div>
    </div>
  );
}
