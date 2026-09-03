# @mobiljuragan/api — Express + TypeScript REST API

REST API utama MobilJuragan. **Sumber tunggal business logic** (Flutter & Next.js
tidak boleh menduplikasi aturan bisnis).

> Status scaffolding **M3 (repository foundation)** — hanya health check.
> Endpoint bisnis (vehicle, booking, OTP, ticket, admin) menyusul di milestone sesuai `docs/PLANNING_TECH_STACK_DAN_ROADMAP.md`.

## Stack

- Express.js + TypeScript (ESM, NodeNext)
- pino (structured logging)
- zod-ready (validasi disuntikkan bersama endpoint)
- Prisma schema disiapkan (PostgreSQL) — DB **tidak** dijalankan pada scaffolding awal (tanpa Docker/psql lokal)

## Prasyarat

- Node ≥ 20
- pnpm (root workspace monorepo) — install dari root repo (bukan dari sini)

## Menjalankan

Semua perintah dijalankan dari **root repo**:

```bash
# 1) install semua dependency workspace (sekali saja)
pnpm install

# 2) run API (dev, hot-reload)
pnpm --filter @mobiljuragan/api dev

# cek health
curl http://localhost:4000/health
# → {"status":"ok","service":"mobiljuragan-api", ...}
```

## Database & Prisma (status jujur)

Schema Prisma (`prisma/schema.prisma`) mengikuti model data roadmap §3. Mekanisme
memakai **Prisma 7 + `@prisma/adapter-pg`** (keputusan: Prisma 7 modern, lihat
`prisma.config.ts`). Pada scaffolding awal ini DB sudah pernah di-migrate &
client di-generate terhadap **PostgreSQL lokal (FlyEnv di workstation dev)**.

- ✅ `prisma/schema.prisma` = sumber kebenaran awal.
- ✅ `prisma.config.ts` = konfigurasi Prisma 7 (URL di-handle di sini, bukan di schema).
- ✅ Migration stamp `prisma/migrations/20260903153842_init` terapply ke DB
  local flyenv (tabel domain + `_prisma_migrations` terverifikasi via psql).
- ✅ Prisma Client ter-generate ke `src/generated/prisma`.
- ⬜ Seed 9 kendaraan resmi ditambahkan belakangan bersama alur seed (masih
  menggantung ketersediaan dataset resmi & cara label `Data contoh`).

> Catatan keamanan lokal: role DB `mobiljuragan` (dev-local, password dev) dibuat
> dengan `LOGIN ... CREATEDB` supaya `prisma migrate dev` bisa membuat shadow
> database. Ini cukup untuk local dev; jangan dipakai begitu saja untuk produksi.

Menjalankan perintah DB (dari `services/api` atau `pnpm --filter @mobiljuragan/api …`):

```bash
cp .env.example .env        # isi DATABASE_URL ke Postgres lokal/staging
prisma migrate dev          # buat migration baru + apply
prisma generate             # refresh Prisma Client
prisma studio               # jelajah data (opsional)
```
