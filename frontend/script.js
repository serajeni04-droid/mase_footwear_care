const API_BASE_URL = '';
const STORAGE_KEY = 'mase_footwear_care_store_v1';
const supabaseConfig = window.MASE_SUPABASE_CONFIG || {};

function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

async function requestSupabaseEmployees(method, query = '', payload = null) {
  const projectUrl = String(supabaseConfig.url).replace(/\/+$/, '');
  const headers = {
    apikey: supabaseConfig.anonKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  if (!supabaseConfig.anonKey.startsWith('sb_publishable_')) {
    headers.Authorization = `Bearer ${supabaseConfig.anonKey}`;
  }

  const response = await fetch(`${projectUrl}/rest/v1/karyawan${query}`, {
    method,
    headers,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const responseText = await response.text();
  let result = null;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(result?.message || result?.details || `Supabase menolak permintaan (${response.status}).`);
  }

  return result;
}

const state = {
  customers: [],
  employees: [],
  items: [],
  transactions: [],
  dashboard: null,
  editingTransactionId: null,
  editingCustomerId: null,
  editingEmployeeId: null,
  editingItemId: null,
};

function getDefaultStore() {
  return {
    customers: [
      { id_pelanggan: 1, nama_pelanggan: 'Rafi Pratama', no_hp: '081234567890' },
      { id_pelanggan: 2, nama_pelanggan: 'Dinda Salsabila', no_hp: '082345678901' },
      { id_pelanggan: 3, nama_pelanggan: 'Bimo Nugroho', no_hp: '083456789012' },
      { id_pelanggan: 4, nama_pelanggan: 'Maya Putri', no_hp: '084567890123' },
      { id_pelanggan: 5, nama_pelanggan: 'Arga Wijaya', no_hp: '085678901234' },
      { id_pelanggan: 6, nama_pelanggan: 'Nadia Fernanda', no_hp: '086789012345' },
    ],
    employees: [
      { id_karyawan: 1, nama_karyawan: 'Andi Saputra', no_hp: '087700000001', jabatan: 'Teknisi' },
      { id_karyawan: 2, nama_karyawan: 'Siti Rahma', no_hp: '087700000002', jabatan: 'Kasir' },
      { id_karyawan: 3, nama_karyawan: 'Budi Santoso', no_hp: '087700000003', jabatan: 'Admin' },
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
}

function saveMockStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStore));
  } catch (error) {
    console.warn('Gagal menyimpan data ke localStorage:', error);
  }
}

const mockStore = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.customers) && Array.isArray(parsed.items) && Array.isArray(parsed.transactions)) {
        if (!Array.isArray(parsed.employees)) {
          parsed.employees = getDefaultStore().employees;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch (error) {
            console.warn('Gagal memperbarui data karyawan di localStorage:', error);
          }
        }
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Gagal membaca data dari localStorage:', error);
  }

  const defaultStore = getDefaultStore();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  } catch (error) {
    console.warn('Gagal menyimpan data awal ke localStorage:', error);
  }
  return defaultStore;
})();

