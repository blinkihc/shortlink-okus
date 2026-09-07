# Tasks: SnipLink MVP (React + TypeScript + Bun)

## Relevant Files

- `package.json` - Definisi dependensi proyek, skrip Bun, dan konfigurasi pustaka
- `vite.config.ts` - Konfigurasi Vite bundler dan plugin React
- `tailwind.config.js` - Konfigurasi desain token Neo-Pop Utility (Hard drop shadows, border chunky, palet solid)
- `src/main.tsx` - Titik masuk aplikasi React (Entry point)
- `src/App.tsx` - Komponen utama dan router navigasi 4-tab (Home, QR Studio, Tautan, Analitik)
- `src/App.test.tsx` - Pengujian unit komponen App dan smoke test rendering
- `src/index.css` - Desain token Neo-Pop Utility dan deklarasi layer Tailwind CSS
- `src/types/index.ts` - Definisi antarmuka TypeScript untuk entitas Link, UtmConfig, QrConfig, dan ClickEvent
- `src/db/indexedDb.ts` - Lapisan database lokal berbasis Dexie.js (IndexedDB)
- `src/db/indexedDb.test.ts` - Pengujian unit operasi CRUD basis data lokal
- `src/stores/useLinkStore.ts` - State management global tautan berbasis Zustand dengan persistensi Dexie
- `src/stores/useLinkStore.test.ts` - Pengujian unit logika mutasi state link
- `src/stores/useAnalyticsStore.ts` - State management metrik klik, scan, dan kanal perujuk
- `src/stores/useAnalyticsStore.test.ts` - Pengujian unit kalkulasi agregasi metrik analitik
- `src/components/common/Header.tsx` - Bilah header aplikasi dengan logo SnipLink dan status environment
- `src/components/common/BottomNav.tsx` - Bilah navigasi bawah 4-tab dengan tactile feedback
- `src/components/common/Toast.tsx` - Komponen notifikasi mengambang dengan umpan balik taktil
- `src/components/shortener/ShortenerCard.tsx` - Komponen formulir pemendek tautan kilat
- `src/components/shortener/UtmBuilderModal.tsx` - Komponen pembuat parameter UTM kampanye pemasaran
- `src/components/shortener/ResultCard.tsx` - Komponen kartu sukses shortlink dengan aksi 1-ketuk salin & ke QR
- `src/components/qr/QRStudioCanvas.tsx` - Komponen kanvas QR interaktif dengan kustomisasi modul dan frame
- `src/components/qr/QRScannerModal.tsx` - Komponen pemindai kode QR via kamera perangkat
- `src/components/links/LinkItemCard.tsx` - Komponen kartu tautan riwayat, aksi pin, salin, dan hapus
- `src/components/links/FilterToolbar.tsx` - Bilah pencarian real-time dan chip filter kategori
- `src/components/analytics/AnalyticsView.tsx` - Komponen dasbor metrik dan ringkasan performa
- `src/components/analytics/BarChart.tsx` - Grafik batang 7 hari aktivitas klik vs scan
- `src/utils/slugGenerator.ts` - Generator alias slug acak 6 karakter dan pembersih slug kustom
- `src/utils/slugGenerator.test.ts` - Pengujian unit fungsi pembuatan slug
- `src/utils/qrGenerator.ts` - Generator matriks QR luring dan konversi ke kanvas/SVG
- `src/utils/qrGenerator.test.ts` - Pengujian unit logika matriks QR dan ekspor
- `src/utils/contrastChecker.ts` - Kalkulator rasio kontras WCAG untuk Scan Health Meter
- `src/utils/shareHelper.ts` - Utilitas lembar berbagi sistem operasi (Native Share API) dan fallback clipboard
- `src/utils/backupHelper.ts` - Utilitas ekspor dan impor data riwayat ke format JSON/CSV
- `src/utils/backupHelper.test.ts` - Pengujian unit serialisasi dan validasi data backup

### Notes

- Pengujian unit diletakkan berdampingan dengan berkas sumber yang diuji.
- Jalankan pengujian unit menggunakan perintah `bun test`.
- Semua dependensi dipasang menggunakan `bun add` atau `bun add -d`.

## Instructions for Completing Tasks

**PENTING:** Setiap kali menyelesaikan tugas, ubah tanda `- [ ]` menjadi `- [x]`. Perbarui dokumen setelah menyelesaikan setiap sub-tugas.

---

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout new branch (`git checkout -b feature/sniplink-mvp`)

- [ ] 1.0 Project Foundation & Tooling Setup (Bun + React + Vite + TypeScript + Tailwind Neo-Pop)
  - [ ] 1.1 Inisialisasi proyek Vite dengan template React + TypeScript menggunakan Bun (`bun create vite . --template react-ts`)
  - [ ] 1.2 Instal dependensi inti aplikasi (`bun add tailwindcss postcss autoprefixer zustand dexie lucide-react clsx tailwind-merge qrcode @zxing/library`)
  - [ ] 1.3 Konfigurasi `tailwind.config.js` dengan token Neo-Pop: border 2px solid `#131B2E`, hard shadows (`4px 4px 0px #131B2E`), dan palet warna solid
  - [ ] 1.4 Siapkan struktur dasar tata letak di `src/App.tsx` dengan simulator bingkai ponsel dan impor font Plus Jakarta Sans di `src/index.css`
  - [ ] 1.5 Konfigurasi runner pengujian `bun test` dan buat uji kelayakan awal di `src/App.test.tsx`

