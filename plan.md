# [cite_start]WIRABHAKTI ACADEMY: Integrated CRM, LMS & Operations Platform (V2) [cite: 3]
## [cite_start]Project Blueprint & Execution Plan [cite: 4]

### [cite_start]1. Executive Summary [cite: 5]
[cite_start]Platform manajemen akademi basket end-to-end yang mengintegrasikan pelatihan atlet (LMS), manajemen hubungan siswa (CRM), dan operasional bisnis (ERP)[cite: 6]. [cite_start]Platform ini dirancang untuk memodernisasi akademi olahraga dengan pendekatan Data-Driven untuk manajemen dan Gamified Experience untuk siswa[cite: 7].

[cite_start]**Tech Stack (Enhanced)** [cite: 8]
* [cite_start]**Frontend:** Next.js 15 (App Router, PWA Support), Tailwind CSS, shadcn/ui, Framer Motion (Animations)[cite: 9].
* [cite_start]**Backend:** NestJS (Modular Architecture), Socket.io (Real-time), Redis (Caching/Queues)[cite: 10].
* [cite_start]**Database:** PostgreSQL (Relational Data) + Prisma ORM[cite: 10].
* **AI/ML:**
    * [cite_start]LLM Integration: OpenAI/LangChain (AI Coach Chatbot & Auto-Feedback)[cite: 12].
    * [cite_start]Computer Vision: face-api.js (Absensi Wajah) & Video Analysis (Future implementation)[cite: 13].
* [cite_start]**Storage:** AWS S3 / Google Cloud Storage (Video Drills, Bukti Bayar, Foto Event)[cite: 14].
* [cite_start]**Infrastructure:** Docker, CI/CD Pipelines (GitHub Actions)[cite: 15].

---

### [cite_start]2. Comprehensive Feature List (Detail) [cite: 16]

#### [cite_start]A. Modul Akademik & Pelatihan (LMS Core) [cite: 17]

**1. [cite_start]Smart Attendance System** [cite: 18]
* [cite_start]**Multiple Methods:** QR Code (Siswa scan di lokasi), Face Recognition (Coach scan wajah siswa), dan Manual Input[cite: 19].
* [cite_start]**Geo-Fencing:** Validasi lokasi saat absen untuk mencegah kecurangan[cite: 20].
* [cite_start]**Real-time Reporting:** Notifikasi otomatis ke WhatsApp Orang Tua saat siswa Check-in dan Check-out[cite: 21].
* [cite_start]**Attendance Analytics:** Grafik kehadiran per kelas, per siswa, dan tren bulanan[cite: 22].

**2. [cite_start]Curriculum & Drill Library** [cite: 23]
* [cite_start]**Video Repository:** Perpustakaan video latihan terstruktur (Shooting, Dribbling, Defense, Physical)[cite: 24].
* [cite_start]**Leveling System:** Materi dikelompokkan berdasarkan level (Rookie, Starter, All-Star, MVP)[cite: 25].
* [cite_start]**Lesson Planning:** Coach dapat membuat rencana latihan mingguan (Lesson Plan) yang dapat diakses tim pelatih[cite: 30].

**3. [cite_start]Player Assessment & Report Card (FUT Style)** [cite: 31]
* [cite_start]**"The Player Card" Visual:** Setiap siswa memiliki profil visual ala kartu pemain sepak bola (misal: FIFA Ultimate Team) dengan Overall Rating (OVR) yang dinamis sebagai skor utama[cite: 32].
* [cite_start]**6 Key Stats (Basketball Adapted):** Statistik ditampilkan dalam format Hexagon yang familier namun disesuaikan untuk basket[cite: 33]:
    * [cite_start]**SPD (Speed):** Kecepatan lari (Sprint), Agility, dan Footwork[cite: 34].
    * [cite_start]**SHO (Shooting):** Akurasi Layup, Mid-range, 3-Point, dan Free Throw[cite: 35].
    * [cite_start]**PAS (Passing):** Court Vision, IQ Bermain, dan Akurasi Umpan[cite: 36].
    * [cite_start]**DRI (Dribbling):** Ball Handling, Kontrol Bola, dan Ketenangan (Composure)[cite: 37].
    * [cite_start]**DEF (Defense):** Steal, Block, Rebounding, dan Penjagaan (Marking)[cite: 38].
    * [cite_start]**PHY (Physical):** Vertical Jump, Kekuatan (Strength), dan Stamina[cite: 39].
