import mongoose from 'mongoose';

const kamarSchema = new mongoose.Schema({
  '_id': { type: Number, required: true },
  'nama-kamar': { type: String, required: true },
  'tipe-kamar': { 
    type: String, 
    enum: ['standart', 'tulip', 'amarilis'],
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
  if (tipe === 'standart') {
    this.harga = 300000;
  } else if (tipe === 'tulip') {
    this.harga = 1000000;
  } else if (tipe === 'amarilis') {
    this.harga = 2000000;
  }
});

export default mongoose.model('Kamar', kamarSchema);