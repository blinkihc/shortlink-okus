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
- `src/stores/useThemeStore.ts` - State management mode gelap/terang berbasis Zustand dengan persistensi localStorage
- `src/stores/useThemeStore.test.ts` - Pengujian unit toggle tema dan sinkronisasi kelas DOM
- `src/utils/pwaHelper.ts` - Utilitas deteksi perangkat mobile/tablet dan penangkap event beforeinstallprompt PWA
- `src/utils/pwaHelper.test.ts` - Pengujian unit logika deteksi perangkat dan installer PWA
- `src/components/common/InstallPromptModal.tsx` - Komponen modal instalasi otomatis untuk Android dan panduan Safari iOS
- `public/manifest.json` - Web App Manifest PWA untuk instalasi ke layar utama
- `public/sw.js` - Service Worker untuk kapabilitas caching luring (offline-first)

### Notes

- Pengujian unit diletakkan berdampingan dengan berkas sumber yang diuji.
- Jalankan pengujian unit menggunakan perintah `bun test`.
- Semua dependensi dipasang menggunakan `bun add` atau `bun add -d`.

## Instructions for Completing Tasks

**PENTING:** Setiap kali menyelesaikan tugas, ubah tanda `- [ ]` menjadi `- [x]`. Perbarui dokumen setelah menyelesaikan setiap sub-tugas.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout new branch (`git checkout -b feature/sniplink-mvp`)

- [x] 1.0 Project Foundation & Tooling Setup (Bun + React + Vite + TypeScript + Tailwind Neo-Pop)
  - [x] 1.1 Inisialisasi proyek Vite dengan template React + TypeScript menggunakan Bun (`bun create vite . --template react-ts`)
  - [x] 1.2 Instal dependensi inti aplikasi (`bun add tailwindcss postcss autoprefixer zustand dexie lucide-react clsx tailwind-merge qrcode @zxing/library`)
  - [x] 1.3 Konfigurasi `tailwind.config.js` dengan token Neo-Pop: border 2px solid `#131B2E`, hard shadows (`4px 4px 0px #131B2E`), dan palet warna solid
  - [x] 1.4 Siapkan struktur dasar tata letak di `src/App.tsx` dengan simulator bingkai ponsel dan impor font Plus Jakarta Sans di `src/index.css`
  - [x] 1.5 Konfigurasi runner pengujian `bun test` dan buat uji kelayakan awal di `src/App.test.tsx`

- [x] 2.0 Data Models, Local-First Database (Dexie.js), & State Management (Zustand)
  - [x] 2.1 Buat definisi tipe domain TypeScript (`Link`, `UtmConfig`, `QrConfig`, `ClickEvent`) di `src/types/index.ts`
  - [x] 2.2 Buat skema database lokal dan tabel IndexedDB menggunakan Dexie.js di `src/db/indexedDb.ts`
  - [x] 2.3 Buat data awal (*seed data*) dan uji operasi CRUD basis data di `src/db/indexedDb.test.ts`
  - [x] 2.4 Implementasikan store global `useLinkStore` berbasis Zustand dengan sinkronisasi otomatis ke Dexie di `src/stores/useLinkStore.ts`
  - [x] 2.5 Buat pengujian unit untuk penambahan, pembaruan, dan penghapusan link di `src/stores/useLinkStore.test.ts`

