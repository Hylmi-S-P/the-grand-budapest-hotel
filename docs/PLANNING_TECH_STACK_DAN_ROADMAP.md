# Planning Tech Stack dan Roadmap MobilJuragan

> Dokumen kerja tim untuk menyepakati arah teknis, membagi pekerjaan, dan mencatat proses pengembangan secara jujur.
>
> **Status dokumen:** planning baseline. Milestone berstatus `planned` tidak boleh ditulis sebagai pekerjaan yang sudah selesai. Ubah menjadi `done` hanya setelah ada evidence yang dapat diperiksa.

---

## 1. Ringkasan project

MobilJuragan adalah produk digital rental mobil untuk CV. Mobil Juragan Express Transport di Merauke, Papua Selatan. Produk memiliki dua client utama:

1. **Customer Mobile App** untuk mencari kendaraan, mengirim permintaan rental, melihat status booking, dan meminta bantuan.
2. **Admin Dashboard Web** untuk memproses booking, memeriksa armada, memperbarui status, dan menangani Customer Care.

Backend menjadi sumber business logic bersama. Flutter dan Next.js tidak boleh membuat aturan bisnis yang berbeda-beda.

### Scope MVP

```text
Customer:
Home → Vehicles → Vehicle Detail → Date & Time → Rental Options
→ Booker Form → Order Review → Phone Verification → Booking Status

Admin:
Dashboard Overview → Incoming Bookings → Booking Detail
→ Booking Status Update

Operasional:
Fleet Calendar, Vehicle Status, Customer Care

Bantuan:
FAQ → New Ticket → Ticket Chat → Customer Care admin
```

### Batasan yang wajib dijaga

- Tarif belum boleh di-hardcode sebagai angka. Gunakan `Tarif dikonfirmasi tim MobilJuragan` atau `Menunggu konfirmasi tarif`.
- Data simulasi harus diberi label `Data contoh`.
- Hanya sembilan kendaraan resmi pada `docs/design-tokens.json` yang boleh masuk ke seed/demo data.
- OTP, availability, WhatsApp, dan status booking pada prototype belum dianggap terhubung sampai backend benar-benar mengimplementasikannya.
- Fitur seperti rating, review, promo, payment gateway, chatbot AI, dan statistik pendapatan bukan scope MVP kecuali team menyetujui perubahan scope secara tertulis.

---

## 2. Keputusan tech stack yang direkomendasikan

| Layer | Pilihan | Peran |
|---|---|---|
| Customer mobile | Flutter + Dart | Implementasi aplikasi pelanggan |
| Admin web | Next.js + TypeScript | Implementasi dashboard admin/staf |
| Backend API | Express.js + TypeScript | REST API dan satu sumber business logic |
| Database | PostgreSQL | Data relational booking, kendaraan, user, dan ticket |
| ORM | Prisma | Schema, migration, query, dan seed |
| API contract | REST JSON + OpenAPI | Kontrak komunikasi antar-client dan backend |
| Mobile state | Riverpod | Server state dan booking flow state di Flutter |
| Mobile routing | go_router | Routing dan guard pada Flutter |
| Mobile HTTP | Dio | HTTP client, interceptor, dan error handling |
| Web server state | TanStack Query | Fetching, cache, loading, dan error state di Next.js |
| Web styling | Tailwind CSS + CSS variables | Implementasi token dari Figma |
| Validation | Zod di API dan dashboard | Validasi input konsisten |
| Logging | Pino | Structured logging pada backend |
| Security baseline | Helmet, CORS allowlist, rate limiting, Argon2id | Hardening API dan authentication |

### Keputusan database

**PostgreSQL + Prisma** adalah rekomendasi utama.

Alasannya:

- Booking memiliki relasi jelas dengan customer, vehicle, status history, dan ticket.
- Availability membutuhkan query rentang tanggal.
- Pembuatan booking dan pengecekan konflik harus dapat dijalankan dalam transaction.
- Foreign key, unique constraint, index, dan enum membantu menjaga integritas data.
- PostgreSQL cukup kuat untuk MVP tanpa menambah kompleksitas microservices.

MongoDB atau Firebase tidak dipilih sebagai database utama karena struktur booking MobilJuragan lebih relational daripada document-first. Redis juga belum masuk MVP; tambahkan hanya jika nanti benar-benar ada kebutuhan cache, queue OTP/WhatsApp, atau background job.

### Arsitektur aplikasi

