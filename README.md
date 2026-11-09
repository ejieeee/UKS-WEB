# Absensi Digital PMR Wira

Sistem Buku Induk Presensi Digital Palang Merah Remaja (PMR) Wira berbasis web modern, dilengkapi dengan Portal Presensi bertanda tangan digital serta Portal Admin (Sekretaris) untuk rekapitulasi, pengelolaan anggota, dan ekspor data (Excel & PDF).

---

## 🌟 Fitur Utama

1. **Portal Presensi Anggota**
   - Pencarian cerdas nama anggota dengan autocomplete instan (debounced).
   - Kartu identitas anggota dengan badge Angkatan (Kelas 10 / Kelas 11), Kelas/Jurusan, dan Divisi (PRIMA, LITBANG, PDD, KEBERSIHAN).
   - Validasi duplikasi absensi harian berbasis zona waktu **Asia/Makassar (WITA, UTC+8)**.
   - Kanvas tanda tangan digital (Canvas HTML5) responsif untuk layar sentuh maupun tetikus.
   - Konfirmasi kehadiran sukses dengan animasi selebrasi (confetti) dan tiket bukti hadir.

2. **Portal Admin & Sekretaris**
   - Autentikasi aman akun Sekretaris / Admin.
   - **Rekap Presensi**: Filter periode (Bulan, Tahun, Angkatan, Kelas, Divisi, Pencarian Nama), pagination, pratinjau tanda tangan dengan fitur perbesar (zoom), edit riwayat, dan hapus catatan.
   - **Ekspor Dokumen**:
     - Unduh rekapitulasi format **Microsoft Excel (.xlsx)**.
     - Unduh cetak dokumen **PDF resmi landscape** dengan header kop dan tabel presensi lengkap.
   - **Kelola Data Anggota (CRUD)**: Tambah anggota baru, ubah biodata anggota, dan hapus anggota tanpa menghilangkan riwayat presensi lampau.
   - **Pengaturan Profil**: Penggantian nama pengguna dan kata sandi admin.

3. **Desain Editorial & Tipografi**
   - Estetika kertas vintage stationery dengan palet warna hangat Crimson & Sage (`#984B50`, `#77846B`, `#F8F6F0`).
   - Tipografi elegan: Playfair Display, Lora, dan DM Sans.

---

## 🚀 Panduan Pengembangan Lokal (Visual Studio Code)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih tinggi (disarankan Node.js 20 LTS).
- NPM (bawaan Node.js).
- [Visual Studio Code](https://code.visualstudio.com/).

### Langkah Menjalankan Aplikasi di VS Code:

1. **Buka Proyek di VS Code**:
   Buka folder proyek ini di VS Code atau terminal:
   ```bash
   code .
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban pada tautan yang ditampilkan di terminal (default: `http://localhost:3000`).

4. **Uji Coba Logika Unit**:
   ```bash
   npm test
   ```

5. **Kompilasi Build Produksi**:
   ```bash
   npm run build
   ```
   Hasil build statis akan tersimpan di dalam direktori `dist/`.

---

## 🌐 Panduan Publikasi ke GitHub Pages

Proyek ini telah dikonfigurasi penuh dengan basis URL relatif (`base: './'`) dan file workflow GitHub Actions otomatis di `.github/workflows/deploy.yml`.

### Langkah-langkah Deployment:

1. **Buat Repositori Baru di GitHub**:
   - Buka [GitHub](https://github.com/new) dan buat repositori baru (misal: `absensi-digital-pmr`).

2. **Unggah Proyek ke GitHub**:
   Jalankan perintah berikut di terminal proyek:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi absensi digital pmr wira"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPO>.git
   git push -u origin main
   ```

3. **Aktifkan Fitur GitHub Pages**:
   - Di halaman repositori GitHub Anda, buka menu **Settings** > **Pages**.
   - Pada bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.

4. **Selesai!**
   GitHub Actions akan otomatis membangun proyek dan merilisnya ke alamat:
   `https://<USERNAME-ANDA>.github.io/<NAMA-REPO>/`

---

## 🔑 Kredensial Awal Admin

- **Username**: `sekretaris`
- **Password**: `pmr123`

*Catatan: Kredensial dapat diperbarui kapan saja melalui tab **Pengaturan Admin** di dalam portal admin.*

---

## 📂 Struktur Direktori

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD otomatis untuk GitHub Pages
├── .vscode/
│   ├── extensions.json       # Rekomendasi ekstensi VS Code
│   └── settings.json         # Konfigurasi editor VS Code
├── public/
│   └── assets/images/        # Aset gambar publik
├── src/
│   ├── assets/images/        # Aset gambar komponen
│   ├── components/
│   │   ├── DataAnggotaView.tsx     # Tabel & CRUD anggota
│   │   ├── Navbar.tsx              # Navigasi & penunjuk waktu WITA
│   │   ├── PengaturanAdminView.tsx # Ganti username & password
│   │   ├── PortalAbsensi.tsx       # Antarmuka presensi anggota
│   │   ├── PortalAdmin.tsx         # Login & dashboard admin
│   │   ├── RekapAbsensiView.tsx    # Rekapitulasi, ekspor Excel & PDF
│   │   └── SignaturePad.tsx        # Kanvas tanda tangan digital
│   ├── services/
│   │   └── mockApi.ts        # Lapisan API klien & persistensi localStorage
│   ├── utils/
│   │   ├── timezone.ts       # Penanganan waktu Makassar (WITA)
│   │   └── timezone.test.ts  # Unit test logika waktu
│   ├── App.tsx               # Komponen utama aplikasi
│   ├── index.css             # Konfigurasi Tailwind CSS v4 & font
│   ├── main.tsx              # Titik masuk React
│   └── types.ts              # Deklarasi tipe TypeScript
├── index.html                # Dokumen HTML utama
├── package.json              # Konfigurasi dependensi & skrip npm
├── tsconfig.json             # Konfigurasi TypeScript
├── vite.config.ts            # Konfigurasi Vite & base path
└── README.md                 # Dokumentasi proyek
```

---

## 📜 Lisensi
Lisensi Apache 2.0.
