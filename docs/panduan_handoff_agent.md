# Dokumen Handoff Teknis & Panduan Kelanjutan Agen (Agent Handoff Guide)

Dokumen ini disusun khusus sebagai rujukan utama (*single source of truth*) bagi agen kecerdasan buatan (*AI Agent*) atau perekayasa perangkat lunak (*Software Engineer*) berikutnya yang akan melanjutkan pemeliharaan atau pengembangan aplikasi **SnipLink** (`okus.me`).

---

## 1. Identitas Proyek & Domain

| Parameter | Keterangan |
| :--- | :--- |
| **Nama Aplikasi** | SnipLink (URL Shortener & QR Studio Neo-Pop) |
| **Domain Resmi** | `https://okus.me` |
| **Repositori GitHub** | `https://github.com/blinkihc/shortlink-okus` |
| **Branch Produksi** | `main` |
| **Branch Pengembangan** | `develop` |
| **Infrastruktur VPS** | Virtual Private Server yang dikelola dengan **Easypanel** (Docker Engine + Traefik) |
| **Runtime & Paket** | Bun (v1.2.14), React 19, TypeScript, Tailwind CSS, Vite |

---

## 2. Arsitektur Teknis & Pola Desain

### A. Tumpukan Teknologi (*Tech Stack*)
1. **Frontend**: React 19, TypeScript, Tailwind CSS v3.
2. **State Management**: Zustand v5 (Stores: `useLinkStore`, `useAnalyticsStore`, `useThemeStore`).
3. **Penyimpanan Data (*Persistence*)**: IndexedDB terenkapsulasi via Dexie.js (`src/db/indexedDb.ts`). Seluruh data tautan dan log analitik disimpan secara lokal (*offline-first*), tanpa ketergantungan pada basis data backend eksternal.
4. **QR Code Engine**: `qrcode` (generasi matriks SVG vektor) dan `@zxing/library` (pemindai QR kamera).
5. **PWA (Progressive Web Application)**: Web App Manifest (`public/manifest.webmanifest`), Service Worker (`public/sw.js`), dan modul deteksi perangkat otomatis (`src/utils/pwaHelper.ts`).
6. **Anti-Slop UI & Layout Mobile**:
   - Skema warna Neo-Pop dengan batas kontras tinggi (Light: `#FFE600`, `#FF5C00`, `#00F0FF`; Dark: `#1E293B`, `#0F172A`).
   - Rasio kontras teks dan QR mematuhi standar aksesibilitas WCAG AA (minimal 4.5:1).
   - Penanganan tata letak seluler adaptif: Tombol sentuh minimal 44px, safe-area insets (`.pb-safe`), tanpa notch/status bar palsu di layar perangkat asli.

---

## 3. Peta Direktori Kode Sumber (`src/`)

```text
src/
├── App.tsx                     # Komponen induk, router tab (Shortener, Analytics, QR Studio), navbar, PWA banner
├── main.tsx                    # Titik masuk aplikasi React & registrasi Service Worker PWA
├── index.css                   # Konfigurasi Tailwind, token tema, safe-area utility, & style WCAG
│
├── config/
│   └── appConfig.ts            # Konfigurasi domain sentral (baca VITE_APP_DOMAIN -> default: okus.me)
│
├── components/
│   ├── analytics/              # Komponen grafik analitik klik/pemindaian & ringkasan metrik
│   ├── common/                 # Komponen umum (ThemeToggle, Toast, ConfirmModal)
│   ├── qr/                     # Modul studio kustomisasi QR, SVG exporter, & QR Scanner kamera
│   └── shortener/              # Modul pemendek URL, manajemen tautan, & card tautan aktif
│
├── db/
│   └── indexedDb.ts            # Skema Dexie IndexedDB (tabel links & analyticsEvents)
│
├── stores/
│   ├── useAnalyticsStore.ts    # State tracking metrik klik, pemindaian, perangkat, & perujuk
│   ├── useLinkStore.ts         # State operasi CRUD tautan pendek, pin status, & seeding awal
│   └── useThemeStore.ts        # State tema tampilan (light/dark mode) tersimpan di localStorage
│
└── utils/
    ├── backupHelper.ts         # Utilitas ekspor/impor data JSON & CSV
    ├── pwaHelper.ts            # Utilitas deteksi platform seluler/tablet & pemicu instalasi PWA
    ├── qrGenerator.ts          # Utilitas kalkulasi matriks QR SVG & validasi kontras warna WCAG
    ├── slugGenerator.ts        # Generator slug acak 6-karakter & sanitasi alias kustom
    └── urlValidator.ts         # Validasi format URL, pembuat parameter UTM, & hashing PIN keamanan
```

