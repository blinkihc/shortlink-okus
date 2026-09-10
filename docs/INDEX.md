# Indeks Master Dokumentasi Proyek SnipLink (okus.me)

Seluruh dokumentasi teknis, laporan perancangan, panduan implementasi, dan standar operasional proyek diarsipkan secara sistematis pada tabel di bawah ini.

---

## 1. Panduan Operasional & Deployment
| Nama Dokumen | Deskripsi | Tautan Berkas |
| :--- | :--- | :--- |
| **Panduan Handoff Agen** | Rujukan utama arsitektur, pola kode, status task, dan panduan untuk agen selanjutnya. | [`panduan_handoff_agent.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_handoff_agent.md) |
| **Panduan Deployment Easypanel** | Prosedur langkah demi langkah deployment aplikasi ke VPS menggunakan panel Easypanel & Docker. | [`panduan_deployment_easypanel.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_deployment_easypanel.md) |
| **Panduan Backend & Database Terpusat** | Arsitektur REST API Bun, database SQLite persisten, dan volume mount di Easypanel. | [`panduan_backend_dan_database_terpusat.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_backend_dan_database_terpusat.md) |
| **Panduan Pemisahan Lingkungan** | Arsitektur pembagian lingkungan lokal vs produksi, percabangan Git, dan audit tata letak seluler. | [`panduan_pemisahan_lingkungan_dan_vps.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_pemisahan_lingkungan_dan_vps.md) |
| **Panduan Penggunaan & Tutorial** | Panduan interaktif pengguna untuk fitur pemendek URL, analitik, dan QR Studio beserta domain asli `okus.me`. | [`panduan_penggunaan_dan_tutorial.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_penggunaan_dan_tutorial.md) |
| **Panduan Autentikasi & Hak Akses** | Spesifikasi autentikasi multi-pengguna, JWT HttpOnly, otorisasi peran Admin/User, dan aturan tamu 5 hari. | [`panduan_autentikasi_dan_hak_akses.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_autentikasi_dan_hak_akses.md) |
| **Panduan Integrasi NeedMCP** | Prosedur instalasi, konfigurasi mcp_config.json, dan tata cara penggunaan NeedMCP CLI untuk sistem desain. | [`panduan_integrasi_needmcp.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/panduan_integrasi_needmcp.md) |


---

## 2. Spesifikasi, Arsitektur, & Desain
| Nama Dokumen | Deskripsi | Tautan Berkas |
| :--- | :--- | :--- |
| **Product Requirement Document (PRD)** | Spesifikasi kebutuhan fungsional dan non-fungsional aplikasi SnipLink. | [`prd_sniplink.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/prd_sniplink.md) |
| **Tech Stack & ERD** | Rincian tumpukan teknologi, pustaka pihak ketiga, dan skema basis data Dexie IndexedDB. | [`tech_stack_and_erd.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/tech_stack_and_erd.md) |
| **UI/UX Style Guide** | Panduan visual Neo-Pop: palet warna, tipografi, bayangan pekat, dan standar tombol. | [`ui_ux_style_guide.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/ui_ux_style_guide.md) |
| **Konsep Desain & Animasi Viewport** | Spesifikasi tata letak multi-viewport (Desktop, Tablet, Mobile) dan kurva animasi mikro bebas slop. | [`konsep_desain_dan_animasi_viewport.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/konsep_desain_dan_animasi_viewport.md) |
| **Walkthrough Prototype** | Laporan verifikasi prototipe awal interaktif SnipLink. | [`walkthrough_prototype.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/walkthrough_prototype.md) |

---