* [cite_start]**Dynamic Evolution:** Nilai pada kartu berubah otomatis ("Evolve") saat siswa menyelesaikan drills atau mencetak prestasi baru[cite: 40].
* [cite_start]**Back-of-Card Report:** Bagian detail kartu berisi catatan kualitatif Coach dan riwayat perkembangan fisik (Tinggi/Berat) yang bisa di-flip dan diunduh sebagai PDF[cite: 41, 42].

**4. [cite_start]Gamification & Engagement** [cite: 43]
* [cite_start]**XP & Leveling:** Siswa mendapat XP dari kehadiran, penyelesaian drill, dan sikap baik[cite: 44].
* [cite_start]**Badges & Achievements:** Penghargaan digital (contoh: "Sharp Shooter", "Early Bird", "Iron Man")[cite: 45].
* [cite_start]**Leaderboard:** Peringkat mingguan/bulanan berdasarkan XP untuk memacu kompetisi sehat[cite: 46].
* [cite_start]**Streak System:** Penanda konsistensi latihan berturut-turut[cite: 46].

**5. [cite_start]Home Training Assignments** [cite: 47]
* [cite_start]**Homework Drills:** Coach memberikan tugas latihan di rumah[cite: 48].
* [cite_start]**Video Submission:** Siswa mengunggah video bukti latihan[cite: 49].
* [cite_start]**Feedback Loop:** Coach memberikan rating dan komentar pada video kiriman siswa[cite: 50].

#### [cite_start]B. Modul Operasional & Bisnis (Business Engine) [cite: 51]

**1. [cite_start]Financial Hub & Billing** [cite: 52]
* [cite_start]**Automated Invoicing:** Invoice SPP (Tuition) dibuat otomatis setiap bulan dengan tanggal jatuh tempo[cite: 53].
* [cite_start]**Payment Gateway Integration:** Midtrans/Xendit (Virtual Account, QRIS, E-Wallet, Credit Card)[cite: 54].
* [cite_start]**Payment Reminders:** Pengingat otomatis via WhatsApp/Email H-3, H-1, dan saat terlambat (Overdue)[cite: 55].
* [cite_start]**Coach Payroll:** Perhitungan gaji pelatih otomatis berdasarkan jumlah sesi kehadiran melatih[cite: 60].
* [cite_start]**Financial Reports:** Laporan Arus Kas (Cash Flow), Pemasukan per Kategori, dan Tunggakan (Aging AR)[cite: 61].

**2. [cite_start]Inventory & E-Commerce (Hoops Store)** [cite: 62]
* [cite_start]**Product Catalog:** Manajemen stok Jersey, Bola, Aksesoris, dan Digital Products (Tiket Event)[cite: 63].
* [cite_start]**Variant Management:** Dukungan untuk varian ukuran (S, M, L, XL) dan warna[cite: 64].
* [cite_start]**Stock Alerts:** Notifikasi otomatis saat stok menipis[cite: 65].
* [cite_start]**Purchase Flow:** Siswa beli di app -> Bayar -> Dapat QR Code Pickup -> Scan di Gudang -> Stok Berkurang[cite: 66].
* [cite_start]**Order History:** Riwayat pembelian lengkap untuk siswa dan admin[cite: 67].

**3. [cite_start]Facility & Schedule Management** [cite: 68]
* [cite_start]**Master Schedule:** Kalender jadwal latihan reguler, privat, dan libur[cite: 69].
* [cite_start]**Court Booking:** (Opsional) Sistem pemesanan lapangan jika akademi menyewakan fasilitas[cite: 70].
* [cite_start]**Class Capacity:** Batasan jumlah siswa per sesi latihan[cite: 71].

