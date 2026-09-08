# Konsep Desain Multi-Viewport & Panduan Animasi Mikro Bebas AI Slop

Dokumen perancangan tata letak (*layout*) multi-viewport dan arsitektur animasi mikro antarmuka SnipLink (`okus.me`) untuk memastikan pengalaman pengguna yang autentik, elegan, dan terbebas dari skeuomorfisme ponsel palsu (*fake device chrome*).

---

## 1. Latar Belakang Perubahan

Pada tahap prototipe awal, antarmuka SnipLink menyertakan bilah kontrol pengembang (*debug toolbar*) di bagian atas serta simulator bingkai ponsel berupa poni kamera (*notch*), jam tiruan `10:14`, dan indikator sinyal `5G 100%`.

Elemen-elemen ini dihapus secara total untuk produksi karena:
1. **Redundansi Visual**: Perangkat ponsel fisik pengguna sudah memiliki status bar dan kamera fisik sendiri. Menggambar ulang notch di dalam aplikasi web menciptakan ilusi canggung (*fake frame inside real frame*).
2. **Kerapian Antarmuka Desktop**: Pada monitor PC atau laptop, aplikasi web mobile modern (seperti Instagram Web, Threads, Telegram Web) tampil sebagai kontainer kartu aplikasi terpusat yang ramping dan bersih, bukan gambar ponsel dengan speaker tiruan.

---

## 2. Spesifikasi Matriks Multi-Viewport

| Parameter | Mode Desktop (PC / Laptop) | Mode Tablet (iPad / Android Tablet) | Mode Ponsel (Mobile Native) |
| :--- | :--- | :--- | :--- |
| **Lebar Layar (*Screen Width*)** | `>= 1024px` | `640px` hingga `1023px` | `< 640px` |
| **Lebar Kontainer Aplikasi** | Terpusat, maksimal `480px` (`max-w-[480px]`). | Terpusat, proporsional `620px` (`max-w-[620px]`). | *Edge-to-edge* penuh 100% (`w-full`). |
| **Tinggi Kontainer** | `h-[90vh] max-h-[880px]` dengan pengguliran (*scrolling*) internal halus. | `min-h-[85vh]` fleksibel. | `min-h-[100dvh]` dinamis mengikuti tinggi layar fisik. |
| **Bingkai / Sudut (*Border & Radius*)** | Sudut melengkung elegan `rounded-2xl`, border Neo-Pop kontras tinggi, bayangan elevasi `shadow-neo-deep`. | Sudut melengkung `rounded-xl`, border rapi. | `rounded-none`, border tepi dinonaktifkan agar menyatu dengan layar fisik. |
| **Bilah Status (*Status Bar*)** | Tidak ada notch / jam tiruan. Konten langsung dimulai dari Header Aplikasi. | Tidak ada notch tiruan. | Menghormati *Safe Area Insets* bawaan sistem operasi ponsel (`pt-safe`, `pb-safe`). |

---

## 3. Spesifikasi Animasi Mikro Terarah (`frontend-ui-animator`)

Sesuai aturan panduan *anti-slop*, animasi harus memiliki tujuan interaksi yang jelas, tidak berlebihan, dan tidak memicu pergeseran tata letak (*zero Cumulative Layout Shift*):

### A. Transisi Pergantian Tab Antarmuka
- **Pemicu**: Pengguna mengeklik ikon tab di navigasi bawah (Home, Links, QR Studio, Analytics).
- **Efek**: `fade-slide-up` berdurasi 180ms - 200ms.
- **Implementasi CSS**:
```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-slide-up {
  animation: fadeSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### B. Umpan Balik Taktil Tombol (*Button Tactile Press*)
- **Pemicu**: Status `:active` saat tombol disentuh atau diklik.
- **Efek**: Penekanan mikro `scale(0.97)` dengan durasi balik 100ms.
- **Kelebihan**: Memberikan kepastian sentuhan bagi pengguna jari ponsel tanpa mengubah tata letak elemen lain.

### C. Animasi Pertumbuhan Batang Diagram (*Chart Bar Grow*)
- **Pemicu**: Pemuatan awal tab analitik.
- **Efek**: Batang grafik tumbuh dari bawah ke atas (`transform-origin: bottom`) dari `scaleY(0)` ke `scaleY(1)` dengan durasi 300ms berurutan (*staggered delay*).

### D. Rotasi Ikon Ganti Tema (*Theme Toggle Rotation*)
- **Pemicu**: Pergantian tema gelap/terang.
- **Efek**: Rotasi halus ikon Matahari/Bulan sejauh 45° disertai transisi warna lembut.

### E. Kepatuhan Aksesibilitas (`prefers-reduced-motion`)
- Bagi pengguna dengan sensitivitas gerak, seluruh animasi wajib otomatis dinonaktifkan:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
