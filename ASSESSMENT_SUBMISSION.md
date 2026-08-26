# Proyek Deployment Aplikasi Web di Cloud

## Deskripsi Singkat tentang Project yang Telah Dipresentasikan

**Judul Project: CloudTask — Cloud Task Management dengan Client-Side State Management dan CI/CD**

CloudTask merupakan aplikasi web manajemen tugas yang dikembangkan untuk menerapkan client-side state management sekaligus mendemonstrasikan proses deployment aplikasi web ke lingkungan cloud. Aplikasi menggunakan React sebagai antarmuka pengguna dan Zustand sebagai state manager pada sisi client. State task, pencarian, filter, preferensi tema, waktu sinkronisasi, serta antrean operasi yang belum tersinkronisasi dipersistenkan ke LocalStorage sehingga kondisi aplikasi dapat dipertahankan ketika halaman dimuat ulang.

CloudTask juga menerapkan pendekatan local-first sederhana. Saat koneksi ke server tidak tersedia, perubahan pada task tetap diterapkan pada state lokal melalui optimistic update dan operasi yang gagal dikirim disimpan ke pendingOperations. Ketika koneksi kembali tersedia, aplikasi mencoba menyinkronkan antrean tersebut ke REST API. Backend dibangun menggunakan Node.js dan Express serta menyediakan endpoint CRUD untuk pengelolaan task dan endpoint `/api/health` untuk memantau kondisi aplikasi.

Untuk lingkungan produksi, project disiapkan agar dapat dijalankan pada VM cloud menggunakan PM2 sebagai process manager dan Nginx sebagai reverse proxy. Konfigurasi deployment juga mencakup penggunaan environment variable, pengelolaan dependensi melalui npm, domain yang diarahkan ke public IP server, serta HTTPS menggunakan sertifikat SSL Let's Encrypt. Selain itu, project menyediakan workflow GitHub Actions untuk mendukung CI/CD sehingga proses build dan deployment dapat dijalankan secara otomatis setiap kali perubahan pada branch utama dikirim ke repository.

Dengan implementasi tersebut, CloudTask mengintegrasikan pengembangan aplikasi, manajemen state client-side, konfigurasi environment dan dependensi, deployment cloud, domain dan SSL, CI/CD, serta monitoring aplikasi dalam satu project yang sesuai dengan ruang lingkup asesmen.

## Link Repository GitHub Project yang Telah Dipresentasikan

**GitHub Repository:**  
`https://github.com/USERNAME/cloudtask-cloud-deployment`

> Ganti `USERNAME` setelah repository GitHub benar-benar dibuat dan dapat diakses.
