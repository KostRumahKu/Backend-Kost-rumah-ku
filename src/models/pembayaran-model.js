import mongoose from 'mongoose';

const pembayaranSchema = new mongoose.Schema({
  'id-tagihan': { type: mongoose.Schema.Types.ObjectId, ref: 'Tagihan', required: true },
  'jumlah-bayar': { type: Number, required: true },
  'metode-pembayaran': { type: String, enum: ['transfer-manual', 'tunai', 'Qris'], required: true },
  'foto-bukti': { type: String },
  'status': { 
    type: String, 
    enum: ['menunggu', 'terverifikasi', 'ditolak'], 
    default: 'menunggu' 
  },
  'tanggal-bayar': { type: Date, default: Date.now }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pembayaran', pembayaranSchema);