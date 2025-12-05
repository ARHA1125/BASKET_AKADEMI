# WIRABHAKTI ACADEMY: Integrated CRM, LMS & Operations Platform (V2) [cite: 3]
## Project Blueprint & Execution Plan [cite: 4]

### 1. Executive Summary [cite: 5]
Platform manajemen akademi basket end-to-end yang mengintegrasikan pelatihan atlet (LMS), manajemen hubungan siswa (CRM), dan operasional bisnis (ERP)[cite: 6]. Platform ini dirancang untuk memodernisasi akademi olahraga dengan pendekatan Data-Driven untuk manajemen dan Gamified Experience untuk siswa[cite: 7].

**Tech Stack (Enhanced)** [cite: 8]
* **Frontend:** Next.js 15 (App Router, PWA Support), Tailwind CSS, shadcn/ui, Framer Motion (Animations)[cite: 9].
* **Backend:** NestJS (Modular Architecture), Socket.io (Real-time), Redis (Caching/Queues)[cite: 10].
* **Database:** PostgreSQL (Relational Data) + Prisma ORM[cite: 10].
* **AI/ML:**
    * LLM Integration: OpenAI/LangChain (AI Coach Chatbot & Auto-Feedback)[cite: 12].
    * Computer Vision: face-api.js (Absensi Wajah) & Video Analysis (Future implementation)[cite: 13].
* **Storage:** AWS S3 / Google Cloud Storage (Video Drills, Bukti Bayar, Foto Event)[cite: 14].
* **Infrastructure:** Docker, CI/CD Pipelines (GitHub Actions)[cite: 15].

---

### 2. Comprehensive Feature List (Detail) [cite: 16]

#### A. Modul Akademik & Pelatihan (LMS Core) [cite: 17]

**1. Smart Attendance System** [cite: 18]
* **Multiple Methods:** QR Code (Siswa scan di lokasi), Face Recognition (Coach scan wajah siswa), dan Manual Input[cite: 19].
* **Geo-Fencing:** Validasi lokasi saat absen untuk mencegah kecurangan[cite: 20].
* **Real-time Reporting:** Notifikasi otomatis ke WhatsApp Orang Tua saat siswa Check-in dan Check-out[cite: 21].
* **Attendance Analytics:** Grafik kehadiran per kelas, per siswa, dan tren bulanan[cite: 22].

**2. Curriculum & Drill Library** [cite: 23]
* **Video Repository:** Perpustakaan video latihan terstruktur (Shooting, Dribbling, Defense, Physical)[cite: 24].
* **Leveling System:** Materi dikelompokkan berdasarkan level (Rookie, Starter, All-Star, MVP)[cite: 25].
* **Lesson Planning:** Coach dapat membuat rencana latihan mingguan (Lesson Plan) yang dapat diakses tim pelatih[cite: 30].

**3. Player Assessment & Report Card (FUT Style)** [cite: 31]
* **"The Player Card" Visual:** Setiap siswa memiliki profil visual ala kartu pemain sepak bola (misal: FIFA Ultimate Team) dengan Overall Rating (OVR) yang dinamis sebagai skor utama[cite: 32].
* **6 Key Stats (Basketball Adapted):** Statistik ditampilkan dalam format Hexagon yang familier namun disesuaikan untuk basket[cite: 33]:
    * **SPD (Speed):** Kecepatan lari (Sprint), Agility, dan Footwork[cite: 34].
    * **SHO (Shooting):** Akurasi Layup, Mid-range, 3-Point, dan Free Throw[cite: 35].
    * **PAS (Passing):** Court Vision, IQ Bermain, dan Akurasi Umpan[cite: 36].
    * **DRI (Dribbling):** Ball Handling, Kontrol Bola, dan Ketenangan (Composure)[cite: 37].
    * **DEF (Defense):** Steal, Block, Rebounding, dan Penjagaan (Marking)[cite: 38].
    * **PHY (Physical):** Vertical Jump, Kekuatan (Strength), dan Stamina[cite: 39].
* **Dynamic Evolution:** Nilai pada kartu berubah otomatis ("Evolve") saat siswa menyelesaikan drills atau mencetak prestasi baru[cite: 40].
* **Back-of-Card Report:** Bagian detail kartu berisi catatan kualitatif Coach dan riwayat perkembangan fisik (Tinggi/Berat) yang bisa di-flip dan diunduh sebagai PDF[cite: 41, 42].

