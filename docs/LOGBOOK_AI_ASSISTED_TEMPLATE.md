# Template Logbook AI-Assisted Development - MobilJuragan

> Tujuan: satu entry `.md` per milestone/fitur, sehingga setiap kontribusi yang dibantu AI dapat ditelusuri dan diverifikasi.
>
> Konvensi:
> - Simpan di `docs/logbook/` dengan nama `YYYY-MM-DD_<milestone>_<fitur>_<inisial-pic>.md`.
> - Tanggal ditulis `dd/mm/yy` sesuai permintaan tim.
> - Status entry tidak boleh `done` sebelum ada bukti (commit hash, screenshot, output test, atau link artifact).

---

## A. Frontmatter singkat

```md
---
tanggal: dd/mm/yy
milestone: M# Nama milestone
fitur: Nama fitur
pic: Inisial anggota
reviewer: Inisial reviewer
status: planned | in progress | done | blocked
model_ai: Nama model AI yang dipakai, atau none
provider_ai: Nama provider/platform jika diketahui, atau none
versi_model: Versi model jika tersedia
cakupan_ai: code | docs | design | test | review | refactor | debug
prompt_disimpan: true | false
path_prompt: path/ke/file/prompt.txt (jika disimpan)
---
```

Catatan tim:
- `cakupan_ai` jujur diisi, jangan dirapel menjadi `code` kalau sebenarnya nulis dokumentasi.
- `prompt_disimpan=true` hanya bila tim memilih menyimpan prompt. Jika tidak, isi `false` dan hapus field `path_prompt`.
- `model_ai` ditulis apa adanya, termasuk provider-nya (mis. `claude-opus-4.5`, `deepseek-v4-flash`, `semut-auto`, `gpt-4.1`).

---

## B. Isi entry

```md
## 1. Ringkasan

Jelaskan apa yang dikerjakan dalam 2-4 kalimat. Tidak perlu hype, tidak perlu buzzword.

## 2. Fitur atau scope

Daftar fitur/perubahan spesifik yang dikerjakan pada entry ini. Bullet pendek.

## 3. API, endpoint, dan identifier teknis

Tulis identifier persis seperti di kode (case-sensitive). Bagian ini dipakai untuk trace antara kode, logbook, dan dokumen lain.

### 3.1 Endpoint API

| Method | Path | Tujuan |
|---|---|---|
| GET | /api/v1/vehicles | Daftar kendaraan |
| POST | /api/v1/bookings | Buat booking |

### 3.2 Schema atau model atau variabel penting

- `Booking.start_at`: tanggal mulai rental.
- `Booking.tariff_status`: `PENDING_CONFIRMATION` sampai admin konfirmasi.
- `vehicle.plate_number`: sumber identitas visual.

### 3.3 Komponen UI yang disentuh

- `Screen / Home` (mobile, node `16:4`)
- `Sidebar Item / Incoming Bookings` (dashboard, node `19:59`)

## 4. File yang berubah

| Path | Aksi | Catatan |
|---|---|---|
| apps/mobile/lib/features/... | tambah | New screen |
| services/api/src/modules/bookings/... | ubah | Endpoint + validation |

## 5. Proses dan perintah

Perintah yang benar-benar dijalankan (boleh diringkas jika panjang):

```text
pnpm -F api test bookings
flutter test test/features/booking/...
```

## 6. Hasil dan evidence

Bukti yang bisa dibuka oleh reviewer:

- Screenshot: `docs/logbook/2026-09-04_M9_customer-booking_home.png`
- Output test: lihat blok di bawah.
- API response: simpan di `docs/logbook/2026-09-04_M9_post-bookings.json` (tanpa PII).
- Link commit: `<short hash>`.

```json
{
  "id": "...",
  "status": "PENDING",
  "tariff_status": "PENDING_CONFIRMATION"
}
```

## 7. Kontribusi AI pada entry ini

Isi jujur:

- Bagian mana yang dibantu AI.
- Apakah output AI diterima apa adanya, diedit, atau ditulis ulang manual.
- Apakah ada bagian yang AI usulkan tetapi tim tolak (dan alasannya).

Contoh:

```text
- AI membantu draf awal endpoint POST /bookings dari checklist kontrak API.
- Validasi Zod, transaction Prisma, dan test ditulis manual.
- AI sempat usulkan auto-generate nomor booking; tim menolak karena harus konsultasi admin dulu.
- Output AI diedit untuk mengikuti konvensi naming file tim.
```

## 8. Catatan dan blocker

Hal yang belum selesai, risiko, atau hal yang perlu ditanyakan ke tim:

- Butuh keputusan tarif apakah nullable di semua skenario.
- Tunggu backend deploy sebelum lanjut ke integration test Customer Care.

## 9. Keputusan teknis

Keputusan yang diambil pada entry ini, jika ada:

```text
- tariff_amount tetap nullable; UI menampilkan copy "Tarif dikonfirmasi tim MobilJuragan".
- Booking conflict dideteksi oleh service layer, bukan hanya database constraint.
```

## 10. Reviewer checklist

- [ ] Status entry konsisten dengan kode (cek commit dan path).
- [ ] Tidak ada identifier yang dibuat-buat (cek terhadap `docs/MANIFEST.json` dan `docs/design-tokens.json`).
- [ ] Tidak ada data contoh yang lolos sebagai data produksi.
- [ ] Bukti (screenshot/test/output) ada dan bisa dibuka.
- [ ] Bagian kontribusi AI tidak dilebih-lebihkan.
```

