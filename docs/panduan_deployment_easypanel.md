# Panduan Lengkap Deployment ke VPS Menggunakan Easypanel

Dokumen teknis resmi untuk menerapkan (*deploy*) aplikasi SnipLink (`okus.me`) dari repositori GitHub ke peladen VPS (*Virtual Private Server*) menggunakan panel kontrol modern **Easypanel** (berbasis Docker & Traefik).

---

## 1. Ikhtisar Arsitektur Easypanel

Easypanel mengotomatisasi kontainerisasi aplikasi di atas Docker:

```text
[ Pengembang / Git Push ke main ]
              │
              ▼ (GitHub Webhook)
    ┌───────────────────┐
    │  VPS / Easypanel  │
    └─────────┬─────────┘
              │ 1. Git Clone (branch: main)
              │ 2. Docker Build (Bun Builder Stage -> Nginx Alpine Runner)
              ▼
    ┌───────────────────┐
    │  Docker Container │ <── Port 80 (Nginx)
    └─────────┬─────────┘
              ▲
              │ Reverse Proxy & Otomasi SSL (Let's Encrypt)
    ┌─────────┴─────────┐
    │  Traefik Ingress  │ <── Port 443 / 80
    └─────────▲─────────┘
              │
[ Pengguna Akhir: https://okus.me ]
```

---

## 2. Prasyarat Sebelum Mulai

Pastikan hal-hal berikut telah terpenuhi:
1. **Domain DNS (Domain Name System)**:
   - Tambahkan **A Record** pada DNS domain Anda:
     - Host: `@` (atau `okus.me`) -> Nilai: `[ALAMAT_IP_VPS_ANDA]`
     - Host: `www` -> Nilai: `[ALAMAT_IP_VPS_ANDA]`
2. **Repositori GitHub**:
   - URL: `https://github.com/blinkihc/shortlink-okus`
   - Cabang Produksi: `main`
3. **Akses Dashboard Easypanel**:
   - URL: `http://[IP_VPS]:3000` (atau domain panel kustom Anda).

---

## 3. Langkah Demi Langkah Konfigurasi di Easypanel

### Langkah 1: Buat Proyek Baru di Easypanel
1. Masuk ke dashboard Easypanel.
2. Di bilah samping (*sidebar*), klik **"Projects"**.
3. Klik tombol **"+ Create Project"**.
4. Masukkan nama proyek: `okus` (atau `shortlink`), lalu simpan.

---

### Langkah 2: Tambahkan Layanan Aplikasi (App Service)
1. Buka proyek `okus` yang baru dibuat.
2. Klik tombol **"+ Service"** di pojok kanan atas.
3. Pilih jenis layanan: **"App"**.
4. Beri nama layanan: `sniplink` (atau `web`).
5. Klik **Create**.

---

### Langkah 3: Konfigurasi Sumber Kode (Source Tab)
1. Pada halaman layanan `sniplink`, buka tab **"Source"**.
2. Pilih opsi **"GitHub"**.
3. Hubungkan akun GitHub atau masukkan kredensial repositori:
   - **Repository**: `blinkihc/shortlink-okus`
   - **Branch**: `main`
4. Centang / aktifkan opsi **"Auto Deploy"** jika ingin setiap `git push origin main` otomatis memicu pembaruan rilis.
5. Simpan perubahan (*Save*).

---

### Langkah 4: Konfigurasi Metode Build (Build Tab)
1. Buka tab **"Build"**.
2. Pada pilihan **Build Method**, pilih: **"Dockerfile"**.
   - *Catatan teknis: Repositori telah dilengkapi `Dockerfile` multi-stage Bun Fullstack Runner yang otomatis mengekspos port 8080.*
3. Pada kolom **File**, pastikan terisi:
   - **File**: `./Dockerfile`
4. Klik tombol **Save**.
   - *Catatan: Pada mode Dockerfile, kolom Port tidak ada di tab Build karena port layanan diatur langsung pada tab **Domains**.*

---

### Langkah 5: Konfigurasi Variabel Lingkungan & Volume
1. Buka tab **"Environment"**:
   ```env
   VITE_APP_DOMAIN=okus.me
   VITE_APP_ENV=production
   PORT=8080
   DATABASE_PATH=/app/data/sniplink.db
   ```
