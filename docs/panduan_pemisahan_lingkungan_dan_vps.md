# Panduan Pemisahan Lingkungan (Lokal vs Production) & Deployment VPS

Dokumen arsitektur teknis dan prosedur operasional untuk memisahkan siklus pengembangan lokal (*local development*) dengan peladen produksi (*production server*) di VPS (Virtual Private Server / Peladen Privat Virtual) agar penambahan fitur baru tidak merusak (*breaking the code*) aplikasi yang sedang aktif digunakan.

---

## 1. Arsitektur Pemisahan Lingkungan (Environment Separation)

Untuk menjamin stabilitas aplikasi, sistem dibagi menjadi 3 tingkatan lingkungan:

| Lingkungan (*Environment*) | Fungsi & Lokasi | Domain / URL | Sumber Basis Data | Kebijakan Data Awal |
| :--- | :--- | :--- | :--- | :--- |
| **Lokal (*Development*)** | Tempat menulis kode baru & eksperimen di komputer pengembang. | `http://localhost:5173` / `8080` | SQLite Terisolasi (`./data/sniplink-dev.db`) + IndexedDB Tamu | Diizinkan data percontohan (*seed links*) jika tabel kosong |
| **Staging (*Pra-Produksi*)** | Tempat pengujian menyeluruh pra-rilis. | `https://staging.okus.me` (opsional) | SQLite Terisolasi (`./data/sniplink-staging.db`) | **100% Bersih** (tanpa tautan percontohan) |
| **Production (*Produksi*)** | Aplikasi aktif pengguna publik di internet. | `https://okus.me` | SQLite Permanen (`/app/data/sniplink-production.db`) | **100% Bersih** (hanya tautan riil & akun admin Bang Ucup) |

---

## 2. Strategi Percabangan Git (Git Branching Model)

Pemisahan kode dikelola secara ketat melalui Git (Sistem Kontrol Versi):

```text
[ feature/nama-fitur-baru ]  <-- Anda bekerja di sini secara lokal
           │
           ▼ (Pull Request / Penggabungan setelah lulus uji coba)
[ develop / staging ]        <-- Lingkungan uji coba pra-rilis
           │
           ▼ (Rilis Terverifikasi / Tag Versi v1.1.0)
[ main / production ]        <-- Hanya kode stabil yang dideploy ke VPS
```

### Aturan Perlindungan Kode:
1. **Dilarang *Push* Langsung ke `main`**: Cabang `main` dilindungi (*protected branch*).
2. **Pre-push Verification Gate**: Sebelum penggabungan (*merge*), kode wajib lolos uji coba otomatis:
   ```bash
   bun test && bun run build
   ```
   Jika ada tes yang gagal (*fail*), penggabungan otomatis dibatalkan.

---

## 3. Konfigurasi Variabel Lingkungan (.env)

Aplikasi SnipLink memisahkan konfigurasi melalui berkas variabel lingkungan:

### A. Berkas `.env.development` (Untuk Komputer Lokal)
```env
VITE_APP_ENV=development
VITE_APP_DOMAIN=localhost:5173
VITE_ENABLE_DEBUG_LOG=true
```

### B. Berkas `.env.production` (Khusus di Peladen VPS)
```env
VITE_APP_ENV=production
VITE_APP_DOMAIN=okus.me
VITE_ENABLE_DEBUG_LOG=false
```

Aplikasi secara otomatis membaca `APP_CONFIG` dari `src/config/appConfig.ts` saat dikompilasi oleh Vite.

---

## 4. Prosedur Deployment Zero-Downtime di VPS

Untuk mencegah aplikasi mati (*downtime*) saat pembaruan versi, gunakan struktur direktori *Symlink* di VPS:

### Struktur Direktori VPS:
```text
/var/www/okus.me/
├── releases/
│   ├── v1.0.0/ (dist hasil build versi lama)
│   └── v1.1.0/ (dist hasil build versi baru)
├── current -> /var/www/okus.me/releases/v1.1.0 (Symlink aktif)
└── shared/
    └── .env.production
```

