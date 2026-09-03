# @mobiljuragan/dashboard — Next.js Admin Dashboard

Web dashboard admin/staf MobilJuragan (Next.js 16 + TypeScript + Tailwind CSS 4).

> Status scaffolding **M3 (repository foundation)** — template Next.js standar siap
> jalan. UI dashboard (Overview, sidebar, booking ops, fleet) menyusul di milestone
> M11+ sesuai `docs/PLANNING_TECH_STACK_DAN_ROADMAP.md`. Belum ada business logic.

## Menjalankan

Dari **root repo**:

```bash
pnpm install
pnpm --filter @mobiljuragan/dashboard dev        # http://localhost:3000
```

Script turbo (dari root): `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`.

## Catatan

- Bukan tujuan repository foundation untuk menambah fitur bisnis di sini (tunggu
  keputusan team & milestone masing-masing).
- Design token web diambil dari `docs/design-tokens.json` nanti (M11), bukan
  di-hardcode sekarang.
