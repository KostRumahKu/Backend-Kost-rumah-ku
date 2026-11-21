import * as peraturanService from "../../services/admin-services/admin-peraturan-service.js";
import {
  KontrakAdminPeraturan,
  KontrakAdminUbahPeraturan,
} from "../../contracts/admin-peraturan-contract.js";
import { AppError } from "../../errors.js";

export const tambahPeraturan = async (req, res, next) => {
    const dataPayload = req.body;
    const {  deskripsi, gambar } = dataPayload ?? {};

     if (!deskripsi) {
       throw new AppError("BAD_REQUEST", "Payload wajib diisi.", {
         kebutuhan_payload: KontrakAdminPeraturan,
       });
     }
  try {
    const data = await peraturanService.tambahPeraturan(req.body);
    res.status(201).json({
      status: "sukses",
      pesan: "Peraturan baru berhasil ditambahkan.",
      data
    });
  } catch (error) {
    next(error);
  }
};

export const ambilSemuaPeraturan = async (req, res, next) => {
  try {
    const data = await peraturanService.ambilSemuaPeraturan();
    res.status(200).json({ status: "sukses", data });
  } catch (error) {
    next(error);
  }
};

export const ambilDetailPeraturan = async (req, res, next) => {
  try {
    const data = await peraturanService.ambilDetailPeraturan(req.params.id);
    res.status(200).json({ status: "sukses", data });
  } catch (error) {
    next(error);
  }
};

export const ubahPeraturan = async (req, res, next) => {
  const dataPayload = req.body;
    if (
        !dataPayload ||
        typeof dataPayload !== "object" ||
        Array.isArray(dataPayload) ||
        Object.keys(dataPayload).length === 0
      ) {
        throw new AppError(
          "BAD_REQUEST",
          "Minimal kirimkan satu field yang ingin diperbarui.",
          {
            kebutuhan_payload: KontrakAdminUbahPeraturan,
            API_note: "Cukup kirim field yang mau diganti saja",
          },
        );
      }
  try {
    const data = await peraturanService.ubahPeraturan(req.params.id, req.body);
    res.status(200).json({
      status: "sukses",
      pesan: "Peraturan berhasil diperbarui.",
      data
    });
  } catch (error) {
    next(error);
  }
};

export const hapusPeraturan = async (req, res, next) => {
  try {
    const hasil = await peraturanService.hapusPeraturan(req.params.id);
    res.status(200).json({ status: "sukses", ...hasil });
  } catch (error) {
    next(error);
  }
};