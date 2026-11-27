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
    "tanggal-mulai": "string (wajib, tanggal mulai masuk rencana sih ini, dalam format YYYY-MM-DD)",
    "metode-pembayaran": "String (Wajib, nilai: 'tunai' atau 'transfer')",
    "id-rekening": "String (Opsional jika metode-pembayaran = tunai, WAJIB diisi jika metode-pembayaran = 'transfer')"  }
};

export const kontrakTambahKamar = {
  "lantai": "Number (Wajib, 1 - 3)",
  "tipe-kamar": "String (Wajib: 'standart', 'tulip', atau 'amarilis')",
  "nama-kamar": "String (Opsional, otomatis mengikuti nomor ID kamar jika kosong)",
  "foto": "Array of String (Opsional, otomatis menyalin foto dari tipe yang sama jika sudah ada)"
};

export const kontrakUbahKamar = {
  "nama-kamar": "String (Opsional, nama baru untuk kamar)",
  "status": "String (Opsional, nilai harus: 'kosong', 'dipesan', 'terisi', atau 'perbaikan')",
  "foto": "Array of String (Opsional, mengubah foto akan otomatis memperbarui seluruh kamar dengan tipe yang sama)"
};

export const kontrakPindahKamar = {
  "id-pengguna": "String (Wajib, ID penyewa yang akan pindah)",
  "id-kamar-baru": "Number (Wajib, ID kamar tujuan)"
};