# Tech Stack & ERD: SnipLink MVP

**Proyek:** SnipLink & QR Generator Mobile  
**Versi:** 1.0  
**Tanggal:** 08 September 2026

---

## 1. Arsitektur Tech Stack Optimal

| Komponen | Pilihan Teknologi | Peran & Alasan Teknis |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** (v1.1+) | Eksekusi TypeScript bawaan, instalasi paket 5-10x lebih cepat dibanding npm/yarn. |
| **Frontend Framework** | **React** (v18+) + **Vite** | Ekosistem komponen luas, HMR (Hot Module Replacement / Penggantian Modul Cepat) instan, dukungan PWA (Progressive Web App / Aplikasi Web Progresif). |
| **Bahasa Pemrograman** | **TypeScript** (v5+) | Validasi tipe data ketat (*strict type-safety*), pencegahan bug saat runtime. |
| **Desain & Styling** | **Tailwind CSS** + Desain Token Neo-Pop | Utilitas kelas terstruktur, tanpa gradien, hard shadow 4px, border 2px solid `#131B2E`. |
| **State Management** | **Zustand** | Manajemen state reaktif 1KB tanpa boilerplate, middleware persistensi otomatis. |
| **Penyimpanan Lokal (Local-First)** | **Dexie.js (IndexedDB)** | Basis data luring di peramban/ponsel dengan performa tinggi untuk riwayat dan konfigurasi QR. |
| **Pustaka QR** | `qrcode` + `@zxing/library` | Rendering QR berbasis matriks kanvas/SVG dan pemindaian langsung via kamera perangkat. |
| **Backend & Redirect Engine (Edge)** | **Hono** on **Bun** | Framework HTTP mikro untuk pengalihan slug kilat (<10ms) dan pencatatan event analitik. |
| **Basis Data Server (Opsional Cloud)** | **SQLite / Turso (LibSQL)** via **Drizzle ORM** | Basis data relasional ringan, edge-ready, sinkronisasi data instan. |

---

## 2. ERD (Entity Relationship Diagram / Diagram Hubungan Entitas)

```mermaid
erDiagram
    USERS ||--o{ LINKS : "memiliki"
    LINKS ||--o| UTM_CONFIGS : "memiliki konfigurasi"
    LINKS ||--o| QR_STUDIO_CONFIGS : "memiliki gaya visual"
    LINKS ||--o{ CLICK_EVENTS : "menghasilkan"

    USERS {
        string id PK "UUID / Identifier Unik"
        string device_id "Fingerprint Perangkat Lokal"
        string role "anon / free / creator"
        datetime created_at "Waktu Registrasi"
    }

    LINKS {
        string id PK "UUID Tautan"
        string user_id FK "Relasi ke Pengguna"
        string original_url "URL Panjang Asli"
        string short_slug UK "Alias Tautan Unik"
        string category "Promo / Sosial / Produk / Kontak"
        boolean is_active "Status Aktif Tautan"
        string password_hash "PIN Proteksi (Opsional)"
        datetime expires_at "Waktu Kedaluwarsa"
        boolean is_pinned "Disematkan ke Atas"
        datetime created_at "Waktu Pembuatan"
        datetime updated_at "Waktu Perubahan"
    }

    UTM_CONFIGS {
        string id PK "UUID Konfigurasi UTM"
        string link_id FK "Relasi ke Tautan"
        string utm_source "Sumber (cth: instagram)"
        string utm_medium "Media (cth: bio, story)"
        string utm_campaign "Nama Kampanye"
        string utm_term "Kata Kunci Kampanye"
        string utm_content "Varian Konten"
    }

    QR_STUDIO_CONFIGS {
        string id PK "UUID Konfigurasi QR"
        string link_id FK "Relasi ke Tautan"
        string module_style "chunky / squircle / dot"
        string fg_color "Warna Modul Solid (Hex)"
        string bg_color "Warna Latar Belakang (Hex)"
        string frame_type "scan-me / menu / wifi / none"
        string frame_text "Teks Kustom Frame"
        boolean has_logo "Sematan Ikon Tengah"
        string ec_level "Level L / M / Q / H"
    }

    CLICK_EVENTS {
        string id PK "UUID Event Klik"
        string link_id FK "Relasi ke Tautan"
        datetime clicked_at "Waktu Interaksi"
        string referrer "Kanal Perujuk (WA/IG/Direct)"
        string user_agent "Identitas Peramban"
        string os "Android / iOS / Desktop"
        string country "Negara Pengunjung"
        string city "Kota Pengunjung"
        boolean is_qr_scan "Apakah Berasal dari Scan QR"
    }
```