2. Buka tab **"Volumes"**:
   - Host Path / Volume Name: `sniplink_data`
   - Mount Path: `/app/data`
3. Simpan perubahan (*Save*).

---

### Langkah 6: Konfigurasi Domain & Sertifikat SSL (Domains Tab)
1. Buka tab **"Domains"**.
2. Klik **"+ Add Domain"**.
3. Masukkan domain utama:
   - **Domain**: `okus.me`
   - **Path**: `/`
   - **Port**: `8080`
4. *(Opsional)* Tambahkan domain kedua jika ingin mendukung subdomain www:
   - **Domain**: `www.okus.me`
5. Easypanel melalui Traefik akan secara otomatis memverifikasi DNS dan menerbitkan sertifikat SSL (*Secure Sockets Layer*) gratis dari Let's Encrypt.
6. Simpan perubahan (*Save*).

---

### Langkah 7: Eksekusi Deployment Pertama (Deploy)
1. Klik tombol **"Deploy"** di bagian atas layanan.
2. Buka tab **"Deployments"** untuk memantau log proses build:
   - Menarik repositori GitHub branch `main`.
   - Menginstal dependensi melalui Bun.
   - Menjalankan `bun run build`.
   - Mengemas bundel ke citra kontainer Nginx Alpine.
   - Menjalankan kontainer dan mengaktifkan rute domain.
3. Tunggu hingga status berubah menjadi **"Running"** (berwarna hijau).

---

## 4. Konfigurasi GitHub Webhook (Untuk Otomasi CI/CD)

Agar setiap pembaruan di branch `main` langsung dideploy otomatis tanpa harus login ke Easypanel:

1. Di Easypanel pada tab **Source** atau **General**, salin URL **Deploy Webhook** (contoh: `https://panel.domain.com/api/deploy?token=xxxx`).
2. Buka repositori GitHub: [`https://github.com/blinkihc/shortlink-okus/settings/hooks`](https://github.com/blinkihc/shortlink-okus/settings/hooks).
3. Klik **"Add webhook"**.
4. Isi data:
   - **Payload URL**: Masukkan URL Deploy Webhook dari Easypanel.
   - **Content type**: `application/json`.
   - **Which events would you like to trigger this webhook?**: Pilih `Just the push event`.
5. Klik **"Add webhook"**.
6. Sekarang setiap penggabungan (*merge*) atau rilis ke `main` akan langsung dideploy ke VPS secara seketika (*zero manual friction*).

---

## 5. Lembar Verifikasi Pasca-Deployment

Lakukan pengujian cepat setelah deployment selesai:

| Komponen Uji | Prosedur Uji | Kriteria Sukses |
| :--- | :--- | :--- |
| **Akses HTTPS** | Kunjungi `https://okus.me` di peramban. | Halaman tampil sempurna dengan gembok hijau SSL. |
| **SPA Fallback** | Akses langsung URL rute misal `https://okus.me/analytics`. | Halaman tetap termuat tanpa galat 404 Nginx. |
| **PWA Detection** | Buka melalui smartphone (Android / iOS). | Modal instalasi PWA muncul otomatis, tata letak mobile pas. |
| **Shortlink Generation** | Buat tautan pendek baru. | Domain yang tertera adalah `okus.me/xxxxxx`. |
| **QR Code Studio** | Unduh berkas SVG QR Code. | Kontras warna QR memenuhi standar WCAG AA. |

---

## 6. Prosedur Penanganan Masalah (Troubleshooting)

• **Kendala: Domain tidak bisa diakses / SSL Error**
  - Penyebab: Propagasi DNS A Record belum selesai atau port 80/443 di VPS terblokir firewall.
  - Solusi: Cek DNS via `https://dnschecker.org/#A/okus.me`. Pastikan firewall VPS membuka port 80 dan 443 (`sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`).

• **Kendala: Build Gagal di Tahap Bun**
  - Penyebab: Masalah memori (*Out Of Memory*) pada VPS ber-RAM kecil.
  - Solusi: Tambahkan swap memory minimal 2 GB pada VPS Linux (`sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`).

• **Kendala: Mengembalikan ke Versi Sebelumnya (Rollback)**
  - Solusi: Di tab **Deployments** Easypanel, klik tanda titik tiga pada deployment stabil sebelumnya lalu pilih **"Redeploy"**.
