# Keputusan Akses Demo & Audit VPS

> Dokumen kerja (3 Sep 2026): menentukan jalur akses supaya teman tim dan dosen bisa mengakses project tanpa bergantung hanya pada laptop satu orang. Berisi opsi yang dipertimbangkan, rekomendasi, dan hasil audit VPS.

## 1. Tujuan

Agar saat demo / produksi, akses tidak menjadi single point of failure di satu laptop. Teman ingin bisa akses dari mana pun, dan (idealnya) tanpa harus pemilik laptop selalu online.

## 2. Permukaan aplikasi & di mana hidupnya

| Permukaan | Siapa buka | Tempat hidup | Butuh server? |
|---|---|---|---|
| Flutter app | install di device/emulator | build di laptop → install APK | Tidak untuk menjalankan app |
| Dashboard (Next.js) | dosen/teman buka browser | perlu host (Vercel / server / VPS) | Ya |
| Backend (Express) | dipanggil app/dashboard | perlu server | Ya |
| Database | diakses backend | perlu server | Tidak langsung ke user |

Kesimpulan: yang menentukan "bisa tanpa laptop adalah **di mana backend + database di-host** dan apakah mobile menunjuk ke alamat yang devicenya (mis. emulator) bisa jangkau.

## 3. Dua jalur akses utama

### Opsi A — Laptop server + tunnel saat demo

```text
Pemilik nyalakan laptop server + tunnel publik (cloudflared).
Backend + DB hidup di laptop.
Teman/dosen akses via URL https://xxx.trycloudflare.com (dari cloudflared)
atau via Tailscale (url 100.104.118.105:4000) bila di tailnet sama.
```

- Pro: gratis listrik; mudah (sudah dicoba & terbukti 200); data pegang pemilik; tidak perlu konfig VPS.
- Kontra: laptop HARUS nyala + internet; sleep/mati = semua putus; latensi bergantung internet rumah; pemilik jadi single point; tidak cocok uT demo jika dosen di jaringan lain & laptop tidak stabil.
- Cocok untuk: demo singkat di mana pemilik siap nyalakan laptop penuh.

### Opsi B — VPS ber-IP publik tetap

```text
Backend + DB di VPS 43.133.130.167 (selalu up 24/7).
Dashboard di Vercel (statis) yang pointing ke API VPS.
Flutter APK menunjuk URL VPS.
Semuanya hidup tanpa laptop nyala.
```

- Pro: akses kapan pun tanpa owner online; IP tetap; tidak rapuh oleh internet rumah; lebih menyerupai produksi; cocok demo ke dosen.
- Kontra: butuh konfig (UFW, user khusus, systemd, Postgres, Express, .env); perlu pantau resource (VPS juga dipakai agent lain/Hermes); HTTPS/domain opsional bila mau produksi formal.
- Cocok untuk: demo final & akses mandiri.

## 4. Rekomendasi (kombinasi dua lapis)

```text
LAPIS 1 - STAGING/KERJA:  backend+DB di laptop server (Tailscale) — gratis utk develop cepat.
LAPIS 2 - DEMO AKSES:     backend+DB di VPS 43.133.130.167 (public 24/7),
                          dashboard di Vercel, Flutter build APK.
```

Justru LAPIS 2 yang menjawab "teman bisa tanpa laptop pemilik". LAPIS 1 dipakai kerja harian. Saat UTS/demo final, presentasikan lewat jalur publik VPS yang hidup mandiri.

## 5. Estimasi biaya (tugas kuliah)

- Opsi A: Rp0 tambahan (listrik laptop); paling murah tapi paling rapuh.
- Opsi B: VPS sudah ada (tidak ada tambahan belanja). Backend ukuran kecil; resource hampir menganggur dibanding biaya bulanan yang memang sudah dibayar. Domain (opsional utk produksi resmi) ~ Rp100-200 ribu/tahun.
- Dashboard: Vercel free tier cukup untuk demo.

## 6. Langkah audit VPS (read-only, belum deploy)

Sebelum menyatakan "muat & aman", perlu verifikasi kondisi VPS saat ini karena data lama bisa stale:

- OS & kapasitas: RAM/CPU terpakai, disk, load.
- Proses/servis berjalan: Hermes agent / gateway dan other service, berapa beban.
- Network: apakah port publik tersedia (contoh target 80/3000/443 akan dipakai), status UFW / firewall.
- Toolchain: apakah Node/Docker/Postgres sudah terpasang; versinya.

Dilanjutkan di bawah hasil audit.

## 7. Status

- [x] Dokumen arah deploy ditulis.
- [x] Audit VPS dimulai (lihat catatan di bawah).
- [ ] Keputusan final jalur (laptop-only vs VPS vs hybrid) ditetapkan setelah audit.
- [ ] Tidak ada deploy backend/DB ke VPS sampai project bener-benar jalan.

## 8. Catatan audit VPS (update 3 Sep 2026)

Audit VPS **tidak dapat dilanjutkan otomatis dari sesi ini tanpa kredensial** dan perlu mitigasi keamanan.

Alasan:
- VPS diakses via password auth (user `ubuntu`, port 2222). Environment Reasonix lokal tidak punya SSH key VPS maupun sshpass/plink; satu-satunya jalur adalah paramiko + password.
- Password VPS adalah secret dan **tidak boleh** ditulis di file repo/GitHub yang public, ke log, atau ke Reasonix notes.
- Jejak lama menyebut VPS dipakai menjalankan Hermes agent dan pernah ada insiden laporan eksekusi halusinasi; kondisi VPS harus diverifikasi independen, TIDAK dipercaya dari catatan lama.

Agar audit aman:
- Pemilik menyediakan akses VPS lewat cara ber-key (disarankan) atau memberikan password langsung ke sesi yang aman (bukan commit).
- Arah yang disarankan sebelum deploy: siapkan SSH key khusus untuk VPS, nonaktifkan password auth setelahnya, dan batasi akses (firewall hanya IP tertentu).
- Setelah akses tersedia, audit hal berikut (read-only): OS, RAM/CPU/disk terpakai, servis berjalan + beban, port terbuka/UFW, toolchain (Node/Docker/Postgres), lalu simpulkan feasibility.

TTD/referensi: dokumen ini hanya menyimpan kesimpulan, bukan kredensial.

NEXT: bila pemilik aksi set penyediaan akses VPS yang aman, audit dapat dilanjutkan dan hasil feasibility dicatat di bagian 6.
