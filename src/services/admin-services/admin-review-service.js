import mongoose from "mongoose";
import Review from "../../models/review-model.js";
import Pengguna from "../../models/pengguna-model.js";
import { AppError } from "../../errors.js";
import {
  formatReviewHybrid,
  hitungRingkasanRating,
} from "../../utils/review-helper.js";

const validasiObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("VALIDATION_ERROR", "Format ID review tidak valid.");
  }
};

const snapshotKamar = (penggunaPopulated) => {
  const kamar = penggunaPopulated?.["id-kamar"];
  if (!kamar || typeof kamar !== "object" || !kamar["nama-kamar"]) {
    return null;
  }

  const tipeKapital = kamar["tipe-kamar"]
    ? kamar["tipe-kamar"].charAt(0).toUpperCase() + kamar["tipe-kamar"].slice(1)
    : "";

  return tipeKapital
    ? `Kamar ${kamar["nama-kamar"]} (${tipeKapital})`
    : `Kamar ${kamar["nama-kamar"]}`;
};

export const ambilSemuaReviewAdmin = async (query = {}) => {
  const filter = {};

  if (query.cari) {
    const kataKunci = String(query.cari).trim();
    if (kataKunci) {
      filter.$or = [
        { "nama-penyewa": { $regex: kataKunci, $options: "i" } },
        { "info-kamar": { $regex: kataKunci, $options: "i" } },
        { deskripsi: { $regex: kataKunci, $options: "i" } },
      ];
    }
  }

  const [daftarMentah, ringkasanPublik] = await Promise.all([
    Review.find(filter)
      .populate({
        path: "id-penyewa",
        select: "nama-lengkap foto-profil id-kamar",
        populate: {
          path: "id-kamar",
          select: "nama-kamar tipe-kamar lantai",
        },
      })
      .sort({ "dibuat-pada": -1 }),
    hitungRingkasanRating({ terisi: true }),
  ]);

  const ulasan = daftarMentah.map((item) => formatReviewHybrid(item));

  return {
    ringkasan: ringkasanPublik,
    total: ulasan.length,
    ulasan,
  };
};

export const ambilDetailReviewAdmin = async (idReview) => {
  validasiObjectId(idReview);

  const reviewMentah = await Review.findById(idReview).populate({
    path: "id-penyewa",
    select: "nama-lengkap foto-profil id-kamar",
    populate: {
      path: "id-kamar",
      select: "nama-kamar tipe-kamar lantai",
    },
  });

  if (!reviewMentah) {
    throw new AppError("NOT_FOUND", "Data review tidak ditemukan.");
  }

  return formatReviewHybrid(reviewMentah);
};

export const buatReviewOlehAdmin = async (payload) => {
  const { "id-penyewa": idPenyewa, bintang, deskripsi } = payload;

  const penyewa = await Pengguna.findById(String(idPenyewa).trim()).populate(
    "id-kamar",
    "nama-kamar tipe-kamar lantai",
  );

  if (!penyewa) {
    throw new AppError(
      "NOT_FOUND",
      `Penyewa dengan ID '${idPenyewa}' tidak ditemukan.`,
    );
  }

  if (penyewa.peran !== "penyewa") {
    throw new AppError(
      "FORBIDDEN",
      "Ulasan hanya dapat dibuatkan untuk akun dengan peran 'penyewa'.",
    );
  }

  const sudahAda = await Review.findOne({ "id-penyewa": penyewa._id });
  if (sudahAda) {
    throw new AppError(
      "CONFLICT",
      `Penyewa '${penyewa["nama-lengkap"]}' sudah memiliki ulasan. Gunakan metode PUT untuk mengedit ulasan tersebut.`,
    );
  }

  const reviewBaru = new Review({
    "id-penyewa": penyewa._id,
    "nama-penyewa": penyewa["nama-lengkap"],
    "foto-profil": penyewa["foto-profil"] || null,
    "info-kamar": snapshotKamar(penyewa),
    bintang,
    deskripsi: deskripsi.trim(),
    terisi: true,
  });

  await reviewBaru.save();

  await reviewBaru.populate({
    path: "id-penyewa",
    select: "nama-lengkap foto-profil id-kamar",
    populate: {
      path: "id-kamar",
      select: "nama-kamar tipe-kamar lantai",
    },
  });

  return formatReviewHybrid(reviewBaru);
};

export const ubahReviewOlehAdmin = async (idReview, payload) => {
  validasiObjectId(idReview);

  const reviewSaatIni = await Review.findById(idReview);
  if (!reviewSaatIni) {
    throw new AppError("NOT_FOUND", "Data review tidak ditemukan.");
  }

  if (payload.bintang !== undefined) {
    reviewSaatIni.bintang = payload.bintang;
  }

  if (payload.deskripsi !== undefined) {
    reviewSaatIni.deskripsi = payload.deskripsi.trim();
  }

  if (payload.terisi !== undefined) {
    reviewSaatIni.terisi = payload.terisi;
  }

  await reviewSaatIni.save();

  await reviewSaatIni.populate({
    path: "id-penyewa",
    select: "nama-lengkap foto-profil id-kamar",
    populate: {
      path: "id-kamar",
      select: "nama-kamar tipe-kamar lantai",
    },
  });

  return formatReviewHybrid(reviewSaatIni);
};

export const hapusReviewOlehAdmin = async (idReview) => {
  validasiObjectId(idReview);

  const reviewDihapus = await Review.findByIdAndDelete(idReview);
  if (!reviewDihapus) {
    throw new AppError("NOT_FOUND", "Data review tidak ditemukan.");
  }

  return {
    pesan: `Ulasan milik '${reviewDihapus["nama-penyewa"]}' berhasil dihapus secara permanen.`,
  };
};