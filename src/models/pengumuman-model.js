import mongoose from 'mongoose';

const pengumumanSchema = new mongoose.Schema({
  'judul': { type: String, required: true },
  'pesan': { type: String, required: true },
  'gambar': { type: String, default: null }, 
  'dibuat-oleh': { type: mongoose.Schema.Types.ObjectId, ref: 'Pengguna', required: true }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Pengumuman', pengumumanSchema);