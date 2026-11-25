import * as fasilitasService from "../../services/admin-services/admin-fasilitas-service.js";
import { AppError } from "../../errors.js";
import {
  kontrakTambahFasilitas,
  kontrakUbahFasilitas,
} from "../../contracts/admin-fasilitas-contract.js";

const validasiArrayGambar = (gambar, kontrak) => {
  if (!Array.isArray(gambar)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Field 'gambar' wajib berupa array berisi URL gambar.",
      { kebutuhan_payload: kontrak },
    );
  }

  const regexUrl = /^https?:\/\/.+/;
  for (const item of gambar) {
    if (typeof item !== "string" || !regexUrl.test(item.trim())) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Setiap item di dalam array 'gambar' wajib berupa URL gambar yang valid (http/https).",
        { kebutuhan_payload: kontrak },
      );
    }
  }
};

export const tambahFasilitas = async (req, res, next) => {
  try {
    const dataPayload = req.body ?? {};
    const { deskripsi, gambar } = dataPayload;

    if (!deskripsi || typeof deskripsi !== "string" || !deskripsi.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Field 'deskripsi' wajib diisi!",
        { kebutuhan_payload: kontrakTambahFasilitas },
      );
    }

    if (gambar !== undefined) {
      validasiArrayGambar(gambar, kontrakTambahFasilitas);
    }

    const hasil = await fasilitasService.tambahFasilitas({
      deskripsi,
      gambar,
    });

    res.status(201).json({
      status: "sukses",
      pesan: "Fasilitas berhasil ditambahkan.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const ambilSemuaFasilitas = async (req, res, next) => {
  try {
    const hasil = await fasilitasService.ambilSemuaFasilitas();

    res.status(200).json({
      status: "sukses",
      total: hasil.length,
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const ambilDetailFasilitas = async (req, res, next) => {
  try {
    const hasil = await fasilitasService.ambilDetailFasilitas(req.params.id);

    res.status(200).json({
      status: "sukses",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const ubahFasilitas = async (req, res, next) => {
  try {
    const dataPayload = req.body;

    if (
      !dataPayload ||
      typeof dataPayload !== "object" ||
      Array.isArray(dataPayload) ||
      Object.keys(dataPayload).length === 0
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Minimal kirimkan satu field yang ingin diperbarui.",
        { kebutuhan_payload: kontrakUbahFasilitas },
      );
    }

    const fieldDiizinkan = ["deskripsi", "gambar"];
    const fieldAsing = Object.keys(dataPayload).filter(
      (key) => !fieldDiizinkan.includes(key),
    );
    if (fieldAsing.length > 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Field tidak dikenali atau tidak diizinkan: ${fieldAsing.join(", ")}.`,
        { kebutuhan_payload: kontrakUbahFasilitas },
      );
    }

    if (dataPayload.deskripsi !== undefined) {
      if (
        typeof dataPayload.deskripsi !== "string" ||
        !dataPayload.deskripsi.trim()
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Field 'deskripsi' tidak boleh kosong.",
          { kebutuhan_payload: kontrakUbahFasilitas },
        );
      }
    }

    if (dataPayload.gambar !== undefined) {
      validasiArrayGambar(dataPayload.gambar, kontrakUbahFasilitas);
    }

    const hasil = await fasilitasService.ubahFasilitas(
      req.params.id,
      dataPayload,
    );

    res.status(200).json({
      status: "sukses",
      pesan: "Fasilitas berhasil diperbarui.",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const hapusFasilitas = async (req, res, next) => {
  try {
    const hasil = await fasilitasService.hapusFasilitas(req.params.id);

    res.status(200).json({
      status: "sukses",
      pesan: hasil.pesan,
    });
  } catch (error) {
    next(error);
  }
};