# WIRABHAKTI ACADEMY: Integrated CRM, LMS & Operations Platform (V2)
## Project Blueprint & Execution Plan

### 1. Executive Summary
Platform manajemen akademi basket end-to-end yang mengintegrasikan pelatihan atlet (LMS), manajemen hubungan siswa (CRM), dan operasional bisnis (ERP). Platform ini dirancang untuk memodernisasi akademi olahraga dengan pendekatan Data-Driven untuk manajemen dan Gamified Experience untuk siswa.

**Tech Stack (Enhanced)**
* **Frontend:** Next.js 15 (App Router, PWA Support), Tailwind CSS, shadcn/ui, Framer Motion (Animations).
* **Backend:** NestJS (Modular Architecture), Socket.io (Real-time), Redis (Caching/Queues).
* **Database:** PostgreSQL (Relational Data) + Prisma ORM.
* **AI/ML:**
    * LLM Integration: OpenAI/LangChain (AI Coach Chatbot & Auto-Feedback).
    * Computer Vision: face-api.js (Absensi Wajah) & Video Analysis (Future implementation).
* **Storage:** AWS S3 / Google Cloud Storage (Video Drills, Bukti Bayar, Foto Event).
* **Infrastructure:** Docker, CI/CD Pipelines (GitHub Actions).

---

### 2. Comprehensive Feature List (Detail)

#### A. Modul Akademik & Pelatihan (LMS Core)

**1. Smart Attendance System**
* **Multiple Methods:** QR Code (Siswa scan di lokasi), Face Recognition (Coach scan wajah siswa), dan Manual Input.
* **Geo-Fencing:** Validasi lokasi saat absen untuk mencegah kecurangan.
* **Real-time Reporting:** Notifikasi otomatis ke WhatsApp Orang Tua saat siswa Check-in dan Check-out.
* **Attendance Analytics:** Grafik kehadiran per kelas, per siswa, dan tren bulanan.

**2. Curriculum & Drill Library**
* **Video Repository:** Perpustakaan video latihan terstruktur (Shooting, Dribbling, Defense, Physical).
* **Leveling System:** Materi dikelompokkan berdasarkan level (Rookie, Starter, All-Star, MVP).
* **Lesson Planning:** Coach dapat membuat rencana latihan mingguan (Lesson Plan) yang dapat diakses tim pelatih.

**3. Player Assessment & Report Card (FUT Style)**
* **"The Player Card" Visual:** Setiap siswa memiliki profil visual ala kartu pemain sepak bola (misal: FIFA Ultimate Team) dengan Overall Rating (OVR) yang dinamis sebagai skor utama.
* **6 Key Stats (Basketball Adapted):** Statistik ditampilkan dalam format Hexagon yang familier namun disesuaikan untuk basket:
    * **SPD (Speed):** Kecepatan lari (Sprint), Agility, dan Footwork.
    * **SHO (Shooting):** Akurasi Layup, Mid-range, 3-Point, dan Free Throw.
    * **PAS (Passing):** Court Vision, IQ Bermain, dan Akurasi Umpan.
    * **DRI (Dribbling):** Ball Handling, Kontrol Bola, dan Ketenangan (Composure).
    * **DEF (Defense):** Steal, Block, Rebounding, dan Penjagaan (Marking).
    * **PHY (Physical):** Vertical Jump, Kekuatan (Strength), dan Stamina.
* **Dynamic Evolution:** Nilai pada kartu berubah otomatis ("Evolve") saat siswa menyelesaikan drills atau mencetak prestasi baru.
* **Back-of-Card Report:** Bagian detail kartu berisi catatan kualitatif Coach dan riwayat perkembangan fisik (Tinggi/Berat) yang bisa di-flip dan diunduh sebagai PDF.

