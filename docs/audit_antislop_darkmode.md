# Audit Desain Antislop-UI: Evaluasi Mode Gelap (Dark Mode) SnipLink

**Berkas Rujukan Visual:** `docs/screenshots/react_dark_mode_view.png`  
**Standar Evaluasi:** Panduan `antislop-ui` & Aksesibilitas WCAG (Web Content Accessibility Guidelines) AA  
**Status Kode:** Belum Dimodifikasi (Hanya Analisis & Rencana Perbaikan)

---

## 1. Matriks Temuan Cacat Desain (Slop Tells)

| No | Lokasi Komponen | Masalah Visual (Slop Tell) | Standar Aturan `antislop-ui` | Rekomendasi Perbaikan (*Fix*) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Bingkai Ponsel (Status Bar & Header) | Latar belakang status bar dan header tetap putih terang di tengah tema gelap | **R-21** (Inkonsistensi implementasi tema) | Samakan latar belakang header dan status bar ke warna biru tinta gelap (`#0B132B` / `#162238`) |
| **2** | Kartu Pemendek Tautan (`ShortenerCard.tsx`) | Judul "Pemendek Tautan Kilat" dan label teks berwarna hitam pekat di atas latar kartu gelap | **R-25** & **WCAG AA** (Kontras < 1.5:1, teks tak terbaca) | Balik warna teks judul menjadi putih krim (`#F8FAFC`) dan teks pendukung menjadi abu-abu terang (`#94A3B8`) |
| **3** | Bilah Kontrol Luar (*Top Controller Bar*) | Tetap berlatar putih terang dengan kontras terisolasi dari kanvas luar | **R-01** & **R-29** (Pecah hierarki palet) | Adaptasikan bilah kontrol ke latar gelap kartu (`#1C2844`) dengan teks terang |
| **4** | Input & Tombol Salin/UTM | Tombol "+ UTM" dan ikon clipboard berlatar putih terang mencolok | **R-04** & **R-11** (Elemen pulau terang tanpa kesatuan visual) | Berikan latar gelap adaptif (`#1E293B`) dengan border kontras tinggi |
| **5** | Garis Tepi Neo-Pop (*Borders*) | Garis tepi 2px `#131B2E` menyatu dengan latar belakang gelap sehingga batas kartu hilang | **R-01** & Identitas Neo-Pop Purity | Ganti border mode gelap dengan garis tegas kontras (`#334155` atau `#475569`) |
| **6** | Baris Metrik Ringkasan Bawah | Label metrik ("Tautan Aktif", "Total Klik", "Scan QR") redup dan tidak terbaca | **WCAG AA** (Kontras teks kecil minimal 4.5:1) | Berikan warna kontras terang (`#CBD5E1`) pada label kecil di bawah angka |

---

## 2. Rincian Temuan Kritis

### A. Inkonsistensi Kanvas Latar ("Efek Frankenstein")
Pada tangkapan layar, status bar jam (`07:52`), notch kamera, dan header `SnipLink` tetap putih bersih (`#FFFFFF`), sementara kartu di bawahnya beralih ke warna gelap. Hal ini memberikan impresi bug rendering CSS (Cascading Style Sheets) di mana tema hanya terpasang sebagian.

### B. Teks Gelap di Latar Gelap (*Invisible Text*)
Elemen berikut gagal total dalam uji keterbacaan:
1. `<h3>` "Pemendek Tautan Kilat": Warna `#131B2E` di atas `#0F172A`.
2. Paragraf pendukung: "Tempel URL panjang untuk membuat tautan ringkas...": Warna `#475569` di atas `#0F172A`.
3. Label form: "TAUTAN ASLI (URL PANJANG)": Warna `#131B2E` di atas `#0F172A`.
4. Label ringkasan: "Tautan Aktif", "Total Klik", "Scan QR": Warna abu-abu gelap di atas hitam.

### C. Kehilangan Ciri Khas Neo-Pop
Gaya Neo-Pop mengandalkan *chunky black borders* (`2px solid #131B2E`) dan *hard drop shadow*. Saat latar belakang menjadi gelap, garis tepi hitam pekat kehilangan pembeda visual dengan kanvas malam. Perlu dialihkan ke garis tepi abu-abu baja kontras (`#334155`) dan bayangan hitam legam pekat (`#020617`).
