# =========================================================
# Tahap 1: Kompilasi Sumber Daya (Builder Stage)
# =========================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Salin manifes dependensi
COPY package.json bun.lock ./

# Instal dependensi proyek
RUN bun install

# Salin seluruh berkas proyek
COPY . .

# Argument build untuk konfigurasi domain produksi
ARG VITE_APP_DOMAIN=okus.me
ARG VITE_APP_ENV=production

ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN
ENV VITE_APP_ENV=$VITE_APP_ENV

# Kompilasi aplikasi (menghasilkan folder dist)
RUN bun run build

# =========================================================
# Tahap 2: Penyajian Berkas Statis (Production Web Server)
# =========================================================
FROM nginx:alpine AS runner

# Salin konfigurasi Nginx kustom untuk SPA fallback & cache
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin artefak hasil kompilasi dari builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ekspos port standar HTTP 80
EXPOSE 80

# Jalankan Nginx sebagai proses utama
CMD ["nginx", "-g", "daemon off;"]
