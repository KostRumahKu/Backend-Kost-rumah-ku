import mongoose from "mongoose";
import Fasilitas from "../../models/fasilitas.model.js";
import { AppError } from "../../errors.js";

const validasiObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("VALIDATION_ERROR", "Format ID fasilitas tidak valid.");
  }
};

export const ambilSemuaFasilitas = async () => {
  return await Fasilitas.find().sort({ "dibuat-pada": -1 });
};

export const ambilDetailFasilitas = async (id) => {
  validasiObjectId(id);
  const dataFasilitas = await Fasilitas.findById(id);
  if (!dataFasilitas) {
    throw new AppError("NOT_FOUND", "Fasilitas tidak ditemukan.");
  }
  return dataFasilitas;
};

export const tambahFasilitas = async (payload) => {
  const { deskripsi, gambar } = payload;

  const daftarGambar = Array.isArray(gambar)
    ? gambar.map((url) => String(url).trim()).filter(Boolean)
    : [];

  const fasilitasBaru = new Fasilitas({
    deskripsi: deskripsi.trim(),
    gambar: daftarGambar,
  });

  return await fasilitasBaru.save();
};

export const ubahFasilitas = async (id, payload) => {
  validasiObjectId(id);
  const { deskripsi, gambar } = payload;

  const dataUpdate = {};
  if (deskripsi !== undefined) {
    dataUpdate.deskripsi = deskripsi.trim();
  }

  if (gambar !== undefined) {
    dataUpdate.gambar = gambar.map((url) => String(url).trim()).filter(Boolean);
  }

  const fasilitasDiperbarui = await Fasilitas.findByIdAndUpdate(
    id,
    dataUpdate,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!fasilitasDiperbarui) {
    throw new AppError("NOT_FOUND", "Fasilitas tidak ditemukan.");
  }

  return fasilitasDiperbarui;
};

export const hapusFasilitas = async (id) => {
  validasiObjectId(id);
  const fasilitasDihapus = await Fasilitas.findByIdAndDelete(id);
  if (!fasilitasDihapus) {
    throw new AppError("NOT_FOUND", "Fasilitas tidak ditemukan.");
  }
  return { pesan: "Fasilitas berhasil dihapus secara permanen." };
};