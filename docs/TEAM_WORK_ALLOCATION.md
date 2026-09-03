# Pembagian Kerja Team MobilJuragan

> Struktur awal untuk team berisi empat orang. Ganti `PIC A`, `PIC B`, `PIC C`, dan `PIC D` dengan nama atau inisial anggota setelah team menyepakatinya.
>
> Pembagian ini memisahkan tiga area implementasi utama dan satu area integrasi/quality gate. Semua anggota tetap wajib memahami alur produk dan dapat membantu saat ada dependency.

---

## 1. Pembagian role

| Role | Fokus utama | Stack / artefak utama | Output utama |
|---|---|---|---|
| PIC A - Mobile Engineer | Customer Mobile App | Flutter, Dart, Riverpod, go_router, Dio | Screen dan flow pelanggan |
| PIC B - Web Engineer | Admin Dashboard | Next.js, TypeScript, Tailwind CSS, TanStack Query | Screen dan flow admin |
| PIC C - Backend Engineer | API dan database | Express.js, TypeScript, Prisma, PostgreSQL | REST API, schema, migration, auth |
| PIC D - Integration, Design QA, dan Release | Integrasi, visual fidelity, testing, dokumentasi | OpenAPI review, design tokens, test, logbook | Evidence, review, release checklist |

### Kenapa pembagian ini dipilih

- Flutter dan Next.js membutuhkan keahlian serta tooling yang berbeda, jadi keduanya punya PIC khusus.
- Express dan PostgreSQL menjadi dependency bersama, sehingga backend perlu satu owner yang jelas.
- Integrasi dan review tidak boleh menjadi pekerjaan yang tidak punya pemilik. PIC D menjadi reviewer, tetapi tetap mengambil pekerjaan teknis yang jelas agar bebannya tidak hanya berupa administrasi.

---

## 2. Tanggung jawab tiap PIC

### PIC A - Mobile Engineer

Bertanggung jawab atas:

- Flutter project setup.
- Theme dan mobile design tokens.
- Bottom navigation: `Beranda`, `Pesan`, `Status`, `Bantuan`.
- Customer booking flow:
  - `Screen / Home` (`16:4`)
  - `Screen / Available Vehicles` (`16:48`)
  - `Screen / Vehicle Detail` (`16:147`)
  - `Screen / Date & Time` (`17:70`)
  - `Screen / Rental Options` (`17:129`)
  - `Screen / Booker Form` (`17:177`)
  - `Screen / Order Review` (`18:145`)
  - `Screen / Phone Verification` (`18:190`)
  - `Screen / Booking Status` (`18:243`)
- Help customer screens:
  - `Screen / Bantuan` (`273:336`)
  - `Screen / Help - New Ticket` (`228:262`)
  - `Screen / Help - Ticket Chat` (`228:305`)
- Mobile loading, empty, error, validation, dan retry state.
- Mobile test dan pengecekan viewport 390x844.

PIC A tidak boleh membuat business rule availability atau status sendiri di Flutter. Aturan tersebut berasal dari API Express.

### PIC B - Web Engineer

Bertanggung jawab atas:

- Next.js project setup dan route layout.
- Admin authentication guard di sisi client, dengan authorization final tetap di backend.
- Sidebar dan topbar dashboard.
- Screen dashboard:
  - `Screen / Dashboard Overview` (`19:4`)
  - `Screen / Incoming Bookings` (`19:59`)
  - `Screen / Booking Detail` (`19:112`)
  - `Screen / Booking Status Update` (`20:180`)
  - `Screen / Fleet Calendar` (`20:20`)
  - `Screen / Vehicle Status` (`20:142`)
  - `Screen / Customer Care` (`228:411`)
- Table state, filter, form validation, dropdown, dan error recovery.
- Dashboard test dan pengecekan viewport 1440x900.

PIC B tidak boleh hardcode status booking, vehicle availability, atau data customer di komponen production. Data harus berasal dari API atau diberi label `Data contoh`.

### PIC C - Backend Engineer

