const defaultStore = {
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

const mockStore = JSON.parse(JSON.stringify(defaultStore));

function buildDashboard() {
	return {
		total_pendapatan: mockStore.transactions.reduce((sum, transaction) => sum + Number(transaction.total_harga || 0), 0),
		total_transaksi: mockStore.transactions.length,
		total_pelanggan: mockStore.customers.length,
		total_items: mockStore.items.length,
	};
}

function attachRelations(transactions) {
	const customerMap = new Map(mockStore.customers.map((customer) => [Number(customer.id_pelanggan), customer]));
	const employeeMap = new Map(mockStore.employees.map((employee) => [Number(employee.id_karyawan), employee]));
	const itemMap = new Map(mockStore.items.map((item) => [Number(item.id_item), item]));

	return transactions.map((transaction) => ({
		...transaction,
		pelanggan: customerMap.get(Number(transaction.id_pelanggan)) || null,
		karyawan: employeeMap.get(Number(transaction.id_karyawan)) || null,
		produk_jasa: itemMap.get(Number(transaction.id_item)) || null,
	}));
}

function getCustomerList() {
	return mockStore.customers.map((customer) => ({
		...customer,
		jumlah_transaksi: mockStore.transactions.filter((transaction) => Number(transaction.id_pelanggan) === Number(customer.id_pelanggan)).length,
	}));
}

function getEmployeeList() {
	return mockStore.employees.map((employee) => ({
		...employee,
		jumlah_transaksi: mockStore.transactions.filter((transaction) => Number(transaction.id_karyawan) === Number(employee.id_karyawan)).length,
	}));
}

function normalizeTransactionPayload(payload) {
	const item = mockStore.items.find((product) => Number(product.id_item) === Number(payload.id_item));

	if (!item) {
		throw new Error('Produk atau jasa tidak ditemukan.');
	}

	const jumlah = Number(payload.jumlah || 1);
	const idKaryawan = payload.id_karyawan ? Number(payload.id_karyawan) : null;
	if (idKaryawan && !mockStore.employees.some((employee) => Number(employee.id_karyawan) === idKaryawan)) {
		throw new Error('Karyawan tidak ditemukan.');
	}

	return {
		id_pelanggan: Number(payload.id_pelanggan),
		id_item: Number(payload.id_item),
		id_karyawan: idKaryawan,
		jumlah,
		total_harga: Number(item.harga) * jumlah,
		metode_pembayaran: payload.metode_pembayaran || 'CASH',
	};
}

function createResponse(statusCode, data) {
	return {
		statusCode,
		body: data,
	};
}

function routeHandler(req, res) {
	const url = req.url || '/';
	const method = (req.method || 'GET').toUpperCase();

	try {
		if (url === '/api/dashboard') {
			const payload = buildDashboard();
			return res ? res.json(payload) : createResponse(200, payload);
		}

		if (url === '/api/pelanggan') {
			const payload = getCustomerList();
			return res ? res.json(payload) : createResponse(200, payload);
		}

		if (url === '/api/karyawan') {
			if (method === 'POST') {
				const payload = req.body || {};
				const namaKaryawan = String(payload.nama_karyawan || '').trim();
				const noHp = String(payload.no_hp || '').trim();
				const jabatan = String(payload.jabatan || '').trim();
				if (!namaKaryawan || !noHp || !jabatan) {
					throw new Error('Nama, nomor HP, dan jabatan karyawan wajib diisi.');
				}

				const idKaryawan = mockStore.employees.length
					? Math.max(...mockStore.employees.map((employee) => Number(employee.id_karyawan))) + 1
					: 1;
				const employee = { id_karyawan: idKaryawan, nama_karyawan: namaKaryawan, no_hp: noHp, jabatan };
				mockStore.employees.push(employee);
				return res ? res.status(201).json(employee) : createResponse(201, employee);
			}

			const payload = getEmployeeList();
			return res ? res.json(payload) : createResponse(200, payload);
		}

		if (url === '/api/items') {
			return res ? res.json(mockStore.items) : createResponse(200, mockStore.items);
		}

		if (url === '/api/transaksi') {
			if (method === 'POST') {
				const payload = normalizeTransactionPayload(req.body || {});
				const nextId = mockStore.transactions.length
					? Math.max(...mockStore.transactions.map((row) => Number(row.id_transaksi))) + 1
					: 1;

				const newTransaction = {
					id_transaksi: nextId,
					tanggal_transaksi: new Date().toISOString().split('T')[0],
					...payload,
				};

				mockStore.transactions.unshift(newTransaction);

				const response = { success: true, message: 'Transaksi berhasil disimpan.' };
				return res ? res.status(201).json(response) : createResponse(201, response);
			}

			const payload = attachRelations([...mockStore.transactions].sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi)));
			return res ? res.json(payload) : createResponse(200, payload);
		}

		const pelangganMatch = url.match(/^\/api\/pelanggan\/(\d+)$/);
		if (pelangganMatch) {
			const id = Number(pelangganMatch[1]);

			if (method === 'PUT') {
				const payload = req.body || {};
				const index = mockStore.customers.findIndex((customer) => Number(customer.id_pelanggan) === id);

				if (index === -1) {
					throw new Error('Pelanggan tidak ditemukan.');
				}

				if (!String(payload.nama_pelanggan || '').trim()) {
					throw new Error('Nama pelanggan wajib diisi.');
				}

				if (!String(payload.no_hp || '').trim()) {
					throw new Error('Nomor HP wajib diisi.');
				}

				mockStore.customers[index] = {
					...mockStore.customers[index],
					nama_pelanggan: String(payload.nama_pelanggan).trim(),
					no_hp: String(payload.no_hp).trim(),
				};

				const response = { success: true, message: 'Data pelanggan berhasil diperbarui.' };
				return res ? res.json(response) : createResponse(200, response);
			}

			if (method === 'DELETE') {
				const hasTransactions = mockStore.transactions.some((transaction) => Number(transaction.id_pelanggan) === id);
				if (hasTransactions) {
					throw new Error('Pelanggan tidak dapat dihapus karena masih memiliki transaksi.');
				}

				const beforeLength = mockStore.customers.length;
				mockStore.customers = mockStore.customers.filter((customer) => Number(customer.id_pelanggan) !== id);

				if (mockStore.customers.length === beforeLength) {
					throw new Error('Pelanggan tidak ditemukan.');
				}

				const response = { success: true, message: 'Data pelanggan berhasil dihapus.' };
				return res ? res.json(response) : createResponse(200, response);
			}
		}

		const karyawanMatch = url.match(/^\/api\/karyawan\/(\d+)$/);
		if (karyawanMatch) {
			const id = Number(karyawanMatch[1]);

			if (method === 'PUT') {
				const payload = req.body || {};
				const index = mockStore.employees.findIndex((employee) => Number(employee.id_karyawan) === id);
				const namaKaryawan = String(payload.nama_karyawan || '').trim();
				const noHp = String(payload.no_hp || '').trim();
				const jabatan = String(payload.jabatan || '').trim();

				if (index === -1) {
					throw new Error('Karyawan tidak ditemukan.');
				}
				if (!namaKaryawan || !noHp || !jabatan) {
					throw new Error('Nama, nomor HP, dan jabatan karyawan wajib diisi.');
				}

				mockStore.employees[index] = { ...mockStore.employees[index], nama_karyawan: namaKaryawan, no_hp: noHp, jabatan };
				const response = { success: true, message: 'Data karyawan berhasil diperbarui.' };
				return res ? res.json(response) : createResponse(200, response);
			}

			if (method === 'DELETE') {
				if (mockStore.transactions.some((transaction) => Number(transaction.id_karyawan) === id)) {
					throw new Error('Karyawan tidak dapat dihapus karena masih tercatat pada transaksi.');
				}

				const beforeLength = mockStore.employees.length;
				mockStore.employees = mockStore.employees.filter((employee) => Number(employee.id_karyawan) !== id);
				if (mockStore.employees.length === beforeLength) {
					throw new Error('Karyawan tidak ditemukan.');
				}

				const response = { success: true, message: 'Data karyawan berhasil dihapus.' };
				return res ? res.json(response) : createResponse(200, response);
			}
		}

		const itemMatch = url.match(/^\/api\/items\/(\d+)$/);
		if (itemMatch) {
			const id = Number(itemMatch[1]);

			if (method === 'PUT') {
				const payload = req.body || {};
				const index = mockStore.items.findIndex((item) => Number(item.id_item) === id);

				if (index === -1) {
					throw new Error('Produk atau jasa tidak ditemukan.');
				}

				const namaItem = String(payload.nama_item || '').trim();
				const harga = Number(payload.harga || 0);
				const stok = Number(payload.stok || 0);
				const jenisItem = String(payload.jenis_item || 'Produk').trim();

				if (!namaItem) {
					throw new Error('Nama produk atau jasa wajib diisi.');
				}

				if (harga <= 0) {
					throw new Error('Harga produk atau jasa harus lebih dari 0.');
				}

				if (stok < 0) {
					throw new Error('Stok tidak boleh kurang dari 0.');
				}

				mockStore.items[index] = {
					...mockStore.items[index],
					nama_item: namaItem,
					jenis_item: jenisItem === 'Jasa' ? 'Jasa' : 'Produk',
					harga,
					stok,
				};

				const response = { success: true, message: 'Data produk atau jasa berhasil diperbarui.' };
				return res ? res.json(response) : createResponse(200, response);
			}

			if (method === 'DELETE') {
				const hasTransactions = mockStore.transactions.some((transaction) => Number(transaction.id_item) === id);
				if (hasTransactions) {
					throw new Error('Produk atau jasa tidak dapat dihapus karena masih digunakan dalam transaksi.');
				}

				const beforeLength = mockStore.items.length;
				mockStore.items = mockStore.items.filter((item) => Number(item.id_item) !== id);

				if (mockStore.items.length === beforeLength) {
					throw new Error('Produk atau jasa tidak ditemukan.');
				}

				const response = { success: true, message: 'Data produk atau jasa berhasil dihapus.' };
				return res ? res.json(response) : createResponse(200, response);
			}
		}

		const transaksiMatch = url.match(/^\/api\/transaksi\/(\d+)$/);
		if (transaksiMatch) {
			const id = Number(transaksiMatch[1]);

			if (method === 'PUT') {
				const payload = normalizeTransactionPayload({ ...req.body, id_item: req.body?.id_item || mockStore.transactions.find((row) => Number(row.id_transaksi) === id)?.id_item });
				const index = mockStore.transactions.findIndex((row) => Number(row.id_transaksi) === id);

				if (index === -1) {
					throw new Error('Transaksi tidak ditemukan.');
				}

				mockStore.transactions[index] = {
					...mockStore.transactions[index],
					...payload,
				};

				const response = { success: true, message: 'Transaksi berhasil diperbarui.' };
				return res ? res.json(response) : createResponse(200, response);
			}

			if (method === 'DELETE') {
				mockStore.transactions = mockStore.transactions.filter((row) => Number(row.id_transaksi) !== id);
				const response = { success: true, message: 'Transaksi berhasil dihapus.' };
				return res ? res.json(response) : createResponse(200, response);
			}
		}

		const response = { success: false, message: 'Endpoint tidak tersedia.' };
		return res ? res.status(404).json(response) : createResponse(404, response);
	} catch (error) {
		const message = error?.message || 'Terjadi kesalahan pada server.';
		return res ? res.status(400).json({ success: false, message }) : createResponse(400, { success: false, message });
	}
}

module.exports = {
	defaultStore,
	mockStore,
	routeHandler,
	buildDashboard,
	getCustomerList,
	getEmployeeList,
	attachRelations,
};
