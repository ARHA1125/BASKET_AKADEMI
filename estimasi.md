# WIRABHAKTI ACADEMY: Technical Estimation & Execution Plan
**Version:** 2.0 (Low Budget / Monolithic Strategy)
**Target Budget:** ~Rp 115.000 / month

---

## 1. Executive Summary
Proyek ini akan dikembangkan dengan pendekatan **Monolithic Infrastructure** menggunakan Docker. Seluruh service (Frontend, Backend, Database, Cache, WA Gateway) akan berjalan dalam satu VPS untuk memangkas biaya operasional seminimal mungkin, tanpa mengorbankan performa untuk skala pengguna awal (< 500 user).

Fitur berat seperti *Face Recognition* ditiadakan di fase ini, digantikan dengan fokus pada **Gamification (Player Card)** dan **AI Text Analysis** yang lebih hemat resource.

---

## 2. Infrastructure Architecture
Sistem akan di-deploy menggunakan strategi **"All-in-One Docker Host"**.

**Host Spec (Minimum Requirement):**
* **Provider:** Contabo (Cloud VPS S) atau setara.
* **CPU:** 4 vCPU.
* **RAM:** 8 GB (Crucial for running Java/Node stacks + DB).
* **Storage:** 50 GB NVMe.
* **OS:** Ubuntu LTS / Debian.

**Docker Container Structure:**
1.  **`app-frontend`**: Next.js 15 (App Router).
2.  **`app-backend`**: NestJS (API Utama).
3.  **`db-postgres`**: PostgreSQL 15 (Alpine Image) - *Self Hosted*.
4.  **`sys-redis`**: Redis (Alpine Image) - *Untuk Queue & Cache*.
5.  **`sys-wa-gateway`**: WAHA / Evolution API - *Untuk Notifikasi WA*.

---

## 3. Technology & Service Stack

| Komponen | Technology / Service | Tier / Biaya | Alasan Pemilihan |
| :--- | :--- | :--- | :--- |
| **Compute** | **VPS (Contabo)** | Paid (Cheap) | RAM 8GB termurah di pasaran, kuat menampung full stack. |
| **Database** | **PostgreSQL** | Free (Self-hosted) | Menghindari biaya Managed DB ($15++). |
| **Storage** | **Cloudflare R2** | Free Tier (10GB) | **Bebas biaya Egress** (Bandwidth gratis saat video ditonton). |
| **AI LLM** | **Groq API** (Llama 3) | Free Tier | Kecepatan tinggi, gratis untuk text analysis volume wajar. |
| **Notification** | **WAHA (Docker)** | Free (Self-hosted) | Unlimited messages, tanpa biaya per percakapan (vs Twilio). |
| **Maps** | **OpenStreetMap** | Free | Alternatif Google Maps API untuk validasi lokasi absen. |
| **Job Queue** | **BullMQ (Redis)** | Free (Library) | Manajemen antrian pesan WA agar anti-banned. |

---

## 4. Kalkulasi Operasional Bulanan (OPEX)

Berikut adalah estimasi biaya tetap (*fixed cost*) per bulan.

| Item | Detail | Estimasi Biaya (IDR) |
| :--- | :--- | :--- |
| **Cloud VPS** | Contabo S (€4.50) | Rp 85.000 |
| **Domain** | .com / .id (Prorata 1 thn) | Rp 12.500 |
| **Storage** | Cloudflare R2 (< 10GB) | Rp 0 |
| **AI Service** | Groq API | Rp 0 |
| **WA Gateway** | Self-hosted | Rp 0 |
| **Email** | Resend (Free Tier) | Rp 0 |
| **Dana Cadangan** | Buffer kurs / pajak | Rp 17.500 |
| **TOTAL** | | **~Rp 115.000 / bulan** |

---

## 5. Technical Implementation Strategy

### A. WhatsApp Automation (Billing System)
Sistem pengiriman tagihan otomatis setiap tanggal 5.
* **Engine:** WAHA (WhatsApp HTTP API) running on Docker.
* **Flow:**
    1.  **Scheduler:** NestJS Cron Job trigger pada tgl 5.
    2.  **Generator:** System generate Invoice Link unik.
    3.  **Queueing:** Job dimasukkan ke **BullMQ** (Redis).
    4.  **Worker:** Memproses pesan satu per satu dengan **Delay Random (5-10 detik)**.
    5.  **Sending:** Request hit ke Local API WA (`http://localhost:3000`).
* **Goal:** Mencegah pemblokiran nomor oleh WhatsApp karena aktivitas *spamming*.

### B. AI Coach Integration
Evaluasi statistik siswa menjadi narasi deskriptif.
* **Engine:** Groq API (Model: `llama3-8b-8192`).
* **Data Flow:**
    * Input: JSON Stats (e.g., `{ shooting: 40, passing: 80 }`).
    * Prompt: *"Analyze stats, act as coach, give 3 drills."*
    * Output: Text saran latihan yang disimpan di database `ReportCard`.

### C. Server Performance Optimization
Trik menjaga VPS tetap stabil dengan budget minim.
1.  **Swap Memory:** Wajib mengaktifkan **4GB Swap File** pada OS VPS sebagai memori cadangan.
2.  **External Build:** Jangan melakukan `npm run build` di dalam VPS.
    * Gunakan **GitHub Actions** untuk build Docker Image.
    * VPS hanya melakukan `docker pull` dan `docker-compose up`.

---

## 6. Action Plan (Next Steps)

1.  **Setup VPS:** Beli VPS, setup security (SSH Key), install Docker & Docker Compose.
2.  **Boilerplate:** Init Repo Monorepo (NestJS + Next.js).
3.  **Docker Config:** Setup `docker-compose.yml` untuk menghubungkan App, DB, dan Redis.
4.  **WA POC:** Test deploy WAHA container dan coba kirim pesan via CURL/Postman.
5.  **Develop Core:** Mulai coding fitur Auth dan Master Data.
