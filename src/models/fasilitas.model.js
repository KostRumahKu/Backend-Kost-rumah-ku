import mongoose from "mongoose";

const fasilitasSchema = new mongoose.Schema({
  deskripsi: { 
    type: String, 
    required: [true, "Deskripsi fasilitas wajib diisi"] 
  },
  gambar: [{ type: String }],
}, { 
  timestamps: { createdAt: 'dibuat-pada', updatedAt: 'diperbarui-pada' } 
});

export default mongoose.model("fasilitas", fasilitasSchema);