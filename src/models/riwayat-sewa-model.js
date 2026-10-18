import mongoose from "mongoose";

const riwayatSewaSchema = new mongoose.Schema(
  {
    "id-kamar": { type: Number, ref: "Kamar", required: true },
    "id-pengguna": { type: String, ref: "Pengguna", required: true },
    "nama-penyewa": { type: String, required: true }, // Disimpan statis untuk jaga-jaga user dihapus permanen
    "tanggal-masuk": { type: Date, required: true },
    "tanggal-keluar": { type: Date },
    catatan: { type: String }, // Contoh: "Keluar karena lulus kuliah", "Pindah kamar", dll
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

export default mongoose.model("RiwayatSewa", riwayatSewaSchema);
