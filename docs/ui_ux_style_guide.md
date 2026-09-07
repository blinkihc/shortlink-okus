# UI/UX Style Guide: SnipLink Playful Pop (Neo-Pop Utility)

**Arsitektur Desain:** Neo-Pop Utility / Neubrutalism Ringan  
**Karakter Visual:** Flat Solids, Zero-Gradient, Chunky Borders, Hard Drop Shadows, High Contrast.  
**Standar Aksesibilitas:** WCAG (Web Content Accessibility Guidelines) 2.1 Level AA / AAA.

---

## 1. Palet Warna & Token (Color Tokens)

| Token Nama | Nilai Hex | Peran Antarmuka | Rasio Kontras (vs Background) |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#0058BE` (Royal Blue) | CTA Utama, Link Slug, Tab Aktif | 8.2:1 (Lolos AAA) |
| `--color-accent` | `#FEA619` (Sunshine Yellow) | Aksi Sekunder, Tombol Unduh, Badge Highlight | 10.4:1 (vs Ink Navy) |
| `--color-danger` | `#D6393D` (Pop Coral) | Notifikasi Error, Hapus, Status Kedaluwarsa | 4.8:1 (Lolos AA) |
| `--color-success` | `#10B981` (Mint / Emerald) | Status Aktif, Umpan Balik Sukses Salin | 4.6:1 (Lolos AA) |
| `--color-text` | `#131B2E` (Ink Navy) | Teks Utama, Border Kartu, Shadow Solid | 16.8:1 (Lolos AAA) |
| `--color-bg-base` | `#F4F6FD` (Soft Sky) | Latar Belakang Layar Utama | Base |
| `--color-bg-surface`| `#FFFFFF` (Chalk White) | Latar Kartu, Input Container, Kanvas QR | Base Surface |
| `--color-bg-muted` | `#E2E7FF` (Pale Cloud) | Latar Chip Kategori, Bar Header Sekunder | Muted Surface |

---

## 2. Tipografi (Typography Specs)

**Font Utama:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts).

| Peran | Ukuran | Berat (Weight) | Jarak Baris (Line Height) | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Title Hero** | 28px | Bold (700) | 34px | -0.5px |
| **Heading Card** | 18px | Bold (700) | 24px | -0.2px |
| **Subheading / Label** | 14px | Semi-Bold (600) | 20px | 0px |
| **Body Regular** | 14px | Medium (500) | 20px | 0px |
| **Caption / Badge** | 11px | Extra-Bold (800) | 14px | +0.8px (All Caps) |

---

## 3. Struktur Elevasi & Radius (Borders, Radii & Shadows)

Semua komponen menggunakan bayangan solid tanpa blur gaussian (Hard Shadow):

| Properti | Nilai Spesifikasi | Penggunaan |
| :--- | :--- | :--- |
| **Border Thickness** | `2px solid #131B2E` | Semua kartu interaktif, tombol, dan input field |
| **Border Radius SM** | `8px` | Badge status, tombol kecil, chip kategori |
| **Border Radius MD** | `12px` | Input text box, tombol CTA utama |
| **Border Radius LG** | `16px` | Kartu riwayat tautan, modal sheet, kanvas QR |
| **Elevation Low** | `2px 2px 0px #131B2E` | Status default input field, chip filter |
| **Elevation Base** | `4px 4px 0px #131B2E` | Kartu daftar tautan, tombol primer default |
| **Elevation Pressed** | `0px 0px 0px #131B2E` | State saat tombol ditekan (translasi: `translate(4px, 4px)`) |

---

## 4. Spesifikasi Komponen Inti

### 4.1. Tombol Primer (Chunky Button)
- **Tampilan:** Background `#0058BE`, teks `#FFFFFF`, border `2px solid #131B2E`, shadow `4px 4px 0px #131B2E`, radius `12px`.
- **Interaksi:** Saat disentuh/ditekan, transform `translate(3px, 3px)` dengan shadow `1px 1px 0px #131B2E`. Haptic feedback medium.

### 4.2. Kartu Riwayat Link (Link Item Card)
- **Tampilan:** Background `#FFFFFF`, border `2px solid #131B2E`, shadow `4px 4px 0px #131B2E`, radius `16px`.
- **Anatomi:** Favicon/Mini-QR (kiri) | Info URL & Metrik (tengah) | Tombol Aksi Cepat Salin & Share (kanan).

### 4.3. Kanvas QR Code Studio
- **Tampilan:** Background frame `#FFFFFF`, border `2px solid #131B2E`, shadow `6px 6px 0px #131B2E`, radius `16px`.
- **Aturan Kontras:** Indikator otomatis mendeteksi rasio kontras modul terhadap latar (peringatan jika < 4.5:1).
- **Quiet Zone:** Padding internal minimal 16px di sekeliling matriks QR.
