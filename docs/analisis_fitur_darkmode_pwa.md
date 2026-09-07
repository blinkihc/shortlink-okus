# Analisis Kompatibilitas Fitur: Dark Mode & PWA Auto-Install Prompt

**Target Sistem:** SnipLink Mobile MVP (Minimum Viable Product / Produk Laik Minimum)  
**Status Evaluasi:** Analisis Arsitektur Pra-Implementasi (Kode Sumber Belum Dimodifikasi)  
**Tujuan:** Memeriksa kelayakan teknis, batasan platform, dan strategi penerapan fitur Mode Gelap dan PWA (Progressive Web Application).

---

## 1. Matriks Kompatibilitas Fitur

| Fitur | Kebutuhan Dependensi | Kompatibilitas Stack (React 19 + Vite + Bun) | Batasan Perangkat / OS (Operating System) | Status Kelayakan |
| :--- | :--- | :--- | :--- | :--- |
| **Dark Mode (Mode Gelap)** | 0 paket eksternal (menggunakan `darkMode: 'class'` Tailwind CSS) | 100% Kompatibel | Tidak ada batasan OS/peramban. Mendukung deteksi preferensi sistem (`prefers-color-scheme`). | **Sangat Siap Diterapkan** |
| **PWA (Progressive Web Application)** | 0 paket wajib (cukup `manifest.json` + `sw.js` murni atau `vite-plugin-pwa`) | 100% Kompatibel | Bekerja pada HTTPS atau `localhost`. | **Sangat Siap Diterapkan** |
| **Auto-Prompt Install (Android/Tablet)** | Web API bawaan (`beforeinstallprompt`) | 100% Kompatibel | Otomatis memicu dialog pasang aplikasi ke layar beranda. | **100% Kompatibel** |
| **Auto-Prompt Install (iOS/iPadOS)** | Navigasi manual Apple Safari | Terbatas (*Restricted*) oleh kebijakan keamanan sistem Apple | Apple Safari memblokir eksekusi programatis `beforeinstallprompt`. Wajib menggunakan modal panduan interaktif. | **Kompatibel Bersyarat (Panduan Visual)** |

---

## 2. Analisis Rinci Mode Gelap (Dark Mode)

### A. Mekanisme Kerja
- Mengaktifkan konfigurasi `darkMode: 'class'` pada file konfigurasi `tailwind.config.js`.
- State tema (`light` / `dark` / `system`) dikelola melalui Zustand store dan disinkronkan ke `localStorage` serta tag elemen `<html>`.

### B. Penyesuaian Token Desain Neo-Pop
- **Mode Terang**: Latar `#F4F6FD`, Kartu `#FFFFFF`, Garis Tepi `#131B2E`, Bayangan Jatuh Keras `4px 4px 0px #131B2E`.
- **Mode Gelap**: Latar `#0B132B` (Biru tinta malam pekat), Kartu `#1C2541`, Garis Tepi `#3A506B` atau `#FEA619` (Kuning Aksen), Bayangan Jatuh Keras `4px 4px 0px #000000`.
- **Aturan Aksesibilitas QR (Quick Response)**: Modul piksel QR dan latar kanvas tetap harus mempertahankan rasio kontras standar WCAG AA (Web Content Accessibility Guidelines) minimal 4.5:1 agar kamera fisik tetap dapat memindai tanpa kegagalan refraksi optik.

---

## 3. Analisis Rinci PWA & Deteksi Instalasi Mobile/Tablet

### A. Perilaku Antar-Platform

```text
                                [ Pengunjung Membuka Web ]
                                             │
                                   Deteksi Jenis Perangkat
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            [ Android / Tablet Android ]                  [ iOS / iPadOS (Apple) ]
                        │                                         │
       Event 'beforeinstallprompt' ditangkap                      │
                        │                              Safari tidak mendukung event
                        ▼                                         │
        Tampilkan Banner / Modal Neo-Pop:                         ▼
        "Pasang SnipLink di Ponselmu"                 Tampilkan Modal Panduan Aksi:
                        │                             1. Ketuk tombol 'Share' (Bagikan)
                        ▼                             2. Pilih 'Tambahkan ke Layar Utama'
          Trigger prompt instalasi OS
```

### B. Prasyarat Teknis PWA
1. **Manifest File (`public/manifest.json`)**:
   - `display: "standalone"` (menghilangkan bilah URL peramban agar tampak seperti aplikasi native Android/iOS).
   - Ikon aplikasi berukuran 192x192 piksel dan 512x512 piksel.
   - `theme_color` dan `background_color` sesuai tema SnipLink.
2. **Service Worker (`public/sw.js`)**:
   - Menangani *caching* aset statis (HTML, CSS, JS, font Plus Jakarta Sans).
   - Memastikan aplikasi dapat dibuka saat tidak ada jaringan internet (*offline-first*), memanfaatkan basis data IndexedDB yang telah terpasang di Task 2.0.

---

## 4. Kesimpulan & Rekomendasi Alur

1. **Dark Mode**: Aman diimplementasikan tanpa risiko konflik dependensi.
2. **PWA**: Sangat disarankan karena melengkapi kapabilitas luring penuh SnipLink. Untuk iOS, antarmuka akan menyajikan kartu panduan visual otomatis saat mendeteksi Safari di iPhone/iPad.
3. Kode sumber saat ini tetap bersih dan belum diubah sebelum persetujuan eksekusi.