const elements = {
  customerSelect: document.getElementById('pelangganSelect'),
  employeeSelect: document.getElementById('employeeSelect'),
  itemSelect: document.getElementById('itemSelect'),
  quantityInput: document.getElementById('quantityInput'),
  paymentMethod: document.getElementById('paymentMethod'),
  selectedItemPrice: document.getElementById('selectedItemPrice'),
  selectedQuantity: document.getElementById('selectedQuantity'),
  totalPricePreview: document.getElementById('totalPricePreview'),
  transactionForm: document.getElementById('transaction-form'),
  submitTransactionBtn: document.getElementById('submitTransactionBtn'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  transactionTableBody: document.getElementById('transaction-table-body'),
  customerTableBody: document.getElementById('customer-table-body'),
  employeeTableBody: document.getElementById('employee-table-body'),
  productGrid: document.getElementById('product-grid'),
  toast: document.getElementById('toast'),
  statPendapatan: document.getElementById('stat-total-pendapatan'),
  statTransaksi: document.getElementById('stat-total-transaksi'),
  statPelanggan: document.getElementById('stat-total-pelanggan'),
  statItem: document.getElementById('stat-total-item'),
  addCustomerBtn: document.getElementById('add-customer-btn'),
  addEmployeeBtn: document.getElementById('add-employee-btn'),
  addItemBtn: document.getElementById('add-item-btn'),
  entryModal: document.getElementById('entry-modal'),
  entryModalTitle: document.getElementById('entry-modal-title'),
  entryForm: document.getElementById('entry-form'),
  entryFormFields: document.getElementById('entry-form-fields'),
  closeEntryModalBtn: document.getElementById('close-entry-modal-btn'),
  cancelEntryFormBtn: document.getElementById('cancel-entry-form-btn'),
};

function formatRupiah(value) {
  const raw = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(raw);
}

function formatDateIndonesia(value) {
  if (!value) return '-';

  const date = new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function showToast(message, type = 'success') {
  const toast = elements.toast;
  toast.textContent = message;
  toast.classList.add('show');
  toast.style.background = type === 'error' ? 'rgba(187, 61, 61, 0.96)' : 'rgba(29, 29, 29, 0.94)';

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function mockApiRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    setTimeout(() => {
      try {
        if (url === '/api/dashboard') {
          return resolve({
            total_pendapatan: mockStore.transactions.reduce((sum, item) => sum + Number(item.total_harga || 0), 0),
            total_transaksi: mockStore.transactions.length,
            total_pelanggan: mockStore.customers.length,
            total_items: mockStore.items.length,
          });
        }

        if (url === '/api/pelanggan') {
          return resolve(
            mockStore.customers.map((pelanggan) => ({
              ...pelanggan,
              jumlah_transaksi: mockStore.transactions.filter(
                (transaksi) => Number(transaksi.id_pelanggan) === Number(pelanggan.id_pelanggan),
              ).length,
            })),
          );
        }

        if (url === '/api/karyawan') {
          if (method === 'POST') {
            const payload = JSON.parse(options.body || '{}');
            const namaKaryawan = String(payload.nama_karyawan || '').trim();
            const noHp = String(payload.no_hp || '').trim();
            const jabatan = String(payload.jabatan || '').trim();

            if (!namaKaryawan || !noHp || !jabatan) {
              return reject(new Error('Nama, nomor HP, dan jabatan karyawan wajib diisi.'));
            }

            const nextId = mockStore.employees.length
              ? Math.max(...mockStore.employees.map((employee) => Number(employee.id_karyawan))) + 1
              : 1;
            const employee = { id_karyawan: nextId, nama_karyawan: namaKaryawan, no_hp: noHp, jabatan };
            mockStore.employees.push(employee);
            saveMockStore();
            return resolve(employee);
          }

          return resolve(
            mockStore.employees.map((employee) => ({
              ...employee,
              jumlah_transaksi: mockStore.transactions.filter(
                (transaction) => Number(transaction.id_karyawan) === Number(employee.id_karyawan),
              ).length,
            })),
          );
        }

        if (url.startsWith('/api/karyawan/')) {
          const id = Number(url.split('/').pop());

          if (method === 'PUT') {
            const payload = JSON.parse(options.body || '{}');
            const namaKaryawan = String(payload.nama_karyawan || '').trim();
            const noHp = String(payload.no_hp || '').trim();
            const jabatan = String(payload.jabatan || '').trim();
            const employeeIndex = mockStore.employees.findIndex((employee) => Number(employee.id_karyawan) === id);

            if (employeeIndex === -1) {
              return reject(new Error('Karyawan tidak ditemukan.'));
            }

            if (!namaKaryawan || !noHp || !jabatan) {
              return reject(new Error('Nama, nomor HP, dan jabatan karyawan wajib diisi.'));
            }

            mockStore.employees[employeeIndex] = {
              ...mockStore.employees[employeeIndex],
              nama_karyawan: namaKaryawan,
              no_hp: noHp,
              jabatan,
            };

            saveMockStore();
            return resolve({ success: true, message: 'Data karyawan berhasil diperbarui.' });
          }

          if (method === 'DELETE') {
            const hasTransactions = mockStore.transactions.some(
              (transaction) => Number(transaction.id_karyawan) === id,
            );

            if (hasTransactions) {
              return reject(new Error('Karyawan tidak dapat dihapus karena masih tercatat pada transaksi.'));
            }

            const beforeLength = mockStore.employees.length;
            mockStore.employees = mockStore.employees.filter((employee) => Number(employee.id_karyawan) !== id);

            if (mockStore.employees.length === beforeLength) {
              return reject(new Error('Karyawan tidak ditemukan.'));
            }

            saveMockStore();
            return resolve({ success: true, message: 'Data karyawan berhasil dihapus.' });
          }
        }

        if (url.startsWith('/api/pelanggan/')) {
          const id = Number(url.split('/').pop());

          if (method === 'PUT') {
            const payload = JSON.parse(options.body || '{}');
            const namaPelanggan = String(payload.nama_pelanggan || '').trim();
            const noHp = String(payload.no_hp || '').trim();
            const customerIndex = mockStore.customers.findIndex((customer) => Number(customer.id_pelanggan) === id);

            if (customerIndex === -1) {
              return reject(new Error('Pelanggan tidak ditemukan.'));
            }

            if (!namaPelanggan) {
              return reject(new Error('Nama pelanggan wajib diisi.'));
            }

            if (!noHp) {
              return reject(new Error('Nomor HP wajib diisi.'));
            }

            mockStore.customers[customerIndex] = {
              ...mockStore.customers[customerIndex],
              nama_pelanggan: namaPelanggan,
              no_hp: noHp,
            };

            saveMockStore();
            return resolve({ success: true, message: 'Data pelanggan berhasil diperbarui.' });
          }

          if (method === 'DELETE') {
            const hasTransactions = mockStore.transactions.some(
              (transaction) => Number(transaction.id_pelanggan) === id,
            );

            if (hasTransactions) {
              return reject(new Error('Pelanggan tidak dapat dihapus karena masih memiliki transaksi.'));
            }

            const beforeLength = mockStore.customers.length;
            mockStore.customers = mockStore.customers.filter((customer) => Number(customer.id_pelanggan) !== id);

            if (mockStore.customers.length === beforeLength) {
              return reject(new Error('Pelanggan tidak ditemukan.'));
            }

            saveMockStore();
            return resolve({ success: true, message: 'Data pelanggan berhasil dihapus.' });
          }
        }

        if (url.startsWith('/api/items/')) {
          const id = Number(url.split('/').pop());

          if (method === 'PUT') {
            const payload = JSON.parse(options.body || '{}');
            const namaItem = String(payload.nama_item || '').trim();
            const jenisItem = String(payload.jenis_item || 'Produk').trim();
            const harga = Number(payload.harga || 0);
            const stok = Number(payload.stok || 0);
            const itemIndex = mockStore.items.findIndex((item) => Number(item.id_item) === id);

            if (itemIndex === -1) {
              return reject(new Error('Produk atau jasa tidak ditemukan.'));
            }

            if (!namaItem) {
              return reject(new Error('Nama produk atau jasa wajib diisi.'));
            }

            if (harga <= 0) {
              return reject(new Error('Harga produk atau jasa harus lebih dari 0.'));
            }

            if (stok < 0) {
              return reject(new Error('Stok tidak boleh kurang dari 0.'));
            }

            mockStore.items[itemIndex] = {
              ...mockStore.items[itemIndex],
              nama_item: namaItem,
              jenis_item: jenisItem === 'Jasa' ? 'Jasa' : 'Produk',
              harga,
              stok,
            };

            saveMockStore();
            return resolve({ success: true, message: 'Data produk atau jasa berhasil diperbarui.' });
          }

          if (method === 'DELETE') {
            const hasTransactions = mockStore.transactions.some(
              (transaction) => Number(transaction.id_item) === id,
            );

            if (hasTransactions) {
              return reject(new Error('Produk atau jasa tidak dapat dihapus karena masih digunakan dalam transaksi.'));
            }

            const beforeLength = mockStore.items.length;
            mockStore.items = mockStore.items.filter((item) => Number(item.id_item) !== id);

            if (mockStore.items.length === beforeLength) {
              return reject(new Error('Produk atau jasa tidak ditemukan.'));
            }

            saveMockStore();
            return resolve({ success: true, message: 'Data produk atau jasa berhasil dihapus.' });
          }
        }

        if (url === '/api/items') {
          return resolve(mockStore.items);
        }

        if (url === '/api/transaksi' && method === 'POST') {
          const payload = JSON.parse(options.body || '{}');
          const item = mockStore.items.find((product) => Number(product.id_item) === Number(payload.id_item));

          if (!item) {
            return reject(new Error('Produk atau jasa tidak ditemukan.'));
          }

          const nextId = mockStore.transactions.length
            ? Math.max(...mockStore.transactions.map((row) => Number(row.id_transaksi))) + 1
            : 1;

          const newTransaction = {
            id_transaksi: nextId,
            tanggal_transaksi: new Date().toISOString().split('T')[0],
            id_pelanggan: Number(payload.id_pelanggan),
            id_item: Number(payload.id_item),
            id_karyawan: payload.id_karyawan ? Number(payload.id_karyawan) : null,
            jumlah: Number(payload.jumlah),
            total_harga: Number(item.harga) * Number(payload.jumlah),
            metode_pembayaran: payload.metode_pembayaran,
          };

          mockStore.transactions.unshift(newTransaction);
          saveMockStore();
          return resolve({ success: true, message: 'Transaksi berhasil disimpan.' });
        }

        if (url === '/api/transaksi') {
          const customerMap = new Map(mockStore.customers.map((item) => [item.id_pelanggan, item]));
          const itemMap = new Map(mockStore.items.map((item) => [item.id_item, item]));
          const employeeMap = new Map(mockStore.employees.map((employee) => [employee.id_karyawan, employee]));

          return resolve(
            [...mockStore.transactions]
              .sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi))
              .map((item) => ({
                ...item,
                pelanggan: customerMap.get(item.id_pelanggan) || null,
                produk_jasa: itemMap.get(item.id_item) || null,
                karyawan: employeeMap.get(item.id_karyawan) || null,
              })),
          );
        }

        if (url.startsWith('/api/transaksi/')) {
          const id = Number(url.split('/').pop());

          if (method === 'DELETE') {
            mockStore.transactions = mockStore.transactions.filter((row) => Number(row.id_transaksi) !== id);
            saveMockStore();
            return resolve({ success: true, message: 'Transaksi berhasil dihapus.' });
          }

          if (method === 'PUT') {
            const payload = JSON.parse(options.body || '{}');
            const index = mockStore.transactions.findIndex((row) => Number(row.id_transaksi) === id);
            if (index === -1) {
              return reject(new Error('Transaksi tidak ditemukan.'));
            }

            const item = mockStore.items.find((product) => Number(product.id_item) === Number(payload.id_item || mockStore.transactions[index].id_item));
            if (!item) {
              return reject(new Error('Produk atau jasa tidak ditemukan.'));
            }

            const newJumlah = payload.jumlah !== undefined ? Number(payload.jumlah) : mockStore.transactions[index].jumlah;
            mockStore.transactions[index] = {
              ...mockStore.transactions[index],
              id_pelanggan: payload.id_pelanggan !== undefined ? Number(payload.id_pelanggan) : mockStore.transactions[index].id_pelanggan,
              id_item: payload.id_item !== undefined ? Number(payload.id_item) : mockStore.transactions[index].id_item,
              id_karyawan: payload.id_karyawan ? Number(payload.id_karyawan) : null,
              jumlah: newJumlah,
              total_harga: Number(item.harga) * newJumlah,
              metode_pembayaran: payload.metode_pembayaran || mockStore.transactions[index].metode_pembayaran,
            };

            saveMockStore();
            return resolve({ success: true, message: 'Transaksi berhasil diperbarui.' });
          }
        }

        reject(new Error('Endpoint tidak tersedia'));
      } catch (error) {
        reject(error);
      }
    }, 250);
  });
}

