# Proof Environment Staging di Laptop Server

> Hasil uji coba (3 Sep 2026): apakah laptop server dapat dipakai sebagai environment staging backend untuk project MobilJuragan. Verifikasi dilakukan langsung via SSH, bukan dugaan.

## Ringkasan

**Kesimpulan: BISA untuk backend staging.** Laptop server Sangat layak menjalankan Express + PostgreSQL development/staging. Akses eksternal terbukti berhasil lewat jaringan Tailscale.

## Resource laptop server (WSL Ubuntu 26.04 LTS)

| Resource | Nilai | Status |
|---|---|---|
| CPU | Intel i3-7020U, 4 core @ 2.30GHz | Cukup |
| RAM | 3.8 GiB total, 3.3 GiB available | Cukup utk Express+Postgres+Next ringan |
| Disk | 953 GiB tersedia | Sangat cukup |
| Node.js | v22.23.2 | Terpasang |
| npm | 10.9.8 | Terpasang |
| Git / curl | ada | Terpasang |
| PostgreSQL | BELUM terpasang | Perlu install jika dipakai DB di sini |
| Docker | BELUM terpasang / daemon inactive | Opsional |
| systemd | aktif (PID 1) | Untuk service persist |

## Proof akses & service

1. **SSH Windows host OK** (port 22, via `100.104.118.105`).
2. **WSL OK** diakses melalui `wsl -d Ubuntu -u root` dari Windows host.
3. **Service systemd tersedia**, jadi service bisa hidup terus (tidak mati saat SSH/terminal ditutup).

### Proof HTTP server staging

- Buat Node server dengan endpoint:
  - `GET /health` → `200` JSON `{status, service, node version, uptime, hostname}`
  - `GET /nope` → `404`
- Daftarkan sebagai systemd service: `mobiljuragan-staging.service`
- Bind pada `0.0.0.0:4000`.

Langkah akses dari luar WSL:

1. Add Windows portproxy: `0.0.0.0:4000` → `172.28.37.214:4000`.
2. Add firewall rule inbound port 4000, terbatas ke `100.64.0.0/10` (Tailscale only).

Verifikasi dari mesin lain (PC Reasonix, device lain di tailnet):

```text
$ curl http://100.104.118.105:4000/health
HTTP 200
{"status":"ok","service":"mobiljuragan-staging-proof",...,"node":"v22.23.2", ...}
```

- `/health` → `200`
- `/nope` → `404` (di luar endpoint dipastikan ditolak dengan benar)

### Proof restart (resilience)

```text
systemctl restart mobiljuragan-staging
systemctl is-active mobiljuragan-staging => active
curl http://100.104.118.105:4000/health => HTTP 200 (uptime reset ke 7s)
```

Artinya: service auto-restart & kembali aktif setelah restart, HTTP 200 kembali via Tailscale.

## Endpoint / konfigurasi

```text
Service (di WSL):   node on 0.0.0.0:4000  (systemd: mobiljuragan-staging.service)
Windows portproxy:  0.0.0.0:4000 -> <WSL_IP>:4000   (saat ini 172.28.37.214)
Firewall:           TCP 4000, RemoteIP 100.64.0.0/10 (Tailscale)
Tailscale:          100.104.118.105 (laptop-5l5l03ci)
URL health (tailnet): http://100.104.118.105:4000/health
```

## Metode akses demo yang dipilih: Tailscale (anggota join tailnet)

Keputusan team (3 Sep 2026): anggota mengakses staging **langsung via Tailscale**, tanpa harus "lewat laptop host dulu" untuk tiap request.

Cara anggota (dilakukan masing-masing sekali):

1. Install Tailscale di perangkat.
2. Login dengan akun dan join tailnet pemilik (`hylmig7@`). Owner meng-approve join sekali.
3. Setelah join, akses langsung:
   - Backend: `http://100.104.118.105:4000/api/v1`
   - Health cek: `http://100.104.118.105:4000/health`

Tidak ada proxy/hopping per request. Begitu anggota ada di tailnet yang sama, laptop server tampil sebagai host di `100.104.118.105` dan bisa dicapai langsung oleh setiap device.

Catatan: seluruh layanan yang mau diakses anggota WAJIB bind `0.0.0.0` (bukan `127.0.0.1`) dan port-nya harus diizinkan di firewall Windows untuk `100.64.0.0/10`. Port `4000` sudah dibuka; saat layanan baru (dashboard, port lain) ingin diakses, tambahkan rule serupa.

## Metode akses alternatif: cloudflared (tunnel publik)

Sebagai cadangan agar anggota/dosen tidak perlu install Tailscale, cloudflared dipasang di server WSL dan memforward port `4000` ke URL publik TryCloudflare.

```text
cloudflared: /usr/local/bin/cloudflared (2026.8.3)
Systemd service: cloudflared-tunnel.service  (active, restart auto)
URL publik (3 Sep 2026): https://writer-generation-lung-markets.trycloudflare.com
```

Proof (dari mesin lain via internet, dipaksa ke IP Cloudflare karena resolver lokal lambat):

```text
curl --resolve writer-generation-lung-markets.trycloudflare.com:443:104.16.230.132 \
     https://writer-generation-lung-markets.trycloudflare.com/health
HTTP 200  {"service":"mobiljuragan-staging-proof", ...}
```

Catatan penting soal DNS: hostname `*.trycloudflare.com` tervalidasi resolve oleh DNS publik (Cloudflare 1.1.1.1 dan Google 8.8.8.8 → 104.16.230.132/104.16.231.132). Namun resolver/router lokal di satu mesin test (192.168.111.1) sempat mengembalikan "Non-existent domain" hingga beberapa menit. Artinya URL publik ini bergantung pada DNS client; untuk demo sebaiknya memakai jaringan dengan resolver normal, atau beri jeda setelah tunnel dibuat.

## Masalah yang ditemukan

1. **Port 2222 (WSL SSH langsung) timelout** karena portproxy Windows berisi rule lama yang menunjuk IP WSL yang sudah berubah (`connstate`: daftar v4tov4 kosong). IP WSL berubah tiap restart, sehingga kita perlu mengupdate portproxy atau memakai jalur `wsl ...` dari Windows.
2. PostgreSQL dan Docker belum terpasang.
3. Akses staging saat ini terbatas ke tailnet; tidak publik (sesuai kebutuhan, belum untuk production publik).

## Rekomendasi lanjutan

- Untuk DB:
  - pasang PostgreSQL di WSL, atau
  - pakai hosting DB terpisah agar tidak membebani laptop bila testing banyak.
- Untuk produksi/demo yang tidak bergantung laptop host menyala:
  - deploy backend + DB ke VPS/cloud dengan IP tetap (mis. `43.133.130.167`).
- Metode akses utama saat ini (untuk demo tugas kuliah): **anggota join tailnet lalu buka URL langsung**. Flow yang perlu dipastikan saat demo:
  1. Laptop host menyala dan WSL aktif (service `mobiljuragan-staging` berjalan).
  2. Semua perangkat demo ada di tailnet yang sama.
  3. Backend bind `0.0.0.0` dan port terbuka untuk `100.64.0.0/10`.
  4. Health cek berhasil (`200`) sebelum demo dimulai.
