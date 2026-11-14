
export const kontrakPembayaranTagihanPenyewaMultiAtauSingle = {
  "id-tagihan-Dasar": "string (wajib) - id tagihan yang di generate dari /permintaan-tagihan atau dari tagihan yang ada di /tagihan yang belum lunas",
  "jumlah-bulan": "string (wajib) - Jumlah banyak nya penyewa mau bayar sekaligus (contoh: 2 = 2 bulan)",
  "bukti-pembayaran": "string (wajib, URL gambar dari CDN)",
  "id-rekening": "string (wajib, ID dari rekening kost yang dipilih penyewa)",
};