```text
Flutter Customer App ───────┐
                            ├── REST /api/v1 ── Express API ── Prisma ── PostgreSQL
Next.js Admin Dashboard ────┘                         │
                                                      └── OTP / WhatsApp provider (later)
```

### Struktur repository target

```text
apps/
├── mobile/                 # Flutter customer app
└── dashboard/              # Next.js admin dashboard
services/
└── api/                    # Express.js API
packages/
├── api-contract/           # OpenAPI dan response contract
└── design-tokens/          # Token yang dipakai lintas client
docs/                       # Figma export, IA, flow, dan planning
```

`docs/design-tokens.json` dan `docs/MANIFEST.json` menjadi referensi awal. Token boleh ditransformasikan ke CSS/Flutter, tetapi nilai dan aturan desainnya tidak boleh berubah tanpa keputusan team.

---

## 3. Model data awal

Schema awal diprioritaskan pada model berikut:

```text
User
├── Booking
│   ├── Vehicle
│   └── BookingStatusHistory
├── SupportTicket
│   └── TicketMessage
└── OtpVerification

Admin action ── AuditLog
```

### Entitas minimum

- `users`: customer, staff, admin, nomor telepon, dan credential admin.
- `vehicles`: sembilan kendaraan resmi, plat nomor, status operasional, dan optional image URL.
- `bookings`: customer, vehicle, rental period, rental type, pickup location, request, tariff status, amount nullable, dan booking status.
- `booking_status_history`: status sebelum/sesudah, catatan internal, actor, dan waktu perubahan.
- `otp_verifications`: hash OTP, expiry, attempt count, dan consumed time. OTP plain text tidak disimpan.
- `support_tickets`: title, category, description, dan ticket status.
- `ticket_messages`: pesan customer/admin dan waktu pengiriman.
- `audit_logs`: aktivitas penting admin.

### Business rules minimum

1. `vehicle_id` harus berasal dari sembilan kendaraan resmi.
2. Booking dengan tanggal yang bertabrakan tidak boleh diterima untuk kendaraan yang sama.
3. Pemeriksaan availability dan insert booking harus dilindungi transaction.
4. `quoted_amount` boleh `null` sampai tarif dikonfirmasi tim.
5. Perubahan status booking harus membuat record pada `booking_status_history`.
6. Endpoint admin wajib memeriksa role di backend, bukan hanya menyembunyikan menu di Next.js.
7. Data demo diberi penanda `Data contoh`; jangan mencampurnya dengan klaim data produksi.

---

## 4. Kontrak API awal

Prefix API:

```text
/api/v1
```

### Customer

```text
POST   /auth/otp/request
POST   /auth/otp/verify
GET    /vehicles
GET    /vehicles/:vehicleId
POST   /bookings
GET    /bookings/:bookingId
GET    /bookings/:bookingId/status
POST   /tickets
GET    /tickets
GET    /tickets/:ticketId
POST   /tickets/:ticketId/messages
```

### Admin

```text
POST   /admin/auth/login
GET    /admin/bookings
GET    /admin/bookings/:bookingId
PATCH  /admin/bookings/:bookingId/status
GET    /admin/fleet/calendar
GET    /admin/vehicles/status
GET    /admin/tickets
GET    /admin/tickets/:ticketId
POST   /admin/tickets/:ticketId/messages
```

Response error harus konsisten, misalnya:

```json
{
  "error": {
    "code": "BOOKING_VEHICLE_UNAVAILABLE",
    "message": "Kendaraan belum tersedia untuk tanggal yang dipilih.",
    "details": {}
  }
}
```

---

## 5. Roadmap 16 milestone dalam 14 minggu

Format ini memberi team **16 milestone yang dapat dibuktikan** dalam **14 minggu kerja**. Beberapa minggu memiliki dua milestone karena keduanya saling terkait. Durasi aktual boleh bergeser, tetapi urutan dependency sebaiknya dipertahankan.

### Status yang digunakan

- `baseline`: artefak sudah ada di workspace sebelum implementation roadmap ini.
- `planned`: belum dikerjakan.
- `in progress`: sedang dikerjakan, harus memiliki catatan evidence sementara.
- `done`: selesai dan sudah diverifikasi.
- `blocked`: terhambat oleh keputusan atau dependency yang belum tersedia.