async function fetchData(url) {
  if (url === '/api/karyawan' && isSupabaseConfigured()) {
    return requestSupabaseEmployees('GET', '?select=*&order=id_karyawan.asc');
  }

  const response = await mockApiRequest(url, { method: 'GET' });
  return response;
}

async function sendData(url, method, payload) {
  if (isSupabaseConfigured() && url === '/api/karyawan' && method === 'POST') {
    const result = await requestSupabaseEmployees('POST', '', payload);
    return result?.[0] || result;
  }

  const employeeMatch = url.match(/^\/api\/karyawan\/(\d+)$/);
  if (isSupabaseConfigured() && employeeMatch && ['PUT', 'DELETE'].includes(method)) {
    const result = await requestSupabaseEmployees(
      method === 'PUT' ? 'PATCH' : 'DELETE',
      `?id_karyawan=eq.${employeeMatch[1]}`,
      method === 'PUT' ? payload : null,
    );

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Data karyawan tidak ditemukan atau tidak dapat diubah.');
    }

    return result[0];
  }

  const response = await mockApiRequest(url, {
    method,
    body: JSON.stringify(payload),
  });

  return response;
}

function renderCustomerOptions() {
  elements.customerSelect.innerHTML = '<option value="">Pilih pelanggan</option>';

  state.customers.forEach((customer) => {
    const option = document.createElement('option');
    option.value = customer.id_pelanggan;
    option.textContent = customer.nama_pelanggan;
    elements.customerSelect.appendChild(option);
  });
}