**4. Gamification & Engagement** [cite: 43]
* **XP & Leveling:** Siswa mendapat XP dari kehadiran, penyelesaian drill, dan sikap baik[cite: 44].
* **Badges & Achievements:** Penghargaan digital (contoh: "Sharp Shooter", "Early Bird", "Iron Man")[cite: 45].
* **Leaderboard:** Peringkat mingguan/bulanan berdasarkan XP untuk memacu kompetisi sehat[cite: 46].
* **Streak System:** Penanda konsistensi latihan berturut-turut[cite: 46].

**5. Home Training Assignments** [cite: 47]
* **Homework Drills:** Coach memberikan tugas latihan di rumah[cite: 48].
* **Video Submission:** Siswa mengunggah video bukti latihan[cite: 49].
* **Feedback Loop:** Coach memberikan rating dan komentar pada video kiriman siswa[cite: 50].

#### B. Modul Operasional & Bisnis (Business Engine) [cite: 51]

**1. Financial Hub & Billing** [cite: 52]
* **Automated Invoicing:** Invoice SPP (Tuition) dibuat otomatis setiap bulan dengan tanggal jatuh tempo[cite: 53].
* **Payment Gateway Integration:** Midtrans/Xendit (Virtual Account, QRIS, E-Wallet, Credit Card)[cite: 54].
* **Payment Reminders:** Pengingat otomatis via WhatsApp/Email H-3, H-1, dan saat terlambat (Overdue)[cite: 55].
* **Coach Payroll:** Perhitungan gaji pelatih otomatis berdasarkan jumlah sesi kehadiran melatih[cite: 60].
* **Financial Reports:** Laporan Arus Kas (Cash Flow), Pemasukan per Kategori, dan Tunggakan (Aging AR)[cite: 61].

**2. Inventory & E-Commerce (Hoops Store)** [cite: 62]
* **Product Catalog:** Manajemen stok Jersey, Bola, Aksesoris, dan Digital Products (Tiket Event)[cite: 63].
* **Variant Management:** Dukungan untuk varian ukuran (S, M, L, XL) dan warna[cite: 64].
* **Stock Alerts:** Notifikasi otomatis saat stok menipis[cite: 65].
* **Purchase Flow:** Siswa beli di app -> Bayar -> Dapat QR Code Pickup -> Scan di Gudang -> Stok Berkurang[cite: 66].
* **Order History:** Riwayat pembelian lengkap untuk siswa dan admin[cite: 67].

**3. Facility & Schedule Management** [cite: 68]
* **Master Schedule:** Kalender jadwal latihan reguler, privat, dan libur[cite: 69].
* **Court Booking:** (Opsional) Sistem pemesanan lapangan jika akademi menyewakan fasilitas[cite: 70].
* **Class Capacity:** Batasan jumlah siswa per sesi latihan[cite: 71].

#### C. Modul Event & Turnamen [cite: 72]

**1. Event Management** [cite: 73]
* **Event Creation:** Turnamen internal, Sparring, atau Tryout[cite: 74].
* **Registration System:** Form pendaftaran peserta/tim via aplikasi[cite: 75].
* **Ticketing:** Penjualan tiket penonton atau biaya pendaftaran peserta[cite: 76].

**2. Squad Management (Drafting System)** [cite: 77]
* **Player Filtering:** Coach mencari pemain berdasarkan usia, posisi, dan statistik rata-rata[cite: 78].
* **Drafting/Invitation:** Mengirim undangan digital ke siswa terpilih untuk bergabung ke tim turnamen[cite: 79].
* **Squad Roster:** Manajemen daftar pemain, nomor punggung, dan posisi untuk turnamen spesifik[cite: 80].

**3. Match Statistics** [cite: 81]
* **Game Log:** Input skor dan hasil pertandingan[cite: 82].
* **Player Stats:** (Advanced) Input poin, assist, rebound per pemain untuk diakumulasi ke profil siswa[cite: 83].

#### D. Modul CRM & Komunikasi [cite: 84]

**1. Student & Parent CRM** [cite: 85]
* **360-Degree Profile:** Data lengkap (Pribadi, Medis, Kontak Darurat, Ukuran Jersey, Riwayat Transaksi)[cite: 86].
* **Family Account:** Satu akun Orang Tua dapat mengelola profil beberapa anak (kakak-adik)[cite: 87].
* **Lead Management:** Formulir pendaftaran calon siswa (Trial Class) dan funnel konversi ke siswa aktif[cite: 92].

**2. Communication Channels** [cite: 93]
* **Broadcast System:** Kirim pengumuman massal (Libur, Event, Promo) via Notifikasi Aplikasi & WhatsApp[cite: 94].
* **1-on-1 Chat:** Fitur chat aman antara Wali Murid dan Admin/Coach (tanpa tukar nomor pribadi jika diinginkan)[cite: 95].
* **Highlight Gallery:** Feed sosial internal untuk berbagi foto/video kegiatan akademi (Instagram-style)[cite: 96].

