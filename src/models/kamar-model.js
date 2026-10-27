import mongoose from 'mongoose';

const kamarSchema = new mongoose.Schema({
  '_id': { type: Number, required: true },
  'nama-kamar': { type: String, required: true },
  'tipe-kamar': { 
    type: String, 
    enum: ['teratai', 'tulip'],
    required: true 
  },
  'harga': { type: Number }, 
  'status': { type: String,
    enum: ['kosong', 'dipesan', 'terisi', 'perbaikan'], 
    default: 'kosong' },
  'lantai': { type: Number, required: true },
  'foto': [{ type: String }],
  'diarsipkan': { type: Boolean, default: false }
}, { timestamps: true });

kamarSchema.pre('save', function() {
  const tipe = this['tipe-kamar'].toLowerCase();
  if (tipe === 'teratai' || tipe === 'ekonomi') {
    this.harga = 300000;
  } else if (tipe === 'tulip' || tipe === 'eksekutif') {
    this.harga = 500000;
  }
});

export default mongoose.model('Kamar', kamarSchema);