### Skrip Otomasi Rilis Baru di VPS (`deploy.sh`):
```bash
#!/bin/bash
set -e

APP_DIR="/var/www/okus.me"
RELEASE_TAG=$(date +%Y%m%d%H%M%S)
NEW_RELEASE_DIR="$APP_DIR/releases/$RELEASE_TAG"

echo "• Menarik kode terbaru dari Git branch main..."
git fetch origin main
git checkout main
git pull origin main

echo "• Menginstal dependensi & menjalankan pengujian..."
bun install --frozen-lockfile
bun test

echo "• Mengompilasi bundel produksi..."
bun run build

echo "• Memindahkan hasil kompilasi ke direktori rilis baru..."
mkdir -p "$NEW_RELEASE_DIR"
cp -r dist/* "$NEW_RELEASE_DIR/"
cp "$APP_DIR/shared/.env.production" "$NEW_RELEASE_DIR/.env"

echo "• Mengalihkan symlink aktif ke rilis baru (Zero Downtime)..."
ln -sfn "$NEW_RELEASE_DIR" "$APP_DIR/current"

echo "• Memuat ulang Nginx..."
sudo systemctl reload nginx

echo "• Rilis $RELEASE_TAG sukses aktif di https://okus.me!"
```

### Mekanisme Rollback Instan (Jika Terjadi Masalah di Produksi):
Jika versi baru ditemukan kendala tak terduga, kembalikan ke versi sebelumnya dalam 1 detik:
```bash
# Arahkan kembali symlink ke rilis stabil sebelumnya
ln -sfn /var/www/okus.me/releases/v1.0.0 /var/www/okus.me/current
sudo systemctl reload nginx
```

---

## 5. Konfigurasi Peladen Web Nginx di VPS

Berkas konfigurasi Nginx (`/etc/nginx/sites-available/okus.me`):

```nginx
server {
    listen 80;
    server_name okus.me www.okus.me;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name okus.me www.okus.me;

    # Sertifikat SSL Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/okus.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/okus.me/privkey.pem;

    root /var/www/okus.me/current;
    index index.html;

    # Caching Agresif untuk Aset Ber-Hash (CSS, JS, Gambar)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Bebas Cache untuk index.html agar Pembaruan PWA Instan Terdeteksi Klien
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Penanganan SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 6. Laporan Audit Layout Mobile Anti-Slop (`antislop-layoutmobile`)

Audit tata letak seluler telah diverifikasi pada resolusi 360px (standar Android / Galaxy) dan 414px (standar iOS Max):

1. **Reflow Tanpa Bingkai Ganda**: Pada viewport ponsel sungguhan (`< 640px`), simulator bingkai ponsel desktop (`max-w-[420px] rounded-[36px]`) otomatis dinonaktifkan. Aplikasi merentang alami 100% mengisi layar ponsel pengguna tanpa batas ganda.
2. **Pembersihan Elemen Palsu**: Notch tiruan dan status bar jam `09:41` tiruan otomatis disembunyikan di ponsel sungguhan (`hidden sm:flex`). Pengguna melihat status bar asli bawaan sistem operasi perangkat mereka sendiri.
3. **Pemberian Ruang Aman (*Safe Area Insets*)**: Bilah navigasi bawah dilengkapi kelas `.pb-safe` (`padding-bottom: max(env(safe-area-inset-bottom), 6px)`) untuk mencegah ikon navigasi tertutup bilah gestur Home di Apple iPhone / Android modern.
4. **Target Sentuh Standar (44×44 px)**: Seluruh tombol navigasi bawah memenuhi standar target sentuh jari minimal `min-w-[56px] min-h-[44px]` dengan umpan balik taktil `active:scale-95`.
5. **Nol Kebocoran Geser Horizontal (*Zero Horizontal Scroll Leak*)**: Pembungkus terluar dilindungi `overflow-x-hidden`, lebar dokumen terverifikasi 100% presisi tanpa geser ke kanan/kiri.

Bukti audit visual tersimpan di: [`docs/screenshots/mobile_responsive_audit.png`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/screenshots/mobile_responsive_audit.png).
