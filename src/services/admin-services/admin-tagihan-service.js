import Tagihan from "../../models/tagihan-model.js";
import mongoose from "mongoose";
import { AppError } from "../../errors.js";

export const ambilSemuaTagihan = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { "nomor-tagihan": { $regex: query.search, $options: "i" } },
      { "bulan-tagihan": { $regex: query.search, $options: "i" } },
    ];
  }

  const daftarTagihan = await Tagihan.find(filter)
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 }); 

  return daftarTagihan;
};

// export const ambilDetailTagihan = async (id) => {
//   const tagihan = await Tagihan.findById(id)
//     .populate("id-pengguna", "nama-lengkap email nomor-telepon")
//     .populate("id-kamar", "nama-kamar tipe-kamar lantai");

//   if (!tagihan) {
//     throw new AppError("NOT_FOUND", "Data tagihan tidak ditemukan.");
//   }
//   return tagihan;
// };

export const cariTagihanMulti = async (payload) => {
  const { "id-atau-invoice": idAtauInvoice } = payload;

  const queryOr = [];

  if (mongoose.Types.ObjectId.isValid(idAtauInvoice.trim())) {
    queryOr.push({ _id: idAtauInvoice.trim() });
  }
  queryOr.push({ "nomor-tagihan": { $regex: idAtauInvoice.trim(), $options: "i" } });
  const hasilPencarian = await Tagihan.find({ $or: queryOr })
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 });

  return hasilPencarian;
};