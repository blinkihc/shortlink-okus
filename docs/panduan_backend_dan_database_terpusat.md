# Panduan Teknis Backend API Terpusat & Basis Data (Easypanel VPS)

Dokumen teknis resmi mengenai arsitektur peladen backend terpusat, skema basis data SQLite persisten, spesifikasi antarmuka pemrograman aplikasi (REST API), mesin pengalihan publik (*HTTP 302 Redirection Engine*), dan prosedur penerapan di panel VPS **Easypanel**.

---

## 1. Arsitektur Peladen Terpadu (Unified Fullstack Runner)

Aplikasi SnipLink telah beralih dari aplikasi sisi-klien murni (*client-isolated SPA*) menjadi sistem terpadu (*unified production service*):

```text
[ Pengguna Publik: https://okus.me/:slug ]
                   │
                   ▼
       ┌────────────────────────┐
       │   Traefik / Easypanel  │  (Port 443 / SSL Otomatis)
       └───────────┬────────────┘
                   │ Proxy internal ke Port 8080
                   ▼
       ┌────────────────────────┐
       │  Bun + Hono Container  │  (Port 8080)
       ├────────────────────────┤
       │ 1. Engine Redirect 302 │ ──> Mengalihkan publik & merekam analitik
       │ 2. REST API /api/*     │ ──> CRUD tautan & analitik
       │ 3. Static Files dist/  │ ──> Menyajikan antarmuka web SPA
       └───────────┬────────────┘
                   │ Baca / Tulis Persisten
                   ▼
       ┌────────────────────────┐
       │ Volume Mount Easypanel │  (/app/data/sniplink.db)
       └────────────────────────┘
```

---

## 2. Skema Basis Data SQLite

Berkas basis data disimpan di `/app/data/sniplink.db` menggunakan mode **WAL (Write-Ahead Logging)** untuk kecepatan dan keandalan tinggi.

### A. Tabel `links`
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Pengenal unik tautan |
| `original_url` | `TEXT NOT NULL` | URL panjang tujuan |
| `short_slug` | `TEXT UNIQUE NOT NULL` | Slug unik pemendek |
| `category` | `TEXT NOT NULL` | Kategori (Promo, Sosial Media, Produk, Kontak) |
| `pin_code` | `TEXT` | 4 digit PIN keamanan (opsional) |
| `is_active` | `INTEGER DEFAULT 1` | Status keaktifan (1 = aktif, 0 = nonaktif) |
| `is_pinned` | `INTEGER DEFAULT 0` | Status sematan (1 = tersemat di atas) |
| `clicks` | `INTEGER DEFAULT 0` | Total klik yang tercatat |
| `scans` | `INTEGER DEFAULT 0` | Total pemindaian QR yang tercatat |
| `qr_config` | `TEXT` | Konfigurasi visual QR Studio (JSON string) |
| `created_at` | `TEXT NOT NULL` | Waktu pembuatan format ISO |
| `updated_at` | `TEXT NOT NULL` | Waktu pembaruan format ISO |

### B. Tabel `analytics_events`
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Pengenal unik log |
| `link_id` | `TEXT NOT NULL` | Relasi ke tabel `links(id)` |
| `event_type` | `TEXT NOT NULL` | Jenis event: `'click'` atau `'qr_scan'` |
| `timestamp` | `TEXT NOT NULL` | Waktu event format ISO |
| `referrer` | `TEXT NOT NULL` | Saluran perujuk (WhatsApp, Instagram, TikTok, dll) |
| `os` | `TEXT NOT NULL` | Sistem operasi pengunjung (Android, iOS, Desktop) |
| `ip_hash` | `TEXT` | Anonimisasi pengenal IP |

---

## 3. Spesifikasi REST API

| Rute | Metode | Deskripsi | Respons Sukses |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Cek status kesehatan kontainer | `{"status":"ok","domain":"okus.me"}` |
| `/api/links` | `GET` | Mengambil seluruh daftar tautan | `{"success":true,"data":[...]}` |
| `/api/links` | `POST` | Membuat tautan baru | `{"success":true,"data":{...}}` (201) |
| `/api/links/:id` | `DELETE` | Menghapus tautan | `{"success":true,"message":"..."}` |
| `/api/links/:id/pin`| `PATCH` | Toggle status sematan tautan | `{"success":true,"data":{...}}` |
| `/api/analytics` | `GET` | Mengambil ringkasan metrik global | `{"success":true,"data":{...}}` |
| `/:slug` | `GET` | Pengalihan publik 302 ke URL tujuan | `HTTP 302 Found` + Header `Location` |
| `/qr/:slug` | `GET` | Pengalihan publik scan QR 302 | `HTTP 302 Found` + Header `Location` |
| `/:slug/verify` | `POST` | Verifikasi PIN untuk tautan terproteksi | `HTTP 302 Found` jika PIN benar |

---

## 4. Konfigurasi Deployment di Easypanel

Untuk menerapkan ke VPS via Easypanel:

1. **Buat / Buka Layanan Aplikasi di Easypanel**:
   * Nama Layanan: `sniplink`
   * Sumber Kode (*Source*): GitHub `blinkihc/shortlink-okus` (branch `main`).
2. **Pengaturan Build (*Build Tab*)**:
   * Metode Build: **Dockerfile**
   * File: `./Dockerfile`
   * *Catatan: Kolom port tidak berada di tab ini saat menggunakan metode Dockerfile.*
3. **Pengaturan Penyimpanan Persisten (*Volumes Tab*)**:
   * Klik **"+ Mount"** / **"Add Volume"**
   * **Host Path** (atau Volume Name): `sniplink_data`
   * **Mount Path**: `/app/data`
   * *Penting*: Pengaturan ini menjamin basis data SQLite tidak hilang saat aplikasi diperbarui atau direstart.
4. **Variabel Lingkungan (*Environment Tab*)**:
   ```env
   VITE_APP_DOMAIN=okus.me
   VITE_APP_ENV=production
   PORT=8080
   DATABASE_PATH=/app/data/sniplink-production.db
   ```
5. **Domain & Port Routing (*Domains Tab*)**:
   * Klik **"+ Add Domain"**
   * **Domain**: `okus.me`
   * **Path**: `/`
   * **Port**: **`8080`** *(Traefik akan meneruskan traffic domain okus.me ke port 8080 kontainer)*
