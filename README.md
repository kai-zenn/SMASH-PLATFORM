# SMASH (Sistem Manajemen Sampah / Bank Sampah Digital)

SMASH adalah aplikasi web modern berbasis *mobile-first* yang dirancang untuk mendigitalisasi operasional bank sampah di tingkat komunitas. Aplikasi ini menjembatani peran **Nasabah** (warga yang menyetorkan sampah terpilah) dan **Admin** (operator atau perwakilan unit bank sampah) untuk mengelola timbangan, menghitung konversi keuangan (Rupiah & Poin Saku), serta mendokumentasikan log transaksi secara transparan dan instan.

---

## 🎯 Manfaat Aplikasi

### Bagi Nasabah (Warga)
* **Transparansi Tabungan**: Memantau akumulasi saldo Rupiah dan poin saku hasil dari setiap penyetoran sampah secara real-time.
* **Kartu Digital Pintar**: Menyediakan QR Code unik sebagai kartu identitas digital untuk mempermudah identifikasi tanpa perlu membawa kartu fisik.
* **Daftar Harga Terkini**: Mengetahui harga beli sampah per kilogram untuk kategori plastik, logam, kertas, maupun organik secara langsung untuk merencanakan pemilahan mandiri.

### Bagi Admin (Operator Unit)
* **Pencatatan Bebas Kertas**: Menghilangkan kebutuhan pencatatan manual di buku besar fisik, mengurangi risiko salah hitung atau hilangnya data.
* **Pemindaian Instan**: Memindai QR Code nasabah melalui kamera perangkat atau mengunggah berkas gambar kartu langsung di aplikasi.
* **Bypass Manual**: Dilengkapi fitur *Buku Tamu Nasabah* untuk memproses transaksi dengan pencarian nama/email jika perangkat tidak memiliki kamera aktif atau kendala perizinan.
* **Visualisasi Tren**: Menyediakan grafik tren timbangan 7 hari terakhir demi menganalisis kapasitas sampah harian di unit operasional.

---

## 💻 Tech Stack

* **Frontend Framework**: [React 18+](https://react.dev/) dengan [TypeScript](https://www.typescriptlang.org/) untuk kode yang terstruktur dan aman (*type-safe*).
* **Build Tool**: [Vite](https://vite.dev/) untuk performa pengembangan yang cepat dan efisien.
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) untuk antarmuka yang modern, responsif, dan fleksibel di berbagai ukuran layar.
* **Animasi**: [Motion](https://motion.dev/) (`motion/react`) untuk transisi antar halaman dan interaksi tombol yang mulus.
* **Grafik & Visualisasi**: [Recharts](https://recharts.org/) & [D3](https://d3js.org/) untuk performa grafik analitik volume timbangan sampah.
* **Ikonografi**: [Lucide React](https://lucide.dev/) untuk pustaka ikon yang konsisten.
* **Pemroses QR**: `html5-qrcode` untuk integrasi scanner QR kamera secara *client-side*.

---

## 📖 Panduan Penggunaan Halaman

### 👨‍💼 Panduan Akun Nasabah (Warga)
1. **Dasbor Utama**:
   * Menampilkan ringkasan total saldo Rupiah, Poin Saku aktif, akumulasi volume sampah yang pernah disetor, serta frekuensi transaksi Anda.
2. **Tab Scan (Kartu QR)**:
   * Menampilkan kartu digital yang memuat nama, ID nasabah, dan QR Code unik.
   * Tunjukkan QR Code ini kepada Admin unit bank sampah saat membawa sampah fisik untuk disetorkan.
3. **Tab Hubungi / Kontak**:
   * Digunakan untuk menghubungi admin unit setempat guna menanyakan operasional atau penarikan saldo tabungan.
4. **Tab Harga**:
   * Berisi tabel rujukan harga sampah per kilogram saat ini untuk memandu proses pemilahan mandiri semenjak dari rumah.

### 👩‍💻 Panduan Akun Admin (SMASH Admin)
1. **Dasbor Ringkasan**:
   * Memantau akumulasi total transaksi masuk hari ini, timbangan volume harian (dalam Kilogram), jumlah warga/nasabah aktif, dan total rupiah yang tersalurkan hari ini.
   * Grafik visualisasi harian menunjukkan fluktuasi sampah masuk dalam seminggu terakhir.
2. **Tab Scan (Pemrosesan Setoran)**:
   * **Menggunakan Kamera**: Nyalakan izin kamera untuk mengaktifkan scanner, dekatkan QR Code di ponsel nasabah ke area pemindaian.
   * **Bypass Manual (Sari Buku Tamu)**: Jika nasabah tidak membawa ponsel, atau kamera laptop/perangkat Anda tidak aktif, cari nama atau email nasabah pada widget pencarian di bawah scanner. Klik **"Pilih Nasabah"**.
   * **Input Pengukuran**: Masukkan berat sampah (kg) dan tentukan kategori sampah. Sistem akan secara otomatis menghitung nilai Rupiah dan bonus Poin Saku berdasarkan standar harga aktual. Klik **"Simpan Setoran"** untuk merilis pembaruan saldo instan ke nasabah.
3. **Tab Nasabah**:
   * Berisi daftar profil nasabah. Klik salah satu nasabah untuk meninjau secara mendalam detail saldo berjalan, riwayat 10 transaksi lengkap, serta mutasi tabungan mereka.

---

## ⚙️ Cara Menjalankan Proyek secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan) di komputer Anda.

### Langkah-Langkah:
1. **Unduh repositori** atau ekstrak berkas ZIP proyek ke dalam komputer Anda.
2. **Pasang Dependensi**:
   Buka terminal di dalam direktori proyek tersebut, lalu jalankan perintah:
   ```bash
   npm install
   ```
3. **Jalankan Mode Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan dan dapat diakses melalui browser Anda di URL default `http://localhost:3000` (atau port lain yang tercantum di terminal).
4. **Kompilasi ke Production (Build)**:
   Untuk mengompilasi kode program menjadi berkas web siap tayang:
   ```bash
   npm run build
   ```
   Hasil kompilasi statis akan diletakkan di direktori `/dist`.
