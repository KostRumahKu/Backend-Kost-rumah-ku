import mongoose from "mongoose";

const kasSchema = new mongoose.Schema(
  {
    "tipe-transaksi": {
      type: String,
      enum: ["pemasukan", "pengeluaran"],
      required: true,
    },
    kategori: {
      type: String,
      enum: [
        "pembayaran-sewa",
        "pengembalian-sewa", 
        "biaya-operasional",
        "perbaikan-kamar",
        "lain-lain",
      ],
      required: true,
    },
    nominal: {
      type: Number,
      required: true,
      min: [1, "Nominal transaksi tidak boleh kurang dari 1"],
    },
    keterangan: {
      type: String,
      required: true,
    },
    "tanggal-transaksi": {
      type: Date,
      default: Date.now,
    },
    "id-referensi": {
      type: String,
      default: null, 
    },
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

export default mongoose.model("KasKost", kasSchema);