**4. Gamification & Engagement**
* **XP & Leveling:** Siswa mendapat XP dari kehadiran, penyelesaian drill, dan sikap baik.
* **Badges & Achievements:** Penghargaan digital (contoh: "Sharp Shooter", "Early Bird", "Iron Man").
* **Leaderboard:** Peringkat mingguan/bulanan berdasarkan XP untuk memacu kompetisi sehat.
* **Streak System:** Penanda konsistensi latihan berturut-turut.

**5. Home Training Assignments**
* **Homework Drills:** Coach memberikan tugas latihan di rumah.
* **Video Submission:** Siswa mengunggah video bukti latihan.
* **Feedback Loop:** Coach memberikan rating dan komentar pada video kiriman siswa.

#### B. Modul Operasional & Bisnis (Business Engine)

**1. Financial Hub & Billing**
* **Automated Invoicing:** Invoice SPP (Tuition) dibuat otomatis setiap bulan dengan tanggal jatuh tempo.
* **Payment Gateway Integration:** Midtrans/Xendit (Virtual Account, QRIS, E-Wallet, Credit Card).
* **Payment Reminders:** Pengingat otomatis via WhatsApp/Email H-3, H-1, dan saat terlambat (Overdue).
* **Coach Payroll:** Perhitungan gaji pelatih otomatis berdasarkan jumlah sesi kehadiran melatih.
* **Financial Reports:** Laporan Arus Kas (Cash Flow), Pemasukan per Kategori, dan Tunggakan (Aging AR).

**2. Inventory & E-Commerce (Hoops Store)**
* **Product Catalog:** Manajemen stok Jersey, Bola, Aksesoris, dan Digital Products (Tiket Event).
* **Variant Management:** Dukungan untuk varian ukuran (S, M, L, XL) dan warna.
* **Stock Alerts:** Notifikasi otomatis saat stok menipis.
* **Purchase Flow:** Siswa beli di app -> Bayar -> Dapat QR Code Pickup -> Scan di Gudang -> Stok Berkurang.
* **Order History:** Riwayat pembelian lengkap untuk siswa dan admin.

**3. Facility & Schedule Management**
* **Master Schedule:** Kalender jadwal latihan reguler, privat, dan libur.
* **Court Booking:** (Opsional) Sistem pemesanan lapangan jika akademi menyewakan fasilitas.
* **Class Capacity:** Batasan jumlah siswa per sesi latihan.

#### C. Modul Event & Turnamen

**1. Event Management**
* **Event Creation:** Turnamen internal, Sparring, atau Tryout.
* **Registration System:** Form pendaftaran peserta/tim via aplikasi.
* **Ticketing:** Penjualan tiket penonton atau biaya pendaftaran peserta.

**2. Squad Management (Drafting System)**
* **Player Filtering:** Coach mencari pemain berdasarkan usia, posisi, dan statistik rata-rata.
* **Drafting/Invitation:** Mengirim undangan digital ke siswa terpilih untuk bergabung ke tim turnamen.
* **Squad Roster:** Manajemen daftar pemain, nomor punggung, dan posisi untuk turnamen spesifik.

**3. Match Statistics**
* **Game Log:** Input skor dan hasil pertandingan.
* **Player Stats:** (Advanced) Input poin, assist, rebound per pemain untuk diakumulasi ke profil siswa.

#### D. Modul CRM & Komunikasi

**1. Student & Parent CRM**
* **360-Degree Profile:** Data lengkap (Pribadi, Medis, Kontak Darurat, Ukuran Jersey, Riwayat Transaksi).
* **Family Account:** Satu akun Orang Tua dapat mengelola profil beberapa anak (kakak-adik).
* **Lead Management:** Formulir pendaftaran calon siswa (Trial Class) dan funnel konversi ke siswa aktif.

**2. Communication Channels**
* **Broadcast System:** Kirim pengumuman massal (Libur, Event, Promo) via Notifikasi Aplikasi & WhatsApp.
* **1-on-1 Chat:** Fitur chat aman antara Wali Murid dan Admin/Coach (tanpa tukar nomor pribadi jika diinginkan).
* **Highlight Gallery:** Feed sosial internal untuk berbagi foto/video kegiatan akademi (Instagram-style).