---

### 3. Alur Kerja Utama (Key User Flows) [cite: 97]

**A. Alur Belanja & Pembayaran (Shop Flow)** [cite: 98]
1.  **Order:** Siswa/Wali memilih item di "Hoops Store" via aplikasi[cite: 99].
2.  **Checkout:** Konfirmasi pesanan dan pemilihan metode pembayaran[cite: 100].
3.  **Payment:** Pembayaran via Payment Gateway (Status update realtime via Webhook)[cite: 101].
4.  **Fulfillment:** Siswa mendapat QR Code "Pick Up"[cite: 102].
5.  **Pickup:** Staf gudang scan QR Code siswa -> Verifikasi -> Barang diserahkan -> Stok update otomatis[cite: 103].

**B. Alur Seleksi Tim Turnamen (Drafting Flow)** [cite: 104]
1.  **Event Setup:** Admin membuat event "Kejurda U-16"[cite: 105].
2.  **Scouting:** Coach memfilter database siswa: "Umur < 16" AND "Skill Shooting > 80"[cite: 106].
3.  **Drafting:** Coach memilih siswa dan klik "Draft to Squad"[cite: 107].
4.  **Notification:** Siswa menerima notifikasi "You are Drafted!"[cite: 108].
5.  **Confirmation:** Siswa/Wali melakukan konfirmasi kesediaan (Accept/Decline)[cite: 109].
6.  **Roster Finalization:** Daftar tim final terbentuk dan dikunci[cite: 110].

**C. Alur Absensi Wajah (AI Presence)** [cite: 111]
1.  **Registration:** Siswa upload 3 foto wajah sisi depan/samping sebagai data latih[cite: 112].
2.  **On-Site:** Coach membuka menu "Face Scan Attendance"[cite: 113].
3.  **Scanning:** Coach mengarahkan kamera HP ke arah siswa[cite: 114].
4.  **Detection:** AI mendeteksi wajah, mencocokkan dengan database, dan menandai "Hadir"[cite: 115].
5.  **Fallback:** Jika gagal, Coach bisa klik manual pada nama siswa[cite: 116].

---

### 4. UI/UX Strategy Update [cite: 117]

**Dashboard Siswa (Gen Z Style - "My Career")** [cite: 122]
* **Visual Locker:** Tampilan inventaris visual (Jersey yang dimiliki, Sepatu, Koleksi Badge)[cite: 123].
* **Game Day Widget:** Countdown timer ke latihan/pertandingan berikutnya + Info Cuaca/Lokasi[cite: 124].
* **XP Progress Bar:** Visualisasi progress menuju level berikutnya[cite: 125].

**Dashboard Wali (Clean Utility)** [cite: 126]
* **Bill Watch:** Highlight tagihan belum lunas dengan warna mencolok (Merah)[cite: 127].
* **Report Card:** Akses cepat ke grafik perkembangan anak[cite: 128].
* **Quick Actions:** Tombol besar "Bayar SPP", "Izin Tidak Hadir", "Chat Admin"[cite: 129].

**Dashboard Admin (Control Tower)** [cite: 130]
* **Metrics Cards:** Revenue bulan ini, Jumlah siswa aktif, Attendance Rate rata-rata[cite: 131].
* **Action Required:** List tugas pending (Verifikasi pembayaran manual, Stok menipis, Approval cuti coach)[cite: 132].

---

### 5. Development Phases [cite: 133]

**Phase 1: Core Foundation & Data (Minggu 1-3)** [cite: 134]
* Setup Monorepo & Auth System (RBAC)[cite: 135].
* Master Data Management (Siswa, Coach, Kelas, Kurikulum)[cite: 136].
* Basic CRM (Profil Siswa & Ortu)[cite: 137].

**Phase 2: Academic & Gamification (Minggu 4-6)** [cite: 138]
* LMS (Video Library, Lesson Plan)[cite: 139].
* Attendance System (QR Code Basic)[cite: 140].
* Skill Assessment & Report Card[cite: 141].
* Gamification Engine (XP, Level, Badges)[cite: 142].

**Phase 3: Business Engine (Minggu 7-9)** [cite: 143]
* Inventory & Store Management[cite: 144].
* Financial Hub (Invoicing & Payment Gateway Integration)[cite: 145].
* Parent Portal Dashboard[cite: 145].

**Phase 4: AI & Advanced Features (Minggu 10-12)** [cite: 146]
* Face Recognition Attendance Implementation[cite: 147].
* Event & Squad Management (Drafting System)[cite: 147].
* AI Chatbot Integration[cite: 148].
* Final Polish & Performance Tuning[cite: 153].