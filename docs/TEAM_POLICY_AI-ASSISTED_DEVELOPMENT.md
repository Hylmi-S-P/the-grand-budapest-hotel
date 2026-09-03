# Kebijakan Tim - AI-Assisted Development

> Dokumen ini mengatur bagaimana tim menggunakan AI saat mengembangkan project MobilJuragan. Aturan di sini mengikat semua anggota, termasuk saat menulis logbook, kode, dokumentasi, atau pull request.

---

## 1. Tujuan

1. Membuat kontribusi tim terlacak dan dapat diverifikasi.
2. Menjaga konsistensi arsitektur, integritas data, dan aturan desain yang sudah disepakati di `docs/PLANNING_TECH_STACK_DAN_ROADMAP.md`, `docs/design/DESIGN.md`, dan `docs/design-tokens.json`.
3. Menggunakan AI sebagai alat bantu, bukan sebagai pengganti judgement tim.
4. Mencegah kebocoran data, klaim palsu, dan kualitas klaim yang menurun.

---

## 2. Prinsip utama

1. **Akuntabel**: setiap perubahan yang dibantu AI harus bisa dijelaskan oleh anggota yang menandatanganinya.
2. **Verifiable**: klaim `done` harus punya bukti (commit, screenshot, test output, atau link artifact).
3. **Transparan**: pemakaian AI ditulis di logbook per entry.
4. **Konsisten**: keputusan teknis diambil oleh tim, bukan AI.
5. **Hemat data**: tidak mengirim data sensitif ke provider AI.

---

## 3. Aturan wajib saat memakai AI

1. **Selalu tulis logbook per entry** dengan format `docs/LOGBOOK_AI_ASSISTED_TEMPLATE.md`.
   Wajib diisi: `tanggal (dd/mm/yy)`, `pic`, `fitur`, `model_ai`, `cakupan_ai`, `status`, dan `path_prompt` (jika disimpan).
2. **Jangan klaim fitur selesai hanya karena AI menulis kode.** Reviewer wajib menjalankan verifikasi.
3. **Identifikasi identifier teknis apa adanya.**
   Endpoint API, nama variabel, nama file, node Figma, dan key/secret placeholder ditulis apa adanya, case-sensitive.
4. **Larangan mengarang data.**
   Tidak boleh menambahkan harga, rating, review, testimoni, nama pelanggan, jumlah booking, atau waktu respons fiktif tanpa label `Data contoh`.
5. **Tarif rental tetap copy, bukan angka.**
   Gunakan `Tarif dikonfirmasi tim MobilJuragan` atau `Menunggu konfirmasi tarif`. `tariff_amount` di database nullable sampai tim memutuskan sebaliknya.
6. **Dataset kendaraan dibatasi.**
   Hanya sembilan kendaraan resmi di `docs/design-tokens.json` yang boleh masuk seed/demo/UI.
7. **Tidak ada em dash pada teks UI atau logbook publik.**
8. **Tidak ada emoji dekoratif** pada heading UI atau bullet dokumen publik.
9. **Tidak ada buzzword** seperti `AI Powered`, `Seamless`, `Next Generation`, `Game-changer`, `Cutting-edge` pada copy UI, presentasi, atau dokumen tim.
10. **AI boleh menulis draf**, tapi keputusan akhir dan review tetap milik anggota tim.

---

## 4. Privasi dan keamanan data

1. **Tidak mengirim rahasia ke provider AI.**
   - API key produksi, password admin, JWT secret, nomor WhatsApp/HP pelanggan, dan PII tidak boleh masuk prompt atau tangkapan layar.
   - Pakai data dummy atau placeholder saat menempel contoh ke prompt.
2. **Screenshot UI harus disensor** untuk bagian yang berisi data sensitif sebelum diunggah ke repo atau logbook.
3. **Secret** disimpan di environment file yang tidak masuk git, dan didokumentasikan di `.env.example` dengan nilai kosong.
4. **PR/ branch** yang memuat kunci, token, atau `.env` wajib ditolak saat review.
5. **Log percakapan AI** yang memuat data sensitif tidak boleh di-commit. Jika perlu disimpan untuk audit, bersihkan dulu.

