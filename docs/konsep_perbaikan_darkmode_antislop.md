# Konsep Komprehensif Perbaikan Mode Gelap (Dark Mode) & Anti-Slop UI

**Standar Evaluasi:** `/ui-ux-pro-max` & `/code-refactoring`  
**Tujuan:** Menghilangkan kontras rendah, teks tak terbaca, dan elemen kamuflase pada tema gelap SnipLink.

---

## 1. Analisis Akar Masalah (Root Cause Analysis)

### A. Border Kolom/Kartu Nyaris Tak Terlihat (Low Contrast Eye-Strain)
- **Kondisi Saat Ini:** Kartu menggunakan `border-color: #334155` di atas latar `#070D1E` dan permukaan `#0F172A`. Rasio kontras hanya ~1.4:1.
- **Dampak:** Batas pemisah kartu hilang. Mata pengguna dipaksa bekerja keras mendeteksi batas kolom (*eye strain*), merusak esensi Neo-Pop (*bold chunky graphic lines*).
- **Solusi Tepat:** Naikkan kontras border kartu di mode gelap menjadi **`#64748B` (Baja Kontras)** atau garis tepi terang **`#CBD5E1` (Chalk Light)** dengan bayangan hitam pekat (`4px 4px 0px #000000`). Batas kartu langsung tegas dan terbaca seketika.

### B. Kotak Warna Hitam QR Menghilang (Kamuflase Latar)
- **Kondisi Saat Ini:** Pilihan warna kedua pada `QRStudioCanvas.tsx` adalah `#131B2E` (Ink Navy / Hitam Pekat). Tombol ini memiliki latar hitam, garis tepi hitam (`#131B2E`), dan bayangan hitam di atas kartu gelap.
- **Dampak:** Kotak warna hitam menjadi "lubang tak kasat mata" yang menyatu 100% dengan latar kartu mode gelap.
- **Solusi Tepat:**
  1. Berikan kontur pembatas kontras pada setiap swatch: `border-2 border-snip-ink dark:border-white`.
  2. Tambahkan cincin pemisah visual ganda: `dark:ring-2 dark:ring-slate-300 dark:ring-offset-2 dark:ring-offset-slate-900`.
  3. Saat warna gelap dipilih, tampilkan ikon centang putih bercahaya tegas atau indikator aktif berkontras tinggi.

### C. Teks Terbakar (*Invisible Black Text on Dark Surface*)
- **Kondisi Saat Ini:** Judul kartu `ShortenerCard.tsx`, label URL, accordion, dan header analitik masih menggunakan kelas statis `text-snip-ink` (`#131B2E`) tanpa varian gelap.
- **Solusi Tepat:** Refactoring token teks:
  - Judul Utama: `text-snip-ink dark:text-white` (Kontras 15.8:1, Lolos WCAG AAA).
  - Subteks / Panduan: `text-slate-600 dark:text-slate-300` (Kontras 7.2:1, Lolos WCAG AAA).
  - Label Metrik: `text-slate-500 dark:text-slate-400`.

### D. Kanvas Belang (*Frankenstein Theme Bleed*)
- **Kondisi Saat Ini:** Status bar ponsel, header aplikasi, dan beberapa tombol aksi masih memancarkan warna putih terang `#FFFFFF` atau lavender terang `#E2E7FF`.
- **Solusi Tepat:** Satukan seluruh shell aplikasi ke dalam hierarki warna gelap:
  - Latar Kanvas Terluar: `#070D1E`
  - Shell Bingkai Ponsel: `#0B132B`
  - Permukaan Kartu Aktif: `#162238` / `#0F172A`
  - Elemen Input & Tombol Sekunder: `#1E293B`

---

## 2. Arsitektur Perubahan Token CSS (`src/index.css`)

```css
/* Konsep Token Baru Mode Gelap Neo-Pop Bebas Mata Sakit */
html.dark body {
  background-color: #070D1E;
  color: #F8FAFC;
}

/* Kartu Neo-Pop Gelap dengan Border Kontras Tinggi */
html.dark .card-neo {
  background-color: #0F172A;
  border-color: #64748B; /* Border kontras tegas anti pusing */
  box-shadow: 4px 4px 0px #000000;
  color: #F8FAFC;
}

/* Input Form Gelap */
html.dark .input-neo {
  background-color: #1E293B;
  border-color: #64748B;
  color: #F8FAFC;
  box-shadow: 2px 2px 0px #000000;
}

html.dark .input-neo:focus {
  background-color: #334155;
  border-color: #FEA619; /* Aksen Fokus Kuning Terang */
}

/* Tombol Permukaan Gelap */
html.dark .btn-neo-surface {
  background-color: #1E293B;
  border-color: #64748B;
  color: #F8FAFC;
  box-shadow: 4px 4px 0px #000000;
}
```

---

## 3. Matriks Komponen & Aksi Refactoring

| Komponen | Masalah Saat Ini | Aksi Refactoring |
| :--- | :--- | :--- |
| **`QRStudioCanvas.tsx`** | Kotak warna hitam `#131B2E` menyatu dengan latar | Beri `dark:border-white dark:ring-2 dark:ring-slate-400` pada semua swatch warna |
| **`ShortenerCard.tsx`** | Teks judul hitam, accordion & input PIN putih mencolok | Tambahkan `dark:text-white`, ubah accordion & input jadi `#1E293B` |
| **`ResultCard.tsx`** | Latar kartu biru muda terang `#EBF3FF` | Ubah ke `#0F172A` dengan border `#0058BE` (Royal Blue) |
| **`UtmBuilderModal.tsx`** | Modal putih dengan teks hitam | Ubah container modal menjadi `dark:bg-slate-900 dark:border-slate-500` |
| **`FilterToolbar.tsx`** | Chip filter putih terang saat tidak terpilih | Ubah menjadi `dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600` |
| **`LinkItemCard.tsx`** | Kartu tautan putih dengan teks abu-abu | Pasang kelas `.card-neo` adaptif dan border `#64748B` |
| **`AnalyticsView.tsx` & `BarChart.tsx`** | Latar grafik `bg-slate-50` terang dan teks hitam | Ubah kanvas grafik menjadi `dark:bg-slate-800/80` dan teks putih |
| **`App.tsx`** | Status bar & notch putih di dalam bingkai HP | Berikan `dark:bg-slate-900 dark:border-slate-700` pada seluruh frame HP |
