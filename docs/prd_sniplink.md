# PRD: SnipLink & QR Generator

**Versi:** 1.0  
**Status:** Approved for Design & Development  
**Target Platform:** Mobile (iOS [iPhone Operating System] & Android)  
**Brand Identity:** SnipLink Playful Pop (Neo-Pop Utility — Flat Solids / Zero Gradients)

---

## 1. Ringkasan Eksekutif & Visi Produk
SnipLink adalah aplikasi mobile utilitas pemendek tautan (URL / Uniform Resource Locator) dan pembuat kode QR (Quick Response) visual berbasis gaya Neo-Pop Utility. Aplikasi berfokus pada kecepatan pembuatan, visual tebal tanpa gradien (flat solids), dan interaksi sentuh fisik (chunky).

---

## 2. Analisis Masalah & Solusi

| Masalah | Dampak | Solusi SnipLink |
| :--- | :--- | :--- |
| URL panjang dan tidak rapi | Bio media sosial tampak tidak profesional | Shortener instan dengan alias slug kustom |
| Kode QR generik hitam-putih | Konversi pindai rendah | QR Studio warna solid, kustom bentuk mata/pixel, frame stiker |
| Ketiadaan data performa link | Pengguna tidak tahu efektivitas tautan | Dasbor analitik ringkas (klik, pemindai unik, referer) |
| Antarmuka utilitas kaku | Pengalaman pengguna membosankan | Visual Neo-Pop dengan shadow solid dan umpan balik taktil |

---

## 3. Spesifikasi Fungsional

### 3.1. URL Shortener Engine
- **Clipboard Detection:** Deteksi tautan via gestur aktif pengguna (mematuhi privasi sistem operasi).
- **Auto & Custom Slug:** Opsi slug acak 6 karakter alfanumerik atau alias manual dengan validasi ketersediaan.
- **Link Lifecycle:** Pengaturan tanggal kadaluarsa dan sakelar aktif/nonaktif.
- **Tindakan Cepat:** Tombol salin dan lembar berbagi (share sheet) 1-ketuk.

### 3.2. Playful QR Studio
- **Tipe Konten:** URL web, WhatsApp direct chat (pesan otomatis), kredensial Wi-Fi, vCard (kontak digital).
- **Kustomisasi Visual:**
  - Bentuk modul: Rounded dot, squircle, chunky block.
  - Pola mata QR (corner eye style).
  - Sematan logo/ikon brand di tengah dengan batasan koreksi error level H (30%).
  - Frame stiker CTA (Call To Action / Ajakan Bertindak).
  - Quiet Zone Validator: Menjaga margin 4 modul agar QR tetap terbaca mesin pemindai.
- **Format Ekspor:**
  - PNG raster resolusi tinggi (1024x1024px / 300 DPI [Dots Per Inch]).
  - SVG (Scalable Vector Graphics) berbasis vektor murni tanpa batas resolusi.

### 3.3. Manajemen Tautan & Riwayat
- Kartu item tautan dengan hitungan klik dan tombol aksi cepat.
- Penyimpanan lokal (Local-first storage) untuk akses offline.
- Filter kategori (Media Sosial, Promo, Menu/Produk, Kontak).

### 3.4. Analitik Tautan
- Total klik dan pemindaian unik.
- Kanal perujuk utama (WhatsApp, Instagram, TikTok, Peramban Langsung).
- Distribusi platform perangkat (Android vs iOS).

---

## 4. Parameter Keberhasilan Produk (KPI / Key Performance Indicator)
- **Time-to-Shorten:** Pembuatan link selesai < 3 detik.
- **QR Customization Rate:** > 45% pengguna memodifikasi warna atau frame sebelum unduh.
- **Share Conversion:** > 85% link yang dibuat langsung disalin/dibagikan.

---

## 5. Kandidat Fitur Tambahan (v1 Scope Enhancements)

| No | Fitur | Dampak Produk | Kompleksitas |
| :--- | :--- | :--- | :--- |
| 1 | **Pembangun Parameter UTM (Urchin Tracking Module Builder)** | Membantu pelacakan kampanye pemasaran otomatis | Rendah |
| 2 | **Integrasi Lembar Berbagi Sistem (Native OS Share Sheet)** | Mempercepat distribusi langsung ke WhatsApp & Instagram | Rendah |
| 3 | **Pemindai QR Bawaan (Built-in QR Camera Scanner)** | Memverifikasi tautan QR fisik sebelum pencetakan massal | Menengah |
| 4 | **Tautan Proteksi Kata Sandi / PIN** | Melindungi tautan dokumen atau promo eksklusif | Rendah |
| 5 | **Deep-Link Direct App Routing** | Membuka aplikasi tujuan langsung tanpa tertahan di browser internal | Menengah |
| 6 | **Pemeriksa Kesehatan Tautan (HTTP Status Checker)** | Mencegah pembuatan shortlink dari URL tujuan rusak (404/dead link) | Rendah |
| 7 | **Pencadangan & Pemulihan Lokal (Backup JSON / CSV)** | Mencegah kehilangan data riwayat tautan pengguna tanpa login | Rendah |
| 8 | **Pemendek Massal Sederhana (Quick Batch Shortener)** | Memproses hingga 5 tautan sekaligus dalam satu tindakan | Menengah |

