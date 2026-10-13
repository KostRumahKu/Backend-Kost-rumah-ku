import mongoose from 'mongoose';

const tagihanSchema = new mongoose.Schema({
  'id-pengguna': { type: mongoose.Schema.Types.ObjectId, ref: 'Pengguna', required: true },
  'id-kamar': { type: Number, ref: 'Kamar', required: true },
  'nomor-tagihan': { type: String, required: true, unique: true },
  'bulan-tagihan': { type: String, required: true }, 
  'jumlah-tagihan': { type: Number, required: true },
  'tanggal-jatuh-tempo': { type: Date, required: true },
  'status': { 
    type: String, 
    enum: ['belum-bayar', 'lunas', 'terlambat'], 
    default: 'belum-bayar' 
  }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Tagihan', tagihanSchema);