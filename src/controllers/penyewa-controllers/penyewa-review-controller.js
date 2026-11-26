import * as penyewaReviewService from "../../services/penyewa-services/penyewa-review-service.js";
import { AppError } from "../../errors.js";
import {
  kontrakPenyewaBuatReview,
  kontrakPenyewaUbahReview,
} from "../../contracts/review-contract.js";

export const getReviewPenyewa = async (req, res, next) => {
  try {
    const idPenyewa = req.pengguna._id || req.pengguna.id;
    const hasil =
      await penyewaReviewService.ambilReviewPenyewaSendiri(idPenyewa);

    res.status(200).json({
      status: "sukses",
      pesan: hasil.terisi
        ? "Berhasil memuat ulasan Anda."
        : "Anda belum mengisi ulasan kost.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const postReviewPenyewa = async (req, res, next) => {
  try {
    const dataPayload = req.body ?? {};
    const { bintang, deskripsi } = dataPayload;

    if (bintang === undefined || !deskripsi) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'bintang' dan 'deskripsi' wajib diisi!",
        { kebutuhan_payload: kontrakPenyewaBuatReview },
      );
    }

    if (typeof bintang !== "number") {
      throw new AppError("VALIDATION_ERROR", "Field 'bintang' berupa number.");
    }

    if (bintang > 5) {
      throw new AppError("VALIDATION_ERROR", "Rating bintang maksimal 5");
    }

    if (bintang < 1) {
      throw new AppError("VALIDATION_ERROR", "Rating bintang minimal 1");
    }

    const fieldDiizinkan = ["bintang", "deskripsi"];
    const fieldAsing = Object.keys(dataPayload).filter(
      (key) => !fieldDiizinkan.includes(key),
    );
    if (fieldAsing.length > 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Field tidak dikenali atau tidak diizinkan: ${fieldAsing.join(", ")}.`,
        { kebutuhan_payload: kontrakPenyewaBuatReview },
      );
    }

    if (typeof deskripsi !== "string" || !deskripsi.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'deskripsi' wajib berupa teks dan tidak boleh kosong.",
        { kebutuhan_payload: kontrakPenyewaBuatReview },
      );
    }

    const idPenyewa = req.pengguna._id || req.pengguna.id;
    const hasil = await penyewaReviewService.buatReviewPenyewa(idPenyewa, {
      bintang,
      deskripsi,
    });

    res.status(201).json({
      status: "sukses",
      pesan: "Terima kasih! Ulasan Anda berhasil dikirim.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const patchReviewPenyewa = async (req, res, next) => {
  try {
    const dataPayload = req.body ?? {};
    const { bintang, deskripsi } = dataPayload;

    if (
        !dataPayload ||
        typeof dataPayload !== "object" ||
        Array.isArray(dataPayload) ||
        Object.keys(dataPayload).length === 0
    ) {
    throw new AppError(
        "VALIDATION_ERROR",
        "Minimal kirimkan satu field yang ingin diperbarui ('bintang' atau 'deskripsi').",
        {
            kebutuhan_payload: kontrakPenyewaUbahReview,
            API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
        },
    );
    }

    if ( typeof bintang !== "number" ) {
        throw new AppError(
            "VALIDATION_ERROR",
            "Field 'bintang' berupa number.",
        );
    }

    if ( bintang > 5 ) {
        throw new AppError(
            "VALIDATION_ERROR",
            "Rating bintang maksimal 5",
        );
    }

    if ( bintang < 1 ) {
        throw new AppError(
            "VALIDATION_ERROR",
            "Rating bintang minimal 1",
        );
    }


    const fieldDiizinkan = ["bintang", "deskripsi"];
    const fieldAsing = Object.keys(dataPayload).filter(
      (key) => !fieldDiizinkan.includes(key),
    );
    if (fieldAsing.length > 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Field tidak dikenali atau tidak diizinkan: ${fieldAsing.join(", ")}.`,
        {
            kebutuhan_payload: kontrakPenyewaUbahReview,
            API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
        },
      );
    }

    if (dataPayload.deskripsi !== undefined) {
      if (
        typeof dataPayload.deskripsi !== "string" ||
        !dataPayload.deskripsi.trim()
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Field 'deskripsi' wajib berupa teks dan tidak boleh kosong.",
          { kebutuhan_payload: kontrakPenyewaUbahReview },
        );
      }
    }

    const idPenyewa = req.pengguna._id || req.pengguna.id;
    const hasil = await penyewaReviewService.ubahReviewPenyewa(
      idPenyewa,
      dataPayload,
    );

    res.status(200).json({
      status: "sukses",
      pesan: "Ulasan Anda berhasil diperbarui.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};