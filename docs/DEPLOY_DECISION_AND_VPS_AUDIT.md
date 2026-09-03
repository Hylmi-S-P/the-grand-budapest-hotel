# Keputusan Akses Demo (Update 3 Sep 2026)

> Dokumen kerja: menentukan jalur akses supaya teman tim dan dosen bisa mengakses project tanpa bergantung hanya pada laptop satu orang. Berisi opsi yang dipertimbangkan dan rekomendasi saat ini.

> **Koreksi penting:** dokumen versi sebelumnya merujuk ke "VPS 43.133.130.167 yang sudah ada". Itu berdasarkan catatan lama yang ternyata sudah tidak berlaku. Saat ini pemilik **tidak memiliki VPS**; satu-satunya infrastructure pribadi adalah **laptop server**. Catatan VPS lama sudah dihapus dari memori karena stale + memuat kredensial.

## 1. Tujuan

Agar saat demo / produksi, akses tidak menjadi single point of failure di satu laptop. Teman ingin bisa akses dari mana pun, dan (idealnya) tanpa harus pemilik laptop selalu online.

## 2. Permukaan aplikasi & di mana hidupnya

| Permukaan | Siapa buka | Tempat hidup | Butuh server? |
|---|---|---|---|
| Flutter app | install di device/emulator | build di laptop → install APK | Tidak untuk menjalankan app |
| Dashboard (Next.js) | dosen/teman buka browser | perlu host (Vercel / server) | Ya |
| Backend (Express) | dipanggil app/dashboard | perlu server | Ya |
| Database | diakses backend | perlu server | Tidak langsung ke user |

Kesimpulan: faktor penentu "bisa akses tanpa laptop" adalah **di mana backend + database di-host**. Karena hanya laptop server yang dimiliki, maka selama backend tinggal di laptop, semua bergantung laptop menyala.

## 3. Opsi jalur akses (dengan hanya laptop server)

### Opsi A — Laptop server + tunnel saat demo (jalur saat ini)

```text
Pemilik nyalakan laptop server + tunnel publik (cloudflared) atau Tailscale.
Backend + DB hidup di laptop.
Teman/dosen akses via url https://xxx.trycloudflare.com  (atau IP tailnet bila join).
```

- Pro: gratis listrik; mudah; sudah dibuktikan HTTP 200; data dipegang pemilik; tidak butuh biaya infra baru.
- Kontra: laptop HARUS nyala + internet; sleep/mati/blanket = semua putus; pemilik jadi single point; latensi bergantung internet rumah.
- Cocok untuk: develop + demo singkat saat pemilik siap menyalakan laptop.

### Opsi B — Hilangkan ketergantungan pada laptop (perlu tempat hidup lain)

Karena tidak punya VPS, "tanpa laptop nyala" hanya bisa dicapai lewat layanan public yang bukan infra sendiri:

```text
Dashboard (Next.js)     -> Vercel free tier     (https://xx.vercel.app)
Backend/SDB ringan      -> Render/Fly.io free tier, ATAU lanjut di laptop dulu
Database                -> Neon/Supabase free tier (opsional, bila mau keluar dari laptop)
Flutter                 -> build APK, tidak perlu server
```

- Pro: teman/dosen bisa akses kapan pun tanpa kamu online; tidak rapuh oleh laptop; lebih menyerupai produksi; beberapa layanan punya free tier.
- Kontra: bukan infra yang kamu kontrol; free tier ada batas (tidur bila idle); data keluar dari laptop (perlu perhatikan privasi); setup beberapa akun.

### Opsi C — Beli/sediakan VPS baru (di luar biaya nol)

Bila tim memutuskan ingin jalur publik yang dipegang sendiri (kontrol penuh, tanpa batas free tier):

```text
Nyiapin VPS baru (mis. Tencent/Lightsail/Vultr), lalu backend+DB di sana.
```

- Pro: kontrol penuh, tidak kena batas free tier, bisa dipakai jangka panjang.
- Kontra: ada biaya bulanan; perlu provisioning & keamanan (firewall, user, SSH key).
- Rekomendasi: hanya bila free tier terbukti tidak cukup; tidak wajib untuk tugas kuliah demo.

## 4. Rekomendasi saat ini (tanpa VPS)

Untuk tugas kuliah dengan hanya laptop server:

- **Untuk develop** dan **demo lokal/singkat**: gunakan laptop server + Tailscale untuk tim, dan cloudflared sesaat sebelum demo online.
- **Untuk memastikan akses bukan gantung laptop**: coba Vercel (dashboard) + backend free tier (Render/Fly) atau DB managed free (Neon). Kendalanya tetap tergantung free tier.

Keputusan final sebaiknya menunggu konfirmasi dari diskusi team: apakah cukup pakai laptop (Opsi A) atau butuh jalur "tanpa laptop nyala" lewat free tier (Opsi B) atau mau menyediakan VPS sendiri (Opsi C).

## 5. Estimasi biaya

- Opsi A: Rp0 tambahan (listrik laptop).
- Opsi B: Rp0 kalau cukup free tier; perlu pantau batas idle/kuota.
- Opsi C: ada biaya bulanan VPS (mis. mulai ~Rp50-100rb/bln tergantung provider), domain opsional.
- Dashboard Vercel free cukup untuk demo.

## 6. Risiko & mitigasi (tanpa VPS)

| Risiko | Mitigasi |
|---|---|
| Laptop mati/sleep saat demo | Nyalakan khusus saat demo; siapkan cadangan rekam layar/pratinjau |
| Free tier tidur bila idle | Pemanasan/health ping sebelum demo |
| Data keluar ke free tier | Hanya data contoh/uji; jangan masukkan PII pelanggan asli |
| Repo public bocor secret | Jangan commit `.env` / kunci apa pun |

## 7. Status

- [x] Klarifikasi: tidak memiliki VPS; hanya laptop server.
- [x] Dokumen dikoreksi (hapus referensi "VPS sudah ada").
- [x] Memory VPS lama dihapus (stale + berisi kredensial).
- [ ] Keputusan final jalur (A/B/C) menunggu diskusi team.
- [ ] Tidak ada deploy ke infrastruktur tambahan sampai arah ditetapkan.
