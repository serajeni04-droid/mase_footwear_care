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
- Data tersimpan di localStorage untuk demo browser

## Teknologi
- HTML
- CSS
- JavaScript Vanilla
- LocalStorage

## Struktur Folder

Entitas database: `pelanggan`, `karyawan`, `produk_jasa`, dan `transaksi`.

## Koneksi Supabase untuk Karyawan
1. Jalankan `database/migration_karyawan.sql` melalui Supabase SQL Editor.
2. Ambil Project URL dan publishable key dari pengaturan API proyek Supabase.
3. Isi `frontend/supabase-config.js` dengan URL dan key tersebut. Jangan pernah menaruh secret atau `service_role` key di frontend.
4. Buka ulang aplikasi. Daftar dan operasi tambah, edit, serta hapus karyawan akan memakai tabel `public.karyawan` melalui Supabase REST API.

Catatan keamanan: kebijakan RLS migrasi ini mengizinkan akses demo tanpa login. Siapa pun yang memiliki URL dan anon key dapat mengubah data karyawan selama kebijakan ini aktif. Jangan pernah memakai `service_role` key di frontend. Untuk aplikasi produksi, tambahkan autentikasi dan batasi kebijakan RLS sesuai pengguna. Data pelanggan, produk/jasa, dan transaksi demo masih memakai `localStorage`.


## Cara Menjalankan
Buka file berikut di browser:

```bash
frontend/index.html
```

Atau jalankan dengan server lokal sederhana jika diperlukan, lalu akses halaman utama dari browser.

## Catatan
Aplikasi ini dibuat untuk kebutuhan tugas kuliah dan berjalan sebagai aplikasi frontend statis dengan penyimpanan lokal di browser.

## Kontributor
MASE Footwear Care
