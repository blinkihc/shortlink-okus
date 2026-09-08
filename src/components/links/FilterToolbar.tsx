import React, { useRef } from 'react';
import { Search, Download, Upload } from 'lucide-react';
import { useLinkStore } from '../../stores/useLinkStore';
import { exportLinksToJson, exportLinksToCsv, parseAndValidateJsonBackup, downloadFile } from '../../utils/backupHelper';
import type { LinkCategory } from '../../types';

export function FilterToolbar() {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    links, 
    showToast
  } = useLinkStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: { label: string; value: LinkCategory | 'all' }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Promo', value: 'Promo' },
    { label: 'Sosial Media', value: 'Sosial Media' },
    { label: 'Produk', value: 'Produk' },
    { label: 'Kontak', value: 'Kontak' }
  ];

  const handleExportJson = () => {
    const json = exportLinksToJson(links);
    downloadFile(json, `sniplink-backup-${Date.now()}.json`, 'application/json');
    showToast('Cadangan berkas JSON berhasil diunduh!');
  };

  const handleExportCsv = () => {
    const csv = exportLinksToCsv(links);
    downloadFile(csv, `sniplink-report-${Date.now()}.csv`, 'text/csv');
    showToast('Laporan berkas CSV berhasil diunduh!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = parseAndValidateJsonBackup(content);
      if (result.success && result.data) {
        useLinkStore.setState({ links: result.data });
        showToast(`${result.data.length} tautan berhasil dipulihkan dari cadangan!`);
      } else {
        showToast(result.error || 'Gagal mengimpor berkas cadangan.', false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama alias atau URL asli..."
          className="input-neo pl-9 py-2 text-xs"
        />
      </div>

      {/* Categories & Backup Actions Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-1.5 shrink-0">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border-2 border-snip-ink dark:border-slate-500 transition-colors shadow-neo-low dark:shadow-none cursor-pointer ${
                selectedCategory === cat.value 
                  ? 'bg-snip-primary text-white translate-x-[1px] translate-y-[1px]' 
                  : 'bg-white dark:bg-slate-800 text-snip-ink dark:text-slate-200 hover:dark:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 shrink-0">
          <button 
            type="button" 
            onClick={handleExportJson}
            className="p-1.5 bg-snip-surface dark:bg-slate-800 border border-snip-ink dark:border-slate-500 rounded shadow-[1px_1px_0px_#131B2E] dark:shadow-none text-snip-ink dark:text-slate-200 hover:bg-snip-muted dark:hover:bg-slate-700 cursor-pointer"
            title="Ekspor Cadangan JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={handleExportCsv}
            className="p-1.5 bg-snip-surface dark:bg-slate-800 border border-snip-ink dark:border-slate-500 rounded shadow-[1px_1px_0px_#131B2E] dark:shadow-none text-snip-ink dark:text-slate-200 hover:bg-snip-muted dark:hover:bg-slate-700 cursor-pointer"
            title="Ekspor Laporan CSV"
          >
            <span className="text-[9px] font-extrabold px-0.5">CSV</span>
          </button>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-snip-surface dark:bg-slate-800 border border-snip-ink dark:border-slate-500 rounded shadow-[1px_1px_0px_#131B2E] dark:shadow-none text-snip-ink dark:text-slate-200 hover:bg-snip-muted dark:hover:bg-slate-700 cursor-pointer"
            title="Pulihkan dari Berkas JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
}
