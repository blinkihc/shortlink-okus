# Tasks: Multi-Viewport Refactor & Micro-Animations (SnipLink)

## Relevant Files

- `src/App.tsx` - Komponen utama antarmuka, router tab, dan kontainer multi-viewport
- `src/App.test.tsx` - Pengujian unit komponen App dan verifikasi struktur DOM
- `src/index.css` - Desain token Neo-Pop, utilitas Tailwind, safe-area insets, dan keyframes animasi mikro
- `src/components/analytics/AnalyticsView.tsx` - Tampilan analitik dan diagram batang dengan animasi tumbuh
- `src/components/common/InstallPromptModal.tsx` - Komponen modal instalasi PWA
- `docs/konsep_desain_dan_animasi_viewport.md` - Spesifikasi teknis desain multi-viewport dan kurva animasi

### Notes

- Seluruh pengujian dijalankan dengan `bun test`.
- Wajib mematuhi standar aksesibilitas `@media (prefers-reduced-motion: reduce)`.
- Dilarang menambahkan notch, kamera tiruan, jam tiruan, atau bingkai ponsel fisik ke dalam aplikasi.

---

## Instructions for Completing Tasks

**PENTING:** Setiap kali menyelesaikan tugas, ubah tanda `- [ ]` menjadi `- [x]`. Perbarui berkas setelah menyelesaikan setiap sub-tugas.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Buat dan beralih ke cabang baru `feature/viewport-refactor-and-animations` dari cabang `develop` (`git checkout -b feature/viewport-refactor-and-animations develop`)

- [x] 1.0 Clean up prototype debug bar & fake phone skeuomorphism
  - [x] 1.1 Hapus bilah *debug* atas (`REACT 19`, `Mode HP`, `Reset`, dll.) dari `src/App.tsx`
  - [x] 1.2 Hapus status bar tiruan ponsel (*notch*, kamera tiruan, jam `10:14`, `5G 100%`) dari `src/App.tsx`
  - [x] 1.3 Bersihkan *state* usang (`currentTime`, `isFullMode`) dan *timer interval* yang tidak lagi diperlukan

- [x] 2.0 Implement true multi-viewport responsive container (Desktop, Tablet, Mobile)
  - [x] 2.1 Rancang kontainer desktop terpusat (`max-w-[480px]`, `min-h-[840px]`, `max-h-[92vh]`, `rounded-2xl`, elevasi bayangan) dengan latar belakang ambien
  - [x] 2.2 Terapkan adaptasi proporsional untuk tablet (`sm:max-w-[620px]`)
  - [x] 2.3 Terapkan mode *edge-to-edge* murni untuk ponsel (`< 640px`: `w-full`, `min-h-[100dvh]`, `rounded-none`, `border-0`, `pb-safe`)

- [x] 3.0 Integrate unified header bar with essential controls
  - [x] 3.1 Integrasikan identitas SnipLink, lencana status *LIVE*, dan pemilih tema gelap/terang langsung di *Header* resmi
  - [x] 3.2 Pasang tombol instalasi PWA (*Progressive Web Application*) yang bersih dan elegan di *Header*
  - [x] 3.3 Tambahkan tombol reset data yang aman dengan dialog konfirmasi

- [x] 4.0 Add purposeful micro-animations & motion design
  - [x] 4.1 Tambahkan keyframes `@keyframes fadeSlideUp`, `@keyframes barGrow`, dan kelas utilitas animasi di `src/index.css`
  - [x] 4.2 Tambahkan umpan balik taktil `active:scale-[0.97]` pada tombol aksi dan bilah navigasi bawah
  - [x] 4.3 Tambahkan pembungkus transisi tab `animate-fade-slide-up` untuk perpindahan tampilan yang halus
  - [x] 4.4 Terapkan animasi pertumbuhan batang diagram di `src/components/analytics/AnalyticsView.tsx`
  - [x] 4.5 Pastikan aturan `@media (prefers-reduced-motion: reduce)` menonaktifkan seluruh animasi secara universal

- [x] 5.0 Responsive layout verification & visual QA
  - [x] 5.1 Jalankan *dev server* dan verifikasi tampilan Desktop (>= 1024px)
  - [x] 5.2 Verifikasi tampilan Tablet (768px)
  - [x] 5.3 Verifikasi tampilan Ponsel (360px & 414px) memastikan target sentuh >= 44px dan nol kebocoran geser horizontal

- [x] 6.0 Run test suite & update documentation
  - [x] 6.1 Jalankan `bun test` dan perbarui pengujian di `src/App.test.tsx` agar selaras dengan struktur DOM baru
  - [x] 6.2 Jalankan `bun run build` untuk memverifikasi kompilasi bundel produksi bebas kesalahan
  - [x] 6.3 Perbarui catatan dokumen dan tandai seluruh sub-tugas yang telah terselesaikan
