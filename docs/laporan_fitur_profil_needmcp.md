# Laporan Rekayasa Fitur Profil Pengguna (NeedMCP `traveler-profile-dashboard`)

Dokumen ini memuat dokumentasi teknis perancangan dan implementasi **Halaman Profil Pengguna (*Profile Page / Dashboard*)** pada proyek SnipLink (`okus.me`). Implementasi ini mengadaptasi cetak biru struktural (*structural wireframe blueprint*) **`traveler-profile-dashboard`** dari server NeedMCP (*Model Context Protocol* - protokol standar integrasi AI) dengan penyelarasan desain Neo-Pop dan aturan anti-slop (*anti-slop*).

---

## 1. Latar Belakang & Kebutuhan Pengguna

Sebelumnya, pengguna hanya dapat melihat nama akun pada bilah navigasi atas (*header*) dengan kontrol terbatas untuk keluar akun. Pengguna membutuhkan satu pusat kendali (*user dashboard*) untuk:
1. Memantau identitas profil dan status keanggotaan (Administrator, Pengguna Terdaftar, atau Pengunjung Tamu).
2. Memeriksa kuota akun dan masa aktif tautan (Tautan Permanen vs Batas 5 Hari Tamu).
3. Mengakses kartu keanggotaan visual (*SnipLink Creator Pass*).
4. Menavigasi cepat ke pengelolaan tautan, analitik riil, dan QR Studio.
5. Mengatur preferensi antarmuka (Mode Gelap/Terang, Pemasangan PWA, dan Membuka Ulang Tur Onboarding).

---

## 2. Pemetaan Komponen Cetak Biru NeedMCP

| Komponen Blueprint NeedMCP | Implementasi SnipLink | Keterangan Gaya & Interaksi |
| :--- | :--- | :--- |
| **`split-header`** | Header Profil & Avatar Ring | Inisial nama pengguna atau ikon avatar dengan lencana status peran (`ADMIN`, `MEMBER`, atau `TAMU`). |
| **`user-greeting`** | Sapaan Pengguna & Surel | Sapaan nama personal dan alamat surel akun terdaftar. |
| **`quick-stats`** | Grid 3 Metrik Akun | Kartu ringkasan: Tautan Aktif, Total Klik Riil, dan Total Pemindaian QR. |
| **`miles-card-section`** | **SnipLink Creator Pass** | Kartu eksklusif gradien gelap dengan nomor lisensi unik (`•••• 1234`), domain resmi `okus.me`, status kuota tautan, dan tombol klaim permanen bagi tamu. |
| **`links-section-1`** | **Manajemen Tautan & Fitur** | Tombol navigasi langsung ke tab Kelola Tautan, Pantau Analitik Riil, dan QR Studio. |
| **`links-section-2`** | **Pengaturan & Preferensi** | Pengaturan tema gelap/terang inline, pasang PWA, buka ulang tur onboarding, dan tombol keluar/masuk akun. |
| **`bottom-navigation`** | Tab Bar 5 Ikon | Menambahkan tab **Profil** (`profile`) pada bilah navigasi bawah mendampingi Home, QR Studio, Tautan, dan Analitik. |

---

## 3. Logika & Penanganan Multi-Peran

### A. Pengguna Terdaftar / Administrator
- **Lencana Peran**: Ditandai lencana mahkota kuning emas `ADMIN VIP` untuk akun Bang Ucup (`admin@okus.me`), atau `MEMBER` biru untuk pengguna terdaftar.
- **Creator Pass**: Berstatus *"Hak Penuh Administrator / Tautan Permanen"* tanpa batas kedaluwarsa.
- **Aksi Akun**: Tombol keluar aman dengan konfirmasi modal.

### B. Pengunjung Tamu (*Guest*)
- **Lencana Peran**: Ditandai `MODE TAMU` dengan batas kuota 1 tautan aktif 5 hari.
- **Creator Pass**: Menampilkan tombol ajakan bertindak (*Call-to-Action*) mencolok *"Klaim Permanen"* yang membuka modal pendaftaran akun baru. Saat registrasi berhasil, seluruh tautan tamu otomatis diklaim menjadi permanen.

---

## 4. Hasil Verifikasi & Pengujian

- **Unit Test**: `bun test` &rarr; 63 pengujian lulus (100% pass) pada 14 berkas uji.
- **Linting**: `oxlint` &rarr; 0 error.
- **Pemeriksaan Tipe TypeScript**: `bunx tsc --noEmit` &rarr; 0 error.
- **Kompilasi Bundel Produksi**: `bun run build` &rarr; Berhasil menghasilkan bundel `dist/` dalam 3.34 detik.
