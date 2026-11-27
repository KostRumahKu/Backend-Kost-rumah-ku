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
      required: [
        function () {
          return this.terisi === true;
        },
        "Rating bintang wajib diisi",
      ],
      default: null,
      validate: {
        validator: function (nilai) {
          if (nilai === null || nilai === undefined) {
            return this.terisi !== true;
          }
          return (
            Number.isInteger(nilai) &&
            nilai >= 1 &&
            nilai <= 5 &&
            String(nilai).length === 1
          );
        },
        message: "Rating bintang harus berupa 1 digit bilangan bulat (1 sampai 5)",
      },
    },
    "simpan-pengaturan-review": { // untuk pop up review di website , true jika tidka ingin membuat ulasan selama nya
      type: Boolean,
      default: false,
    },
    deskripsi: {
      type: String,
      required: [
        function () {
          return this.terisi === true;
        },
        "Deskripsi ulasan wajib diisi",
      ],
      default: null,
      trim: true,
    },
    terisi: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

export default mongoose.model("Review", reviewSchema);