# =========================================================
# Tahap 1: Kompilasi Sumber Daya Frontend (Builder Stage)
# =========================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Salin manifes dependensi
COPY package.json bun.lock ./

# Instal seluruh dependensi
RUN bun install

# Salin seluruh kode sumber
COPY . .

# Konfigurasi argumen build domain produksi
ARG VITE_APP_DOMAIN=okus.me
ARG VITE_APP_ENV=production

ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN
ENV VITE_APP_ENV=$VITE_APP_ENV

# Kompilasi antarmuka frontend SPA
RUN bun run build

# =========================================================
# Tahap 2: Peladen Terpadu Fullstack (Production Runner)
# =========================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Salin dependensi
COPY package.json bun.lock ./
RUN bun install --production

# Salin kode peladen, definisi tipe, dan artefak frontend dist
COPY server/ ./server/
COPY src/types/ ./src/types/
COPY --from=builder /app/dist ./dist

# Siapkan direktori penyimpanan SQLite persisten
RUN mkdir -p /app/data && chown -R bun:bun /app

# Konfigurasi variabel lingkungan produksi
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/app/data/sniplink.db

# Jalankan dengan pengguna non-root
USER bun

# Ekspos port peladen HTTP terpadu
EXPOSE 8080

# Jalankan peladen backend terpusat
CMD ["bun", "server/index.ts"]