---

### 3. Alur Kerja Utama (Key User Flows)

**A. Alur Belanja & Pembayaran (Shop Flow)**
1.  **Order:** Siswa/Wali memilih item di "Hoops Store" via aplikasi.
2.  **Checkout:** Konfirmasi pesanan dan pemilihan metode pembayaran.
3.  **Payment:** Pembayaran via Payment Gateway (Status update realtime via Webhook).
4.  **Fulfillment:** Siswa mendapat QR Code "Pick Up".
5.  **Pickup:** Staf gudang scan QR Code siswa -> Verifikasi -> Barang diserahkan -> Stok update otomatis.

**B. Alur Seleksi Tim Turnamen (Drafting Flow)**
1.  **Event Setup:** Admin membuat event "Kejurda U-16".
2.  **Scouting:** Coach memfilter database siswa: "Umur < 16" AND "Skill Shooting > 80".
3.  **Drafting:** Coach memilih siswa dan klik "Draft to Squad".
4.  **Notification:** Siswa menerima notifikasi "You are Drafted!".
5.  **Confirmation:** Siswa/Wali melakukan konfirmasi kesediaan (Accept/Decline).
6.  **Roster Finalization:** Daftar tim final terbentuk dan dikunci.

**C. Alur Absensi Wajah (AI Presence)**
1.  **Registration:** Siswa upload 3 foto wajah sisi depan/samping sebagai data latih.
2.  **On-Site:** Coach membuka menu "Face Scan Attendance".
3.  **Scanning:** Coach mengarahkan kamera HP ke arah siswa.
4.  **Detection:** AI mendeteksi wajah, mencocokkan dengan database, dan menandai "Hadir".
5.  **Fallback:** Jika gagal, Coach bisa klik manual pada nama siswa.

---

### 4. UI/UX Strategy Update

**Dashboard Siswa (Gen Z Style - "My Career")**
* **Visual Locker:** Tampilan inventaris visual (Jersey yang dimiliki, Sepatu, Koleksi Badge).
* **Game Day Widget:** Countdown timer ke latihan/pertandingan berikutnya + Info Cuaca/Lokasi.
* **XP Progress Bar:** Visualisasi progress menuju level berikutnya.

**Dashboard Wali (Clean Utility)**
* **Bill Watch:** Highlight tagihan belum lunas dengan warna mencolok (Merah).
* **Report Card:** Akses cepat ke grafik perkembangan anak.
* **Quick Actions:** Tombol besar "Bayar SPP", "Izin Tidak Hadir", "Chat Admin".

**Dashboard Admin (Control Tower)**
* **Metrics Cards:** Revenue bulan ini, Jumlah siswa aktif, Attendance Rate rata-rata.
* **Action Required:** List tugas pending (Verifikasi pembayaran manual, Stok menipis, Approval cuti coach).

---

### 5. Development Phases

**Phase 1: Core Foundation & Data (Minggu 1-3)**
* Setup Monorepo & Auth System (RBAC).
* Master Data Management (Siswa, Coach, Kelas, Kurikulum).
* Basic CRM (Profil Siswa & Ortu).

**Phase 2: Academic & Gamification (Minggu 4-6)**
* LMS (Video Library, Lesson Plan).
* Attendance System (QR Code Basic).
* Skill Assessment & Report Card.
* Gamification Engine (XP, Level, Badges).

**Phase 3: Business Engine (Minggu 7-9)**
* Inventory & Store Management.
* Financial Hub (Invoicing & Payment Gateway Integration).
* Parent Portal Dashboard.

**Phase 4: AI & Advanced Features (Minggu 10-12)**
* Face Recognition Attendance Implementation.
* Event & Squad Management (Drafting System).
* AI Chatbot Integration.
* Final Polish & Performance Tuning.