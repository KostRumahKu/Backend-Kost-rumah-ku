import mongoose from "mongoose";

const riwayatSewaSchema = new mongoose.Schema(
  {
    "id-kamar": { type: Number, ref: "Kamar", required: true },
    "id-pengguna": { type: String, ref: "Pengguna", required: true },
    "nama-penyewa": { type: String, required: true }, 
    "tanggal-masuk": { type: Date, required: true },
    "tanggal-keluar": { type: Date },
    catatan: { type: String }, 
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

export default mongoose.model("RiwayatSewa", riwayatSewaSchema);
