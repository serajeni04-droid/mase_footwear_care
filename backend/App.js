const mockData = {
  customers: [
    { id_pelanggan: 1, nama_pelanggan: 'Rafi Pratama', no_hp: '081234567890' },
    { id_pelanggan: 2, nama_pelanggan: 'Dinda Salsabila', no_hp: '082345678901' },
    { id_pelanggan: 3, nama_pelanggan: 'Bimo Nugroho', no_hp: '083456789012' },
    { id_pelanggan: 4, nama_pelanggan: 'Maya Putri', no_hp: '084567890123' },
    { id_pelanggan: 5, nama_pelanggan: 'Arga Wijaya', no_hp: '085678901234' },
    { id_pelanggan: 6, nama_pelanggan: 'Nadia Fernanda', no_hp: '086789012345' },
  ],
  items: [
    { id_item: 1, nama_item: 'Fast Cleaning', jenis_item: 'Jasa', harga: 35000, stok: 0 },
    { id_item: 2, nama_item: 'Deep Cleaning', jenis_item: 'Jasa', harga: 45000, stok: 0 },
    { id_item: 3, nama_item: 'Unyellowing', jenis_item: 'Jasa', harga: 65000, stok: 0 },
    { id_item: 4, nama_item: 'Premium Cleaning', jenis_item: 'Jasa', harga: 85000, stok: 0 },
    { id_item: 5, nama_item: 'Shoe Cleaner', jenis_item: 'Produk', harga: 35000, stok: 35 },
    { id_item: 6, nama_item: 'Shoe Protector', jenis_item: 'Produk', harga: 55000, stok: 20 },
    { id_item: 7, nama_item: 'Cleaning Brush', jenis_item: 'Produk', harga: 25000, stok: 15 },
  ],
  transactions: [
    { id_transaksi: 1, tanggal_transaksi: '2026-09-20', id_pelanggan: 1, id_item: 2, jumlah: 1, total_harga: 45000, metode_pembayaran: 'CASH' },
    { id_transaksi: 2, tanggal_transaksi: '2026-09-21', id_pelanggan: 2, id_item: 5, jumlah: 2, total_harga: 70000, metode_pembayaran: 'QRIS' },
    { id_transaksi: 3, tanggal_transaksi: '2026-09-22', id_pelanggan: 3, id_item: 1, jumlah: 1, total_harga: 35000, metode_pembayaran: 'TRANSFER' },
    { id_transaksi: 4, tanggal_transaksi: '2026-09-23', id_pelanggan: 4, id_item: 3, jumlah: 1, total_harga: 65000, metode_pembayaran: 'CASH' },
    { id_transaksi: 5, tanggal_transaksi: '2026-09-25', id_pelanggan: 5, id_item: 6, jumlah: 1, total_harga: 55000, metode_pembayaran: 'TRANSFER' },
    { id_transaksi: 6, tanggal_transaksi: '2026-09-26', id_pelanggan: 1, id_item: 4, jumlah: 2, total_harga: 170000, metode_pembayaran: 'QRIS' },
  ],
};

if (typeof window !== 'undefined') {
  window.__MASE_MOCK_API__ = mockData;
}

const mockApi = {
  '/api/dashboard': () => {
    const totalPendapatan = mockData.transactions.reduce((sum, item) => sum + Number(item.total_harga || 0), 0);

    return {
      total_pendapatan: totalPendapatan,
      total_transaksi: mockData.transactions.length,
      total_pelanggan: mockData.customers.length,
      total_items: mockData.items.length,
    };
  },

  '/api/pelanggan': () => {
    return mockData.customers.map((pelanggan) => ({
      ...pelanggan,
      jumlah_transaksi: mockData.transactions.filter(
        (transaksi) => Number(transaksi.id_pelanggan) === Number(pelanggan.id_pelanggan),
      ).length,
    }));
  },

  '/api/items': () => mockData.items,

  '/api/transaksi': () => {
    const customerMap = new Map(mockData.customers.map((item) => [item.id_pelanggan, item]));
    const itemMap = new Map(mockData.items.map((item) => [item.id_item, item]));

    return [...mockData.transactions]
      .sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi))
      .map((item) => ({
        ...item,
        pelanggan: customerMap.get(item.id_pelanggan) || null,
        produk_jasa: itemMap.get(item.id_item) || null,
      }));
  },
};

if (typeof window !== 'undefined') {
  window.__MASE_MOCK_API_ROUTES__ = mockApi;
}
