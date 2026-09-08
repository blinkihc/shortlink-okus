# Catatan Rilis & Pembaruan (Changelog) - SnipLink (`okus.me`)

Semua perubahan penting pada aplikasi SnipLink didokumentasikan dalam berkas ini mengikuti standar semantik dan bahasa pengguna yang ramah.

---

## [v1.1.0] - 2026-09-09

### ✨ Tampilan & Tata Letak Baru (Multi-Viewport Shell)
- **Eliminasi Bingkai Ponsel Palsu**: Menghilangkan simulator poni kamera (*notch*), jam tiruan `10:14`, dan indikator sinyal `5G 100%` agar antarmuka tampil autentik dan bersih.
- **Pembersihan Bilah Pengembang**: Menghapus bilah *debug toolbar* prototipe (`REACT 19`, `Mode HP`, `Reset`) dari tampilan produksi.
- **Mode Desktop Ramping (PC / Laptop)**: Aplikasi kini tampil sebagai kontainer aplikasi mobile terpusat (*centered web shell* maksimal 480px) dengan bayangan elevasi modern di atas latar belakang ambien halus, mencegah tampilan melar tak wajar pada monitor lebar.
- **Mode Tablet Ergonomis**: Penyesuaian lebar proporsional (maksimal 620px) yang nyaman digenggam dua tangan pada perangkat tablet (iPad / Android Tablet).
- **Mode Ponsel Asli (*Edge-to-Edge*)**: Tampilan merentang penuh 100% layar fisik tanpa batas ganda, menghormati bilah status bawaan sistem operasi dan area aman (*safe-area insets*).

### 🔧 Header Terpadu & Kontrol Cerdas
- **Header Resmi Terintegrasi**: Menggabungkan logo SnipLink, lencana status *LIVE* berdenyut, tombol pasang PWA (*Progressive Web Application*), dan pemilih tema gelap/terang langsung di bilah atas aplikasi.
- **Dialog Reset Aman**: Menambahkan jendela konfirmasi saat pengguna memilih mengembalikan data ke kondisi awal untuk mencegah kehilangan data tautan secara tidak sengaja.

### ⚡ Animasi Mikro Fungsional (`frontend-ui-animator`)
- **Transisi Tab Halus**: Efek pergantian tab (*fade-slide-up*) berdurasi 200ms saat beralih antar halaman (Home, QR Studio, Tautan, Analitik) tanpa pergeseran tata letak (*zero Cumulative Layout Shift*).
- **Umpan Balik Taktil Tombol**: Respons penekanan mikro (`active:scale-95`) pada tombol aksi dan bilah navigasi bawah untuk pengalaman sentuh layaknya aplikasi *native*.
- **Animasi Diagram Batang**: Batang grafik 7 hari pada tab analitik kini tumbuh mulus dari bawah ke atas saat halaman dimuat.

### 🛡️ Aksesibilitas & Performa
- **Dukungan Gerak Tereduksi**: Seluruh animasi mikro otomatis diringkas menjadi instan saat mendeteksi preferensi sistem `prefers-reduced-motion: reduce`.
- **Optimalisasi PWA Service Worker**: Membatasi registrasi *Service Worker* hanya pada lingkungan produksi untuk menjamin kelancaran pembaruan langsung (*Hot Module Replacement*) selama pengembangan lokal.

---

## [v1.0.0] - 2026-09-08

### ✨ Fitur Awal (MVP Rilis Perdana)
- **Pemendek Tautan Kilat**: Pemendek URL dengan alias slug kustom, sanitasi benturan nama, dan pembuat parameter UTM.
- **Studio Kode QR Vektor**: Kustomisasi warna modul QR, logo tengah, dan kalkulator kontras WCAG (*Web Content Accessibility Guidelines*).
- **Pemindai Kode QR Kamera**: Pemindaian kode QR langsung dari kamera perangkat via ZXing.
- **Pelacakan Analitik Luring**: Grafik riwayat klik 7 hari, pemilah sistem operasi (Android, iOS, Windows, macOS), dan asal perujuk berbasis IndexedDB (Dexie).
- **Mode Gelap & Terang Neo-Pop**: Kontras tinggi dengan border tebal dan hard shadows khas Neo-Pop Utility.
- **Dukungan PWA & Instalasi Cepat**: Web App Manifest dan Service Worker luring (*offline-first*).
- **Domain Resmi**: Migrasi konfigurasi URL ke domain produksi `https://okus.me`.
