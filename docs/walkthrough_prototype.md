# Walkthrough: Prototipe Antarmuka SnipLink Mobile (Neo-Pop Utility)

**Tanggal:** 08 September 2026  
**Status:** Terverifikasi & Aktif di Local Server (`http://localhost:8080`)  
**Standar Desain:** Neo-Pop Utility (Zero-Gradient Purity, Hard Drop Shadows, Plus Jakarta Sans)

---

## 1. Ringkasan Pekerjaan
Saya mengimplementasikan prototipe lengkap antarmuka mobile untuk aplikasi SnipLink dan QR Studio sesuai standar PRD (Product Requirements Document / Dokumen Persyaratan Produk) dan UI (User Interface / Antarmuka Pengguna) `antislop-ui`.

---

## 2. Struktur Berkas

| Berkas | Peran / Deskripsi |
| :--- | :--- |
| [`index.html`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/index.html) | Struktur semantik 4-tab (Home, QR Studio, Tautan, Analitik) dan simulator bingkai ponsel |
| [`style.css`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/style.css) | Desain token Neo-Pop: border 2px solid `#131B2E`, bayangan jatuh pejal 4px, palet warna solid |
| [`app.js`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/app.js) | Logika pemendek tautan, generator matriks QR luring (offline), penyimpanan lokal, dan ekspor PNG/SVG |
| [`docs/prd_sniplink.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/prd_sniplink.md) | Dokumen spesifikasi kebutuhan produk terstruktur |
| [`docs/ui_ux_style_guide.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/ui_ux_style_guide.md) | Panduan gaya desain dan token antarmuka pengguna |

---

## 3. Fitur Utama yang Berfungsi

1. **Pemendek Tautan Kilat (Shortener Engine):**
   - Mendukung alias kustom (*custom slug*) dan kategori.
   - Deteksi tautan clipboard interaktif dengan tombol tempel 1-ketuk.
   - Menghasilkan tautan pendek format `snip.link/<slug>` dan menyimpan ke penyimpanan lokal (*local storage*).
2. **Playful QR Studio:**
   - Pembuatan kode QR (Quick Response / Respon Cepat) luring dengan kanvas piksel murni.
   - Pilihan bentuk modul: Chunky Block, Squircle, dan Round Dot.
   - Pemilihan stiker bingkai: "SCAN ME!", "LIHAT MENU", "FREE WI-FI".
   - Detektor kesehatan pemindaian (*Scan Health Meter*) berbasis rasio kontras WCAG (Web Content Accessibility Guidelines).
   - Ekspor berkas resolusi tinggi PNG (Portable Network Graphics) dan berkas vektor SVG (Scalable Vector Graphics).
3. **Manajemen Daftar Tautan:**
   - Filter cepat berdasarkan kategori (Semua, Promo, Media Sosial, Produk, Kontak).
   - Pencarian real-time berdasarkan kata kunci slug dan tautan asli.
   - Fitur sematkan tautan penting ke baris teratas (*pin to top*).
4. **Pulse Analytics:**
   - Metrik total klik dan pemindaian QR dinamis.
   - Grafik batang aktivitas 7 hari terakhir.
   - Distribusi perujuk (*referral channels*) dan pembagian sistem operasi pengguna (Android vs iOS).
