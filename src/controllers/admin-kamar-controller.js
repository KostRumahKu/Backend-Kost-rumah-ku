import * as kamarService from "../services/admin-kamar-service.js";
import {
  kontrakInputPenghuni,
  kontrakPindahKamar,
  kontrakUbahKamar,
} from "../contracts/kamar-contract.js";
import { AppError } from "../errors.js";

export const tambahKamar = async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new AppError("VALIDATION_ERROR", "Payload kamar wajib berupa object.");
  }

  const kamarBaru = await kamarService.tambahKamarBaru(req.body);
  res.status(201).json({
    status: "sukses",
    pesan: "Kamar berhasil ditambahkan",
    data: kamarBaru,
  });
};

export const lihatDaftarKamar = async (req, res) => {
  const daftarKamar = await kamarService.ambilSemuaKamar(req.query);
  res.status(200).json({
    status: "sukses",
    data: daftarKamar,
  });
};

export const lihatDetailKamar = async (req, res) => {
  const kamar = await kamarService.ambilDetailKamar(req.params.id);
  res.status(200).json({
    status: "sukses",
    data: kamar,
  });
};

export const ubahKamar = async (req, res) => {
  const dataUpdate = req.body;

  if (
    !dataUpdate ||
    typeof dataUpdate !== "object" ||
    Array.isArray(dataUpdate) ||
    Object.keys(dataUpdate).length === 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Tidak ada data yang dikirim untuk diperbarui.",
      { kebutuhan_payload: kontrakUbahKamar },
    );
  }

  const kamarDiperbarui = await kamarService.ubahDataKamar(
    req.params.id,
    dataUpdate,
  );

  res.status(200).json({
    status: "sukses",
    pesan: "Data kamar berhasil diperbarui",
    data: kamarDiperbarui,
  });
};

export const hapusKamar = async (req, res) => {
  const idKamar = req.params.id;
  const isPermanent = req.query.permanent === "true";

  await kamarService.hapusKamar(idKamar, isPermanent);

  res.status(200).json({
    status: "sukses",
    pesan: isPermanent
      ? "Kamar berhasil dihapus permanen"
      : "Kamar berhasil dipindahkan ke arsip ",
  });
};

export const resetKamar = async (req, res) => {
  const idKamar = req.params.id;
  const catatan = req.body?.catatan;

  await kamarService.resetKamar(idKamar, catatan);

  res.status(200).json({
    status: "sukses",
    pesan:
      "Kamar berhasil direset menjadi kosong dan riwayat penghuni telah diarsipkan",
  });
};

export const inputPenghuniManual = async (req, res) => {
  const idKamar = req.params.id;
  const dataPayload = req.body;
  const { dataPengguna, dataSewa } = dataPayload ?? {};

  if (
    !dataPengguna ||
    !dataSewa ||
    !dataPengguna["nama-lengkap"] ||
    !dataPengguna.email ||
    !dataPengguna["nomor-telepon"] ||
    !dataPengguna["nama-kontak-darurat"] ||
    !dataPengguna["nomor-kontak-darurat"] ||
    !dataSewa["durasi-bulan"] ||
    !dataSewa["tanggal-mulai"] ||
    !dataSewa["metode-pembayaran"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format request tidak lengkap! Harap pastikan semua data yang wajib telah diisi.",
      { kebutuhan_payload: kontrakInputPenghuni },
    );
  }

  if (typeof dataSewa["durasi-bulan"] !== "number") {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format salah! 'durasi-bulan' wajib berupa angka murni (contoh: 3).",
    );
  }

  if (
    dataPengguna["nomor-telepon"] ===
    dataPengguna["nomor-kontak-darurat"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!",
    );
  }

  const hasil = await kamarService.inputPenghuniManual(idKamar, dataPayload);

  res.status(201).json({
    status: "sukses",
    pesan: `Berhasil menginput penghuni baru secara manual. Tagihan ${hasil.nomorInvoice} otomatis dibuat dan dilunasi!`,
    data: hasil,
  });
};

export const entryDataLama = async (req, res) => {
  const idKamar = req.params.id;
  const dataPayload = req.body;
  const { dataPengguna, dataSewa } = dataPayload ?? {};

  if (
    !dataPengguna ||
    !dataSewa ||
    !dataPengguna["nama-lengkap"] ||
    !dataPengguna.email ||
    !dataPengguna["nomor-telepon"] ||
    !dataPengguna["nama-kontak-darurat"] ||
    !dataPengguna["nomor-kontak-darurat"] ||
    dataSewa["durasi-bulan"] === undefined ||
    !dataSewa["tanggal-mulai"] ||
    !dataSewa["metode-pembayaran"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format request tidak lengkap!",
      { kebutuhan_payload: kontrakInputPenghuni },
    );
  }

  if (
    typeof dataSewa["durasi-bulan"] !== "number" ||
    dataSewa["durasi-bulan"] <= 0
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Durasi sewa wajib berupa angka murni dan minimal 1 bulan.",
    );
  }

  if (
    dataPengguna["nomor-telepon"] ===
    dataPengguna["nomor-kontak-darurat"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!",
    );
  }

  const hasil = await kamarService.entryDataLama(idKamar, dataPayload);

  res.status(201).json({
    status: "sukses",
    pesan:
      "Berhasil mendigitalisasi/entry data penghuni lama secara manual. Tagihan otomatis dibuat.",
    data: hasil,
  });
};

export const pindahKamar = async (req, res) => {
  const dataPayload = req.body;

  if (
    !dataPayload ||
    !dataPayload["id-pengguna"] ||
    dataPayload["id-kamar-baru"] === undefined
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "ID Pengguna dan ID Kamar Baru wajib dikirimkan!",
      { kebutuhan_payload: kontrakPindahKamar },
    );
  }

  if (typeof dataPayload["id-kamar-baru"] !== "number") {
    throw new AppError(
      "VALIDATION_ERROR",
      "ID Kamar Baru wajib berupa angka murni (contoh: 2005).",
    );
  }

  const hasil = await kamarService.pindahKamar(dataPayload);

  res.status(200).json({
    status: "sukses",
    pesan: `Penyewa berhasil dipindahkan ke Kamar ${dataPayload["id-kamar-baru"]}.`,
    data: hasil,
  });
};
