import mongoose from 'mongoose';

const pemesananSchema = new mongoose.Schema({
  'id-pengguna': { type: String, ref: 'Pengguna', required: true },
  'id-kamar': { type: Number, ref: 'Kamar', required: true }, // ID Kamar spesifik yang dilock oleh sistem
  'tanggal-pesan': { type: Date, default: Date.now },
  'durasi-bulan': { type: Number, required: true },
  
  'status': { 
    type: String, 
    enum: ['menunggu-pembayaran', 'menunggu-validasi', 'berhasil', 'dibatalkan'], 
    default: 'menunggu-pembayaran' 
  },
  
  'bukti-pembayaran': { type: String }, // Menyimpan URL CDN dari Frontend
  'tanggal-mulai': { type: Date, required: true }, // Rencana tanggal masuk dari form
  'batas-waktu-bayar': { type: Date, required: true } // Kunci untuk sistem Cron Job Timeout
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pemesanan', pemesananSchema);