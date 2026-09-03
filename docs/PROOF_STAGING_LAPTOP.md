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

## Masalah yang ditemukan

1. **Port 2222 (WSL SSH langsung) timelout** karena portproxy Windows berisi rule lama yang menunjuk IP WSL yang sudah berubah (`connstate`: daftar v4tov4 kosong). IP WSL berubah tiap restart, sehingga kita perlu mengupdate portproxy atau memakai jalur `wsl ...` dari Windows.
2. PostgreSQL dan Docker belum terpasang.
3. Akses staging saat ini terbatas ke tailnet; tidak publik (sesuai kebutuhan, belum untuk production publik).

## Rekomendasi lanjutan

- Untuk DB:
  - pasang PostgreSQL di WSL, atau
  - pakai hosting DB terpisah agar tidak membebani laptop bila testing banyak.
- Untuk produksi akhir (jika publik):
  - gunakan VPS/cloud yang punya fixed IP + uptime lebih baik.
- Laptop server dipakai untuk development/staging dan demo internal (tailnet), bukan satu-satunya production server.
