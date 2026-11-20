import * as adminPenggunaService from "../../services/admin-services/admin-edit-pengguna-service.js";
import { AppError } from "../../errors.js";
import { normalisasiNomorHP } from "../../utils/validasi-format-nomor-hp.js";
import {
  kontrakAdminEditProfilSendiri,
  kontrakAdminEditProfilPenyewa,
} from "../../contracts/admin-edit-pengguna-contract.js";

export const getProfilAdminSendiri = async (req, res) => {
  const idAdmin = req.pengguna._id || req.pengguna.id;
  const hasil = await adminPenggunaService.ambilProfilAdminSendiri(idAdmin);

  res.status(200).json({
    status: "sukses",
    data: hasil,
  });
};

export const getDaftarPenyewa = async (req, res) => {
  const hasil = await adminPenggunaService.ambilDaftarPenyewa(req.query);

  res.status(200).json({
    status: "sukses",
    total: hasil.length,
    data: hasil,
  });
};

export const getDetailPenyewa = async (req, res) => {
  const idPenyewa = req.params.id;
  const hasil = await adminPenggunaService.ambilDetailPenyewaOlehAdmin(idPenyewa);

  res.status(200).json({
    status: "sukses",
    data: hasil,
  });
};

const validasiDanSiapkanPayload = (body, daftarFieldDiizinkan, kontrak) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("VALIDATION_ERROR", "Payload request tidak valid.", {
      kebutuhan_payload: kontrak,
      API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
    });
  }

  const keysDikirim = Object.keys(body);

  if (keysDikirim.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Minimal kirimkan satu field untuk diperbarui.",
      { kebutuhan_payload: kontrak,
        API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
       },
    );
  }

  const fieldTerlarang = keysDikirim.filter(
    (key) => !daftarFieldDiizinkan.includes(key),
  );
  if (fieldTerlarang.length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Field berikut tidak diizinkan untuk diubah: ${fieldTerlarang.join(", ")}.`,
      { kebutuhan_payload: kontrak,
        API_note: "Karena ini patch jadi cukup kirimkan salah satu field yang mau diganti saja",
       },
    );
  }

  const payloadBersih = {};

  if (body["nama-lengkap"] !== undefined) {
    const nama = String(body["nama-lengkap"]).trim();
    if (!nama) {
      throw new AppError("VALIDATION_ERROR", "Nama lengkap tidak boleh kosong.");
    }
    payloadBersih["nama-lengkap"] = nama;
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      throw new AppError("VALIDATION_ERROR", "Format email tidak valid.");
    }
    payloadBersih.email = email;
  }

  if (body["kata-sandi"] !== undefined) {
    const sandi = String(body["kata-sandi"]);
    if (sandi.length < 6) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Kata sandi baru minimal harus terdiri dari 6 karakter.",
      );
    }
    payloadBersih["kata-sandi"] = sandi;
  }

  if (body["nomor-telepon"] !== undefined) {
    payloadBersih["nomor-telepon"] = normalisasiNomorHP(
      body["nomor-telepon"],
      "Nomor telepon",
    );
  }

  if (body["nama-kontak-darurat"] !== undefined) {
    const namaDarurat = String(body["nama-kontak-darurat"]).trim();
    if (!namaDarurat) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Nama kontak darurat tidak boleh kosong.",
      );
    }
    payloadBersih["nama-kontak-darurat"] = namaDarurat;
  }

  if (body["nomor-kontak-darurat"] !== undefined) {
    payloadBersih["nomor-kontak-darurat"] = normalisasiNomorHP(
      body["nomor-kontak-darurat"],
      "Nomor kontak darurat",
    );
  }

  if (body["foto-profil"] !== undefined) {
    const urlFoto = String(body["foto-profil"]).trim();
    if (!urlFoto || !/^https?:\/\/.+/.test(urlFoto)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Format 'foto-profil' harus berupa URL gambar yang valid (http/https).",
      );
    }
    payloadBersih["foto-profil"] = urlFoto;
  }

  return payloadBersih;
};

export const patchProfilAdminSendiri = async (req, res) => {
  const idAdmin = req.pengguna._id || req.pengguna.id;
  const fieldDiizinkan = [
    "nama-lengkap",
    "email",
    "kata-sandi",
    "nomor-telepon",
    "nama-kontak-darurat",
    "nomor-kontak-darurat",
    "foto-profil",
  ];

  const payloadBersih = validasiDanSiapkanPayload(
    req.body,
    fieldDiizinkan,
    kontrakAdminEditProfilSendiri,
  );

  const hasil = await adminPenggunaService.editProfilAdminSendiri(
    idAdmin,
    payloadBersih,
  );

  res.status(200).json({
    status: "sukses",
    pesan: "Profil Anda berhasil diperbarui.",
    data: hasil,
  });
};

export const patchProfilPenyewa = async (req, res) => {
  const idPenyewa = req.params.id;
  const fieldDiizinkan = [
    "email",
    "kata-sandi",
    "nomor-telepon",
    "nama-kontak-darurat",
    "nomor-kontak-darurat",
    "foto-profil",
  ];

  const payloadBersih = validasiDanSiapkanPayload(
    req.body,
    fieldDiizinkan,
    kontrakAdminEditProfilPenyewa,
  );

  const hasil = await adminPenggunaService.editProfilPenyewaOlehAdmin(
    idPenyewa,
    payloadBersih,
  );

  res.status(200).json({
    status: "sukses",
    pesan: "Profil penyewa berhasil diperbarui.",
    data: hasil,
  });
};