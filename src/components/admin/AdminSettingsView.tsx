import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  Tag, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Save, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useLinkStore } from '../../stores/useLinkStore';
import type { CategoryItem, FrameAksiItem } from '../../types';

interface AdminSettingsViewProps {
  onBack: () => void;
}

export function AdminSettingsView({ onBack }: AdminSettingsViewProps) {
  const {
    guestLinkExpiryDays,
    categories,
    frames,
    isSavingSettings,
    fetchPublicSettings,
    fetchAdminCategories,
    fetchAdminFrames,
    updateGuestExpiryDays,
    addCategory,
    updateCategory,
    deleteCategory,
    addFrame,
    updateFrame,
    deleteFrame
  } = useAdminStore();

  const { showToast } = useLinkStore();

  // Local state untuk form pengaturan tamu
  const [expiryDaysInput, setExpiryDaysInput] = useState<number>(guestLinkExpiryDays);

  // Local state untuk form kategori
  const [newCatName, setNewCatName] = useState<string>('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState<string>('');

  // Local state untuk form frame aksi
  const [newFrameName, setNewFrameName] = useState<string>('');
  const [newFrameCta, setNewFrameCta] = useState<string>('');
  const [newFrameKode, setNewFrameKode] = useState<string>('');
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [editingFrameName, setEditingFrameName] = useState<string>('');
  const [editingFrameCta, setEditingFrameCta] = useState<string>('');

  useEffect(() => {
    fetchPublicSettings().then(() => {
      setExpiryDaysInput(useAdminStore.getState().guestLinkExpiryDays);
    });
    fetchAdminCategories();
    fetchAdminFrames();
  }, [fetchPublicSettings, fetchAdminCategories, fetchAdminFrames]);

  // Handler Simpan Batas Hari Tamu
  const handleSaveExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = Math.max(1, Number(expiryDaysInput) || 5);
    const result = await updateGuestExpiryDays(days);
    showToast(result.message, result.success);
  };

  // Handler Tambah Kategori
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Nama kategori wajib diisi.', false);
      return;
    }
    const result = await addCategory(newCatName.trim());
    if (result.success) {
      setNewCatName('');
    }
    showToast(result.message, result.success);
  };

  // Handler Simpan Edit Kategori
  const handleSaveEditCategory = async (id: string) => {
    if (!editingCatName.trim()) {
      showToast('Nama kategori tidak boleh kosong.', false);
      return;
    }
    const result = await updateCategory(id, { nama: editingCatName.trim() });
    if (result.success) {
      setEditingCatId(null);
      setEditingCatName('');
    }
    showToast(result.message, result.success);
  };

  // Handler Hapus Kategori
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (window.confirm(`Hapus kategori '${cat.nama}'?`)) {
      const result = await deleteCategory(cat.id);
      showToast(result.message, result.success);
    }
  };

  // Handler Toggle Status Kategori
  const handleToggleCatActive = async (cat: CategoryItem) => {
    const result = await updateCategory(cat.id, { isActive: !cat.isActive });
    showToast(result.message, result.success);
  };

  // Handler Tambah Frame Aksi
  const handleAddFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrameName.trim() || !newFrameCta.trim()) {
      showToast('Nama frame dan teks CTA wajib diisi.', false);
      return;
    }
    const result = await addFrame({
      nama: newFrameName.trim(),
      teksCta: newFrameCta.trim(),
      kode: newFrameKode.trim() || undefined
    });
    if (result.success) {
      setNewFrameName('');
      setNewFrameCta('');
      setNewFrameKode('');
    }
    showToast(result.message, result.success);
  };

  // Handler Simpan Edit Frame
  const handleSaveEditFrame = async (id: string) => {
    if (!editingFrameName.trim() || !editingFrameCta.trim()) {
      showToast('Nama dan teks CTA tidak boleh kosong.', false);
      return;
    }
    const result = await updateFrame(id, {
      nama: editingFrameName.trim(),
      teksCta: editingFrameCta.trim()
    });
    if (result.success) {
      setEditingFrameId(null);
      setEditingFrameName('');
      setEditingFrameCta('');
    }
    showToast(result.message, result.success);
  };

  // Handler Hapus Frame
  const handleDeleteFrame = async (frame: FrameAksiItem) => {
    if (window.confirm(`Hapus frame stiker '${frame.nama}'?`)) {
      const result = await deleteFrame(frame.id);
      showToast(result.message, result.success);
    }
  };

  // Handler Toggle Status Frame
  const handleToggleFrameActive = async (frame: FrameAksiItem) => {
    const result = await updateFrame(frame.id, { isActive: !frame.isActive });
    showToast(result.message, result.success);
  };

  return (
    <div className="flex flex-col gap-4 pb-12 animate-fade-slide-up">
      {/* Bilah Atas: Navigasi Kembali & Judul Pengaturan */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-snip-ink/20 dark:border-slate-700 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-neo-surface btn-neo-sm flex items-center gap-1.5 cursor-pointer"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="w-4 h-4 text-snip-ink dark:text-slate-200" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-1.5 bg-amber-400 border-2 border-snip-ink text-snip-ink px-2.5 py-1 rounded-md text-[11px] font-black shadow-neo-low">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Role: Administrator</span>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-black tracking-tight text-snip-ink dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-snip-primary dark:text-sky-400" />
          <span>Pengaturan Sistem</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          Kelola parameter global aplikasi, daftar kategori tautan, dan template frame stiker QR.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. KARTU PENGATURAN BATAS WAKTU TAUTAN TAMU */}
      {/* ========================================================================= */}
      <section className="card-neo flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-snip-ink/10 dark:border-slate-700 pb-2">
          <div className="w-7 h-7 rounded-md bg-snip-primary text-white flex items-center justify-center border border-snip-ink shadow-neo-low shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-snip-ink dark:text-white">
              1. Masa Aktif Tautan Tamu
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Membatasi durasi simpan tautan non-member sebelum otomatis dihapus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveExpiry} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200 tracking-wider">
              Batas Waktu (Hari)
            </label>
            <div className="flex items-center relative">
              <input
                type="number"
                min={1}
                max={365}
                required
                value={expiryDaysInput}
                onChange={e => setExpiryDaysInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="input-neo text-sm font-black w-full"
              />
              <span className="absolute right-3 text-xs font-black text-slate-400 pointer-events-none">
                Hari
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="btn-neo-primary text-xs font-black py-2.5 px-4 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Batas Hari'}</span>
          </button>
        </form>

        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-400 dark:border-sky-700 rounded-md p-2.5 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <span>
            Saat ini tautan tamu disetel kedaluwarsa dalam <strong>{guestLinkExpiryDays} hari</strong>. Member terdaftar tetap memiliki tautan permanen tanpa batas waktu.
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. KARTU PENGELOLAAN DAFTAR KATEGORI TAUTAN */}
      {/* ========================================================================= */}
      <section className="card-neo flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-snip-ink/10 dark:border-slate-700 pb-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500 text-white flex items-center justify-center border border-snip-ink shadow-neo-low shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-snip-ink dark:text-white">
              2. Daftar Kategori Tautan (Tabel: kategori)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sinkron ke formulir pemendek & bilah penyaringan tautan.
            </p>
          </div>
        </div>

        {/* Form Tambah Kategori Baru */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Contoh: Webinar, Undangan, Event..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="input-neo text-xs flex-1"
            maxLength={30}
          />
          <button
            type="submit"
            className="btn-neo-accent btn-neo-sm flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Daftar Kategori */}
        <div className="flex flex-col gap-2 mt-1">
          {categories.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400">
              Belum ada kategori terdaftar.
            </div>
          ) : (
            categories.map(cat => {
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`p-2.5 rounded-md border-2 border-snip-ink dark:border-slate-600 flex items-center justify-between gap-2 shadow-neo-low transition-colors ${
                    cat.isActive 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-slate-100 dark:bg-slate-800/60 opacity-60'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={e => setEditingCatName(e.target.value)}
                        className="input-neo text-xs py-1 px-2 flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEditCategory(cat.id)}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded border border-snip-ink cursor-pointer"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-snip-ink cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-snip-ink dark:text-white">
                          {cat.nama}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleCatActive(cat)}
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-snip-ink cursor-pointer ${
                            cat.isActive 
                              ? 'bg-emerald-300 text-emerald-950' 
                              : 'bg-slate-300 text-slate-800'
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          {cat.isActive ? 'AKTIF' : 'NON-AKTIF'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.nama);
                          }}
                          className="p-1 text-slate-600 hover:text-snip-primary dark:text-slate-300 dark:hover:text-sky-400 cursor-pointer"
                          title="Ubah Nama"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KARTU PENGELOLAAN FRAME STIKER AKSI (CTA) */}
      {/* ========================================================================= */}
      <section className="card-neo flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-snip-ink/10 dark:border-slate-700 pb-2">
          <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center border border-snip-ink shadow-neo-low shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-snip-ink dark:text-white">
              3. Daftar Frame Stiker Aksi (Tabel: frame_aksi)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Template stiker CTA yang muncul di bawah kode QR pada Playful QR Studio.
            </p>
          </div>
        </div>

        {/* Form Tambah Frame Baru */}
        <form onSubmit={handleAddFrame} className="bg-snip-muted dark:bg-slate-800 border-2 border-snip-ink dark:border-slate-700 rounded-md p-3 flex flex-col gap-2.5">
          <div className="text-[11px] font-extrabold uppercase text-snip-ink dark:text-slate-200">
            + Tambah Template Frame Baru
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-slate-300">
                Nama Frame
              </label>
              <input
                type="text"
                placeholder="Contoh: Flash Sale"
                value={newFrameName}
                onChange={e => setNewFrameName(e.target.value)}
                className="input-neo text-xs w-full"
                maxLength={30}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-slate-300">
                Teks Stiker CTA
              </label>
              <input
                type="text"
                placeholder="Contoh: DISKON 50%!"
                value={newFrameCta}
                onChange={e => setNewFrameCta(e.target.value)}
                className="input-neo text-xs w-full uppercase"
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <input
              type="text"
              placeholder="Kode Unik (Opsional, cth: flash-sale)"
              value={newFrameKode}
              onChange={e => setNewFrameKode(e.target.value)}
              className="input-neo text-xs flex-1"
              maxLength={25}
            />

            <button
              type="submit"
              className="btn-neo-accent btn-neo-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan Frame</span>
            </button>
          </div>
        </form>

        {/* Daftar Frame Aksi */}
        <div className="flex flex-col gap-2.5 mt-1">
          {frames.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400">
              Belum ada template frame stiker aksi.
            </div>
          ) : (
            frames.map(frame => {
              const isEditing = editingFrameId === frame.id;

              return (
                <div
                  key={frame.id}
                  className={`p-3 rounded-md border-2 border-snip-ink dark:border-slate-600 flex flex-col gap-2 shadow-neo-low transition-colors ${
                    frame.isActive 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-slate-100 dark:bg-slate-800/60 opacity-60'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold block mb-0.5 text-slate-500">Nama Frame</label>
                          <input
                            type="text"
                            value={editingFrameName}
                            onChange={e => setEditingFrameName(e.target.value)}
                            className="input-neo text-xs py-1 px-2 w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-0.5 text-slate-500">Teks CTA</label>
                          <input
                            type="text"
                            value={editingFrameCta}
                            onChange={e => setEditingFrameCta(e.target.value)}
                            className="input-neo text-xs py-1 px-2 w-full uppercase"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveEditFrame(frame.id)}
                          className="btn-neo-sm bg-emerald-500 text-white border border-snip-ink px-3 py-1 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFrameId(null)}
                          className="btn-neo-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-snip-ink px-3 py-1 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Batal</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Stiker Preview Box */}
                        <div className="bg-snip-accent text-snip-ink border-2 border-snip-ink rounded px-2 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_#131B2E] shrink-0">
                          {frame.teksCta}
                        </div>

                        <div>
                          <div className="text-xs font-black text-snip-ink dark:text-white flex items-center gap-1.5">
                            <span>{frame.nama}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              ({frame.kode})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFrameActive(frame)}
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border border-snip-ink mt-0.5 cursor-pointer ${
                              frame.isActive 
                                ? 'bg-emerald-300 text-emerald-950' 
                                : 'bg-slate-300 text-slate-800'
                            }`}
                            title="Klik untuk mengubah status aktif"
                          >
                            {frame.isActive ? 'AKTIF' : 'NON-AKTIF'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFrameId(frame.id);
                            setEditingFrameName(frame.nama);
                            setEditingFrameCta(frame.teksCta);
                          }}
                          className="p-1.5 text-slate-600 hover:text-snip-primary dark:text-slate-300 dark:hover:text-sky-400 cursor-pointer"
                          title="Ubah Frame"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFrame(frame)}
                          className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                          title="Hapus Frame"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
