# Analisis Mekanisme Google Auth, Penyebab Email Dummy, dan Rencana Solusi

Dokumen ini memuat audit teknis mendalam terhadap implementasi fitur autentikasi Google pada SnipLink (okus.me), pemetaan mekanisme aliran data (*data flow*), akar penyebab kemunculan akun tiruan (*mock dummy account*), serta rekomendasi solusi integrasi resmi Google OAuth.

---

## 1. Ringkasan Temuan

Saat tombol **"Masuk Cepat lewat Google"** diklik pada antarmuka, aplikasi langsung memasukkan sesi pengguna dengan surel `user.google@gmail.com` tanpa menampilkan jendela sembulan (*popup dialog*) atau pengalihan (*redirect*) ke Google.

### Tabel Perbandingan Kondisi Sistem
| Aspek | Kondisi Saat Ini (Mock) | Standar Produksi (Google OAuth 2.0 / GIS) |
| :--- | :--- | :--- |
| **Pemicu Antarmuka** | Menjalankan fungsi klien tanpa parameter | Membuka jendela dialog resmi Google Identity |
| **Sumber Data Akun** | Nilai baku tiruan (*hardcoded fallback*) | Token identitas kriptografis (*ID Token JWT*) dari Google |
| **Validasi Peladen** | Menerima teks mentah dari *body* HTTP | Memverifikasi tanda tangan kunci publik Google |
| **Kredensial GCP** | Belum ada `GOOGLE_CLIENT_ID` di `.env` | Memerlukan *Client ID* terdaftar di Google Cloud Console |
| **Status Akun** | Semua penekan tombol berbagi 1 akun dummy | Setiap pengguna memiliki akun unik sesuai profil asli |

---

## 2. Akar Masalah (*Root Cause Analysis*)

Investigasi berkas kode menemukan 4 titik penyebab:

