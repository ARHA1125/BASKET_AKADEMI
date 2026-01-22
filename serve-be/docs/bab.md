# BAB II
# LANDASAN TEORI

Pada bab ini berisikan teori yang digunakan untuk membuat/merancang produk Tugas Akhir (TA). Teori-teori ini mencakup bahasa pemrograman, framework, basis data, dan alat pengembangan yang menjadi dasar pembangunan sistem.

## 2.1 TypeScript
TypeScript adalah superse strict syntactical dari JavaScript yang menambahkan fitur static typing opsional ke dalam bahasa tersebut. TypeScript dikembangkan oleh Microsoft dan dirancang untuk pengembangan aplikasi skala besar. Menurut dokumentasi resminya, TypeScript dikompilasi menjadi JavaScript standar yang dapat berjalan di semua browser, host Node.js, atau mesin JavaScript apa pun yang mendukung ECMAScript 3 (atau yang lebih baru). Keunggulan utama TypeScript adalah kemampuannya untuk mendeteksi kesalahan tipe data pada saat kompilasi (compile-time) daripada saat runtime, yang meningkatkan keandalan kode dan produktivitas pengembang.

## 2.2 Node.js
Node.js adalah lingkungan runtime JavaScript lintas platform dan _open-source_ yang berjalan pada mesin V8 JavaScript Chrome. Node.js menggunakan model I/O yang dipicu oleh _event_ (event-driven) dan non-blocking, yang membuatnya ringan dan efisien. Teknologi ini memungkinkan pengembang untuk membangun aplikasi jaringan yang dapat diskalakan dengan cepat, serta memungkinkan penggunaan JavaScript di sisi server (_server-side_), menyatukan pengembangan aplikasi web menggunakan satu bahasa pemrograman di sisi klien dan server.

## 2.3 NestJS
NestJS adalah framework untuk membangun aplikasi sisi server Node.js yang efisien, andal, dan dapat diskalakan. Framework ini dibangun dengan dan mendukung penuh TypeScript (namun tetap memungkinkan pengembang untuk menulis kode dalam JavaScript murni) dan menggabungkan elemen-elemen dari Pemrograman Berorientasi Objek (OOP), Pemrograman Fungsional (FP), dan Pemrograman Reaktif Fungsional (FRP). NestJS menggunakan arsitektur modular yang terinspirasi oleh Angular, yang memudahkan pengorganisasian kode ke dalam modul-modul yang terpisah, meningkatkan keterbacaan, dan memfasilitasi pengujian unit.

## 2.4 React
React adalah pustaka JavaScript _open-source_ yang digunakan untuk membangun antarmuka pengguna (UI), khususnya untuk aplikasi satu halaman (_Single Page Application_). Dikelola oleh Facebook (sekarang Meta) dan komunitas pengembang individu serta perusahaan luas. React memungkinkan pengembang untuk membuat komponen UI yang dapat digunakan kembali (_reusable components_) yang mengelola keadaannya sendiri, kemudian menyusunnya untuk membuat antarmuka pengguna yang kompleks. React menggunakan konsep Virtual DOM untuk mengoptimalkan pembaruan tampilan web, menjadikannya cepat dan efisien.

## 2.5 Next.js
Next.js adalah kerangka kerja (_framework_) pengembangan web berbasis React yang diciptakan oleh Vercel. Next.js memungkinkan fungsionalitas aplikasi web seperti perenderan sisi server (_Server-Side Rendering_ - SSR) dan pembuatan situs statis (_Static Site Generation_ - SSG). Berbeda dengan aplikasi React tradisional yang merender konten di sisi klien, Next.js memungkinkan konten untuk dirender di server sebelum dikirim ke klien, yang meningkatkan kinerja pemuatan halaman awal dan optimasi mesin pencari (SEO).

## 2.6 PostgreSQL
PostgreSQL adalah sistem manajemen basis data relasional objek (_Object-Relational Database Management System_ - ORDBMS) _open-source_ yang kuat dan canggih. PostgreSQL dikenal karena keandalannya, integritas data, dan kebenaran teknisnya. Sistem ini mendukung sebagian besar standar SQL dan menawarkan banyak fitur modern seperti kueri kompleks, kunci asing (_foreign keys_), pemicu (_triggers_), tampilan (_views_), integritas transaksional, dan kontrol konkurensi multi-versi (MVCC). PostgreSQL sangat dapat diperluas, memungkinkan pengguna untuk menentukan tipe data mereka sendiri, fungsi kustom, dan bahkan menulis kode dari berbagai bahasa pemrograman tanpa mengkompilasi ulang basis data.

