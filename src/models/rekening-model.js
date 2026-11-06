import mongoose from 'mongoose';

const rekeningSchema = new mongoose.Schema({
  'nama-bank': { type: String, required: true }, // Contoh: "BCA", "Mandiri", "QRIS"
  'nama-pemilik': { type: String, required: true }, // Contoh: "Bpk. Budi Santoso"
  'nomor-rekening': { type: String, required: true }, // Contoh: "847291002"
  'jenis': { type: String, enum: ['transfer-bank', 'e-wallet', 'qris'], required: true },
  'logo-bank': { type: String }, // URL Icon bank dari FE/CDN
  'foto-qris': { type: String }, // Jika jenisnya QRIS, admin bisa upload gambar barcode
  'status': { type: String, enum: ['aktif', 'nonaktif'], default: 'aktif' }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('RekeningKost', rekeningSchema);