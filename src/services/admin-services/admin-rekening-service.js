import RekeningKost from "../../models/rekening-model.js";
import { AppError } from "../../errors.js";

export const ambilDaftarRekening = async () => {
  const daftarRekening = await RekeningKost.find({ status: "aktif" }).sort({
    "dibuat-pada": -1,
  });
  return daftarRekening;
};

export const tambahRekeningBaru = async (payload) => {
  const {
    "nama-bank": namaBank,
    "nama-pemilik": namaPemilik,
    "nomor-rekening": nomorRekening,
    jenis,
    "logo-bank": logoBank,
    "foto-qris": fotoQris,
  } = payload;

  const rekeningBaru = new RekeningKost({
    "nama-bank": namaBank,
    "nama-pemilik": namaPemilik,
    "nomor-rekening": nomorRekening,
    jenis,
    "logo-bank": logoBank || null,
    "foto-qris": fotoQris || null,
  });

  await rekeningBaru.save();
  return rekeningBaru;
};

export const perbaruiRekening = async (idRekening, payload) => {
  const {
    "nama-bank": namaBank,
    "nama-pemilik": namaPemilik,
    "nomor-rekening": nomorRekening,
    jenis,
    "logo-bank": logoBank,
    "foto-qris": fotoQris,
    status,
  } = payload;

  const rekening = await RekeningKost.findById(idRekening);
  if (!rekening) {
    throw new AppError("NOT_FOUND", "Metode pembayaran tidak ditemukan.");
  }

  if (namaBank) rekening["nama-bank"] = namaBank;
  if (namaPemilik) rekening["nama-pemilik"] = namaPemilik;
  if (nomorRekening) rekening["nomor-rekening"] = nomorRekening;
  if (jenis) rekening.jenis = jenis;
  if (logoBank !== undefined) rekening["logo-bank"] = logoBank;
  if (fotoQris !== undefined) rekening["foto-qris"] = fotoQris;
  if (status) rekening.status = status; // aktif atau tidak-aktif utuk rekeming nya

  await rekening.save();
  return rekening;
};

export const hapusRekening = async (idRekening) => {
  const rekening = await RekeningKost.findByIdAndUpdate(
    idRekening,
    { status: "tidak-aktif" },
    { new: true },
  );

  if (!rekening) {
    throw new AppError("NOT_FOUND", "Metode pembayaran tidak ditemukan.");
  }

  return rekening;
};