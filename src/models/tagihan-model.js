import mongoose from 'mongoose';

const tagihanSchema = new mongoose.Schema({
  'id-pengguna': { type: String, ref: 'Pengguna', required: true },
  'nama-penyewa': { type: String, required: true },
  'id-kamar': { type: Number, ref: 'Kamar', required: true },
  'nomor-tagihan': { type: String, required: true, unique: true },
  'bulan-tagihan': { type: String, required: true },
  'bukti-pembayaran': { type: String, default: null }, 
  'jumlah-tagihan': { type: Number, required: true },
  'tanggal-jatuh-tempo': { type: Date, required: true },
  'status': { 
    type: String, 
    enum: ['belum-bayar', 'menunggu-validasi', 'lunas', 'terlambat', 'dibatalkan'],
    default: 'belum-bayar' 
  },
  'pembayaran-multi': { type: Boolean, default: false },
  'rekening-tujuan': { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RekeningKost', 
    default: null 
  },
  'metode-pembayaran': { 
    type: String, 
    default: null 
  },
  'catatan-admin': { type: String, default: null }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Tagihan', tagihanSchema);