function renderItemOptions() {
  elements.itemSelect.innerHTML = '<option value="">Pilih item</option>';

  state.items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id_item;
    option.textContent = `${item.nama_item} (${item.jenis_item})`;
    elements.itemSelect.appendChild(option);
  });
}

function renderEmployeeOptions() {
  elements.employeeSelect.innerHTML = '<option value="">Pilih karyawan (opsional)</option>';

  state.employees.forEach((employee) => {
    const option = document.createElement('option');
    option.value = employee.id_karyawan;
    option.textContent = `${employee.nama_karyawan} (${employee.jabatan})`;
    elements.employeeSelect.appendChild(option);
  });
}

function updatePricePreview() {
  const selectedItemId = Number(elements.itemSelect.value);
  const quantity = Number(elements.quantityInput.value) || 1;
  const selectedItem = state.items.find((item) => Number(item.id_item) === Number(selectedItemId));

  elements.selectedQuantity.textContent = quantity;

  if (!selectedItem) {
    elements.selectedItemPrice.textContent = formatRupiah(0);
    elements.totalPricePreview.textContent = formatRupiah(0);
    return;
  }

  const price = Number(selectedItem.harga || 0);
  const total = price * quantity;

  elements.selectedItemPrice.textContent = formatRupiah(price);
  elements.totalPricePreview.textContent = formatRupiah(total);
}

function renderDashboard() {
  const dashboard = state.dashboard || {
    total_pendapatan: 0,
    total_transaksi: 0,
    total_pelanggan: 0,
    total_items: 0,
  };

  elements.statPendapatan.textContent = formatRupiah(dashboard.total_pendapatan || 0);
  elements.statTransaksi.textContent = `${dashboard.total_transaksi || 0} transaksi`;
  elements.statPelanggan.textContent = `${dashboard.total_pelanggan || 0} pelanggan`;
  elements.statItem.textContent = `${dashboard.total_items || 0} item`;
}