## 3. Laporan Rekayasa Fitur & Anti-Slop
| Nama Dokumen | Deskripsi | Tautan Berkas |
| :--- | :--- | :--- |
| **Laporan Task 0 - 5** | Riwayat pembangunan fondasi, UI Neo-Pop, QR Studio, dan IndexedDB. | [`laporan_task_0_sampai_5.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_0_sampai_5.md) |
| **Laporan Task 6** | Pembangunan sistem analitik visual 7-hari, pemilah OS/Referrer, dan pelacakan QR. | [`laporan_task_6.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_6.md) |
| **Laporan Task 7, 8, 9** | Implementasi PIN keamanan, fitur Dark Mode, dan modul deteksi PWA otomatis. | [`laporan_task_7_8_9.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_task_7_8_9.md) |
| **Analisis Dark Mode & PWA** | Kajian teknis kompatibilitas PWA seluler dan transisi tema gelap. | [`analisis_fitur_darkmode_pwa.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/analisis_fitur_darkmode_pwa.md) |
| **Audit Anti-Slop Dark Mode** | Identifikasi kelemahan visual, kontras tipis, dan isu elemen menyatu pada tema gelap. | [`audit_antislop_darkmode.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/audit_antislop_darkmode.md) |
| **Konsep Perbaikan Dark Mode** | Konsep pemulihan kontras tinggi dan isolasi warna matriks QR pada latar gelap. | [`konsep_perbaikan_darkmode_antislop.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/konsep_perbaikan_darkmode_antislop.md) |
| **Laporan Refactoring Dark Mode** | Hasil eksekusi refactoring token CSS dan validasi visual bebas slop. | [`laporan_refactoring_darkmode.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_refactoring_darkmode.md) |
| **Laporan Perbaikan Viewport Penuh** | Eliminasi bingkai mockup HP, penghapusan margin vertikal, dan pembersihan komentar antislop. | [`laporan_perbaikan_viewport_full_height.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_perbaikan_viewport_full_height.md) |
| **Laporan Pembersihan Analitik Riil** | Eliminasi metrik dummy, generator fiktif, tombol simulasi, dan penerapan statistik riil murni. | [`laporan_pembersihan_analitik_riil.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_pembersihan_analitik_riil.md) |
| **Materi Iklan & Promosi (Before-After)** | Dokumentasi aset halaman HTML dan gambar JPEG materi promosi produk SnipLink. | [`materi_iklan_dan_promosi.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/materi_iklan_dan_promosi.md) |
| **Laporan Fitur Onboarding (NeedMCP)** | Implementasi tur onboarding 3 fitur berbasis cetak biru struktural onboarding-hero NeedMCP. | [`laporan_fitur_onboarding_needmcp.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_fitur_onboarding_needmcp.md) |
| **Laporan Fitur Profil (NeedMCP)** | Implementasi halaman profil dan dasbor Creator Pass berbasis cetak biru traveler-profile-dashboard NeedMCP. | [`laporan_fitur_profil_needmcp.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_fitur_profil_needmcp.md) |
| **Laporan Perampingan Header** | Rekayasa perampingan bilah navigasi atas (header), pemindahan kontrol sekunder ke profil, dan menu avatar Neo-Pop. | [`laporan_perampingan_header.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_perampingan_header.md) |
| **Laporan Penyesuaian Tampilan Tamu** | Penghapusan banner mode tamu dan penyembunyian opsi kustomisasi serta metrik untuk pengguna anonim. | [`laporan_penyesuaian_tampilan_tamu.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_penyesuaian_tampilan_tamu.md) |
| **Laporan Persistensi Shortlink (Tamu vs Member)** | Analisis dan perbaikan hilangnya shortlink saat reload, persistensi device 5 hari tamu, dan penguncian basis data produksi member. | [`laporan_persistensi_shortlink_member_dan_tamu.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_persistensi_shortlink_member_dan_tamu.md) |
| **Laporan Halaman Pengaturan Admin** | Implementasi Admin Settings: batas simpan tamu (app_settings), kategori (kategori), dan frame aksi CTA (frame_aksi). | [`laporan_admin_settings_page.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/laporan_admin_settings_page.md) |
| **Analisis Google Auth & Solusi** | Investigasi penyebab akun dummy Google Auth, pemetaan aliran data, dan rekomendasi integrasi Google Identity Services. | [`analisis_google_auth_dan_solusi.md`](file:///c:/Users/NB%20-%20MBA/Documents/antigravity/kind-hubble/docs/analisis_google_auth_dan_solusi.md) |