Bertanggung jawab atas:

- Express app dan route `/api/v1`.
- Prisma schema, migration, seed, dan PostgreSQL.
- Seed sembilan kendaraan resmi.
- Customer OTP mock dan admin authentication.
- Vehicle listing, detail, dan availability.
- Booking creation, conflict check, transaction, dan status.
- Booking status history dan internal note.
- Support ticket dan ticket message.
- Role authorization pada endpoint admin.
- Validation, error format, rate limiting, logging, dan API test.
- OpenAPI sebagai kontrak bersama client.

PIC C wajib menjaga agar `quoted_amount` atau field tarif yang setara tetap nullable sebelum tarif nyata tersedia. OTP code, password, token, dan secret tidak boleh masuk logbook atau repository.

### PIC D - Integration, Design QA, dan Release

Bertanggung jawab atas:

- Menjaga `docs/design-tokens.json` tetap sinkron dengan implementasi CSS dan Flutter theme.
- Review penggunaan screenshot Figma dari `docs/MANIFEST.json`.
- Meninjau kesesuaian UI terhadap `docs/design/DESIGN.md`.
- Membuat integration test lintas client dan API bersama PIC A/B/C.
- Memeriksa loading, empty, error, responsive layout, focus, contrast, dan tap target.
- Menjaga template serta entry logbook AI.
- Menjaga OpenAPI, README runbook, dan evidence release.
- Membuat issue/review ketika ada data fiktif, dead button, endpoint tidak sesuai, atau klaim `done` tanpa bukti.
- Mengambil ownership atas komponen state atau helper yang diperlukan, misalnya shared error state, empty state, atau test fixture, agar role ini memiliki output coding yang terukur.

PIC D bukan sekretaris yang menulis laporan dari cerita orang lain. Ia memeriksa bukti langsung dari kode, test, screenshot, dan API response.

---

## 3. Pola kerja antar-PIC

```text
PIC A Flutter ────────┐
                      ├── API contract: PIC C
PIC B Next.js ────────┤
                      └── Review/integration: PIC D
```

### Aturan dependency

1. PIC C membuat endpoint dan OpenAPI contract sebelum PIC A/B mengandalkan response final.
2. PIC A dan PIC B boleh mulai dengan mock data yang ditandai `Data contoh`, tetapi harus menggantinya saat endpoint siap.
3. PIC A/B tidak mengubah nama field API secara sepihak. Perubahan harus dicatat sebagai keputusan contract.
4. PIC D melakukan review setelah feature branch memiliki output yang dapat dijalankan.
5. Pemilik fitur wajib memperbaiki temuan review. PIC D tidak menjadi satu-satunya orang yang memperbaiki semua masalah.

---

## 4. Pembagian berdasarkan milestone

| Milestone | PIC utama | PIC pendukung | Hasil yang harus diperiksa |
|---|---|---|---|
| M1 Project baseline | PIC D | Semua PIC | Scope, Figma, IA, dan flow terpetakan |
| M2 Tech stack decision | PIC C | Semua PIC | Decision record disetujui team |
| M3 Repository foundation | PIC A, B, C | PIC D | Tiga app/service dapat dijalankan |
| M4 Database foundation | PIC C | PIC D | Migration dan seed 9 kendaraan terverifikasi |
| M5 API contract dan authentication | PIC C | PIC B, D | OpenAPI, auth, role, dan OTP mock diuji |
| M6 Vehicle dan availability API | PIC C | PIC A, B, D | Vehicle list/detail/availability dan conflict test |
| M7 Flutter application shell | PIC A | PIC D | Theme, routing, bottom nav, viewport mobile |
| M8 Booking domain backend | PIC C | PIC A, B, D | Transaction, validation, booking status |
| M9 Customer booking flow | PIC A | PIC C, D | Home sampai Order Review terintegrasi |
| M10 Prototype checkpoint / UTS | PIC A | PIC C, D | Phone Verification dan Booking Status dapat didemo |
| M11 Next.js dashboard shell | PIC B | PIC D | Sidebar, layout, route guard, viewport dashboard |
| M12 Admin booking operations | PIC B, C | PIC D | Detail, update status, note, status history |
| M13 Fleet operations | PIC B, C | PIC D | Fleet Calendar dan Vehicle Status |
| M14 Help dan Customer Care | PIC A, B, C | PIC D | Ticket customer sampai reply admin |
| M15 Quality, accessibility, dan security audit | PIC D | Semua PIC | Test report dan defect list ditutup/diterangkan |
| M16 Release candidate dan UAS handoff | PIC D | Semua PIC | Fresh setup, demo, dokumentasi, known limitations |

