-- database.sql
-- Skema database untuk aplikasi MASE Footwear Care
-- PostgreSQL / Supabase compatible

CREATE TABLE pelanggan (
    id_pelanggan SERIAL PRIMARY KEY,
    nama_pelanggan VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20)
);

CREATE TABLE produk_jasa (
    id_item SERIAL PRIMARY KEY,
    nama_item VARCHAR(100) NOT NULL,
    jenis_item VARCHAR(20) NOT NULL CHECK (jenis_item IN ('Jasa', 'Produk')),
    harga NUMERIC(12,2) NOT NULL DEFAULT 0,
    stok INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE transaksi (
    id_transaksi SERIAL PRIMARY KEY,
    tanggal_transaksi DATE NOT NULL DEFAULT CURRENT_DATE,
    id_pelanggan INTEGER NOT NULL,
    id_item INTEGER NOT NULL,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    total_harga NUMERIC(12,2) NOT NULL,
    metode_pembayaran VARCHAR(20) NOT NULL CHECK (metode_pembayaran IN ('CASH', 'QRIS', 'TRANSFER')),
    CONSTRAINT fk_transaksi_pelanggan
        FOREIGN KEY (id_pelanggan)
        REFERENCES pelanggan (id_pelanggan)
        ON DELETE RESTRICT,
    CONSTRAINT fk_transaksi_item
        FOREIGN KEY (id_item)
        REFERENCES produk_jasa (id_item)
        ON DELETE RESTRICT
);

ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk_jasa ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pelanggan_read_write" ON pelanggan
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "produk_jasa_read_write" ON produk_jasa
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "transaksi_read_write" ON transaksi
FOR ALL USING (true) WITH CHECK (true);

INSERT INTO pelanggan (nama_pelanggan, no_hp) VALUES
('Rafi Pratama', '081234567890'),
('Dinda Salsabila', '082345678901'),
('Bimo Nugroho', '083456789012'),
('Maya Putri', '084567890123'),
('Arga Wijaya', '085678901234');

INSERT INTO produk_jasa (nama_item, jenis_item, harga, stok) VALUES
('Fast Cleaning', 'Jasa', 35000, 0),
('Deep Cleaning', 'Jasa', 45000, 0),
('Unyellowing', 'Jasa', 65000, 0),
('Premium Cleaning', 'Jasa', 85000, 0),
('Shoe Cleaner', 'Produk', 35000, 35),
('Shoe Protector', 'Produk', 55000, 20),
('Cleaning Brush', 'Produk', 25000, 15);

INSERT INTO transaksi (tanggal_transaksi, id_pelanggan, id_item, jumlah, total_harga, metode_pembayaran) VALUES
('2026-09-20', 1, 2, 1, 45000, 'CASH'),
('2026-09-21', 2, 5, 2, 70000, 'QRIS'),
('2026-09-22', 3, 1, 1, 35000, 'TRANSFER'),
('2026-09-23', 4, 3, 1, 65000, 'CASH'),
('2026-09-25', 5, 6, 1, 55000, 'TRANSFER'),
('2026-09-26', 1, 4, 2, 170000, 'QRIS');

-- Query contoh untuk melihat data transaksi lengkap
-- SELECT t.*, p.nama_pelanggan, pj.nama_item, pj.jenis_item
-- FROM transaksi t
-- JOIN pelanggan p ON p.id_pelanggan = t.id_pelanggan
-- JOIN produk_jasa pj ON pj.id_item = t.id_item;
