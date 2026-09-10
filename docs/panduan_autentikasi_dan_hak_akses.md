# Panduan Teknis Autentikasi Multi-Pengguna & Hak Akses (SnipLink V2)

Dokumen teknis resmi mengenai implementasi sistem autentikasi multi-pengguna, manajemen otorisasi peran (*Role-Based Access Control*), mekanisme sesi JWT (*JSON Web Token*), pembatasan tautan tamu 5 hari, serta alur klaim otomatis (*auto-claim*) pada aplikasi SnipLink (`https://okus.me`).

---

## 1. Arsitektur Autentikasi & Keamanan

Sistem autentikasi SnipLink beroperasi mandiri pada peladen Bun + Hono tanpa ketergantungan layanan eksternal berbayar:

```text
┌─────────────────────────────────────────────────────────────┐
│                      Peramban Klien                         │
│   (Mode Tamu via x-guest-token  /  Akun via Cookie HttpOnly) │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Request REST API   │  Header: x-guest-token & Cookie: auth_token
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Peladen Bun + Hono (Port 8080)              │
│  ├─ Middleware getSessionUser (Validasi JWT HS256)          │
│  ├─ Hashing Kata Sandi: Bun.password (Argon2id)             │
│  ├─ Pembatasan Kuota Tamu (Maksimal 1 tautan aktif)         │
│  └─ Auto-Claim Engine (Klaim tautan tamu ke akun pengguna)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Basis Data SQLite (/app/data/sniplink.db)   │
│  ├─ Tabel users (Data identitas & hash kata sandi)          │
│  └─ Tabel links (Kolom user_id, expires_at, guest_token)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Peran (*User Roles*)

| Peran | Deskripsi | Hak Akses |
| :--- | :--- | :--- |
| **Administrator (`admin`)** | Akun superuser khusus untuk bang Ucup (`admin@okus.me`). | Pemantauan seluruh tautan sistem, manajemen pengguna, bypass kuota tamu, dan kuota bio-link tak terbatas di Fase 2. |
| **Pengguna Biasa (`user`)** | Pengguna publik yang telah terdaftar/login. | Pembuatan tautan tanpa batas, masa aktif permanen, akses penuh analitik riil pribadi, dan 1 halaman bio-link. |
| **Tamu (*Anonymous/Guest*)** | Pengunjung yang belum masuk/mendaftar. | Dibatasi maksimal **1 tautan aktif**, masa aktif **5 hari** (otomatis kadaluwarsa), dan analitik riil terkunci. |

---

## 3. Kebijakan Tautan Tamu & Klaim Otomatis (*Auto-Claim*)

1. **Token Tamu Peramban**:
   Setiap peramban yang belum login diberikan token acak unik (disimpan di `localStorage` dengan kunci `sniplink_guest_token`).
2. **Pembatasan 1 Tautan**:
   Peladen memeriksa jumlah tautan aktif yang terikat dengan `guest_token`. Jika pengguna tamu mencoba membuat tautan ke-2, peladen menolak dengan kode status `HTTP 403 Forbidden`.
3. **Masa Aktif 5 Hari**:
   Tautan tamu memiliki kolom `expires_at` yang diatur ke `Waktu Sekarang + 5 Hari`. Setelah melewati batas ini, mesin pengalihan mengembalikan respons `404 / Kadaluwarsa` dan peladen secara berkala menghapus berkas data lama.
4. **Alur Klaim Otomatis (*Auto-Claim*)**:
   Saat tamu mendaftar akun baru (*Register*) atau masuk (*Login*), peramban menyertakan `guestToken`. Peladen secara otomatis:
   - Mengubah `user_id` tautan tamu menjadi `user.id`.
   - Mengosongkan nilai `expires_at` (menjadikan tautan permanen).
   - Mengubah penanda `is_claimed` menjadi `1`.
   - Membuka akses analitik riil langsung di dasbor pengguna.

---

## 4. Spesifikasi Endpoint Autentikasi

| Rute | Metode | Otorisasi | Deskripsi |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Publik | Mendaftarkan akun baru (surel, sandi min. 6 karakter, nama, opsional `guestToken`). |
| `/api/auth/login` | `POST` | Publik | Masuk dengan surel & kata sandi; mengembalikan cookie JWT `HttpOnly`. |
| `/api/auth/google` | `POST` | Publik | Integrasi masuk cepat via profil Google OAuth. |
| `/api/auth/me` | `GET` | Cookie / Bearer | Mengambil profil pengguna yang sedang aktif. |
| `/api/auth/logout` | `POST` | Sesi Aktif | Menghapus cookie `auth_token` untuk keluar sesi. |
| `/api/auth/set-password` | `POST` | Sesi Aktif | Membuat atau memperbarui kata sandi baru akun (enkripsi Argon2id). |
| `/api/links/claim` | `POST` | Sesi Aktif | Mengklaim kepemilikan tautan tamu ke akun pengguna yang sedang masuk. |

---

## 5. Inisialisasi Akun Administrator & Alur Aktivasi Mandiri

Akun administrator diperlakukan setara dengan pengguna sistem lainnya tanpa kata sandi statis bawaan:
- **Akun Bawaan Basis Data**: `admin@okus.me` diinisialisasi pada tabel `users` dengan `role = 'admin'` dan `password_hash = NULL`.
- **Aktivasi Pertama Kali**:
  1. Administrator memasukkan email `admin@okus.me` dan mengosongkan kolom kata sandi pada formulir login.
  2. Peladen memverifikasi bahwa akun belum bersandi, mengizinkan login sesi, dan menandai `mustSetPassword: true`.
  3. Antarmuka segera menampilkan modal sembulan wajib (*non-dismissible modal*) untuk membuat kata sandi baru (minimal 6 karakter beserta konfirmasi).
  4. Kata sandi baru dienkripsi menggunakan algoritma **Argon2id** (`Bun.password.hash`) ke tabel `users` via rute `POST /api/auth/set-password`.
  5. Untuk login berikutnya, akun administrator wajib menggunakan kata sandi yang baru saja dibuat layaknya pengguna pendaftar umum.
- **Kunci Rahasia JWT**: Disetel melalui variabel lingkungan `JWT_SECRET` pada peladen produksi.
- **Pemisahan Berkas Lingkungan**: Berkas `.env` dan basis data SQLite persisten terdaftar pada `.gitignore` dan tidak diunggah ke repositori publik.


---

## 6. Dialog Konfirmasi Keluar Akun (*Logout Confirm Modal*)

Untuk mencegah dialog bawaan peramban (*browser native alert*) yang kaku, SnipLink menggunakan modal dialog sembulan (*modal popup*) bergaya Neo-Pop:
- **Komponen**: [`src/components/auth/LogoutConfirmModal.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/components/auth/LogoutConfirmModal.tsx).
- **Pengendali State**: `useAuthStore` (`isLogoutConfirmOpen`, `openLogoutConfirm`, `closeLogoutConfirm`).
- **Pemicu**: Tombol "Keluar" pada bilah navigasi atas (*header dropdown*) dan tombol "Keluar dari Akun" pada Dasbor Profil.
- **Interaksi Aksesibilitas**:
  - Penutupan otomatis saat pengguna menekan tombol papan ketik `Escape` atau menyentuh latar belakang buram (*backdrop click dismiss*).
  - Menampilkan notifikasi (*toast*) konfirmasi keberhasilan saat sesi aktif selesai diakhiri.

