export const kontrakInputPenghuni = {
  "dataPengguna": {
    "nama-lengkap": "String (Wajib)",
    "email": "String (Wajib, format email yang valid)",
    "nomor-telepon": "String (Opsional)"
  },
  "dataSewa": {
    "durasi-bulan": "Number (Wajib, contoh: 6)",
    "tanggal-mulai": "Date (Wajib, format ISO 8601, contoh: '2026-10-15T00:00:00.000Z')",
    "metode-pembayaran": "String (Wajib, nilai: 'tunai' atau 'transfer-manual')"
  }
};

export const kontrakTambahKamar = {
  "lantai": "Number (Wajib)",
  "tipe-kamar": "String (Wajib, 'kelas-a' atau 'kelas-b')",
  "harga": "Number (Wajib)",
  "fasilitas": "Array of String (Opsional)"
};