- [ ] 2.0 Data Models, Local-First Database (Dexie.js), & State Management (Zustand)
  - [ ] 2.1 Buat definisi tipe domain TypeScript (`Link`, `UtmConfig`, `QrConfig`, `ClickEvent`) di `src/types/index.ts`
  - [ ] 2.2 Buat skema database lokal dan tabel IndexedDB menggunakan Dexie.js di `src/db/indexedDb.ts`
  - [ ] 2.3 Buat data awal (*seed data*) dan uji operasi CRUD basis data di `src/db/indexedDb.test.ts`
  - [ ] 2.4 Implementasikan store global `useLinkStore` berbasis Zustand dengan sinkronisasi otomatis ke Dexie di `src/stores/useLinkStore.ts`
  - [ ] 2.5 Buat pengujian unit untuk penambahan, pembaruan, dan penghapusan link di `src/stores/useLinkStore.test.ts`

- [ ] 3.0 Core Shortener Engine, Custom Slug Validator, & UTM Parameter Builder
  - [ ] 3.1 Implementasikan utilitas pembuat slug acak 6 karakter dan validasi sanitasi alias di `src/utils/slugGenerator.ts`
  - [ ] 3.2 Buat pengujian unit generator slug di `src/utils/slugGenerator.test.ts`
  - [ ] 3.3 Bangun komponen `ShortenerCard.tsx` lengkap dengan deteksi tombol tempel clipboard dan dropdown kategori
  - [ ] 3.4 Bangun komponen modal `UtmBuilderModal.tsx` dengan pratinjau URL akhir real-time (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
  - [ ] 3.5 Tambahkan opsi proteksi PIN/password sederhana pada tautan dengan hashing di `src/utils/security.ts`
  - [ ] 3.6 Hubungkan formulir pemendek tautan ke Zustand store dan tampilkan `ResultCard.tsx` dengan tombol salin instan

- [ ] 4.0 Playful QR Studio, Multi-Module Renderer, & Built-in Camera Scanner
  - [ ] 4.1 Bangun modul rendering matriks QR luring murni di `src/utils/qrGenerator.ts`
  - [ ] 4.2 Implementasikan kanvas QR dengan pilihan gaya modul pixel (Chunky Block, Squircle, Round Dot) dan sematan ikon logo tengah
  - [ ] 4.3 Implementasikan bingkai stiker aksi CTA ("SCAN ME!", "LIHAT MENU", "FREE WI-FI") dengan batas *quiet zone* aman
  - [ ] 4.4 Implementasikan kalkulator rasio kontras WCAG di `src/utils/contrastChecker.ts` dan hubungkan ke badge *Scan Health Meter*
  - [ ] 4.5 Implementasikan ekspor unduhan berkas PNG resolusi tinggi (300 DPI ready) dan berkas vektor murni SVG
  - [ ] 4.6 Bangun komponen modal `QRScannerModal.tsx` menggunakan kamera perangkat untuk membaca kode QR secara langsung
  - [ ] 4.7 Buat pengujian unit untuk kalkulasi matriks QR dan kontras warna di `src/utils/qrGenerator.test.ts`

- [ ] 5.0 Link Hub Management, Native Share Sheet, & Local Backup (JSON/CSV)
  - [ ] 5.1 Bangun komponen `LinkItemCard.tsx` dengan fitur sematkan ke atas (*pin*), tombol salin, tombol buka ke QR Studio, dan hapus
  - [ ] 5.2 Bangun bilah pencarian real-time dan chip filter kategori di `src/components/links/FilterToolbar.tsx`
  - [ ] 5.3 Implementasikan integrasi lembar berbagi sistem operasi bawaan (*Web Share API*) dengan fallback clipboard di `src/utils/shareHelper.ts`
  - [ ] 5.4 Implementasikan utilitas ekspor data riwayat ke berkas JSON dan CSV di `src/utils/backupHelper.ts`
  - [ ] 5.5 Implementasikan utilitas impor data JSON dengan validasi skema di `src/utils/backupHelper.ts`
  - [ ] 5.6 Buat pengujian unit serialisasi dan impor data cadangan di `src/utils/backupHelper.test.ts`

- [ ] 6.0 Pulse Analytics Engine & Performance Metrics Visualizer
  - [ ] 6.1 Implementasikan pencatatan event klik dan scan lokal di `src/stores/useAnalyticsStore.ts`
  - [ ] 6.2 Bangun komponen grafik batang `BarChart.tsx` untuk aktivitas 7 hari terakhir (Klik vs Scan QR) dengan gaya balok solid
  - [ ] 6.3 Bangun bilah progress kanal perujuk teratas (WhatsApp, Instagram, TikTok, Browser Langsung)
  - [ ] 6.4 Bangun visualisasi perbandingan sistem operasi pengguna (Android vs iOS)
  - [ ] 6.5 Buat pengujian unit agregasi metrik analitik di `src/stores/useAnalyticsStore.test.ts`

- [ ] 7.0 End-to-End Testing, Accessibility Audit, & Production Build Verification
  - [ ] 7.1 Jalankan seluruh rangkaian tes unit dengan perintah `bun test` dan pastikan tingkat kelulusan 100%
  - [ ] 7.2 Lakukan audit aksesibilitas antarmuka pengguna: navigasi keyboard, outline fokus kontras, dan rasio WCAG AA
  - [ ] 7.3 Uji responsivitas pada berbagai resolusi layar ponsel (360px, 414px, dan mode layar penuh)
  - [ ] 7.4 Eksekusi build produksi dengan perintah `bun run build` dan verifikasi kesiapan berkas statis