---

## 4. Status Pengerjaan (Completed Tasks)

Semua tugas utama telah selesai dan teruji penuh (37 unit tests passing):

| ID Tugas | Deskripsi Fitur | Status | Bukti Dokumen |
| :--- | :--- | :--- | :--- |
| **Task 0 - 5** | Core URL Shortener, Neo-Pop UI, QR Studio, IndexedDB, Validasi Slug & UTM | SELESAI | [`docs/laporan_task_0_sampai_5.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_0_sampai_5.md) |
| **Task 6** | Fitur Analitik Lanjutan (Grafik 7 Hari, Referrer, OS, QR Scan vs Clicks) | SELESAI | [`docs/laporan_task_6.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_6.md) |
| **Task 7** | Fitur Keamanan (PIN Lock), Perlindungan Kadaluwarsa Tautan, Impor/Ekspor JSON/CSV | SELESAI | [`docs/laporan_task_7_8_9.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_7_8_9.md) |
| **Task 8** | Fitur Dark Mode Anti-Slop dengan Kontras Tinggi & Deteksi Tema Sistem | SELESAI | [`docs/laporan_refactoring_darkmode.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_refactoring_darkmode.md) |
| **Task 9** | Fitur PWA Otomatis (Banner Instalasi Adaptif Seluler/Tablet, Offline Service Worker) | SELESAI | [`docs/laporan_task_7_8_9.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_7_8_9.md) |
| **Domain Update** | Migrasi domain ke `okus.me` via `src/config/appConfig.ts` | SELESAI | [`src/config/appConfig.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/config/appConfig.ts) |
| **Easypanel Prep** | Pembuatan `Dockerfile` multi-stage, `nginx.conf`, & `.dockerignore` | SELESAI | [`Dockerfile`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/Dockerfile) |

---

## 5. Prosedur Operasional Lokal (Local Development)

Bagi agen/pengembang yang menjalankan proyek ini di komputer lokal:

```bash
# 1. Instalasi seluruh dependensi
bun install

# 2. Menjalankan server pengembangan lokal (tersedia di http://localhost:5173)
bun run dev

# 3. Menjalankan seluruh pengujian unit otomatis
bun test

# 4. Melakukan kompilasi bundel produksi (verifikasi kelulusan build)
bun run build
```

---

## 6. Prosedur Pembaruan Kode & Deployment (Workflow Aturan Main)

Untuk menjaga stabilitas lingkungan produksi di VPS:

1. **JANGAN PERNAH** melakukan commit/push langsung ke branch `main` untuk eksperimen fitur.
2. Selalu buat cabang baru dari `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/nama-fitur-baru
   ```
3. Setelah fitur selesai diuji di lingkungan lokal:
   ```bash
   bun test && bun run build
   git checkout develop
   git merge feature/nama-fitur-baru
   git push origin develop
   ```
4. Apabila versi di `develop` telah matang dan siap dirilis ke produksi:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
5. Easypanel akan mendeteksi commit baru di `main` via Webhook dan otomatis merilis versi baru ke `https://okus.me` tanpa downtime (*zero-downtime container replacement*).

---

## 7. Rencana Pengembangan Selanjutnya (Backlog Rekomendasi)

Jika bang Ucup menginginkan penambahan kemampuan aplikasi di masa mendatang, agen berikutnya dapat mempertimbangkan fitur-fitur berikut:
1. **Sinkronisasi Multi-Device (Opsional Backend)**:
   - Menambahkan integrasi REST API atau BaaS (seperti Supabase / PocketBase) untuk pengguna yang ingin tautannya tersinkronisasi antar perangkat seluler dan desktop.
2. **Ekspor Laporan Analitik Format PDF / Excel**:
   - Menambahkan utilitas pengunduhan grafik analitik ke dokumen PDF atau lembar sebar XLSX untuk keperluan presentasi bisnis.
3. **Pengujian End-to-End Otomatis (E2E)**:
   - Menambahkan skenario Playwright pada alur CI/CD GitHub Actions untuk menguji klik tautan dan pemicu banner PWA secara otomatis pada berbagai ukuran layar.
