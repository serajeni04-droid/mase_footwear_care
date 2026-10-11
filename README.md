# MASE Footwear Care

Sistem pendapatan dan penjualan untuk layanan cuci sepatu serta penjualan produk perawatan sepatu.
https://serajeni04-droid.github.io/mase_footwear_care/frontend/index.html
## Deskripsi
Aplikasi ini dibuat untuk membantu mengelola:
- data pelanggan
- data karyawan
- data produk dan jasa
- transaksi penjualan
- pendapatan harian dan total transaksi
- dashboard ringkasan bisnis

## Fitur Utama
- Dashboard total pendapatan, total transaksi, total pelanggan, dan total produk/jasa
- Tambah transaksi baru
- Edit transaksi
- Hapus transaksi
- Input pelanggan baru
- Edit pelanggan
- Hapus pelanggan dengan validasi bila masih memiliki transaksi
- Tambah, edit, dan hapus karyawan
- Pilih karyawan yang menangani transaksi
- Hapus karyawan dengan validasi bila masih tercatat pada transaksi
- Input produk/jasa baru
- Edit produk/jasa
- Hapus produk/jasa dengan validasi bila masih digunakan dalam transaksi
- Perhitungan total harga otomatis
- Data pelanggan, karyawan, produk/jasa, dan transaksi tersimpan di Supabase
- Dashboard dihitung dari data Supabase

## Teknologi
- HTML
- CSS
- JavaScript Vanilla
- Supabase PostgreSQL REST API
- LocalStorage sebagai fallback jika konfigurasi Supabase kosong

## Struktur Folder

Entitas database: `pelanggan`, `karyawan`, `produk_jasa`, dan `transaksi`.

## Koneksi Supabase
1. Jalankan `database/migration_karyawan.sql` melalui Supabase SQL Editor.
2. Ambil Project URL dan publishable key dari pengaturan API proyek Supabase.
3. Isi `frontend/supabase-config.js` dengan URL dan key tersebut. Jangan pernah menaruh secret atau `service_role` key di frontend.
4. Buka ulang aplikasi. Pelanggan, karyawan, produk/jasa, transaksi, dan dashboard akan memakai tabel Supabase melalui REST API.

Catatan keamanan: kebijakan demo mengizinkan akses tanpa login. Siapa pun yang memiliki URL dan publishable key dapat mengubah data pada tabel yang kebijakannya terbuka. Untuk aplikasi produksi, tambahkan autentikasi dan batasi kebijakan RLS sesuai pengguna.


## Cara Menjalankan
Buka file berikut di browser:

```bash
frontend/index.html
```

Atau jalankan dengan server lokal sederhana jika diperlukan, lalu akses halaman utama dari browser.

## Catatan
Aplikasi ini dibuat untuk kebutuhan tugas kuliah dan berjalan sebagai aplikasi frontend statis yang terhubung ke Supabase.

## Kontributor
MASE Footwear Care
