import Review from "../../models/review-model.js";
import Pengguna from "../../models/pengguna-model.js";
import { AppError } from "../../errors.js";
import { formatReviewHybrid } from "../../utils/review-helper.js";

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

export const ambilReviewPenyewaSendiri = async (idPenyewa) => {
  const reviewMentah = await Review.findOne({ "id-penyewa": idPenyewa }).populate({
    path: "id-penyewa",
    select: "nama-lengkap foto-profil id-kamar",
    populate: {
      path: "id-kamar",
      select: "nama-kamar tipe-kamar lantai",
    },
  });

  if (!reviewMentah) {
    return {
      terisi: false,
      review: null,
    };
  }

  const reviewTerformat = formatReviewHybrid(reviewMentah);

  return {
    terisi: reviewTerformat.terisi,
    review: reviewTerformat,
  };
};

export const buatReviewPenyewa = async (idPenyewa, payload) => {
  const penyewa = await Pengguna.findById(idPenyewa).populate(
    "id-kamar",
    "nama-kamar tipe-kamar lantai",
  );

  if (!penyewa) {
    throw new AppError("NOT_FOUND", "Data akun penyewa tidak ditemukan.");
  }

  if (penyewa.peran !== "penyewa") {
    throw new AppError(
      "FORBIDDEN",
      "Hanya penghuni aktif (penyewa) yang dapat memberikan ulasan kost.",
    );
  }

  const sudahAda = await Review.findOne({ "id-penyewa": idPenyewa });
  if (sudahAda) {
    throw new AppError(
      "CONFLICT",
      "Anda sudah pernah mengirimkan ulasan.",
    );
  }

  const reviewBaru = new Review({
    "id-penyewa": penyewa._id,
    "nama-penyewa": penyewa["nama-lengkap"],
    "foto-profil": penyewa["foto-profil"] || null,
    "info-kamar": snapshotKamar(penyewa),
    bintang: payload.bintang,
    deskripsi: payload.deskripsi.trim(),
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

  return {
    terisi: true,
    review: formatReviewHybrid(reviewBaru),
  };
};

export const ubahReviewPenyewa = async (idPenyewa, payload) => {
  const reviewSaatIni = await Review.findOne({ "id-penyewa": idPenyewa });

  if (!reviewSaatIni) {
    throw new AppError(
      "NOT_FOUND",
      "Anda belum memiliki ulasan. Silakan kirim ulasan terlebih dahulu menggunakan metode POST.",
    );
  }

  if (payload.bintang !== undefined) {
    reviewSaatIni.bintang = payload.bintang;
  }

  if (payload.deskripsi !== undefined) {
    reviewSaatIni.deskripsi = payload.deskripsi.trim();
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

  return {
    terisi: reviewSaatIni.terisi,
    review: formatReviewHybrid(reviewSaatIni),
  };
};