## 2.7 TypeORM
TypeORM adalah _Object-Relational Mapper_ (ORM) yang dapat berjalan di platform Node.js, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, dan Electron. TypeORM mendukung pola _Active Record_ dan _Data Mapper_. Tujuannya adalah untuk memfasilitasi interaksi antara aplikasi TypeScript/JavaScript dan basis data relasional (seperti PostgreSQL, MySQL, MariaDB) dengan cara yang berorientasi objek. Dengan menggunakan TypeORM, pengembang dapat memanipulasi data basis data menggunakan kelas dan objek daripada menulis kueri SQL mentah, yang meningkatkan keamanan dan keterbacaan kode.

## 2.8 Redis
Redis (_Remote Dictionary Server_) adalah penyimpanan struktur data dalam memori (_in-memory data store_) yang bersifat _open-source_ (berlisensi BSD), yang digunakan sebagai basis data, cache, dan perantara pesan (_message broker_). Redis mendukung berbagai struktur data seperti string, hash, list, set, sorted set dengan kueri rentang, bitmap, hyperloglogs, indeks geospasial, dan stream. Karena menyimpan data di dalam memori (RAM), Redis menawarkan kinerja baca dan tulis yang sangat cepat, menjadikannya pilihan ideal untuk kasus penggunaan yang memerlukan latensi rendah seperti caching sesi dan antrean tugas.

## 2.9 Socket.io
Socket.io adalah pustaka JavaScript yang memungkinkan komunikasi dua arah (_bi-directional_), _real-time_, dan berbasis _event_ antara klien web (browser) dan server. Socket.io terdiri dari dua bagian: pustaka sisi klien yang berjalan di browser dan pustaka sisi server untuk Node.js. Pustaka ini terutama menggunakan protokol WebSocket untuk memungkinkan komunikasi latensi rendah, namun menyediakan mekanisme _fallback_ otomatis ke metode lain (seperti HTTP _long-polling_) jika koneksi WebSocket tidak dapat dibangun. Ini sangat penting untuk membangun fitur seperti obrolan instan (_chatting_) dan notifikasi _real-time_.

## 2.10 Docker
Docker adalah platform _open-source_ yang digunakan untuk mengembangkan, mengirimkan, dan menjalankan aplikasi. Docker memungkinkan pengembang untuk memisahkan aplikasi dari infrastruktur mereka sehingga perangkat lunak dapat dikirimkan dengan cepat. Dengan Docker, pengembang dapat mengemas aplikasi beserta semua dependensinya (pustaka, kerangka kerja, file konfigurasi) ke dalam sebuah unit standar yang disebut kontainer. Kontainer ini ringan, portabel, dan memastikan bahwa aplikasi akan berjalan dengan cara yang sama di lingkungan apa pun, baik itu laptop pengembang, server pengujian, atau 
lingkungan produksi.

## 2.11 Tailwind CSS
Tailwind CSS adalah kerangka kerja CSS yang mengutamakan utilitas (_utility-first_) untuk membangun desain antarmuka pengguna kustom dengan cepat. Berbeda dengan kerangka kerja CSS tradisional seperti Bootstrap yang menyediakan komponen siap pakai (seperti tombol dan kartu), Tailwind menyediakan kelas-kelas utilitas tingkat rendah (seperti `text-center`, `p-4`, `flex`) yang dapat digabungkan untuk membangun desain apa pun langsung di dalam _markup_ HTML. Pendekatan ini memberikan fleksibilitas desain yang lebih besar dan mengurangi ukuran file CSS akhir melalui proses _purging_ kode yang tidak digunakan.

## 2.12 BullMQ
BullMQ adalah pustaka antrean pesan (_message queue_) berbasis Node.js yang cepat dan kuat, dibangun di atas Redis. BullMQ digunakan untuk menangani tugas-tugas asinkron dan terdistribusi, seperti pemrosesan latar belakang (_background processing_), penjadwalan pekerjaan, dan manajemen antrean prioritas. Dalam konteks sistem ini, BullMQ berfungsi untuk memisahkan operasi berat (seperti pembuatan laporan atau pengiriman notifikasi massal) dari alur utama aplikasi, memastikan responsivitas server tetap terjaga.

## 2.13 WAHA (WhatsApp HTTP API)
WAHA (_WhatsApp HTTP API_) adalah layanan antarmuka pemrograman aplikasi (API) berbasis Docker yang memungkinkan interaksi dengan platform WhatsApp secara terprogram melalui protokol HTTP. WAHA berfungsi sebagai jembatan antara aplikasi server dan jaringan WhatsApp, memungkinkan pengiriman pesan teks, media, dan notifikasi secara otomatis tanpa intervensi manual. Dalam konteks sistem ini, WAHA digunakan sebagai engine pihak ketiga (_third-party engine_) untuk memfasilitasi komunikasi sistem ke pengguna melalui saluran WhatsApp yang populer dan mudah diakses.
