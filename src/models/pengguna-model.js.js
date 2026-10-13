import mongoose from 'mongoose';

const penggunaSchema = new mongoose.Schema({
  'nama-lengkap': { type: String, required: true },
  'email': { type: String, required: true, unique: true },
  'kata-sandi': { type: String, required: false },
  'peran': { 
    type: String, 
    enum: ['pemilik', 'admin', 'penyewa', 'calon-penyewa'], 
    default: 'calon-penyewa' 
  },
  'nomor-telepon': { type: String },
  'nama-kontak-darurat': { type: String },
  'nomor-kontak-darurat': { type: String },
  'id-kamar': { 
    type: Number, 
    ref: 'Kamar', 
    default: null 
  },
  'tanggal-mulai': { type: Date },
  'tanggal-berakhir': { type: Date }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pengguna', penggunaSchema);