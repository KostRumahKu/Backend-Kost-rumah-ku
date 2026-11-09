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
  "rekening-tujuan": { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RekeningKost',
    default: null 
  },
  
  'bukti-pembayaran': { type: String }, 
  'tanggal-mulai': { type: Date, required: true }, 
  'batas-waktu-bayar': { type: Date, required: true } 
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pemesanan', pemesananSchema);