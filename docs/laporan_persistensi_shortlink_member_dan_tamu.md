# Laporan Teknis: Analisis & Perbaikan Persistensi Shortlink (Tamu vs Member)

Dokumen teknis investigasi dan implementasi perbaikan masalah hilangnya hasil tautan ringkas (*shortlink*) saat halaman direload, pemisahan penyimpanan perangkat lokal (*device storage*) untuk non-member maksimal 5 hari, serta penguncian penyimpanan langsung ke basis data produksi (*production database*) untuk member.

---

## 1. Temuan Analisis Masalah (*Root Cause Analysis*)

| Kasus Pengguna | Gejala Masalah | Penyebab Utama di Kode |
| :--- | :--- | :--- |
| **Non-Member (Tamu)** | Tautan ringkas dan kartu hasil (`ResultCard`) lenyap setelah halaman di-reload. | 1. Kartu hasil pembuatan (`ResultCard`) hanya disimpan pada memori sementara komponen React (`useState<LinkItem \| null>(null)`), sehingga saat reload state kembali kosong (`null`).<br>2. Pada `initializeStore`, terjadi penimpaan IndexedDB secara gegabah (`await db.links.clear()`) yang menghapus data device lokal ketika respons awal kosong. |
| **Member (Pengguna Login)** | Tautan member tidak muncul kembali setelah reload. | 1. **Kondisi Balapan (*Race Condition*)**: `initAuth()` dan `initializeStore()` dijalankan secara paralel di `App.tsx`. Saat `initializeStore()` berjalan, `user` masih bernilai `null` sehingga server menganggap permintaan berasal dari tamu dan mengembalikan tautan tamu yang kosong.<br>2. **Ketidaksesuaian Arsitektur**: Tautan member sempat dimasukkan ke IndexedDB browser, padahal hak akses member harus langsung dan permanen ke basis data server (*SQLite production*).<br>3. **Ketergantungan Cookie Tunggal**: Token JWT (*JSON Web Token*) hanya mengandalkan cookie `HttpOnly` tanpa *header* `Authorization: Bearer <token>`, rentan terblokir saat reload di lingkungan produksi (*reverse proxy/Traefik*). |

---

## 2. Solusi Arsitektur yang Diterapkan

### A. Non-Member (Tamu / Anonim)
1. **Penyimpanan di Device Pengguna**:
   - Tautan tamu disimpan pada IndexedDB peramban lokal perangkat pengguna.
   - Masa aktif maksimal **5 hari** (`expiresAt = Date.now() + 5 hari`).
   - Setiap kali halaman dibuka/dimuat, sistem memindai dan membersihkan (*auto-purge*) tautan di perangkat yang usianya telah melampaui 5 hari.
   - Tautan yang masih berlaku (< 5 hari) tetap tampil di layar meskipun halaman direload atau pengguna dalam kondisi luring (*offline*).
2. **Persistensi Kartu Hasil**:
   - `createdResult` dipersistensikan pada `sessionStorage` perangkat (`sniplink_last_created_result`), sehingga kotak konfirmasi dan kode QR tetap terlihat setelah reload sampai pengguna menutupnya secara eksplisit.

### B. Member (Pengguna Terdaftar / Login)
1. **Langsung ke Basis Data Produksi**:
   - Tautan member berstatus permanen dan disimpan langsung ke basis data SQLite peladen (`/api/links`).
   - Tautan member **TIDAK PERNAH** disimpan ke IndexedDB atau LocalStorage perangkat lokal klien.
   - Saat sesi member terdeteksi, IndexedDB lokal secara otomatis dibersihkan (`await db.links.clear()`) guna mencegah kebocoran data tautan akun ke penyimpanan publik perangkat.
2. **Otentikasi Ganda (*Dual Auth Resilience*)**:
   - Token JWT disimpan pada `localStorage` (`sniplink_token`) dan dikirim via *header* `Authorization: Bearer <token>` berdampingan dengan cookie `HttpOnly`.
   - Menghilangkan kegagalan otentikasi di lingkungan produksi akibat pembatasan *SameSite* atau terminasi proksi terbalik.
3. **Inisialisasi Sekuensial**:
   - Pada `App.tsx`, pemanggilan `await initAuth()` diselesaikan terlebih dahulu sebelum `initializeStore()` berjalan.
   - Perubahan status otentikasi pengguna secara reaktif memicu pembaruan daftar tautan secara instan.

---

## 3. Berkas yang Dimodifikasi

1. [`src/stores/useAuthStore.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/stores/useAuthStore.ts)
   - Penambahan fungsi ekspor `getAuthToken()`.
   - Penyimpanan token JWT ke `localStorage` pada `login`, `register`, dan `loginWithGoogle`.
   - Pengiriman *header* `Authorization: Bearer <token>` pada `initAuth`, `logout`, dan `setPassword`.
   - Penghapusan token pada saat `logout`.
2. [`src/stores/useLinkStore.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/stores/useLinkStore.ts)
   - Pemisahan total logika penyimpanan:
     - Member: Langsung ke REST API basis data produksi, membersihkan IndexedDB lokal.
     - Non-Member: Menyimpan ke IndexedDB lokal dengan filter masa aktif maksimal 5 hari.
   - Pengiriman token Bearer dan token tamu dinamis.
3. [`src/App.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/App.tsx)
   - Persistensi `createdResult` melalui `sessionStorage` dengan validasi masa berlaku.
   - Penataan urutan pemanggilan efek: `initAuth()` mendahului `initializeStore()`.
   - Sinkronisasi reaktif tautan saat nilai `user` berubah.

---

## 4. Hasil Verifikasi (/verification-before-completion)

```bash
# 1. Verifikasi Kompilasi TypeScript & Pembuatan Bundel Produksi
npm run build
# Status: exit code 0, 2131 modul terkompilasi tanpa kesalahan.

# 2. Verifikasi Linter Kode
npm run lint
# Status: exit code 0, 0 eror.

# 3. Pengujian End-to-End Persistensi (Tamu & Member)
bun verify_persistence.ts
# Hasil:
# - Mode Tamu: Pembuatan link 201, expiresAt = 5 hari ke depan, reload 200, link tetap ada (LULUS).
# - Mode Member: Registrasi 201, buat link permanen 201, reload 200, link tetap ada (LULUS).
```
