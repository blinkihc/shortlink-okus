import React, { useState, useEffect } from 'react';
import { ChevronDown, Tag, KeyRound, Scissors, ClipboardPaste, AlertTriangle, UserPlus } from 'lucide-react';
import type { LinkCategory, UtmConfig, LinkItem } from '../../types';
import { useLinkStore } from '../../stores/useLinkStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { resolveSlug } from '../../utils/slugGenerator';
import { isValidUrl, appendUtmParameters } from '../../utils/urlValidator';
import { UtmBuilderModal } from './UtmBuilderModal';
import { APP_CONFIG } from '../../config/appConfig';

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
  const { user, openAuthModal } = useAuthStore();
  const { categories, guestLinkExpiryDays, fetchPublicCategories, fetchPublicSettings } = useAdminStore();

  useEffect(() => {
    fetchPublicCategories();
    fetchPublicSettings();
  }, [fetchPublicCategories, fetchPublicSettings]);

  const isGuest = !user;
  const isGuestAtLimit = isGuest && links.length >= 1;

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
    if (isGuestAtLimit) {
      showToast('Batas 1 tautan mode tamu tercapai. Masuk untuk tautan tanpa batas.', false);
      openAuthModal('register');
      return;
    }

    if (!isValidUrl(url)) {
      showToast('Harap masukkan URL yang valid (https://...)', false);
      return;
    }

    const finalOriginalUrl = (!isGuest && utmConfig) ? appendUtmParameters(url, utmConfig) : url;
    const existingSlugs = links.map(l => l.shortSlug);
    const slug = (!isGuest && customSlug) ? resolveSlug(customSlug, existingSlugs) : resolveSlug('', existingSlugs);

    try {
      const created = await addLink({
        originalUrl: finalOriginalUrl,
        shortSlug: slug,
        category: !isGuest ? category : 'Promo',
        pinCode: !isGuest && pinCode.trim() ? pinCode.trim() : undefined
      });

      onCreated(created);
      setUrl('');
      setCustomSlug('');
      setPinCode('');
      setUtmConfig(undefined);
    } catch (err: any) {
      if (err.message && err.message.includes('Mode Tamu')) {
        openAuthModal('register');
      }
    }
  };

  return (
    <section className="card-neo">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-snip-ink dark:text-white">
            Pemendek Tautan Kilat
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Tempel URL panjang untuk membuat tautan ringkas dan kode QR instan.
          </p>
        </div>
      </div>

      {/* Banner Limit Tamu */}
      {isGuestAtLimit && (
        <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-500 rounded-lg p-3 my-3 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-black text-xs text-amber-900 dark:text-amber-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Batas 1 Tautan Tamu Tercapai</span>
          </div>
          <p className="text-[11px] leading-relaxed mb-2">
            Anda telah menggunakan kuota 1 tautan tamu (aktif {guestLinkExpiryDays} hari). Daftar atau masuk untuk tautan permanen tanpa batas & analitik riil.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="w-full py-1.5 bg-snip-primary hover:bg-blue-700 text-white font-black rounded border-2 border-snip-ink dark:border-slate-500 shadow-neo-low cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar / Masuk Akun Sekarang →</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
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
              className="absolute right-2 p-1.5 bg-snip-muted dark:bg-slate-800 border border-snip-ink dark:border-slate-500 rounded-sm text-snip-ink dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Tempel dari Clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Options Accordion Toggle & Body (Hanya untuk pengguna terdaftar / login) */}
        {!isGuest && (
          <>
            <div className="flex items-center justify-between pt-0.5">
              <button 
                type="button" 
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="inline-flex items-center gap-1 text-xs font-bold text-snip-primary dark:text-sky-400 hover:underline cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`} />
                <span>Kustomisasi Slug, Kategori & PIN</span>
              </button>

              <button 
                type="button" 
                onClick={() => setIsUtmOpen(true)}
                className={`text-[11px] font-extrabold px-2 py-1 rounded-sm border flex items-center gap-1 cursor-pointer ${
                  utmConfig 
                    ? 'bg-snip-accent text-snip-ink border-snip-ink' 
                    : 'bg-snip-muted dark:bg-slate-800 text-snip-ink dark:text-slate-200 border-snip-ink dark:border-slate-500'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>{utmConfig ? 'UTM Aktif' : '+ UTM'}</span>
              </button>
            </div>

            {/* Collapsible Options Body */}
            {isOptionsOpen && (
              <div className="bg-snip-muted dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-600 rounded-md p-3 flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] font-bold block mb-1 text-snip-ink dark:text-slate-200">Alias Slug Tautan</label>
                  <div className="flex items-center border-2 border-snip-ink dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 overflow-hidden shadow-neo-low">
                    <span className="bg-snip-ink dark:bg-slate-800 text-white dark:text-slate-200 text-xs font-bold px-2.5 py-2 select-none border-r border-snip-ink dark:border-slate-600">
                      {APP_CONFIG.defaultDomain}/
                    </span>
                    <input 
                      type="text" 
                      value={customSlug}
                      onChange={e => setCustomSlug(e.target.value)}
                      placeholder="promo-kopi"
                      className="w-full px-2.5 py-1.5 text-xs font-bold outline-none bg-transparent text-snip-ink dark:text-white"
                      maxLength={30}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Kosongkan untuk membuat kode 6 karakter acak otomatis.</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-snip-ink dark:text-slate-200">Kategori</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value as LinkCategory)}
                      className="w-full bg-white dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 rounded-md px-2 py-1.5 text-xs font-bold shadow-neo-low outline-none text-snip-ink dark:text-white cursor-pointer"
                    >
                      {categories.length > 0 ? (
                        categories.filter(c => c.isActive).map(c => (
                          <option key={c.id} value={c.nama}>{c.nama}</option>
                        ))
                      ) : (
                        <>
                          <option value="Promo">Promo</option>
                          <option value="Sosial Media">Sosial Media</option>
                          <option value="Produk">Produk</option>
                          <option value="Kontak">Kontak</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-snip-ink dark:text-slate-200">PIN Proteksi (Opsional)</label>
                    <div className="flex items-center relative">
                      <input 
                        type="password"
                        maxLength={4}
                        value={pinCode}
                        onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 Digit PIN"
                        className="w-full bg-white dark:bg-slate-900 border-2 border-snip-ink dark:border-slate-600 rounded-md px-2.5 py-1.5 text-xs font-bold shadow-neo-low outline-none text-snip-ink dark:text-white"
                      />
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-neo-primary w-full mt-1 cursor-pointer">
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
