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
      "simpan-pengaturan-review": false,
      review: null,
    };
  }

  const reviewTerformat = formatReviewHybrid(reviewMentah);

  return {
    terisi: Boolean(reviewTerformat.terisi),
    "simpan-pengaturan-review": Boolean(
      reviewTerformat["simpan-pengaturan-review"],
    ),
    review: reviewTerformat.terisi ? reviewTerformat : null,
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

  const dokumenSaatIni = await Review.findOne({ "id-penyewa": idPenyewa });

  if (dokumenSaatIni && dokumenSaatIni.terisi === true) {
    throw new AppError(
      "CONFLICT",
      "Anda sudah pernah mengirimkan ulasan.",
      { API_NOTES : "untuk bagian ini bisa pakai PATCH ke penyewa kalau ulasan nya sudah ada"}
    );
  }

  let dokumenTersimpan;

  if (dokumenSaatIni && dokumenSaatIni.terisi === false) {
    dokumenSaatIni["nama-penyewa"] = penyewa["nama-lengkap"];
    dokumenSaatIni["foto-profil"] = penyewa["foto-profil"] || null;
    dokumenSaatIni["info-kamar"] = snapshotKamar(penyewa);
    dokumenSaatIni.bintang = payload.bintang;
    dokumenSaatIni.deskripsi = payload.deskripsi.trim();
    dokumenSaatIni.terisi = true;
    if (payload["simpan-pengaturan-review"] !== undefined) {
      dokumenSaatIni["simpan-pengaturan-review"] =
        payload["simpan-pengaturan-review"];
    }
    dokumenTersimpan = await dokumenSaatIni.save();
  } else {
    const reviewBaru = new Review({
      "id-penyewa": penyewa._id,
      "nama-penyewa": penyewa["nama-lengkap"],
      "foto-profil": penyewa["foto-profil"] || null,
      "info-kamar": snapshotKamar(penyewa),
      bintang: payload.bintang,
      deskripsi: payload.deskripsi.trim(),
      terisi: true,
      "simpan-pengaturan-review":
        payload["simpan-pengaturan-review"] !== undefined
          ? payload["simpan-pengaturan-review"]
          : false,
    });
    dokumenTersimpan = await reviewBaru.save();
  }

  await dokumenTersimpan.populate({
    path: "id-penyewa",
    select: "nama-lengkap foto-profil id-kamar",
    populate: {
      path: "id-kamar",
      select: "nama-kamar tipe-kamar lantai",
    },
  });

  const terformat = formatReviewHybrid(dokumenTersimpan);

  return {
    terisi: true,
    "simpan-pengaturan-review": terformat["simpan-pengaturan-review"],
    review: terformat,
  };
};

export const ubahReviewPenyewa = async (idPenyewa, payload) => {
  const reviewSaatIni = await Review.findOne({ "id-penyewa": idPenyewa });

  if (!reviewSaatIni || reviewSaatIni.terisi !== true) {
    throw new AppError(
      "NOT_FOUND",
      "Anda belum memiliki ulasan. Silakan kirim ulasan terlebih dahulu.",
      { API_NOTES : "untuk bagian ini bisa pakai POST ke penyewa kalau ulasan nya belum ada"}
    );
  }

  if (payload.bintang !== undefined) {
    reviewSaatIni.bintang = payload.bintang;
  }

  if (payload.deskripsi !== undefined) {
    reviewSaatIni.deskripsi = payload.deskripsi.trim();
  }

  if (payload["simpan-pengaturan-review"] !== undefined) {
    reviewSaatIni["simpan-pengaturan-review"] =
      payload["simpan-pengaturan-review"];
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

  const terformat = formatReviewHybrid(reviewSaatIni);

  return {
    terisi: terformat.terisi,
    "simpan-pengaturan-review": terformat["simpan-pengaturan-review"],
    review: terformat,
  };
};

export const aturPengaturanReviewPenyewa = async (idPenyewa, simpanPengaturan) => {
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
      "Pengaturan ulasan hanya berlaku untuk penghuni aktif (penyewa).",
    );
  }

  let dokumenReview = await Review.findOne({ "id-penyewa": idPenyewa });

  if (dokumenReview) {
    dokumenReview["simpan-pengaturan-review"] = simpanPengaturan;
    await dokumenReview.save();
  } else {
    dokumenReview = new Review({
      "id-penyewa": penyewa._id,
      "nama-penyewa": penyewa["nama-lengkap"],
      "foto-profil": penyewa["foto-profil"] || null,
      "info-kamar": snapshotKamar(penyewa),
      bintang: null,
      deskripsi: null,
      terisi: false,
      "simpan-pengaturan-review": simpanPengaturan,
    });
    await dokumenReview.save();
  }

  return {
    terisi: Boolean(dokumenReview.terisi),
    "simpan-pengaturan-review": Boolean(
      dokumenReview["simpan-pengaturan-review"],
    ),
  };
};