#### [cite_start]C. Modul Event & Turnamen [cite: 72]

**1. [cite_start]Event Management** [cite: 73]
* [cite_start]**Event Creation:** Turnamen internal, Sparring, atau Tryout[cite: 74].
* [cite_start]**Registration System:** Form pendaftaran peserta/tim via aplikasi[cite: 75].
* [cite_start]**Ticketing:** Penjualan tiket penonton atau biaya pendaftaran peserta[cite: 76].

**2. [cite_start]Squad Management (Drafting System)** [cite: 77]
* [cite_start]**Player Filtering:** Coach mencari pemain berdasarkan usia, posisi, dan statistik rata-rata[cite: 78].
* [cite_start]**Drafting/Invitation:** Mengirim undangan digital ke siswa terpilih untuk bergabung ke tim turnamen[cite: 79].
* [cite_start]**Squad Roster:** Manajemen daftar pemain, nomor punggung, dan posisi untuk turnamen spesifik[cite: 80].

**3. [cite_start]Match Statistics** [cite: 81]
* [cite_start]**Game Log:** Input skor dan hasil pertandingan[cite: 82].
* [cite_start]**Player Stats:** (Advanced) Input poin, assist, rebound per pemain untuk diakumulasi ke profil siswa[cite: 83].

#### [cite_start]D. Modul CRM & Komunikasi [cite: 84]

**1. [cite_start]Student & Parent CRM** [cite: 85]
* [cite_start]**360-Degree Profile:** Data lengkap (Pribadi, Medis, Kontak Darurat, Ukuran Jersey, Riwayat Transaksi)[cite: 86].
* [cite_start]**Family Account:** Satu akun Orang Tua dapat mengelola profil beberapa anak (kakak-adik)[cite: 87].
* [cite_start]**Lead Management:** Formulir pendaftaran calon siswa (Trial Class) dan funnel konversi ke siswa aktif[cite: 92].

**2. [cite_start]Communication Channels** [cite: 93]
* [cite_start]**Broadcast System:** Kirim pengumuman massal (Libur, Event, Promo) via Notifikasi Aplikasi & WhatsApp[cite: 94].
* [cite_start]**1-on-1 Chat:** Fitur chat aman antara Wali Murid dan Admin/Coach (tanpa tukar nomor pribadi jika diinginkan)[cite: 95].
* [cite_start]**Highlight Gallery:** Feed sosial internal untuk berbagi foto/video kegiatan akademi (Instagram-style)[cite: 96].

---

### [cite_start]3. Alur Kerja Utama (Key User Flows) [cite: 97]

**A. [cite_start]Alur Belanja & Pembayaran (Shop Flow)** [cite: 98]
1.  [cite_start]**Order:** Siswa/Wali memilih item di "Hoops Store" via aplikasi[cite: 99].
2.  [cite_start]**Checkout:** Konfirmasi pesanan dan pemilihan metode pembayaran[cite: 100].
3.  [cite_start]**Payment:** Pembayaran via Payment Gateway (Status update realtime via Webhook)[cite: 101].
4.  [cite_start]**Fulfillment:** Siswa mendapat QR Code "Pick Up"[cite: 102].
5.  [cite_start]**Pickup:** Staf gudang scan QR Code siswa -> Verifikasi -> Barang diserahkan -> Stok update otomatis[cite: 103].

**B. [cite_start]Alur Seleksi Tim Turnamen (Drafting Flow)** [cite: 104]
1.  [cite_start]**Event Setup:** Admin membuat event "Kejurda U-16"[cite: 105].
2.  [cite_start]**Scouting:** Coach memfilter database siswa: "Umur < 16" AND "Skill Shooting > 80"[cite: 106].
3.  [cite_start]**Drafting:** Coach memilih siswa dan klik "Draft to Squad"[cite: 107].
4.  [cite_start]**Notification:** Siswa menerima notifikasi "You are Drafted!"[cite: 108].
5.  [cite_start]**Confirmation:** Siswa/Wali melakukan konfirmasi kesediaan (Accept/Decline)[cite: 109].
6.  [cite_start]**Roster Finalization:** Daftar tim final terbentuk dan dikunci[cite: 110].