---

## 5. Aturan logbook setiap kontribusi

Setiap anggota membuat entry `.md` menggunakan `docs/LOGBOOK_AI_ASSISTED_TEMPLATE.md`.

Field minimum:

```text
siapa yang melakukan develop: pic + nama/inisial
fitur: nama fitur yang benar-benar dikerjakan
API/endpoint: method dan path yang digunakan
nama variabel/model/component: identifier case-sensitive
tanggal: dd/mm/yy
model AI: nama model/provider yang digunakan, atau none
status: planned | in progress | done | blocked
bukti: commit, screenshot, test output, API response, atau artifact
reviewer: anggota yang memeriksa
```

Jika satu fitur dikerjakan oleh dua orang, buat entry terpisah untuk kontribusi masing-masing. Jangan membuat satu entry yang menghapus batas tanggung jawab.

Contoh nama entry:

```text
docs/logbook/2026-09-10_M6_vehicle-api_PIC-C.md
docs/logbook/2026-09-10_M7_flutter-shell_PIC-A.md
docs/logbook/2026-09-10_M7_dashboard-shell_PIC-B.md
```

`model_ai` tidak boleh diisi berdasarkan tebakan. Jika model/provider tidak diketahui, tulis `unknown` sementara dan cari konfirmasi sebelum entry ditutup. Jika AI tidak digunakan, tulis `none`.

---

## 6. Rotasi reviewer

Agar reviewer tidak selalu orang yang sama:

| Pemilik | Reviewer utama | Reviewer cadangan |
|---|---|---|
| PIC A | PIC D | PIC C |
| PIC B | PIC D | PIC A |
| PIC C | PIC D | PIC B |
| PIC D | PIC C | PIC A atau PIC B |

Reviewer tidak boleh menyetujui perubahan yang tidak ia periksa. Untuk perubahan database, minimal PIC C dan satu anggota lain harus membaca migration. Untuk perubahan API contract, client yang terdampak harus ikut review.

---

## 7. Hal yang tidak boleh dilakukan

- Satu orang menjadi owner Flutter, Next.js, dan backend sekaligus tanpa persetujuan team.
- PIC D hanya diberi tugas mengetik logbook tanpa output teknis.
- PIC A/B memakai field API yang belum disepakati.
- Menggabungkan banyak fitur berbeda ke satu entry logbook agar terlihat selesai.
- Menulis `done` sebelum test atau evidence tersedia.
- Menyimpan API key, password, token, PII, atau OTP asli dalam prompt, screenshot, logbook, atau repository.
- Menggunakan data customer atau harga fiktif seolah-olah data produksi.

---

## 8. Cara mulai pembagian kerja

1. Team mengisi nama/inisial untuk `PIC A`, `PIC B`, `PIC C`, dan `PIC D`.
2. Team memilih reviewer cadangan jika ada anggota yang berhalangan.
3. PIC C mengonfirmasi kontrak API dan model data awal.
4. PIC A dan PIC B mengonfirmasi screen yang menjadi tanggung jawab masing-masing.
5. PIC D membuat folder `docs/logbook/` dan mengatur format nama entry.
6. Setiap PIC membuat entry logbook pertama dengan status `planned` sebelum mulai mengerjakan milestone.
7. Setelah satu milestone selesai, PIC utama membuat ringkasan evidence dan team mengubah status hanya setelah review.
