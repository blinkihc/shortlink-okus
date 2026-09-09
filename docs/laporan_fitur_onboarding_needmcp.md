# Laporan Rekayasa Fitur Onboarding (NeedMCP `onboarding-hero`)

Dokumen ini mencatat rekayasa implementasi fitur **Onboarding** berbasis cetak biru struktural (*structural wireframe blueprint*) **`onboarding-hero`** dari server NeedMCP (*Model Context Protocol* - protokol standar integrasi AI), yang diadaptasikan secara presisi ke dalam sistem desain Neo-Pop dan aturan anti-slop pada aplikasi SnipLink (`okus.me`).

---

## 1. Latar Belakang & Kebutuhan Pengguna

Sebelum masuk ke antarmuka utama (*Home*), pengguna baru memerlukan panduan cepat (*onboarding tour*) untuk memahami proposisi nilai dan fitur utama aplikasi SnipLink dalam 3 langkah ringkas.

### Kebutuhan Kunci:
1. Menampilkan 3 fitur utama SnipLink secara bergantian.
2. Mengikuti arsitektur wireframe `onboarding-hero` resmi NeedMCP.
3. Menyelaraskan seluruh elemen visual dengan identitas Neo-Pop (border tegas 2-3px, *hard neo-shadow*, warna kontras tinggi, dan responsif terhadap *Dark Mode*).
4. Menyediakan kemampuan lewati (*skip*), navigasi bebas titik (*interactive dots*), serta tombol akses ulang di bilah atas (*header*).
5. Persistensi status kunjungan menggunakan `localStorage` peramban.

---

## 2. Struktur Blueprint NeedMCP yang Diadaptasi

| Komponen Blueprint NeedMCP | Implementasi SnipLink | Keterangan Gaya & Interaksi |
| :--- | :--- | :--- |
| **`status-bar` / Top Bar** | Brand SnipLink & tombol *"Lewati"* | Memungkinkan pengguna berpengalaman langsung menuju beranda. |
| **`hero-image-area`** | Lingkaran grafis sentral + lencana mengambang (*floating overlay*) | Ikon fitur utama dengan palet warna cerah, border hitam 3px, dan bayangan neo. |
| **`content-area`** | Lencana tag nomor, judul tebal, deskripsi, dan pil keunggulan | Menggunakan tipografi tegas, lencana ceklis, dan kontras tinggi. |
| **`slider-dots`** | 3 kapsul indikator langkah | Menampilkan langkah aktif (kapsul memanjang) dan interaktif saat diklik. |
| **`bottom-bar`** | Tombol navigasi *"Kembali"* dan *"Lanjut"* / *"Mulai"* | Transisi halus antar slide (01 &rarr; 02 &rarr; 03) hingga tombol aksi akhir. |

---

## 3. Rincian 3 Fitur yang Disajikan

### Fitur 01: Pemendek Tautan & PIN Keamanan
- **Tag**: `FITUR 01 / 03`
- **Judul**: *Pendekkan Tautan dengan okus.me*
- **Penjelasan**: Mengubah tautan panjang menjadi pendek, rapi, mudah dibagikan, serta opsi proteksi kode sandi PIN 4-digit.
- **Lencana**: `Domain okus.me`, `Kustom Alias Unik`, `Proteksi Sandi PIN`.

### Fitur 02: QR Studio Kustom Siap Cetak & Unduh
- **Tag**: `FITUR 02 / 03`
- **Judul**: *QR Code Studio Kustom Siap Cetak*
- **Penjelasan**: Membuat kode QR interaktif instan, kustomisasi palet warna matriks, bingkai label teks, dan unduh format PNG/SVG beresolusi tinggi.
- **Lencana**: `Ekspor PNG & SVG`, `Kustom Warna & Frame`, `Preset Siap Cetak`.

### Fitur 03: Analitik Riil & Pelacakan Akurat
- **Tag**: `FITUR 03 / 03`
- **Judul**: *Analitik Riil & Pelacakan Akurat*
- **Penjelasan**: Pemantauan metrik performa murni tanpa bot atau generator palsu, mencakup grafik klik 7 hari, pemindai QR, sistem operasi (*Operating System*), dan rujukan web (*Referrer*).
- **Lencana**: `Grafik Klik 7 Hari`, `Pemilah OS & Device`, `Statistik Murni Riil`.

---

## 4. Mekanisme Penyimpanan & Kontrol Antarmuka

```typescript
// Pemeriksaan status onboarding saat aplikasi pertama kali dimuat
const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
  try {
    return localStorage.getItem('sniplink_onboarded') !== 'true';
  } catch {
    return false;
  }
});

// Penutupan onboarding dan persistensi status
const handleFinishOnboarding = () => {
  try {
    localStorage.setItem('sniplink_onboarded', 'true');
  } catch {}
  setShowOnboarding(false);
};
```

Pengguna yang sudah menyelesaikan tur dapat sewaktu-waktu membuka kembali layar panduan dengan menekan tombol **Panduan Fitur (`HelpCircle`)** pada bilah navigasi atas (*header*).

---

## 5. Hasil Verifikasi & Pengujian

- **Unit Test**: `bun test` &rarr; 60 test lulus (100% pass) pada 13 berkas pengujian.
- **Linting**: `oxlint` &rarr; 0 error.
- **Build Produksi**: `bun run build` &rarr; Berhasil dikompilasi ke direktori `dist/` dalam waktu 5.26 detik.