---

## C. Contoh entry jadi (placeholder, bukan pekerjaan yang sudah selesai)

```md
---
tanggal: 12/09/26
milestone: M4 Database Foundation
fitur: Prisma schema + seed fleet resmi
pic: PIC C
reviewer: PIC D
status: planned
model_ai: deepseek-v4-flash
provider_ai: semut-auto
versi_model: unknown
cakupan_ai: code
prompt_disimpan: false
---

## 1. Ringkasan

Membuat Prisma schema awal untuk Vehicle, Booking, BookingStatusHistory, dan OtpVerification. Menulis migration dan seed berisi sembilan kendaraan resmi dari `docs/design-tokens.json`.

## 3. API, endpoint, dan identifier teknis

### 3.1 Schema

- `Vehicle.plate_number` UNIQUE
- `Booking.tariff_status` ENUM: `PENDING_CONFIRMATION`, `CONFIRMED`
- `Booking.tariff_amount` DECIMAL NULL

## 4. File yang berubah

| Path | Aksi |
|---|---|
| services/api/prisma/schema.prisma | tambah |
| services/api/prisma/seed.ts | tambah |

## 6. Hasil dan evidence

```text
$ pnpm -F api prisma migrate dev --name init
Applied 1 migrations
$ pnpm -F api prisma db seed
Seeded 9 vehicles
```

Status entry akan diubah ke `done` setelah migration dan seed diverifikasi oleh reviewer.
```

---

## D. Aturan tambahan khusus untuk entry ini

1. **Satu entry = satu fitur atau satu keputusan teknis.** Jangan menggabungkan tiga fitur dalam satu entry.
2. **Field wajib**: `tanggal`, `fitur`, `pic`, `status`, `model_ai`. Tanpa ini, entry dianggap tidak valid dan tidak masuk hitungan milestone.
   Field tambahan yang disarankan: `provider_ai`, `cakupan_ai`, `reviewer`, dan `path_prompt` jika tim memilih menyimpan prompt.
3. **Identifier teknis** (endpoint path, nama variabel, nama file, node Figma) ditulis apa adanya. Jangan diterjemahkan atau diparafrase.
4. **Bukti** disimpan di folder `docs/logbook/` dengan nama yang konsisten dengan entry, atau link commit/branch jika repository aktif.
5. **Klaim "done"** harus punya minimal satu bukti yang bisa dibuka reviewer dalam waktu singkat.
6. **Kontribusi AI** jujur: jika seluruh entry tidak pakai AI, tulis `model_ai: none` dan jelaskan di bagian kontribusi.