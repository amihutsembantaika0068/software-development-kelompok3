Aplikasi Identifikasi Spesies Ikan Berbasis DNA

Aplikasi berbasis web untuk identifikasi spesies ikan secara instan menggunakan algoritma K-Nearest Neighbors (KNN) berdasarkan analisis sekuens DNA.

Anggota Tim

Amihutsem Bantaika (2313020068) — Project Manager

Fendi Hari Arta (2313020148) — Frontend Developer

Mochammad Wisnu Rifa’i (2313020160) — Backend Developer

Deskripsi Proyek

Proyek ini mengintegrasikan metode bioinformatika dengan teknologi web untuk membantu peneliti dan akademisi mengidentifikasi spesies ikan secara cepat dan akurat. Sistem membandingkan input sekuens DNA pengguna dengan dataset referensi menggunakan Hamming Distance untuk menentukan kemiripan genetik.

Fitur Utama

Identifikasi Real-Time: Proses klasifikasi dilakukan secara asynchronous tanpa perlu memuat ulang halaman.

Algoritma KNN: Implementasi klasifikasi cerdas untuk mencari tetangga terdekat dalam database DNA.

Responsive UI: Desain antarmuka modern yang interaktif dan user-friendly.

Riwayat Identifikasi: Pencatatan otomatis setiap hasil klasifikasi ke dalam basis data MySQL.

Teknologi

Frontend: HTML5, CSS3, JavaScript (Fetch API).

Backend: Node.js, Express.js, MySQL2 (Connector).

Database: MySQL.

Algoritma: K-Nearest Neighbors (KNN).

Cara Menjalankan Aplikasi

Persiapan Database:

Pastikan XAMPP atau MySQL aktif.

Buat database dengan nama db_identifikasi_ikan.

Import struktur tabel dari file .sql yang tersedia di folder database.

Setup Backend:

Masuk ke folder backend.

Jalankan npm install untuk menginstal dependensi.

Jalankan npm start untuk menghidupkan server di port 3000.

Menjalankan Aplikasi:

Buka file index.html atau akses melalui server frontend di browser Anda.

Alur Kerja Sistem

Input: Pengguna memasukkan sekuens DNA pada form yang tersedia.

Request: Frontend mengirim data ke Backend (/predict) via JSON.

Processing: Backend menghitung kemiripan antara input dan dataset menggunakan KNN.

Response: Hasil (Family, Genus, Species, Confidence) ditampilkan ke layar pengguna.

Struktur Project

/frontend: Berisi aset UI, HTML, dan logika client-side.

/backend: Berisi logika server, API, konfigurasi database, dan dataset.

/database: Berisi file skrip SQL untuk konfigurasi database.

Proyek Mata Kuliah Software Development - Universitas Nusantara PGRI Kediri 2025/2026
