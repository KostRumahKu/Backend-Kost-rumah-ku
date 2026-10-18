export const kontrakInputPenghuni = {
  "dataPengguna": {
    "nama-lengkap": "String (Wajib)",
    "email": "String (Wajib, format email yang valid)",
    "nomor-telepon": "String (Wajib)",
    "nama-kontak-darurat": "String (Wajib)",
    "nomor-kontak-darurat": "String (Wajib)"
  },
  "dataSewa": {
    "durasi-bulan": "Number (Wajib, pastikan tidak pakai tanda kutip, contoh: 3)",
    "tanggal-mulai": "Date (Wajib, format ISO 8601)",
    "metode-pembayaran": "String (Wajib, nilai: 'tunai' atau 'transfer-manual')"
  }
};

export const kontrakTambahKamar = {
  "lantai": "Number (Wajib)",
  "tipe-kamar": "String (Wajib, 'tulip' atau 'teratai')",
  "harga": "Number (Wajib)",
};


export const kontrakUbahKamar = {
  "nama-kamar": "String (Opsional, nama baru untuk kamar)",
  "status": "String (Opsional, nilai harus: 'kosong', 'dipesan', 'terisi', atau 'perbaikan')",
  "foto": "Array of String (Opsional, berisi daftar URL atau nama fail foto)"
};