function renderTransactions() {
  if (!state.transactions.length) {
    elements.transactionTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">Belum ada transaksi. Silakan tambahkan transaksi baru.</td>
      </tr>
    `;
    return;
  }

  elements.transactionTableBody.innerHTML = state.transactions
    .map((transaction) => {
      const paymentClass = (transaction.metode_pembayaran || 'CASH').toLowerCase();
      const itemType = (transaction.produk_jasa?.jenis_item || 'Produk').toLowerCase();
      const paymentLabel = transaction.metode_pembayaran || 'CASH';
      const itemTypeLabel = transaction.produk_jasa?.jenis_item || 'Produk';

      return `
        <tr>
          <td>#${transaction.id_transaksi}</td>
          <td>${formatDateIndonesia(transaction.tanggal_transaksi)}</td>
          <td>${transaction.pelanggan?.nama_pelanggan || '-'}</td>
          <td>${transaction.karyawan?.nama_karyawan || '-'}</td>
          <td>${transaction.produk_jasa?.nama_item || '-'}</td>
          <td><span class="badge ${itemType === 'jasa' ? 'type-jasa' : 'type-produk'}">${itemTypeLabel}</span></td>
          <td>${transaction.jumlah}</td>
          <td>${formatRupiah(transaction.total_harga)}</td>
          <td><span class="badge payment-${paymentClass}">${paymentLabel}</span></td>
          <td>
            <button class="action-btn edit" data-action="edit" data-id="${transaction.id_transaksi}">Edit</button>
            <button class="action-btn delete" data-action="delete" data-id="${transaction.id_transaksi}">Hapus</button>
          </td>
        </tr>
      `;
    })
    .join('');

  elements.transactionTableBody.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => handleEditTransaction(Number(button.dataset.id)));
  });

  elements.transactionTableBody.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteTransaction(Number(button.dataset.id)));
  });
}

function renderCustomers() {
  if (!state.customers.length) {
    elements.customerTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">Belum ada data pelanggan.</td>
      </tr>
    `;
    return;
  }

  elements.customerTableBody.innerHTML = state.customers
    .map(
      (customer) => `
        <tr>
          <td>${customer.id_pelanggan}</td>
          <td>${customer.nama_pelanggan}</td>
          <td>${customer.no_hp || '-'}</td>
          <td>${customer.jumlah_transaksi || 0}</td>
          <td>
            <button class="action-btn edit" data-customer-action="edit" data-id="${customer.id_pelanggan}">Edit</button>
            <button class="action-btn delete" data-customer-action="delete" data-id="${customer.id_pelanggan}">Hapus</button>
          </td>
        </tr>
      `,
    )
    .join('');

  elements.customerTableBody.querySelectorAll('[data-customer-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => openCustomerModal(Number(button.dataset.id)));
  });

  elements.customerTableBody.querySelectorAll('[data-customer-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteCustomer(Number(button.dataset.id)));
  });
}

function renderEmployees() {
  if (!state.employees.length) {
    elements.employeeTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada data karyawan.</td></tr>';
    return;
  }

  elements.employeeTableBody.innerHTML = state.employees
    .map((employee) => `
      <tr>
        <td>${employee.id_karyawan}</td>
        <td>${employee.nama_karyawan}</td>
        <td>${employee.no_hp || '-'}</td>
        <td>${employee.jabatan}</td>
        <td>${employee.jumlah_transaksi || 0}</td>
        <td>
          <button class="action-btn edit" data-employee-action="edit" data-id="${employee.id_karyawan}">Edit</button>
          <button class="action-btn delete" data-employee-action="delete" data-id="${employee.id_karyawan}">Hapus</button>
        </td>
      </tr>
    `)
    .join('');

  elements.employeeTableBody.querySelectorAll('[data-employee-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => openEmployeeModal(Number(button.dataset.id)));
  });

  elements.employeeTableBody.querySelectorAll('[data-employee-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteEmployee(Number(button.dataset.id)));
  });
}

function renderProducts() {
  if (!state.items.length) {
    elements.productGrid.innerHTML = '<div class="empty-state">Belum ada produk atau jasa.</div>';
    return;
  }

  elements.productGrid.innerHTML = state.items
    .map(
      (item) => `
        <div class="product-card">
          <div class="product-card-top">
            <span class="badge ${item.jenis_item === 'Jasa' ? 'type-jasa' : 'type-produk'}">${item.jenis_item}</span>
            <span>Stok: ${item.stok}</span>
          </div>
          <h4>${item.nama_item}</h4>
          <small>${item.jenis_item}</small>
          <div class="price">${formatRupiah(item.harga)}</div>

          <div class="product-card-actions">
            <button class="action-btn edit" data-item-action="edit" data-id="${item.id_item}">Edit</button>
            <button class="action-btn delete" data-item-action="delete" data-id="${item.id_item}">Hapus</button>
          </div>
        </div>
      `,
    )
    .join('');

  elements.productGrid.querySelectorAll('[data-item-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => openItemModal(Number(button.dataset.id)));
  });

  elements.productGrid.querySelectorAll('[data-item-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteItem(Number(button.dataset.id)));
  });
}

function closeEntryModal() {
  state.editingCustomerId = null;
  state.editingEmployeeId = null;
  state.editingItemId = null;
  elements.entryModal.classList.add('hidden');
  elements.entryModal.setAttribute('aria-hidden', 'true');
  elements.entryForm.reset();
}

