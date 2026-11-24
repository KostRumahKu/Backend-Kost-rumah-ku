export const kontrakPublicBooking = {
  "nama-lengkap": "String (Wajib)",
  "email": "String (Wajib, format email yang valid)",
  "nomor-telepon": "String (Wajib)",
  "nama-kontak-darurat": "String (Wajib)",
  "nomor-kontak-darurat": "String (Wajib)",
  "tipe-kamar": "String (Wajib: 'standart' [lantai 1-3], 'tulip' [khusus lantai 2], atau 'amarilis' [khusus lantai 3])",
  "lantai": "Number (Wajib: 1, 2, atau 3)",
  "durasi-bulan": "Number (Wajib, minimal 1)",
  "tanggal-mulai": "Date (Wajib, format YYYY-MM-DD)"
};

export const kontrakPublicUploadBukti = {
  "id-pemesanan": "string (wajib, ID dari pemesanan kamar)",
  "id-rekening": "string (wajib, ID dari rekening kost yang dipilih penyewa)",
  "bukti-pembayaran": "string (wajib, URL gambar dari CDN)",
};