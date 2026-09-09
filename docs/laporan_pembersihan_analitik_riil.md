# Laporan Pembersihan Data Analitik Dummy & Penerapan Statistik Riil

Dokumen ini mencatat tindakan pembersihan seluruh metrik analitik palsu/dummy/simulasi dan standarisasi sistem analitik murni berbasis statistik riil pada SnipLink (`okus.me`).

---

## 1. Latar Belakang & Masalah
Sebelumnya, sistem analitik SnipLink memiliki beberapa komponen data buatan (dummy) yang tidak mencerminkan statistik nyata:
1. **Nilai Seed Awal Berisi Angka Palsu**:
   - `promo-kopi`: 420 klik, 140 scan.
   - `bio-creator`: 610 klik, 210 scan.
   - `menu-resto`: 250 klik, 112 scan.
2. **Generator Dummy Events (`generateSeedEvents`)**:
   - Menghasilkan ratusan entri event klik dan scan fiktif selama 7 hari ke belakang ke dalam basis data browser (IndexedDB).
3. **Tombol Simulasi Interaksi Palsu**:
   - Terdapat bilah tombol `+1 Klik` dan `+1 Scan QR` yang menginjeksi klik acak buatan ke database lokal.
4. **Lencana Persentase Palsu yang Di-hardcode**:
   - Terdapat badge statis `+24% Minggu Ini` dan `+18% Minggu Ini` terlepas dari ada atau tidaknya data riil.

---

## 2. Tindakan Pembersihan & Standardisasi yang Dilakukan

| Komponen | Kondisi Sebelumnya | Kondisi Terstandarisasi Baru |
| :--- | :--- | :--- |
| **Data Seed Tautan** (`src/db/indexedDb.ts` & `server/db.ts`) | Nilai klik ratusan (420, 610, 250) | Seluruh tautan inisial diatur ke `clicks: 0, scans: 0` |
| **Event Generator** (`src/stores/useAnalyticsStore.ts`) | Ratusan event buatan 7 hari | `generateSeedEvents()` menghasilkan array kosong `[]`, inisialisasi awal murni 0 |
| **Sinkronisasi Backend Riil** (`/api/events`) | Mengandalkan generator lokal | Frontend langsung memuat event riil dari peladen SQLite backend (`/api/events`) |
| **Tombol Simulasi** (`AnalyticsView.tsx`) | Tombol `+1 Klik` & `+1 Scan QR` | Dihapus sepenuhnya; diganti indikator status pelacakan kunjungan riil otomatis dan tombol `Segarkan` |
| **Lencana Persentase Palsu** | Hardcoded `+24%` & `+18%` | Dihapus; diganti label deskriptif tipe interaksi riil |
| **Kondisi Data Kosong (Empty State)** | Grafik menampilkan batang palsu | Menampilkan placeholder rapi: "Belum ada riwayat klik atau scan dalam 7 hari terakhir" dan "Menunggu Deteksi Perangkat" |
| **Basis Data SQLite Produksi** (`data/sniplink.db`) | Berisi metrik testing sebelumnya | Seluruh baris di-reset: `UPDATE links SET clicks = 0, scans = 0` dan tabel `analytics_events` dibersihkan |

---

## 3. Mekanisme Pelacakan Riil (Produksi)

Statistik hanya akan bertambah apabila ada interaksi nyata dari pengunjung:
1. **Kunjungan URL Publik (`GET okus.me/:slug`)**:
   - Peladen mendeteksi `User-Agent` (Android, iOS, atau Desktop).
   - Peladen membaca header `Referer` (WhatsApp, Instagram, TikTok, atau Browser Langsung).
   - Menambah `clicks = clicks + 1` pada baris tautan yang sesuai.
   - Mencatat satu rekaman riil ke tabel `analytics_events`.
2. **Pemindaian Kode QR (`GET okus.me/qr/:slug`)**:
   - Menambah `scans = scans + 1` pada tautan terkait.
   - Mencatat rekaman berjenis `qr_scan` ke tabel `analytics_events`.
3. **Endpoint Pembersihan Ulang (Admin/Reset)**:
   - Tersedia `POST /api/analytics/reset` untuk membersihkan kembali data statistik ke angka 0 kapan pun diperlukan.

---

## 4. Hasil Verifikasi & Uji Otomasi
- Seluruh 47 pengujian unit pada Bun (`bun test`) lulus tanpa kesalahan (100% pass).
- Bundle produksi (`bun run build`) berhasil dikompilasi bersih tanpa galat TypeScript.
- Tampilan analitik terverifikasi bersih pada port 8080 dengan tampilan awal 0 klik dan 0 scan.
