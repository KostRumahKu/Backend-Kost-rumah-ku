import mongoose from 'mongoose';

const kamarSchema = new mongoose.Schema({
  // Menimpa _id bawaan MongoDB menjadi tipe Number kustom
  '_id': { 
    type: Number, 
    required: true 
  }, // Contoh jadi pas insert data: 1001 (Lantai 1, kamar 01), 2015 (Lantai 2, kamar 15)
  
  'nama-kamar': { type: String, required: true, unique: true }, // Bisa diisi "Kamar 1001" atau "Mawar 1001"
  'tipe-kamar': { 
    type: String, 
    enum: ['ekonomi', 'eksekutif'], 
    required: true 
  },
  'harga': { type: Number, required: true },
  'status': { 
    type: String, 
    enum: ['kosong', 'dipesan', 'terisi', 'perbaikan'], 
    default: 'kosong' 
  },
  'fasilitas': [{ type: String }],
  'deskripsi': { type: String },
  'foto': [{ type: String }],
  'lantai': { type: Number, required: true }, // Contoh: 1, 2, atau 3
  'diarsipkan': { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model('Kamar', kamarSchema);