function openEmployeeModal(employeeId = null) {
  const isEditing = Boolean(employeeId);
  const employee = isEditing ? state.employees.find((item) => Number(item.id_karyawan) === Number(employeeId)) : null;

  elements.entryModalTitle.textContent = isEditing ? 'Edit Karyawan' : 'Tambah Karyawan';
  state.editingEmployeeId = isEditing ? Number(employeeId) : null;
  elements.entryFormFields.innerHTML = `
    <div class="field-group">
      <label for="employee-name">Nama karyawan</label>
      <input id="employee-name" name="nama_karyawan" type="text" maxlength="60" placeholder="Masukkan nama karyawan" value="${employee?.nama_karyawan || ''}" required />
    </div>
    <div class="field-group">
      <label for="employee-phone">No. HP</label>
      <input id="employee-phone" name="no_hp" type="tel" maxlength="20" placeholder="Contoh: 081234567890" value="${employee?.no_hp || ''}" required />
    </div>
    <div class="field-group">
      <label for="employee-role">Jabatan</label>
      <input id="employee-role" name="jabatan" type="text" maxlength="40" placeholder="Contoh: Teknisi" value="${employee?.jabatan || ''}" required />
    </div>
  `;

  elements.entryModal.classList.remove('hidden');
  elements.entryModal.setAttribute('aria-hidden', 'false');
  document.getElementById('employee-name').focus();
}

function openCustomerModal(customerId = null) {
  const isEditing = Boolean(customerId);
  const customer = isEditing ? state.customers.find((item) => Number(item.id_pelanggan) === Number(customerId)) : null;

  elements.entryModalTitle.textContent = isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan';
  state.editingCustomerId = isEditing ? Number(customerId) : null;

  elements.entryFormFields.innerHTML = `
    <div class="field-group">
      <label for="customer-name">Nama pelanggan</label>
      <input id="customer-name" name="nama_pelanggan" type="text" maxlength="60" placeholder="Masukkan nama pelanggan" value="${customer?.nama_pelanggan || ''}" required />
    </div>
    <div class="field-group">
      <label for="customer-phone">No. HP</label>
      <input id="customer-phone" name="no_hp" type="tel" maxlength="20" placeholder="Contoh: 081234567890" value="${customer?.no_hp || ''}" required />
    </div>
  `;

  elements.entryModal.classList.remove('hidden');
  elements.entryModal.setAttribute('aria-hidden', 'false');
  document.getElementById('customer-name').focus();
}

function openItemModal(itemId = null) {
  const isEditing = Boolean(itemId);
  const item = isEditing ? state.items.find((currentItem) => Number(currentItem.id_item) === Number(itemId)) : null;

  elements.entryModalTitle.textContent = isEditing ? 'Edit Produk & Jasa' : 'Tambah Produk & Jasa';
  state.editingItemId = isEditing ? Number(itemId) : null;

  elements.entryFormFields.innerHTML = `
    <div class="field-group">
      <label for="item-name">Nama item</label>
      <input id="item-name" name="nama_item" type="text" maxlength="60" placeholder="Contoh: Premium Cleaning" value="${item?.nama_item || ''}" required />
    </div>
    <div class="field-group">
      <label for="item-type">Jenis</label>
      <select id="item-type" name="jenis_item" required>
        <option value="Jasa" ${item?.jenis_item === 'Jasa' ? 'selected' : ''}>Jasa</option>
        <option value="Produk" ${item?.jenis_item === 'Produk' ? 'selected' : ''}>Produk</option>
      </select>
    </div>
    <div class="field-group">
      <label for="item-price">Harga</label>
      <input id="item-price" name="harga" type="number" min="1000" step="1000" placeholder="50000" value="${item?.harga || ''}" required />
    </div>
    <div class="field-group">
      <label for="item-stock">Stok</label>
      <input id="item-stock" name="stok" type="number" min="0" step="1" placeholder="0" value="${item?.stok || 0}" required />
    </div>
  `;
  elements.entryModal.classList.remove('hidden');
  elements.entryModal.setAttribute('aria-hidden', 'false');
  document.getElementById('item-name').focus();
}

