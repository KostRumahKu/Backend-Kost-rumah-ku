export const kontrakPublicBooking = {
  "nama-lengkap": "string (wajib, nama lengkap calon penyewa)",
  "email": "string (wajib, alamat email aktif untuk pengiriman tagihan & kredensial)",
  "nomor-telepon": "string (wajib, nomor WhatsApp aktif)",
  "nama-kontak-darurat": "string (wajib, nama wali/orang tua)",
  "nomor-kontak-darurat": "string (wajib, nomor telepon darurat)",
  "tipe-kamar": "string (wajib, pilihan: 'teratai' atau 'tulip')",
  "lantai": "angka (wajib, pilihan lantai kamar, misal: 1, 2, atau 3)", 
  "durasi-bulan": "angka (wajib, lama sewa dalam bulan, minimal 1)",
  "tanggal-mulai": "tanggal (wajib, format YYYY-MM-DD, estimasi masuk kost)"
};

export const kontrakPublicUploadBukti = {
  "id-pemesanan": "string (wajib, ID dari pemesanan kamar)",
  "id-rekening": "string (wajib, ID dari rekening kost yang dipilih penyewa)",
  "bukti-pembayaran": "string (wajib, URL gambar dari CDN)",
};