import React, { useState } from 'react';
import { ChevronDown, Tag, KeyRound, Scissors, ClipboardPaste } from 'lucide-react';
import type { LinkCategory, UtmConfig, LinkItem } from '../../types';
import { useLinkStore } from '../../stores/useLinkStore';
import { resolveSlug } from '../../utils/slugGenerator';
import { isValidUrl, appendUtmParameters } from '../../utils/urlValidator';
import { UtmBuilderModal } from './UtmBuilderModal';

interface ShortenerCardProps {
  onCreated: (link: LinkItem) => void;
}

export function ShortenerCard({ onCreated }: ShortenerCardProps) {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [category, setCategory] = useState<LinkCategory>('Promo');
  const [pinCode, setPinCode] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isUtmOpen, setIsUtmOpen] = useState(false);
  const [utmConfig, setUtmConfig] = useState<UtmConfig | undefined>(undefined);

  const { links, addLink, showToast } = useLinkStore();

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          showToast('Tautan berhasil ditempel dari clipboard!');
          return;
        }
      }
    } catch {
      // Fallback sample
    }
    setUrl('https://tokopedia.com/promo-spesial-kemilau');
    showToast('Tautan sampel berhasil ditempel.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(url)) {
      showToast('Harap masukkan URL yang valid (https://...)', false);
      return;
    }

    const finalOriginalUrl = appendUtmParameters(url, utmConfig);
    const existingSlugs = links.map(l => l.shortSlug);
    const slug = resolveSlug(customSlug, existingSlugs);

    const created = await addLink({
      originalUrl: finalOriginalUrl,
      shortSlug: slug,
      category: category,
      pinCode: pinCode.trim() ? pinCode.trim() : undefined
    });

    onCreated(created);
    setUrl('');
    setCustomSlug('');
    setPinCode('');
    setUtmConfig(undefined);
  };

  return (
    <section className="card-neo">
      <h2 className="text-lg font-extrabold tracking-tight mb-1 text-snip-ink">
        Pemendek Tautan Kilat
      </h2>
      <p className="text-xs text-slate-600 mb-3.5">
        Tempel URL panjang untuk membuat tautan ringkas dan kode QR instan.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink tracking-wider">
            Tautan Asli (URL Panjang)
          </label>
          <div className="relative flex items-center">
            <input 
              type="url"
              required
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://tokopedia.com/produk/promo..."
              className="input-neo pr-10"
            />
            <button 
              type="button" 
              onClick={handlePaste}
              className="absolute right-2 p-1.5 bg-snip-muted border border-snip-ink rounded-sm text-snip-ink hover:bg-white transition-colors"
              title="Tempel dari Clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Options Accordion Toggle */}
        <div className="flex items-center justify-between pt-0.5">
          <button 
            type="button" 
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="inline-flex items-center gap-1 text-xs font-bold text-snip-primary hover:underline"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`} />
            <span>Kustomisasi Slug, Kategori & PIN</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsUtmOpen(true)}
            className={`text-[11px] font-extrabold px-2 py-1 rounded-sm border border-snip-ink flex items-center gap-1 ${
              utmConfig ? 'bg-snip-accent text-snip-ink' : 'bg-snip-muted text-snip-ink'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>{utmConfig ? 'UTM Aktif' : '+ UTM'}</span>
          </button>
        </div>

        {/* Collapsible Options Body */}
        {isOptionsOpen && (
          <div className="bg-snip-muted border-2 border-snip-ink rounded-md p-3 flex flex-col gap-2.5">
            <div>
              <label className="text-[11px] font-bold block mb-1">Alias Slug Tautan</label>
              <div className="flex items-center border-2 border-snip-ink rounded-md bg-white overflow-hidden shadow-neo-low">
                <span className="bg-snip-ink text-white text-xs font-bold px-2.5 py-2 select-none">
                  snip.link/
                </span>
                <input 
                  type="text" 
                  value={customSlug}
                  onChange={e => setCustomSlug(e.target.value)}
                  placeholder="promo-kopi"
                  className="w-full px-2.5 py-1.5 text-xs font-bold outline-none"
                  maxLength={30}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Kosongkan untuk membuat kode 6 karakter acak otomatis.</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold block mb-1">Kategori</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as LinkCategory)}
                  className="w-full bg-white border-2 border-snip-ink rounded-md px-2 py-1.5 text-xs font-bold shadow-neo-low outline-none"
                >
                  <option value="Promo">Promo & Diskon</option>
                  <option value="Sosial Media">Media Sosial</option>
                  <option value="Produk">Produk & Menu</option>
                  <option value="Kontak">Kontak & Portofolio</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">PIN Proteksi (Opsional)</label>
                <div className="flex items-center relative">
                  <input 
                    type="password"
                    maxLength={4}
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 Digit PIN"
                    className="w-full bg-white border-2 border-snip-ink rounded-md px-2.5 py-1.5 text-xs font-bold shadow-neo-low outline-none"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-neo-primary w-full mt-1">
          <Scissors className="w-4 h-4" />
          <span>Potong Tautan Sekarang</span>
        </button>
      </form>

      {/* UTM Builder Modal */}
      <UtmBuilderModal 
        isOpen={isUtmOpen}
        onClose={() => setIsUtmOpen(false)}
        initialConfig={utmConfig}
        onSave={cfg => {
          setUtmConfig(cfg);
          showToast('Parameter UTM berhasil dikonfigurasi!');
        }}
      />
    </section>
  );
}