async function handleEntrySubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const modalTitle = elements.entryModalTitle.textContent;

  if (modalTitle.includes('Karyawan')) {
    const namaKaryawan = String(formData.get('nama_karyawan') || '').trim();
    const noHp = String(formData.get('no_hp') || '').trim();
    const jabatan = String(formData.get('jabatan') || '').trim();

    if (!namaKaryawan || !noHp || !jabatan) {
      showToast('Nama, nomor HP, dan jabatan karyawan wajib diisi.', 'error');
      return;
    }

    if (state.editingEmployeeId) {
      try {
        await sendData(`/api/karyawan/${state.editingEmployeeId}`, 'PUT', {
          nama_karyawan: namaKaryawan,
          no_hp: noHp,
          jabatan,
        });
        closeEntryModal();
        await refreshAllData();
        showToast('Data karyawan berhasil diperbarui.', 'success');
      } catch (error) {
        showToast(error.message || 'Gagal memperbarui karyawan.', 'error');
      }
      return;
    }

    try {
      await sendData('/api/karyawan', 'POST', {
        nama_karyawan: namaKaryawan,
        no_hp: noHp,
        jabatan,
      });
      closeEntryModal();
      await refreshAllData();
      showToast('Karyawan berhasil ditambahkan.', 'success');
    } catch (error) {
      showToast(error.message || 'Gagal menambahkan karyawan.', 'error');
    }
    return;
  }

  if (modalTitle.includes('Pelanggan')) {
    const namaPelanggan = String(formData.get('nama_pelanggan') || '').trim();
    const noHp = String(formData.get('no_hp') || '').trim();

    if (!namaPelanggan) {
      showToast('Nama pelanggan wajib diisi.', 'error');
      return;
    }

    if (!noHp) {
      showToast('Nomor HP wajib diisi.', 'error');
      return;
    }

    if (state.editingCustomerId) {
      try {
        await sendData(`/api/pelanggan/${state.editingCustomerId}`, 'PUT', {
          nama_pelanggan: namaPelanggan,
          no_hp: noHp,
        });

        closeEntryModal();
        await refreshAllData();
        showToast('Data pelanggan berhasil diperbarui.', 'success');
        return;
      } catch (error) {
        showToast(error.message || 'Gagal memperbarui pelanggan', 'error');
        return;
      }
    }

    const nextId = mockStore.customers.length ? Math.max(...mockStore.customers.map((item) => Number(item.id_pelanggan))) + 1 : 1;
    mockStore.customers.push({
      id_pelanggan: nextId,
      nama_pelanggan: namaPelanggan,
      no_hp: noHp,
    });
    saveMockStore();

    closeEntryModal();
    await refreshAllData();
    showToast('Pelanggan berhasil ditambahkan', 'success');
    return;
  }

  const namaItem = String(formData.get('nama_item') || '').trim();
  const jenisItem = String(formData.get('jenis_item') || 'Produk');
  const harga = Number(formData.get('harga') || 0);
  const stok = Number(formData.get('stok') || 0);

  if (!namaItem) {
    showToast('Nama produk atau jasa wajib diisi.', 'error');
    return;
  }

  if (harga <= 0) {
    showToast('Harga produk atau jasa harus lebih dari 0.', 'error');
    return;
  }

  if (stok < 0) {
    showToast('Stok tidak boleh kurang dari 0.', 'error');
    return;
  }

  if (state.editingItemId) {
    try {
      await sendData(`/api/items/${state.editingItemId}`, 'PUT', {
        nama_item: namaItem,
        jenis_item: jenisItem,
        harga,
        stok: Math.max(0, stok),
      });

      closeEntryModal();
      await refreshAllData();
      showToast('Data produk atau jasa berhasil diperbarui.', 'success');
      return;
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui produk atau jasa', 'error');
      return;
    }
  }

  const nextId = mockStore.items.length ? Math.max(...mockStore.items.map((item) => Number(item.id_item))) + 1 : 1;
  mockStore.items.push({
    id_item: nextId,
    nama_item: namaItem,
    jenis_item: jenisItem,
    harga,
    stok: Math.max(0, stok),
  });
  saveMockStore();

  closeEntryModal();
  await refreshAllData();
  showToast('Produk atau jasa berhasil ditambahkan', 'success');
}

async function loadDashboard() {
  const dashboard = await fetchData('/api/dashboard');
  state.dashboard = dashboard;
  renderDashboard();
}

async function loadCustomers() {
  const data = await fetchData('/api/pelanggan');
  state.customers = data;
  renderCustomerOptions();
  renderCustomers();
}

async function loadEmployees() {
  const data = await fetchData('/api/karyawan');
  state.employees = data;
  mockStore.employees = data;
  saveMockStore();
  renderEmployeeOptions();
  renderEmployees();
}

async function loadItems() {
  const data = await fetchData('/api/items');
  state.items = data;
  renderItemOptions();
  renderProducts();
  updatePricePreview();
}

async function loadTransactions() {
  const data = await fetchData('/api/transaksi');
  state.transactions = data;
  renderTransactions();
}

async function refreshAllData() {
  try {
    await Promise.all([loadDashboard(), loadCustomers(), loadEmployees(), loadItems(), loadTransactions()]);
  } catch (error) {
    showToast(error.message || 'Terjadi kesalahan saat memuat data', 'error');
  }
}

function resetForm() {
  state.editingTransactionId = null;
  elements.transactionForm.reset();
  elements.quantityInput.value = 1;
  elements.submitTransactionBtn.textContent = 'Simpan Transaksi';
  elements.cancelEditBtn.classList.add('hidden');
  updatePricePreview();
}

async function handleSubmitTransaction(event) {
  event.preventDefault();

  const idPelanggan = Number(elements.customerSelect.value);
  const idItem = Number(elements.itemSelect.value);
  const jumlah = Number(elements.quantityInput.value);
  const metodePembayaran = elements.paymentMethod.value;
  const idKaryawan = Number(elements.employeeSelect.value) || null;

  if (!idPelanggan || !idItem || !jumlah || !metodePembayaran) {
    showToast('Semua field harus diisi dengan benar.', 'error');
    return;
  }

  const payload = {
    id_pelanggan: idPelanggan,
    id_item: idItem,
    id_karyawan: idKaryawan,
    jumlah,
    metode_pembayaran: metodePembayaran,
  };

  try {
    const result = state.editingTransactionId
      ? await sendData(`/api/transaksi/${state.editingTransactionId}`, 'PUT', payload)
      : await sendData('/api/transaksi', 'POST', payload);

    showToast(
      state.editingTransactionId ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil disimpan',
      'success',
    );

    resetForm();
    await refreshAllData();
  } catch (error) {
    showToast(error.message || 'Gagal menyimpan transaksi', 'error');
  }
}