### a. Pemanggilan Tanpa Parameter pada Komponen UI
Pada berkas [`src/components/auth/AuthModal.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/components/auth/AuthModal.tsx#L58-L67):
```typescript
const handleGoogleLogin = async () => {
  setErrorMessage(null);
  const res = await loginWithGoogle(); // Dijalankan tanpa payload profil
  if (res.success) {
    showToast('Berhasil masuk dengan Google!');
    await initializeStore();
  } else {
    setErrorMessage(res.message || 'Gagal masuk dengan Google.');
  }
};
```
Fungsi `handleGoogleLogin` tidak menginisialisasi pustaka autentikasi Google pihak ketiga, melainkan langsung mengeksekusi `loginWithGoogle()`.

### b. Fallback Tiruan (*Hardcoded Mock*) pada State Store
Pada berkas [`src/stores/useAuthStore.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/stores/useAuthStore.ts#L175-L192):
```typescript
loginWithGoogle: async (mockProfile) => {
  set({ isLoading: true });
  try {
    const email = mockProfile?.email || 'user.google@gmail.com';
    const name = mockProfile?.name || 'Pengguna Google';

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        name,
        googleId: `goog-${Date.now()}`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        guestToken: get().guestToken
      })
    });
    // ...
```
Parameter `mockProfile` bernilai `undefined`, sehingga sistem mengeksekusi operator cadangan:
- `email` disetel ke `'user.google@gmail.com'`
- `name` disetel ke `'Pengguna Google'`
- `googleId` disetel ke acak waktu `'goog-' + Date.now()`

### c. Peladen Menerima Masukan Tanpa Verifikasi Token Kriptografis
Pada berkas [`server/index.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/server/index.ts#L261-L285):
```typescript
app.post('/api/auth/google', async (c) => {
  const body = await c.req.json();
  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || 'Pengguna Google').trim();
  const googleId = body.googleId ? String(body.googleId) : undefined;
  // ...
  let user = userRepo.findByEmail(email);
  if (!user) {
    user = userRepo.create({
      email,
      name,
      avatarUrl,
      role: 'user',
      authProvider: 'google',
      googleId
    });
  }
  // Menerbitkan JWT internal aplikasi
```
Endpoint `/api/auth/google` mempercayai data teks JSON dari klien tanpa memeriksa bukti verifikasi dari pihak ketiga (*identity provider*).

### d. Ketiadaan Konfigurasi Lingkungan Google Cloud
Pada berkas [`.env.example`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/.env.example):
Variabel lingkungan seperti `GOOGLE_CLIENT_ID` atau `GOOGLE_CLIENT_SECRET` belum dideklarasikan karena proyek pada awalnya memprioritaskan fitur dasar dan mock antarmuka.

---

## 3. Mekanisme Aliran Data Saat Ini (*Current Data Flow*)

```
[Pengguna Klik Tombol "Masuk Cepat lewat Google"]
                       │
                       ▼
         [AuthModal.tsx: handleGoogleLogin()]
                       │
                       ▼
       [useAuthStore.ts: loginWithGoogle()]
       - Set email = 'user.google@gmail.com'
       - Set name = 'Pengguna Google'
       - Set googleId = 'goog-<timestamp>'
       - Set guestToken = token_tamu_aktif
                       │
                       ▼ (HTTP POST /api/auth/google)
           [server/index.ts Peladen Hono]
                       │
                       ├─► [SQLite DB: userRepo.findByEmail()]
                       │    ├─ Ditemukan: Ambil user eksisting
                       │    └─ Tidak ada: INSERT user baru (role: user, auth_provider: google)
                       │
                       ├─► [SQLite DB: linkRepo.claimGuestLinks()]
                       │    └─ Tautan milik guestToken dialihkan ke user.id
                       │
                       ├─► [Penerbitan JWT (JSON Web Token)]
                       │    └─ Token ditandatangani dengan JWT_SECRET (masa aktif 30 hari)
                       │
                       ▼ (HTTP 200 OK + Cookie HttpOnly auth_token)
         [useAuthStore.ts Menerima Respons]
         - Simpan token ke localStorage ('sniplink_token')
         - Simpan data user ke Zustand State
         - Tutup modal & muat ulang dasbor
```

---

## 4. Analisis Risiko Keamanan & Dampak Data

1. **Tabrakan Akun (*Account Collision*)**:
   Semua pengguna yang menekan tombol Google akan masuk ke akun tunggal yang sama (`user.google@gmail.com`). Tautan pendek milik pengguna A dapat terlihat dan dikelola oleh pengguna B.
2. **Klaim Tautan Liar (*Unauthorized Link Hijacking*)**:
   Setiap klik Google login akan mengklaim tautan tamu saat itu ke akun `user.google@gmail.com`, mencampurkan kepemilikan tautan dari berbagai perangkat.
3. **Palsifikasi Identitas (*Identity Spoofing*)**:
   Siapa pun dapat menembakkan HTTP POST ke `/api/auth/google` dengan membawa surel pengguna mana saja dan langsung mendapatkan token akses akun tersebut.

---

## 5. Pilihan Solusi Rekayasa

### Solusi 1: Google Identity Services (GIS) / Credential ID Token (Sangat Direkomendasikan)
Menggunakan standar web modern Google (*Google Identity Services* client library).

#### Alur Kerja:
1. Memuat skrip Google `https://accounts.google.com/gsi/client` di halaman web atau memakai pembungkus React.
2. Menampilkan tombol resmi Google Sign-In atau pop-up *One Tap*.
3. Pengguna memilih akun Google asli mereka di antarmuka aman Google.
4. Google mengembalikan kredensial terenkripsi (*ID Token* berupa JWT) ke peramban.
5. Peramban mengirim *ID Token* tersebut ke backend `/api/auth/google`.
6. Backend memverifikasi validitas token ke endpoint Google (`https://oauth2.googleapis.com/tokeninfo?id_token=...`) atau secara kriptografis menggunakan sertifikat publik Google.
7. Backend mengambil data nama, email, foto profil resmi yang terverifikasi, lalu membuat/memperbarui sesi akun di basis data SQLite.

### Solusi 2: OAuth 2.0 Authorization Code Flow (Server-Side Redirect)
Menggunakan pengalihan URL penuh (*full page redirect*).

#### Alur Kerja:
1. Pengguna mengeklik tombol dan dialihkan ke rute `/api/auth/google`.
2. Peladen merespons dengan HTTP 302 Redirect ke `accounts.google.com/o/oauth2/v2/auth`.
3. Setelah persetujuan pengguna, Google mengarahkan kembali ke `/api/auth/google/callback?code=...`.
4. Peladen menukar `code` dengan token akses dan profil ke peladen Google.
5. Peladen menetapkan cookie sesi dan mengarahkan kembali ke dasbor.

### Solusi 3: Mode Aman Sementara (Nonaktifkan / Sembunyikan Tombol Mock)
Jika kredensial Google Cloud Console belum siap:
1. Sembunyikan tombol "Masuk Cepat lewat Google" dari [`AuthModal.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/components/auth/AuthModal.tsx) atau beri tanda keterangan `Segera Hadir`.
2. Hapus atau kunci rute `/api/auth/google` agar tidak menerima akun tiruan yang merusak konsistensi data riil.

---

## 6. Prasyarat Konfigurasi Google Cloud Console

Untuk mengaktifkan login Google riil, langkah konfigurasi berikut wajib dilakukan pada konsol Google:
1. Buka **Google Cloud Console** (GCP: Google Cloud Platform) di `https://console.cloud.google.com/`.
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Konfigurasi **OAuth Consent Screen**:
   - Tipe Pengguna: External (*Eksternal*).
   - Nama Aplikasi: SnipLink.
   - Email Dukungan Pengguna & Pengembang.
   - Ruang Lingkup (*Scopes*): `email`, `profile`, `openid`.
4. Buat Kredensial **OAuth 2.0 Client ID**:
   - Tipe Aplikasi: Web Application (*Aplikasi Web*).
   - Asal JavaScript Resmi (*Authorized JavaScript origins*):
     - `http://localhost:5173` (lokal frontend Vite)
     - `http://localhost:8080` (lokal backend Bun)
     - `https://okus.me` (domain produksi)
   - URI Pengalihan Resmi (*Authorized redirect URIs* - jika memakai alur server):
     - `https://okus.me/api/auth/google/callback`
5. Ambil **Client ID** dan masukkan ke variabel lingkungan:
   - Frontend: `VITE_GOOGLE_CLIENT_ID`
   - Backend: `GOOGLE_CLIENT_ID`

---

## 7. Status Implementasi Penonaktifan Sementara (Terkini)

Sesuai arahan Bang Ucup, langkah pengamanan data telah dieksekusi:
1. **Pembersihan Antarmuka**: Tombol "Masuk Cepat lewat Google" dan pemisah teks "atau" telah dihapus dari [`AuthModal.tsx`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/components/auth/AuthModal.tsx).
2. **Penguncian Endpoint Peladen**: Rute `POST /api/auth/google` pada [`server/index.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/server/index.ts) telah dikunci dengan respons HTTP 503 (*Service Unavailable*).
3. **Pengamanan State Store**: Fungsi `loginWithGoogle` pada [`useAuthStore.ts`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/src/stores/useAuthStore.ts) tidak lagi menembakkan *payload* tiruan.
4. **Pembersihan Basis Data**: Akun dummy `user.google@gmail.com` telah dihapus dari basis data SQLite (`data/sniplink-dev.db` dan `data/sniplink.db`).

