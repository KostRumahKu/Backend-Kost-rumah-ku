import mongoose from 'mongoose';
import { DEFAULT_PROFILE_IMAGE_URL } from "../config/app-config.js";

const penggunaSchema = new mongoose.Schema({
  '_id': { type: String, required: true },
  'nama-lengkap': { type: String, required: true },
  'email': { type: String, required: true, unique: true },
  'kata-sandi': { type: String, required: false },
  'peran': { 
    type: String, 
    enum: ['pemilik', 'admin', 'penyewa', 'calon-penyewa'], 
    default: 'calon-penyewa' 
  },
  'status-akun': {
    type: String,
    enum: ['aktif', 'ditangguhkan'],
    default: 'aktif'
  },
  'nomor-telepon': { type: String, required: true, unique: true },
  'nama-kontak-darurat': { type: String, required: true },
  'nomor-kontak-darurat': { type: String, required: true },
  'id-kamar': { 
    type: Number, 
    ref: 'Kamar', 
    default: null 
  },
  'tanggal-mulai': { type: Date },
  'tanggal-berakhir': { type: Date },
  'otp-reset': { type: String, default: null },
  'otp-kedaluwarsa': { type: Date, default: null },
  'email-baru-sementara': { type: String, default: null },
  'foto-profil': { 
    type: String, 
    default: DEFAULT_PROFILE_IMAGE_URL
  },
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pengguna', penggunaSchema);