import mongoose from "mongoose";

const peraturanSchema = new mongoose.Schema({
//   judul: { 
//     type: String, 
//     required: [true, "Judul peraturan wajib diisi"] 
//   },
  deskripsi: { 
    type: String, 
    required: [true, "Deskripsi peraturan wajib diisi"] 
  },
  gambar: { 
    type: String, 
    default: null 
  }
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model("Peraturan", peraturanSchema);