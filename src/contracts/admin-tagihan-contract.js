export const KontrakAdminTagihan = {
    "id-atau-invoice" : "string (wajib idTagihan atau invoice yang mau di ambil detail nya)"
}

export const kontrakAdminBalidasiPembayaran = {
    "status-validasi": "string (wajib) ('disetujui' atau 'ditolak').",
    "catatan-admin": "string (optional jika kosong - saja) catatan dari admin"
}

export const kontrakAdminBayarTunggakanManual = {
    "id-tagihan-Dasar": "string (wajib) - id tagihan yang di generate dari /permintaan-tagihan atau dari tagihan yang ada di /tagihan yang belum lunas",
    "jumlah-bulan": "string (wajib) - Jumlah banyak nya penyewa mau bayar sekaligus (contoh: 2 = 2 bulan)",
    "id-rekening": "string (wajib, ID dari rekening kost yang dipilih penyewa)",
    "catatan-admin": "string (optional jika kosong - saja) catatan dari admin"
};