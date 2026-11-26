import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    "id-penyewa": {
      type: String,
      ref: "Pengguna",
      required: [true, "ID penyewa wajib diisi"],
      unique: true,
    },
    "nama-penyewa": {
      type: String,
      required: [true, "Nama penyewa wajib diisi"],
      trim: true,
    },
    "foto-profil": {
      type: String,
      default: null,
    },
    "info-kamar": {
      type: String,
      default: null, // Snapshot cadangan, misal: "Kamar 1004 (Standart)"
    },
    bintang: {
      type: Number,
      required: [true, "Rating bintang wajib diisi"],
      validate: {
        validator: function (nilai) {
          return Number.isInteger(nilai) && String(nilai).length === 1;
        },
        message: "Rating bintang harus berupa 1 digit bilangan bulat (1 sampai 5)",
      },
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi ulasan wajib diisi"],
      trim: true,
    },
    terisi: { // Untuk cek apakah sudah review atau belum (untuk pop up di awal dashboard seperti play store)
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

export default mongoose.model("Review", reviewSchema);