---

## 5. Aturan kontribusi AI per jenis pekerjaan

| Jenis pekerjaan | Aturan kontribusi AI |
|---|---|
| Kode fitur | Boleh draf, harus ditinjau, dites, dan disetujui PIC + reviewer |
| Kode test | Boleh draf, tapi test case final ditentukan tim |
| Migrasi database | Wajib review manual PIC backend sebelum dijalankan |
| Copywriting UI | Wajib pakai pedoman `docs/design/DESIGN.md` dan daftar CTA spesifik produk |
| Diagram `.drawio` | AI boleh rekomendasikan struktur, tapi layout final dibuat/diatur tim |
| Dokumen publik | AI boleh draf, tapi klaim harus sesuai evidence |
| Pull request description | AI boleh draf, ringkasan akhir tetap oleh PIC |
| Riset atau eksplorasi | AI boleh dipakai, hasil harus diverifikasi sebelum jadi keputusan |

---

## 6. Aturan klaim "selesai"

Entry logbook hanya boleh berstatus `done` jika:

- Kode sudah di-commit ke branch dan ada commit hash.
- Test yang relevan dijalankan dan hasilnya disimpan.
- Untuk fitur UI: screenshot sebelum/sesudah tersedia, dan dicek pada viewport target (mobile 390×844 atau dashboard 1440×900).
- Untuk API: ada response contoh atau test integrasi.
- Untuk database: migration tercatat dan seed terverifikasi.
- Reviewer sudah mengisi checklist di template logbook.

Jika salah satu syarat tidak terpenuhi, status tetap `planned`, `in progress`, atau `blocked`.

---

## 7. Aturan review

1. Reviewer bukan penulis entry.
2. Reviewer cek kontribusi AI secara independen (jangan percaya prompt+output saja).
3. Reviewer boleh minta revisi sebelum status `done`.
4. Reviewer menolak entry yang:
   - Klaim `done` tanpa bukti.
   - Memasukkan data fiktif tanpa label `Data contoh`.
   - Memasukkan identifier yang tidak ada di kode/spec.
   - Memasukkan rahasia/PII.

---

## 8. Aturan saat ada konflik teknis

1. Keputusan akhir dibuat lewat musyawarah tim dan dicatat sebagai ADR (architecture decision record) singkat di logbook.
2. AI boleh merangkum argumen pro/kontra, tapi tidak boleh menjadi penentu.
3. Keputusan yang mengubah scope MVP harus melalui persetujuan semua PIC.

---

## 9. Alur kerja yang disarankan

```text
1. PIC baca milestone di docs/PLANNING_TECH_STACK_DAN_ROADMAP.md
2. PIC buka/membuat entry logbook (template)
3. PIC kerjakan fitur (boleh draf AI)
4. PIC tulis logbook: apa yang dibantu AI, apa yang ditulis manual, apa yang ditolak
5. PIC commit + push ke branch
6. Reviewer cek entry, kode, dan bukti
7. Status entry berubah ke done jika lolos review
8. PIC update status milestone di planning jika perlu
```

---

## 10. Konsekuensi pelanggaran

1. Entry tanpa logbook atau logbook tidak lengkap: status milestone tidak naik.
2. Klaim `done` tanpa bukti: dianggap `blocked`, bukan `done`.
3. Memasukkan rahasia/PII ke repo atau provider AI: wajib ganti kredensial, insiden dilaporkan ke tim, dan revisi proses dilakukan.
4. Memasukkan data fiktif ke demo produksi: rollback dan review data integrity.

---

## Lampiran: cek cepat sebelum commit

```text
- Tanggal sudah dd/mm/yy
- PIC dan reviewer sudah diisi
- Model AI dan cakupan AI diisi jujur
- Identifier teknis ditulis apa adanya
- Tidak ada rahasia/PII
- Tidak ada data fiktif tanpa label "Data contoh"
- Tidak ada em dash pada teks UI/dokumen publik
- Tidak ada buzzword
- Bukti (commit/test/screenshot) tercatat di entry
- Status entry konsisten dengan bukti
```