function handleEditTransaction(id) {
  const transaction = state.transactions.find((item) => Number(item.id_transaksi) === Number(id));

  if (!transaction) {
    showToast('Transaksi tidak ditemukan.', 'error');
    return;
  }

  state.editingTransactionId = id;
  elements.customerSelect.value = transaction.id_pelanggan;
  elements.itemSelect.value = transaction.id_item;
  elements.employeeSelect.value = transaction.id_karyawan || '';
  elements.quantityInput.value = transaction.jumlah;
  elements.paymentMethod.value = transaction.metode_pembayaran;
  elements.submitTransactionBtn.textContent = 'Perbarui Transaksi';
  elements.cancelEditBtn.classList.remove('hidden');
  updatePricePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDeleteTransaction(id) {
  const transaction = state.transactions.find((item) => Number(item.id_transaksi) === Number(id));

  if (!transaction) {
    showToast('Transaksi tidak ditemukan.', 'error');
    return;
  }

  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus transaksi #${transaction.id_transaksi}?`);
  if (!confirmed) {
    return;
  }

  try {
    await sendData(`/api/transaksi/${id}`, 'DELETE', {});
    showToast('Transaksi berhasil dihapus', 'success');

    if (state.editingTransactionId === id) {
      resetForm();
    }

    await refreshAllData();
  } catch (error) {
    showToast(error.message || 'Gagal menghapus transaksi', 'error');
  }
}

async function handleDeleteCustomer(id) {
  const customer = state.customers.find((item) => Number(item.id_pelanggan) === Number(id));

  if (!customer) {
    showToast('Pelanggan tidak ditemukan.', 'error');
    return;
  }

  const hasTransactions = state.transactions.some(
    (transaction) => Number(transaction.id_pelanggan) === Number(id),
  );

  if (hasTransactions) {
    showToast('Pelanggan tidak dapat dihapus karena masih memiliki transaksi.', 'error');
    return;
  }

  const confirmed = window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?');
  if (!confirmed) {
    return;
  }

  try {
    await sendData(`/api/pelanggan/${id}`, 'DELETE', {});
    showToast('Data pelanggan berhasil dihapus.', 'success');
    await refreshAllData();
  } catch (error) {
    showToast(error.message || 'Gagal menghapus pelanggan', 'error');
  }
}

async function handleDeleteItem(id) {
  const item = state.items.find((currentItem) => Number(currentItem.id_item) === Number(id));

  if (!item) {
    showToast('Produk atau jasa tidak ditemukan.', 'error');
    return;
  }

  const hasTransactions = state.transactions.some(
    (transaction) => Number(transaction.id_item) === Number(id),
  );

  if (hasTransactions) {
    showToast('Produk atau jasa tidak dapat dihapus karena masih digunakan dalam transaksi.', 'error');
    return;
  }

  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus ${item.nama_item}?`);
  if (!confirmed) {
    return;
  }

  try {
    await sendData(`/api/items/${id}`, 'DELETE', {});
    showToast('Data produk atau jasa berhasil dihapus.', 'success');
    await refreshAllData();
  } catch (error) {
    showToast(error.message || 'Gagal menghapus produk atau jasa', 'error');
  }
}

async function handleDeleteEmployee(id) {
  const employee = state.employees.find((item) => Number(item.id_karyawan) === Number(id));

  if (!employee) {
    showToast('Karyawan tidak ditemukan.', 'error');
    return;
  }

  if (state.transactions.some((transaction) => Number(transaction.id_karyawan) === Number(id))) {
    showToast('Karyawan tidak dapat dihapus karena masih tercatat pada transaksi.', 'error');
    return;
  }

  if (!window.confirm(`Apakah Anda yakin ingin menghapus karyawan ${employee.nama_karyawan}?`)) {
    return;
  }

  try {
    await sendData(`/api/karyawan/${id}`, 'DELETE', {});
    await refreshAllData();
    showToast('Data karyawan berhasil dihapus.', 'success');
  } catch (error) {
    showToast(error.message || 'Gagal menghapus karyawan.', 'error');
  }
}

function initEvents() {
  elements.itemSelect.addEventListener('change', updatePricePreview);
  elements.quantityInput.addEventListener('input', updatePricePreview);
  elements.transactionForm.addEventListener('submit', handleSubmitTransaction);
  elements.cancelEditBtn.addEventListener('click', resetForm);
  elements.addCustomerBtn.addEventListener('click', openCustomerModal);
  elements.addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
  elements.addItemBtn.addEventListener('click', openItemModal);
  elements.closeEntryModalBtn.addEventListener('click', closeEntryModal);
  elements.cancelEntryFormBtn.addEventListener('click', closeEntryModal);
  elements.entryForm.addEventListener('submit', handleEntrySubmit);
  elements.entryModal.addEventListener('click', (event) => {
    if (event.target === elements.entryModal) {
      closeEntryModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  refreshAllData();
});
