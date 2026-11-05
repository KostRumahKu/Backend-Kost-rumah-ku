import mongoose from "mongoose";

const pengajuanSchema = new mongoose.Schema(
  {
    _id: { type: String },
    "id-pengguna": {
      type: String,
      ref: "Pengguna",
      required: true,
    },
    "jenis-pengajuan": {
      type: String,
      enum: ["berhenti-sewa", "pindah-kamar"],
      required: true,
    },
    "id-kamar-sekarang": {
      type: Number,
      required: true,
    },
    "id-kamar-tujuan": {
      type: Number,
      default: null,
    },
    "tanggal-target": {
      type: Date,
      required: true,
    },
    alasan: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "menunggu-konfirmasi",
        "disetujui",
        "ditolak",
        "dibatalkan-admin",
        "dibatalkan-penyewa",
      ],
      default: "menunggu-konfirmasi",
    },
    "catatan-admin": {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "dibuat-pada", updatedAt: "diperbarui-pada" },
  },
);

pengajuanSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret["id-pengajuan"] = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Pengajuan = mongoose.model("Pengajuan", pengajuanSchema);
export default Pengajuan;