---

## 7. Visibilitas Kontrol Antarmuka (Tamu vs Pengguna Login)

Untuk menyederhanakan alur pengguna anonim (*guest UX*) serta membedakan hak guna fitur tingkat lanjut:

| Komponen / Elemen | Mode Tamu (Anonim) | Pengguna Terdaftar (Login) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Banner Informasi Tamu** | Dihapus / Tidak Ditampilkan | Tidak Ditampilkan | Banner statis mode tamu di atas formulir pemendek telah dihapus untuk tampilan yang lebih bersih. |
| **Kustomisasi Slug, Kategori & PIN** | Tersembunyi (*Hidden*) | Ditampilkan (*Visible*) | Opsi lanjutan (slug kustom, pilihan kategori, dan proteksi PIN) hanya tersedia bagi pengguna yang telah login. |
| **Parameter UTM** | Tersembunyi (*Hidden*) | Ditampilkan (*Visible*) | Tombol pembuat parameter UTM (*Urchin Tracking Module*) hanya dapat diakses pengguna terdaftar. |
| **Ringkasan Metrik Cepat (3 Angka)** | Tersembunyi (*Hidden*) | Ditampilkan (*Visible*) | Blok metrik beranda ("Tautan Aktif", "Total Klik", "Scan QR") disembunyikan untuk pengunjung anonim. |


