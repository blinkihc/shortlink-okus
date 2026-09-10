# Laporan Implementasi: Halaman Pengaturan Khusus Administrator (Admin Settings)

Dokumentasi komprehensif implementasi Halaman Pengaturan Khusus Administrator (*Admin Settings Page*) pada aplikasi SnipLink (`okus.me`). Dokumen ini mencakup skema basis data SQLite, rute REST API peladen, komponen antarmuka Neo-Pop, dan sinkronisasi dinamis ke seluruh sistem.

---

## 1. Ringkasan Kebutuhan & Arsitektur

Berdasarkan permintaan dan keputusan desain bersama bang Ucup:
1. **Hak Akses & Otorisasi**: Menu pengaturan hanya dapat diakses oleh akun dengan role `admin` (Administrator VIP).
2. **Navigasi Masuk**: Dropdown menu pada avatar bilah atas (*header*) menampilkan 3 CTA (*Call to Action* / ajakan bertindak) untuk admin:
   - **Profil Saya** (*My Profile*)
   - **Settings** (*Admin Settings*)
   - **Keluar** (*Logout*)
3. **Tampilan Antarmuka**: Menggunakan sub-view penuh mandiri (*dedicated full sub-view*) bergaya Neo-Pop dengan tombol navigasi kembali ke Beranda (*Back to Home*).
4. **Tiga Komponen Pengaturan Inti**:
   - **Item 1: Batas Waktu Simpan Tautan Tamu** (*Guest Link Expiry Days*), nilai default 5 hari, tersimpan di tabel `app_settings`.
   - **Item 2: Kelola Kategori Tautan** (*Link Categories*), hak CRUD (*Create, Read, Update, Delete*) penuh, tersimpan di tabel baru `kategori`.
   - **Item 3: Kelola Frame Stiker Aksi CTA** (*CTA Sticker Frames*), hak CRUD penuh untuk stiker Playful QR Studio, tersimpan di tabel baru `frame_aksi`.

---

## 2. Skema Basis Data SQLite Persisten (`server/db.ts`)

Tiga tabel baru ditambahkan ke basis data SQLite:

### A. Tabel `app_settings`
Menyimpan pasangan kunci-nilai konfigurasi global aplikasi.
```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
-- Nilai default awal:
-- ('guest_link_expiry_days', '5', ISO_TIMESTAMP)
```

### B. Tabel `kategori`
Menyimpan daftar kategori tautan yang dapat dikelola secara dinamis oleh admin.
```sql
CREATE TABLE IF NOT EXISTS kategori (
  id TEXT PRIMARY KEY,
  nama TEXT UNIQUE NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kategori_nama ON kategori(nama);
-- Data master awal default:
-- 'Promo', 'Sosial Media', 'Produk', 'Kontak'
```

### C. Tabel `frame_aksi`
Menyimpan template stiker aksi QR Playful Studio.
```sql
CREATE TABLE IF NOT EXISTS frame_aksi (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  teks_cta TEXT NOT NULL,
  kode TEXT UNIQUE NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_frame_aksi_kode ON frame_aksi(kode);
-- Data template awal default:
-- ('frm-scan-me', 'Scan Me', 'SCAN ME!', 'scan-me', 1)
-- ('frm-menu', 'Menu Resto', 'LIHAT MENU', 'menu', 1)
-- ('frm-wifi', 'Koneksi WiFi', 'FREE WI-FI', 'wifi', 1)
-- ('frm-promo', 'Promo Diskon', 'DISKON SPESIAL', 'promo', 1)
```

---

## 3. Spesifikasi Rute REST API Peladen (`server/index.ts`)

| Rute Endpoint | Metode HTTP | Hak Akses / Otorisasi | Deskripsi & Respons |
| :--- | :--- | :--- | :--- |
| `/api/settings` | `GET` | Publik | Mengambil konfigurasi publik aktif (termasuk `guestLinkExpiryDays`). |
| `/api/categories` | `GET` | Publik | Mengambil daftar kategori aktif (`is_active = 1`). |
| `/api/frames` | `GET` | Publik | Mengambil daftar frame stiker aksi QR aktif (`is_active = 1`). |
| `/api/admin/settings` | `PATCH` | Role `admin` | Memperbarui parameter pengaturan (misal `guestLinkExpiryDays`). |
| `/api/admin/categories` | `GET` | Role `admin` | Mengambil seluruh kategori (termasuk status non-aktif). |
| `/api/admin/categories` | `POST` | Role `admin` | Menambahkan kategori baru. |
| `/api/admin/categories/:id` | `PATCH` | Role `admin` | Mengubah nama atau status aktif/non-aktif kategori. |
| `/api/admin/categories/:id` | `DELETE` | Role `admin` | Menghapus kategori secara permanen dari sistem. |
| `/api/admin/frames` | `GET` | Role `admin` | Mengambil seluruh template frame aksi (termasuk status non-aktif). |
| `/api/admin/frames` | `POST` | Role `admin` | Menambahkan frame stiker aksi baru. |
| `/api/admin/frames/:id` | `PATCH` | Role `admin` | Mengubah nama, teks CTA, atau status aktif frame. |
| `/api/admin/frames/:id` | `DELETE` | Role `admin` | Menghapus frame stiker aksi secara permanen. |