| Minggu | Milestone | Fokus | Output yang harus terlihat | Definition of done / evidence | Status awal |
|---:|---|---|---|---|---|
| 1 | M1. Project baseline | Menyatukan problem, scope, Figma, IA, dan flow | Dokumen baseline dan daftar kebutuhan | Team menyetujui scope; link `MANIFEST`, `DESIGN`, IA, dan flow tercatat | `baseline` |
| 1 | M2. Tech stack decision | Menetapkan Flutter, Next.js, Express, PostgreSQL, Prisma, REST | Keputusan stack dan alasan teknis | Semua anggota memahami pembagian client, API, dan database; keputusan tersimpan di dokumen ini | `planned` |
| 2 | M3. Repository foundation | Membuat struktur `apps`, `services`, `packages`, dan aturan environment | Repository dapat dijalankan dengan instruksi README | Health check/API placeholder, dashboard placeholder, dan Flutter app dapat di-start sesuai setup team | `planned` |
| 3 | M4. Database foundation | Menulis Prisma schema, migration, dan seed sembilan kendaraan | Database development berisi schema dan fleet seed resmi | Migration berhasil; seed hanya berisi sembilan kendaraan; tidak ada harga atau customer fiktif tanpa label | `planned` |
| 4 | M5. API contract dan authentication | OpenAPI, response format, admin auth, mock customer OTP | `openapi.yaml`, auth endpoint, middleware role | Request/response terdokumentasi; auth test lulus; OTP memiliki expiry, attempt limit, dan tidak disimpan plain text | `planned` |
| 5 | M6. Vehicle dan availability API | Daftar/detail kendaraan dan pengecekan tanggal | Endpoint vehicle + availability | Semua kendaraan berasal dari dataset resmi; loading/empty/error response tersedia; conflict date memiliki test | `planned` |
| 5 | M7. Flutter application shell | Theme, token, routing, bottom navigation, reusable widgets | Flutter shell dengan `Beranda`, `Pesan`, `Status`, `Bantuan` | App berjalan pada target mobile; tidak ada horizontal overflow; tap target dan label nav sesuai DESIGN.md | `planned` |
| 6 | M8. Booking domain backend | Create booking, validation, transaction, status awal | Endpoint `POST /bookings` dan query status | Booking valid tersimpan atomically; booking conflict ditolak; tarif tetap nullable; error code konsisten | `planned` |
| 7 | M9. Customer booking flow | Implementasi screen booking utama di Flutter | Home sampai Order Review terhubung ke API/mock layer | User dapat memilih kendaraan, tanggal, rental type, mengisi form, dan melihat review; state loading/empty/error ada | `planned` |
| 8 | M10. Prototype checkpoint / UTS | Integrasi Phone Verification dan Booking Status | Demo end-to-end customer booking | Flow dapat didemokan dari Home sampai Status; OTP mock diberi batasan jelas; screenshot/video evidence disimpan | `planned` |
| 9 | M11. Next.js dashboard shell | Layout dashboard, sidebar, topbar, route protection | Overview, sidebar, dan design token web | Dashboard dapat dijalankan; layout target 1440×900 tidak overlap; role non-admin ditolak | `planned` |
| 10 | M12. Admin booking operations | Incoming Bookings, Detail, Status Update | Admin dapat melihat dan mengubah booking | Update status + internal note + optional WhatsApp intent tersimpan; status history dibuat; test role dan validation lulus | `planned` |
| 11 | M13. Fleet operations | Fleet Calendar dan Vehicle Status | Daftar 9 fleet, filter status, availability context | Filter bekerja; data example diberi label; empty/error state dan recovery tersedia | `planned` |
| 12 | M14. Help dan Customer Care | FAQ, New Ticket, Ticket Chat, admin reply | Ticket lifecycle customer → admin → reply | Customer dapat membuat ticket dan mengirim pesan; admin dapat membalas; failure state memiliki retry | `planned` |
| 13 | M15. Quality, accessibility, dan security audit | Testing lintas client/API, WCAG, data integrity | Test report dan daftar defect | Test focused lulus; mobile 390×844 dan dashboard 1440×900 dicek; contrast, keyboard/focus, auth, rate limit, dan 9-vehicle gate diaudit | `planned` |
| 14 | M16. Release candidate dan UAS handoff | Deployment/staging, dokumentasi, demo, case study | Release candidate, README, API docs, handoff, logbook final | Fresh setup dapat diulang; known limitations tertulis; demo berjalan; tidak ada claim fitur yang belum diverifikasi | `planned` |

### Catatan terhadap minggu kuliah

RPS kuliah memiliki 16 pertemuan dengan UTS pada minggu 8 dan UAS pada minggu 16. Roadmap engineering di atas memakai 14 minggu kerja agar bisa menyesuaikan jadwal team. Jika logbook wajib mengikuti kalender 16 minggu:

- Minggu kuliah 1–2 dapat mengacu pada artefak problem framing, prototype, IA, dan user flow yang sudah ada.
- M1 dan M2 menjadi baseline/penyelarasan, bukan alasan untuk mengklaim coding sudah selesai.
- M10 dapat diposisikan sebagai checkpoint UTS.
- M16 dapat diposisikan sebagai persiapan UAS/handoff.
- Dua minggu tambahan dapat digunakan sebagai buffer untuk revisi dosen, usability test, dan perbaikan defect, bukan untuk membuat progress fiktif.

---

## 6. Format catatan logbook setiap milestone

Gunakan satu entry per milestone, bukan hanya kalimat “mengerjakan project”.

```text
Tanggal:
Minggu / Milestone:
Tujuan sesi:
Pekerjaan yang benar-benar dilakukan:
Keputusan teknis/desain:
Kendala:
Solusi atau tindak lanjut:
Output/evidence:
Status: planned | in progress | done | blocked
PIC:
Reviewer:
```

### Contoh entry yang benar

```text
Minggu 3 / M4. Database foundation
Tujuan sesi: membuat schema awal dan seed fleet.
Pekerjaan: menulis Prisma schema untuk Vehicle dan Booking, lalu menjalankan migration.
Output/evidence: migration log, screenshot database, dan test seed.
Kendala: belum ada provider database staging.
Tindak lanjut: memakai PostgreSQL lokal untuk development; provider staging diputuskan sebelum M16.
Status: done hanya setelah migration dan seed diverifikasi.
```

### Bukti yang boleh dipakai

- commit hash atau changed file,
- screenshot UI sebelum/sesudah,
- hasil test command,
- API request/response yang direkam tanpa secret,
- migration dan seed output,
- link OpenAPI,
- review checklist,
- keputusan team yang memiliki tanggal dan PIC.

Jangan menulis `done` hanya karena file dibuat. Milestone selesai jika output dan acceptance check-nya benar-benar diperiksa.

---

## 7. Pembagian tanggung jawab awal

| Area | PIC utama | Kolaborasi |
|---|---|---|
| Product scope dan IA | Product/UX | Semua anggota |
| Flutter customer app | Mobile developer | UX, backend |
| Next.js dashboard | Web developer | UX, backend |
| Express API dan auth | Backend developer | Mobile, web |
| PostgreSQL/Prisma | Backend developer | QA |
| API contract/OpenAPI | Backend + satu wakil client | Semua developer |
| Design token dan visual QA | UX/UI | Mobile, web |
| Testing dan delivery | QA/release owner | Semua anggota |

PIC dapat diganti, tetapi setiap milestone harus memiliki satu owner dan satu reviewer.

---

## 8. Delivery gate team

Sebelum milestone ditutup, cek hal berikut sesuai konteks milestone:

- [ ] Tidak ada data kendaraan di luar sembilan dataset resmi.
- [ ] Tidak ada harga, rating, nama pelanggan, statistik, atau waktu respons fiktif tanpa label `Data contoh`.
- [ ] Tarif tetap memakai copy konfirmasi, bukan angka rekaan.
- [ ] Mobile tidak overflow pada 390×844.
- [ ] Dashboard tidak patah pada 1440×900.
- [ ] Loading, empty, dan error state memiliki sebab serta recovery.
- [ ] Semua tombol dan route memiliki tujuan nyata atau diberi batasan yang jujur.
- [ ] Kontras, focus state, label input, dan tap target diperiksa.
- [ ] Auth dan role diperiksa di backend.
- [ ] Secret tidak masuk ke repository, screenshot, logbook, atau API example.
- [ ] Setiap klaim `done` memiliki evidence.

---

## 9. Keputusan yang masih terbuka

Hal berikut belum diputuskan oleh dokumen ini karena membutuhkan persetujuan team atau kondisi deployment:

1. Provider hosting PostgreSQL dan API.
2. Provider OTP/WhatsApp production.
3. Strategi upload foto kendaraan final.
4. Apakah customer authentication production memakai OTP WhatsApp, SMS, atau provider lain.
5. Pembagian PIC aktual setiap milestone.
6. Target platform mobile pertama: Android saja atau Android + iOS.

Keputusan terbuka tidak boleh diam-diam dianggap sudah final. Catat keputusan, alasan, tanggal, dan PIC pada logbook atau decision record.
