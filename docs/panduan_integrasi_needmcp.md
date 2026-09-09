# Panduan Integrasi & Penggunaan NeedMCP

Dokumen ini memuat panduan lengkap instalasi, konfigurasi, dan tata cara penggunaan **NeedMCP** (*Model Context Protocol* - protokol standar industri penghubung asisten pemrograman kecerdasan buatan dengan komponen antarmuka pengguna siap pakai) pada proyek SnipLink (`okus.me`).

---

## 1. Definisi & Fungsi NeedMCP

**NeedMCP** adalah penyedia server MCP (*Model Context Protocol*) jarak jauh (*remote server*) yang menyediakan katalog komponen UI (*User Interface* / antarmuka pengguna) dan sistem desain (*Design System*) siap pakai langsung ke dalam asisten kecerdasan buatan (*AI coding assistant* seperti Google Antigravity, Cursor, Windsurf, Claude Desktop, dll.).

### Manfaat Utama bagi SnipLink:
- **Akses Komponen Produksi**: Memungkinkan asisten AI mengambil tata letak dan komponen antarmuka modern langsung sesuai standar industri.
- **Konsistensi Gaya Desain**: Memungkinkan penguncian gaya visual tertentu (*style locking*) seperti palet warna, tipografi, dan varian tombol/kartu.
- **Ekspor Desain Cepat**: Mampu mengunduh file panduan desain utuh (`DESIGN.md`) ke dalam direktori kerja proyek hanya dengan satu perintah terminal.

---

## 2. Status Pemasangan pada Proyek

Pustaka CLI (*Command Line Interface* / antarmuka baris perintah) NeedMCP telah terpasang ke dalam dependensi pengembangan (*devDependencies*) proyek SnipLink.

### Rincian Dependensi:
- **Paket**: `needmcp`
- **Versi**: `^1.3.0`
- **Lokasi Konfigurasi Asisten**: `C:\Users\NB - MBA\.gemini\antigravity\mcp_config.json`

### Konfigurasi MCP Server:
Konfigurasi berikut telah ditambahkan ke dalam berkas konfigurasi MCP Google Antigravity:
```json
{
  "mcpServers": {
    "needmcp": {
      "serverUrl": "https://needmcp.com/mcp"
    }
  }
}
```

---

## 3. Cara Penggunaan & Perintah CLI

Seluruh perintah NeedMCP dapat dijalankan langsung di terminal proyek menggunakan pengelola paket `bunx` (atau `npx`).

### A. Mendapatkan Kunci API (Opsional / Rekomendasi)
1. Buka situs resmi NeedMCP: [needmcp.com](https://needmcp.com)
2. Masuk / daftar akun gratis.
3. Masuk ke menu **API Keys** pada dasbor.
4. Buat kunci baru (berformat `sk-need-xxxxxxxxxxxx`).
> *Catatan*: NeedMCP juga menyediakan **Guest Mode** gratis tanpa kunci API dengan batas penggunaan hingga 20 permintaan.

### B. Menjalankan Konfigurasi Awal (*Setup*)
Jalankan salah satu perintah berikut:

```bash
# Menjalankan wizard interaktif
bunx needmcp setup
```

Atau masukkan kunci API langsung tanpa melalui dialog interaktif:
```bash
bunx needmcp setup --key sk-need-xxxxxxxxxxxx
```

### C. Mengunci Gaya Desain (*Set Style*)
Untuk mengaktifkan gaya visual tertentu pada sesi pengerjaan AI:
```bash
bunx needmcp style set <nama-slug-style>
```
*Contoh:*
```bash
bunx needmcp style set modern-dashboard
```

### D. Mengunduh Sistem Desain ke Proyek (`DESIGN.md`)
Untuk mengekstrak spesifikasi sistem desain lengkap menjadi berkas `DESIGN.md` di direktori proyek:
```bash
bunx needmcp design <nama-slug-style>
```

Jika berkas `DESIGN.md` sudah ada dan ingin langsung ditimpa (*overwrite*):
```bash
bunx needmcp design <nama-slug-style> --force
```

### E. Menghapus Server NeedMCP dari Konfigurasi
Jika di kemudian hari server NeedMCP ingin dilepas dari konfigurasi klien:
```bash
bunx needmcp remove
```

---

## 4. Ringkasan Perintah Penting

| Perintah | Fungsi | Keterangan |
| :--- | :--- | :--- |
| `bunx needmcp setup` | Konfigurasi server MCP | Pilihan klien AI & input API Key / Guest Mode |
| `bunx needmcp setup --key <sk>` | Konfigurasi cepat | Melewati dialog prompt terminal |
| `bunx needmcp style set <slug>` | Kunci tema desain | Menetapkan konteks tema aktif pada sesi AI |
| `bunx needmcp design <slug>` | Ekspor `DESIGN.md` | Mengunduh panduan desain markdown ke repositori |
| `bunx needmcp remove` | Lepas konfigurasi | Menghapus entri NeedMCP dari config klien |
