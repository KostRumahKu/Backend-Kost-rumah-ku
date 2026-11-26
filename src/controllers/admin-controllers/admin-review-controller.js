import * as adminReviewService from "../../services/admin-services/admin-review-service.js";
import { AppError } from "../../errors.js";
import {
  kontrakAdminBuatReview,
  kontrakAdminUbahReview,
} from "../../contracts/review-contract.js";

export const getSemuaReview = async (req, res, next) => {
  try {
    const hasil = await adminReviewService.ambilSemuaReviewAdmin(req.query);

    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat daftar ulasan penyewa.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const getDetailReview = async (req, res, next) => {
  try {
    const hasil = await adminReviewService.ambilDetailReviewAdmin(req.params.id);

    res.status(200).json({
      status: "sukses",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const postReviewAdmin = async (req, res, next) => {
  try {
    const dataPayload = req.body ?? {};
    const { "id-penyewa": idPenyewa, bintang, deskripsi } = dataPayload;

    if (!idPenyewa || bintang === undefined || !deskripsi) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'id-penyewa', 'bintang', dan 'deskripsi' wajib diisi!",
        { kebutuhan_payload: kontrakAdminBuatReview },
      );
    }

    const fieldDiizinkan = ["id-penyewa", "bintang", "deskripsi"];
    const fieldAsing = Object.keys(dataPayload).filter(
      (key) => !fieldDiizinkan.includes(key),
    );
    if (fieldAsing.length > 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Field tidak dikenali atau tidak diizinkan: ${fieldAsing.join(", ")}.`,
        { kebutuhan_payload: kontrakAdminBuatReview },
      );
    }

    if (typeof idPenyewa !== "string" || !idPenyewa.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'id-penyewa' wajib berupa string ID yang valid.",
      );
    }

    if (typeof deskripsi !== "string" || !deskripsi.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'deskripsi' wajib berupa teks dan tidak boleh kosong.",
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

    const hasil = await adminReviewService.buatReviewOlehAdmin({
      "id-penyewa": idPenyewa,
      bintang,
      deskripsi,
    });

    res.status(201).json({
      status: "sukses",
      pesan: "Ulasan berhasil ditambahkan atas nama penyewa.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const patchReviewAdmin = async (req, res, next) => {
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
        "Minimal kirimkan satu field yang ingin diperbarui ('bintang', 'deskripsi', atau 'terisi').",
        {
          kebutuhan_payload: kontrakAdminUbahReview,
          API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
        },
      );
    }

    const fieldDiizinkan = ["bintang", "deskripsi", "terisi"];
    const fieldAsing = Object.keys(dataPayload).filter(
      (key) => !fieldDiizinkan.includes(key),
    );
    if (fieldAsing.length > 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Field tidak dikenali atau tidak diizinkan: ${fieldAsing.join(", ")}.`,
        {
          kebutuhan_payload: kontrakAdminUbahReview,
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
        );
      }
    }

    if (
      dataPayload.terisi !== undefined &&
      typeof dataPayload.terisi !== "boolean"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'terisi' wajib berupa boolean (true atau false).",
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

    const hasil = await adminReviewService.ubahReviewOlehAdmin(
      req.params.id,
      dataPayload,
    );

    res.status(200).json({
      status: "sukses",
      pesan: "Data ulasan berhasil diperbarui.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const hasil = await adminReviewService.hapusReviewOlehAdmin(req.params.id);

    res.status(200).json({
      status: "sukses",
      pesan: hasil.pesan,
    });
  } catch (error) {
    next(error);
  }
};