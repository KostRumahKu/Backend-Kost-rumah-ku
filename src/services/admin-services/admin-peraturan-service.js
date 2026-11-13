import Peraturan from "../../models/peraturan-model.js";
import { AppError } from "../../errors.js";

export const ambilSemuaPeraturan = async () => {
  return await Peraturan.find().sort({ "dibuat-pada": -1 }); 
};

export const ambilDetailPeraturan = async (id) => {
  const peraturan = await Peraturan.findById(id);
  if (!peraturan) throw new AppError("NOT_FOUND", "Peraturan tidak ditemukan.");
  return peraturan;
};

export const tambahPeraturan = async (payload) => {
  const { deskripsi, gambar } = payload;
  const peraturanBaru = new Peraturan({
    deskripsi: deskripsi.trim(),
    gambar: gambar ? gambar.trim() : null
  });

  return await peraturanBaru.save();
};

export const ubahPeraturan = async (id, payload) => {
  const {  deskripsi, gambar } = payload;

  const dataUpdate = {};
  if (deskripsi !== undefined) dataUpdate.deskripsi = deskripsi.trim();
  if (gambar !== undefined) dataUpdate.gambar = gambar === "" ? null : gambar.trim(); // Bisa hapus gambar dengan string kosong

  const peraturanDiperbarui = await Peraturan.findByIdAndUpdate(id, dataUpdate, {
    new: true,
    runValidators: true
  });
  
  if (!peraturanDiperbarui) {
    throw new AppError("NOT_FOUND", "Peraturan tidak ditemukan.");
  }
  return peraturanDiperbarui;
};

export const hapusPeraturan = async (id) => {
  const peraturanDihapus = await Peraturan.findByIdAndDelete(id);
  if (!peraturanDihapus) {
    throw new AppError("NOT_FOUND", "Peraturan tidak ditemukan.");
  }
  return { pesan: "Peraturan berhasil dihapus secara permanen." };
};