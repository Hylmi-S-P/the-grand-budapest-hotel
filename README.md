# MobilJuragan MVP

Prototype rental mobil untuk CV. Mobil Juragan Express Transport di Merauke, Papua Selatan.
Full product planning & roadmap: `docs/PLANNING_TECH_STACK_DAN_ROADMAP.md` (baca dulu).

> **Status environment:** monorepo (pnpm + Turborepo) telah di-scaffold dan
> terbukti dapat di-build di lokal. Masih tahap diskusi kelompok — belum ada
> business logic/fitur. Semua keputusan besar tetap menunggu kesepakatan team
> (lihat bagian "Keputusan terbuka" di dokumen roadmap).

## Struktur monorepo

```text
apps/
├── mobile/        Flutter customer app  (apps/mobile, project `mobiljuragan_mobile`)
└── dashboard/     Next.js 16 + TS + Tailwind  (@mobiljuragan/dashboard)
services/
└── api/           Express + TS REST API, Prisma 7  (@mobiljuragan/api)
packages/          (belum dibuat — ditunda sampai format contract disepakati)
docs/              Figma, IA, planning, logbook, design tokens
```

`pnpm-workspace.yaml` mencakup `apps/*` `services/*` `packages/*`; `apps/mobile`
bukan npm package jadi otomatis dilewati pnpm. Artifak build & `.env` di-ignore.

## Prasyarat

- Node.js ≥ 20 (dev memakai v26 — cocok),
- `pnpm` (v11 dipakai; approval build scripts paket dicatat di `pnpm-workspace.yaml`).
- Flutter/Dart (dev: Flutter 3.44) untuk `apps/mobile`.

## Menjalankan

Semua dari root repo:

```bash
pnpm install            # install semua workspace (sekali saja)

# API (health-check; DB-optional untuk health)
pnpm --filter @mobiljuragan/api dev          # http://localhost:4000/health

# Admin dashboard
pnpm --filter @mobiljuragan/dashboard dev    # http://localhost:3000

# Mobile (Flutter) — masuk ke apps/mobile lalu:
cd apps/mobile && flutter run                 # target: android/ios/web (DevTools.dll nanti pilih device)
```

Perintah turbo lintas-package:

```bash
pnpm build        # api (tsc) + dashboard (next build)
pnpm typecheck    # typecheck api & dashboard
pnpm lint
pnpm dev          # keduanya sekaligus (konkuren)
```

## Database & Prisma (status jujur)

- Provider: **PostgreSQL 18 lokal (FlyEnv)** di workstation dev — role & DB
  `mobiljuragan` dibuat untuk Prisma.
- Prisma **7** dengan `@prisma/adapter-pg`; connection ditangani di
  `services/api/prisma.config.ts`, bukan di schema (`datasource.url` dihapus Prisma 7).
- Migration `20260903153842_init` **sudah diterapkan** (8 tabel domain) — lihat
  `services/api/README.md` untuk detail & cara reproduce di mesin lain.
- Detail endpoint business menyusul milestone M5+; **belum ada** endpoint selain `/health`.

## Developer flow (agar aman & tidak menipu "done")

- Secret hanya di `.env` lokal (`.env` ter-ignore; `.env.example` di-commit tanpa nilai nyata).
- Setiap milestone ditandai `done` **hanya setelah ada evidence** — lihat
  `docs/LOGBOOK_AI_ASSISTED_TEMPLATE.md` & delivery gate di roadmap §8.
- Lihat pembagian kerja: `docs/TEAM_WORK_ALLOCATION.md`.

## Dokumentasi pendukung

- `docs/PLANNING_TECH_STACK_DAN_ROADMAP.md` — keputusan stack, data, API, roadmap.
- `docs/MANIFEST.json` & `docs/design-tokens.json` — artefak referensi awal.
- `docs/TEAM_POLICY_AI-ASSISTED_DEVELOPMENT.md` — aturan kontribusi AI.