**C. [cite_start]Alur Absensi Wajah (AI Presence)** [cite: 111]
1.  [cite_start]**Registration:** Siswa upload 3 foto wajah sisi depan/samping sebagai data latih[cite: 112].
2.  [cite_start]**On-Site:** Coach membuka menu "Face Scan Attendance"[cite: 113].
3.  [cite_start]**Scanning:** Coach mengarahkan kamera HP ke arah siswa[cite: 114].
4.  [cite_start]**Detection:** AI mendeteksi wajah, mencocokkan dengan database, dan menandai "Hadir"[cite: 115].
5.  [cite_start]**Fallback:** Jika gagal, Coach bisa klik manual pada nama siswa[cite: 116].

---

### [cite_start]4. UI/UX Strategy Update [cite: 117]

[cite_start]**Dashboard Siswa (Gen Z Style - "My Career")** [cite: 122]
* [cite_start]**Visual Locker:** Tampilan inventaris visual (Jersey yang dimiliki, Sepatu, Koleksi Badge)[cite: 123].
* [cite_start]**Game Day Widget:** Countdown timer ke latihan/pertandingan berikutnya + Info Cuaca/Lokasi[cite: 124].
* [cite_start]**XP Progress Bar:** Visualisasi progress menuju level berikutnya[cite: 125].

[cite_start]**Dashboard Wali (Clean Utility)** [cite: 126]
* [cite_start]**Bill Watch:** Highlight tagihan belum lunas dengan warna mencolok (Merah)[cite: 127].
* [cite_start]**Report Card:** Akses cepat ke grafik perkembangan anak[cite: 128].
* [cite_start]**Quick Actions:** Tombol besar "Bayar SPP", "Izin Tidak Hadir", "Chat Admin"[cite: 129].

[cite_start]**Dashboard Admin (Control Tower)** [cite: 130]
* [cite_start]**Metrics Cards:** Revenue bulan ini, Jumlah siswa aktif, Attendance Rate rata-rata[cite: 131].
* [cite_start]**Action Required:** List tugas pending (Verifikasi pembayaran manual, Stok menipis, Approval cuti coach)[cite: 132].

---

### [cite_start]5. Development Phases [cite: 133]

[cite_start]**Phase 1: Core Foundation & Data (Minggu 1-3)** [cite: 134]
* [cite_start]Setup Monorepo & Auth System (RBAC)[cite: 135].
* [cite_start]Master Data Management (Siswa, Coach, Kelas, Kurikulum)[cite: 136].
* [cite_start]Basic CRM (Profil Siswa & Ortu)[cite: 137].

[cite_start]**Phase 2: Academic & Gamification (Minggu 4-6)** [cite: 138]
* [cite_start]LMS (Video Library, Lesson Plan)[cite: 139].
* [cite_start]Attendance System (QR Code Basic)[cite: 140].
* [cite_start]Skill Assessment & Report Card[cite: 141].
* [cite_start]Gamification Engine (XP, Level, Badges)[cite: 142].

[cite_start]**Phase 3: Business Engine (Minggu 7-9)** [cite: 143]
* [cite_start]Inventory & Store Management[cite: 144].
* [cite_start]Financial Hub (Invoicing & Payment Gateway Integration)[cite: 145].
* [cite_start]Parent Portal Dashboard[cite: 145].

[cite_start]**Phase 4: AI & Advanced Features (Minggu 10-12)** [cite: 146]
* [cite_start]Face Recognition Attendance Implementation[cite: 147].
* [cite_start]Event & Squad Management (Drafting System)[cite: 147].
* [cite_start]AI Chatbot Integration[cite: 148].
* [cite_start]Final Polish & Performance Tuning[cite: 153].