- [x] 3.0 Core Shortener Engine, Custom Slug Validator, & UTM Parameter Builder
  - [x] 3.1 Implementasikan utilitas pembuat slug acak 6 karakter dan validasi sanitasi alias di `src/utils/slugGenerator.ts`
  - [x] 3.2 Buat pengujian unit generator slug di `src/utils/slugGenerator.test.ts`
  - [x] 3.3 Bangun komponen `ShortenerCard.tsx` lengkap dengan deteksi tombol tempel clipboard dan dropdown kategori
  - [x] 3.4 Bangun komponen modal `UtmBuilderModal.tsx` dengan pratinjau URL akhir real-time (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
  - [x] 3.5 Tambahkan opsi proteksi PIN/password sederhana pada tautan dengan hashing di `src/utils/security.ts`
  - [x] 3.6 Hubungkan formulir pemendek tautan ke Zustand store dan tampilkan `ResultCard.tsx` dengan tombol salin instan

- [x] 4.0 Playful QR Studio, Multi-Module Renderer, & Built-in Camera Scanner
  - [x] 4.1 Bangun modul rendering matriks QR luring murni di `src/utils/qrGenerator.ts`
  - [x] 4.2 Implementasikan kanvas QR dengan pilihan gaya modul pixel (Chunky Block, Squircle, Round Dot) dan sematan ikon logo tengah
  - [x] 4.3 Implementasikan bingkai stiker aksi CTA ("SCAN ME!", "LIHAT MENU", "FREE WI-FI") dengan batas *quiet zone* aman
  - [x] 4.4 Implementasikan kalkulator rasio kontras WCAG di `src/utils/contrastChecker.ts` dan hubungkan ke badge *Scan Health Meter*
  - [x] 4.5 Implementasikan ekspor unduhan berkas PNG resolusi tinggi (300 DPI ready) dan berkas vektor murni SVG
  - [x] 4.6 Bangun komponen modal `QRScannerModal.tsx` menggunakan kamera perangkat untuk membaca kode QR secara langsung
  - [x] 4.7 Buat pengujian unit untuk kalkulasi matriks QR dan kontras warna di `src/utils/qrGenerator.test.ts`

- [x] 5.0 Link Hub Management, Native Share Sheet, & Local Backup (JSON/CSV)
  - [x] 5.1 Bangun komponen `LinkItemCard.tsx` dengan fitur sematkan ke atas (*pin*), tombol salin, tombol buka ke QR Studio, dan hapus
  - [x] 5.2 Bangun bilah pencarian real-time dan chip filter kategori di `src/components/links/FilterToolbar.tsx`
  - [x] 5.3 Implementasikan integrasi lembar berbagi sistem operasi bawaan (*Web Share API*) dengan fallback clipboard di `src/utils/shareHelper.ts`
  - [x] 5.4 Implementasikan utilitas ekspor data riwayat ke berkas JSON dan CSV di `src/utils/backupHelper.ts`
  - [x] 5.5 Implementasikan utilitas impor data JSON dengan validasi skema di `src/utils/backupHelper.ts`
  - [x] 5.6 Buat pengujian unit serialisasi dan impor data cadangan di `src/utils/backupHelper.test.ts`

- [x] 6.0 Pulse Analytics Engine & Performance Metrics Visualizer
  - [x] 6.1 Implementasikan pencatatan event klik dan scan lokal di `src/stores/useAnalyticsStore.ts`
  - [x] 6.2 Bangun komponen grafik batang `BarChart.tsx` untuk aktivitas 7 hari terakhir (Klik vs Scan QR) dengan gaya balok solid
  - [x] 6.3 Bangun bilah progress kanal perujuk teratas (WhatsApp, Instagram, TikTok, Browser Langsung)
  - [x] 6.4 Bangun visualisasi perbandingan sistem operasi pengguna (Android vs iOS)
  - [x] 6.5 Buat pengujian unit agregasi metrik analitik di `src/stores/useAnalyticsStore.test.ts`

- [x] 7.0 End-to-End Testing, Accessibility Audit, & Production Build Verification
  - [x] 7.1 Jalankan seluruh rangkaian tes unit dengan perintah `bun test` dan pastikan tingkat kelulusan 100%
  - [x] 7.2 Lakukan audit aksesibilitas antarmuka pengguna: navigasi keyboard, outline fokus kontras, dan rasio WCAG AA
  - [x] 7.3 Uji responsivitas pada berbagai resolusi layar ponsel (360px, 414px, dan mode layar penuh)
  - [x] 7.4 Eksekusi build produksi dengan perintah `bun run build` dan verifikasi kesiapan berkas statis

- [x] 8.0 Dark Mode Neo-Pop Custom Theme Engine
  - [x] 8.1 Konfigurasi `darkMode: 'class'` dan warna tema gelap Neo-Pop di `tailwind.config.js` & `src/index.css`
  - [x] 8.2 Buat store `useThemeStore.ts` untuk mengelola state tema (`light` / `dark`) dengan sinkronisasi ke class `dark` pada elemen `<html>` dan `localStorage`
  - [x] 8.3 Pasang saklar tema taktil (*tactile theme toggle*) pada Header dan sesuaikan kelas kartu, teks, dan tombol pada seluruh komponen
  - [x] 8.4 Buat pengujian unit toggle tema dan sinkronisasi DOM di `src/stores/useThemeStore.test.ts`

- [x] 9.0 Progressive Web App (PWA) & Mobile/Tablet Auto-Install Prompt
  - [x] 9.1 Buat Web App Manifest (`public/manifest.json`) dengan konfigurasi standalone dan ikon Neo-Pop
  - [x] 9.2 Buat Service Worker luring (`public/sw.js`) untuk caching aset statis dan daftarkan di `src/main.tsx`
  - [x] 9.3 Buat utilitas deteksi perangkat mobile/tablet dan penangkap event `beforeinstallprompt` di `src/utils/pwaHelper.ts`
  - [x] 9.4 Bangun modal dialog `InstallPromptModal.tsx` dengan auto-prompt di Android/Tablet dan kartu panduan visual untuk Apple iOS Safari
  - [x] 9.5 Buat pengujian unit deteksi perangkat dan installer PWA di `src/utils/pwaHelper.test.ts`

