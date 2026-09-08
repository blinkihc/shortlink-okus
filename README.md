# SnipLink & Playful QR Studio (okus.me)

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-black.svg)](https://bun.sh/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![A11y](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-orange.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplikasi pemendek tautan (*Smart URL Shortener*) dan studio kode QR (Quick Response / Respon Cepat) modern bergaya estetika **Neo-Pop** dengan dukungan domain kustom **okus.me**. Dibangun dengan prinsip *offline-first* menggunakan IndexedDB (Dexie) dan standar aksesibilitas WCAG (Web Content Accessibility Guidelines) AA.

---

## Fitur Utama

- ⚡ **Pemendek Tautan Pintar (*Smart URL Shortener*)**: Memotong tautan panjang dengan domain resmi `https://okus.me/{slug}` atau alias kustom pilihan pengguna.
- 🏷️ **Pembangun Parameter UTM (*UTM Builder*)**: Mendukung pelacakan kampanye pemasaran terstandarisasi (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
- 🔒 **Proteksi PIN (Keamanan)**: Kunci akses tautan rahasia dengan 4 digit angka PIN terenkripsi SHA-256 via Web Crypto API (Application Programming Interface / Antarmuka Pemrograman Aplikasi).
- 🎨 **Playful QR Studio**: Generator kode QR kustom siap cetak (300 DPI / Dots Per Inch / Titik Per Inci) dengan 5 palet warna solid anti-kamuflase, aneka bentuk modul pixel (*chunky*, *dots*, *squircle*), dan stiker bingkai CTA (Call To Action / Ajakan Bertindak).
- 📷 **Pemindai QR Bawaan**: Pindai dan uji kelayakan pembacaan kode QR fisik langsung melalui kamera perangkat.
- 📊 **Pulse Analytics**: Dasbor metrik performa interaksi (total klik, scan QR luring, tren grafik batang 7 hari, kanal rujukan, dan rasio sistem operasi Android/iOS).
- 🌙 **Engine Tema Gelap (*Neo-Pop Dark Mode*)**: Desain kontras tinggi (rasio kontras 7.2:1) yang ergonomis dan bebas kelelahan mata (*anti-eye strain*).
- 📱 **PWA (Progressive Web Application)**: Notifikasi pasang otomatis di perangkat Android/Tablet dan panduan visual Safari di Apple iOS.
- 💾 **Cadangan & Pemulihan Mandiri**: Ekspor seluruh basis data ke format JSON / CSV dan impor cadangan lokal kapan saja.

---

## Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) (v1.2+) |
| **Framework Frontend** | [React 19](https://react.dev/) |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) |
| **Styling & Design System** | Tailwind CSS (Neo-Pop Custom Theme Engine) |
| **Penyimpanan Lokal** | IndexedDB via [Dexie.js](https://dexie.org/) |
| **Manajemen Status (*State*)** | [Zustand](https://github.com/pmndrs/zustand) |
| **Mesin QR & Grafis** | [qrcode](https://www.npmjs.com/package/qrcode) & Canvas API |
| **Ikon Antarmuka** | [lucide-react](https://lucide.dev/) |
| **Test Runner** | Bun Test (37 Unit Tests Lolos 100%) |

---

## Memulai Cepat (Panduan Pengembang)

### 1. Prasyarat
Pastikan runtime [Bun](https://bun.sh/) telah terpasang di sistem operasi Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/blinkihc/shortlink-okus.git
cd shortlink-okus
```

### 3. Pasang Dependensi
```bash
bun install
```

### 4. Jalankan Peladen Pengembangan Lokal
```bash
bun run dev
```
Akses aplikasi melalui peramban di `http://localhost:5173`.

### 5. Jalankan Pengujian Unit Otomatis
```bash
bun test
```

### 6. Kompilasi Produksi
```bash
bun run build
```
Aset siap rilis akan dihasilkan di folder `dist/`.

---

## Struktur Folder Proyek

```text
├── docs/                        # Dokumentasi teknis, PRD, tutorial, & laporan
│   ├── panduan_penggunaan_dan_tutorial.md
│   ├── panduan_pemisahan_lingkungan_dan_vps.md
│   ├── laporan_refactoring_darkmode.md
│   └── screenshots/             # Bukti visual tangkapan layar antarmuka
├── public/                      # Aset statis, manifest PWA, & Service Worker
├── src/
│   ├── components/              # Komponen React (Shortener, QR, Links, Analytics)
│   ├── config/                  # Konfigurasi terpusat (APP_CONFIG okus.me)
│   ├── db/                      # Skema basis data lokal IndexedDB Dexie
│   ├── stores/                  # Toko status Zustand (Links, Theme, Analytics)
│   ├── types/                   # Definisi tipe TypeScript
│   ├── utils/                   # Logika utilitas (Slug, QR, PWA, Backup, Validator)
│   ├── App.tsx                  # Komponen induk aplikasi
│   ├── index.css                # Desain sistem Neo-Pop & token warna
│   └── main.tsx                 # Titik masuk aplikasi & registrasi PWA
└── tailwind.config.js           # Konfigurasi Tailwind CSS
```

---

## Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
