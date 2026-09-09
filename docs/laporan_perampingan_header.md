# Laporan Rekayasa Perampingan Bilah Navigasi Atas (Header)

Dokumen ini memuat dokumentasi teknis perancangan dan implementasi perampingan bilah navigasi atas (*top navigation bar / header*) pada proyek SnipLink (`okus.me`). Perubahan ini dilakukan untuk menghilangkan kepadatan visual (*visual clutter*), memberikan ruang bernapas (*breathing room*), dan meningkatkan kenyamanan navigasi pada tampilan perangkat seluler (*mobile*) maupun desktop.

---

## 1. Latar Belakang & Analisis Masalah

Bilah navigasi atas (*header*) sebelumnya menampung terlalu banyak elemen dalam satu baris sempit:
1. **Logo & Judul Brand** bersanding dengan kotak lencana `• LIVE` berbingkai tebal.
2. **Tombol Bantuan / Tur Panduan (`HelpCircle`)** yang jarang digunakan secara harian.
3. **Tombol Pemasangan PWA (*Progressive Web App*)** yang menyita ruang horizontal.
4. **Sakelar Mode Gelap/Terang (`ThemeToggle`)**.
5. **Tombol Status Akun / Keluar** yang memanjang dengan teks label penuh.

Kepadatan ini mengakibatkan elemen saling berhimpitan pada layar seluler (lebar layar < 400px), mengurangi kontras visual, serta mengaburkan hierarki aksi utama aplikasi.

---

## 2. Keputusan Arsitektur & Desain (Hasil /grill-me)

Berdasarkan kesepakatan penataan antarmuka bebas slop (*anti-slop*):
1. **Pemusatan Kontrol Sekunder ke Dasbor Profil**:
   - Sakelar tema (*Dark/Light Mode*), instalasi PWA (*Progressive Web App*), dan pemicu tur onboarding (*Onboarding Tour*) dipindahkan secara permanen ke tab **Profil** ([`ProfileDashboard.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/components/profile/ProfileDashboard.tsx)).
   - Bilah navigasi atas hanya menyisakan identitas aplikasi dan menu akses akun pengguna.
2. **Penyederhanaan Area Kiri (*Branding Area*)**:
   - Menyatukan logo pemotong tautan, nama brand `SnipLink`, dan indikator status menjadi satu tombol interaktif menuju tab Beranda (*Home*).
   - Mengganti kotak label `• LIVE` dengan titik hijau menyala tunggal (*pulsing emerald dot*) tanpa kotak pembungkus.
3. **Penyederhanaan Area Kanan (*User Action Area*)**:
   - Mengganti tombol akun panjang dengan avatar lingkaran ringkas (*compact circular avatar*) berdiameter 36px dengan cincin aksen peran (*role border ring*).
   - Menekan avatar membuka menu mengambang (*Neo-Pop dropdown*) dengan 2 opsi tegas:
     - **Profil Saya**: Membuka tab Profil Pengguna.
     - **Keluar**: Menjalankan aksi keluar akun dengan dialog konfirmasi aman.
   - Untuk pengunjung yang belum masuk (*guest*), ditampilkan tombol ringkas "Masuk" yang langsung membuka modal autentikasi (*AuthModal*).
4. **Penutupan Otomatis (*Click-Outside Dismiss*)**:
   - Menambahkan referensi DOM (*Document Object Model*) menggunakan `useRef` dan pendengar event `mousedown` pada `document` agar menu tertutup otomatis saat pengguna menyentuh area luar.

---

## 3. Matriks Perbandingan Sebelum vs Sesudah

| Aspek Komponen | Sebelum Perampingan | Sesudah Perampingan |
| :--- | :--- | :--- |
| **Pemicu Bantuan/Tur** | Tombol ikon tanda tanya di header | Dipindahkan ke menu preferensi pada Dasbor Profil |
| **Instalasi PWA** | Tombol unduh PWA berulang di header | Terpusat di kartu preferensi pada Dasbor Profil |
| **Sakelar Mode Tema** | Tombol sakelar ikon matahari/bulan di header | Terpusat di kartu preferensi pada Dasbor Profil |
| **Lencana Status LIVE** | Kotak teks hijau `• LIVE` dengan border tebal | Titik hijau menyala (*pulsing emerald dot*) minimalis |
| **Aksi Akun Pengguna** | Tombol persegi panjang + teks nama akun/peran | Avatar bundar ringkas + Dropdown Neo-Pop interaktif |
| **Kenyamanan Seluler** | Sesak, berisiko meluap (*overflow*) pada layar sempit | Lega, bersih, menyisakan ruang bernapas horizontal |

---

## 4. Rincian Modifikasi Berkas

### [`src/App.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/App.tsx)
- Menambahkan state `isUserMenuOpen` dan referensi `userMenuRef` (`useRef<HTMLDivElement>(null)`).
- Menambahkan listener `mousedown` untuk menutup dropdown saat area luar diklik.
- Menghapus impor ikon `Download`, `HelpCircle`, `Moon`, `Sun` dari pustaka `lucide-react`.
- Mengonstruksi struktur header baru dengan pembungkus navigasi berjarak napas longgar (`justify-between`, `h-14`, bayangan Neo-Pop `shadow-[0_4px_0_0_#000]`, lapisan `z-30`).

---

## 5. Hasil Verifikasi & Mutu Kode

- **Pemeriksaan Tipe TypeScript**: `bunx tsc --noEmit` &rarr; 0 error.
- **Pemeriksaan Kualitas Lint**: `bun run lint` (`oxlint`) &rarr; 0 error, 0 warning pada `src/App.tsx`.
- **Pengujian Unit Otomatis**: `bun test` &rarr; 63 pengujian lulus (100% pass) pada 14 berkas uji.
- **Kompilasi Bundel Produksi**: `bun run build` &rarr; Berhasil dikompilasi ke direktori `dist/` dalam waktu 2.77 detik.