> **Catatan Keamanan**: Akses endpoint admin dilindungi middleware `requireAdmin()` yang memverifikasi JSON Web Token (JWT) HttpOnly / Bearer. Permintaan tanpa login menghasilkan kode status HTTP 401 (*Unauthorized*), sedangkan pengguna non-admin menghasilkan 403 (*Forbidden*).

---

## 4. Antarmuka Klien (Frontend) & Desain Neo-Pop

### A. Navigasi Avatar Header (`src/App.tsx`)
- Menu dropdown avatar mendeteksi `user.role === 'admin'`.
- Menampilkan 3 tombol CTA berurutan:
  1. **Profil Saya** (`setActiveTab('profile')`)
  2. **Settings** (`setActiveTab('admin-settings')`) beraksen warna amber dengan ikon gear.
  3. **Keluar** (`openLogoutConfirm()`).

### B. Komponen Sub-View Penuh (`src/components/admin/AdminSettingsView.tsx`)
- **Header View**: Tombol `← Kembali` ke Beranda + badge identitas `Role: Administrator`.
- **Bagian 1: Masa Aktif Tautan Tamu**:
  - Input angka jumlah hari (default: 5 hari).
  - Tombol Neo-Pop "Simpan Batas Hari" dengan status penyimpanan real-time.
  - Keterangan edukatif batas waktu tamu vs permanen member.
- **Bagian 2: Kelola Kategori Tautan**:
  - Formulir input tambah kategori baru + tombol "+ Tambah".
  - Daftar baris kategori dengan indikator status badge (AKTIF / NON-AKTIF).
  - Aksi interaktif: Ubah Nama (mode inline edit), Toggle Status Aktif, dan Hapus Kategori.
- **Bagian 3: Kelola Frame Stiker Aksi (CTA)**:
  - Formulir tambah template frame baru: Nama Frame, Teks Stiker CTA (kapital otomatis), dan Kode Unik.
  - Kartu preview visual stiker Neo-Pop dengan teks CTA yang kontras.
  - Aksi interaktif: Ubah Nama/Teks CTA, Toggle Status Aktif, dan Hapus Frame.

### C. Sinkronisasi Dinamis ke Komponen Eksisting
1. **Formulir Pemendek URL (`src/components/shortener/ShortenerCard.tsx`)**:
   - Pilihan `<select>` kategori dimuat secara dinamis dari API `/api/categories`.
   - Banner mode tamu menampilkan batas hari dinamis yang disetel admin: `"kuota 1 tautan tamu (aktif {guestLinkExpiryDays} hari)"`.
2. **Penyaringan Tautan (`src/components/links/FilterToolbar.tsx`)**:
   - Pilihan filter kategori pada bilah pencarian tautan dimuat dinamis dari data kategori server.
3. **Playful QR Studio (`src/components/qr/QRStudioCanvas.tsx`)**:
   - Pilihan tombol frame stiker dimuat dinamis dari API `/api/frames`.
   - Teks stiker CTA yang dipilih langsung dirender ke kanvas dan pratinjau stiker QR secara instan.

---

## 5. Ringkasan Verifikasi Teknis

Sesuai standar operasional `/verification-before-completion`:
- **Uji REST API**: 9 pengujian otomatis pada skrip `scratch/test_admin_api.ts` berhasil dengan kode keluar 0 (*exit code 0*):
  - Proteksi otorisasi 401/403 terverifikasi.
  - CRUD tabel `app_settings`, `kategori`, dan `frame_aksi` berfungsi sempurna.
- **Kompilasi & Linter**:
  - `npm run build`: Kompilasi TypeScript dan bundler Vite berhasil 100% tanpa kesalahan (*0 errors*).
  - `npm run lint`: Pemeriksaan Oxlint bersih dari kesalahan sintaksis (*0 errors*).
- **Peladen Aktif**: Berjalan pada port 8080 dengan isolasi basis data lokal `./data/sniplink-dev.db`.
