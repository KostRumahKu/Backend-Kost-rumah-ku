import * as kamarService from "../../services/admin-services/admin-kamar-service.js";
import {
  kontrakInputPenghuni,
  kontrakPindahKamar,
  kontrakTambahKamar,
  kontrakUbahKamar,
} from "../../contracts/kamar-contract.js";
import { AppError } from "../../errors.js";
import { normalisasiNomorHP } from "../../utils/validasi-format-nomor-hp.js";

export const tambahKamar = async (req, res) => {
  const dataPayload = req.body;

  if (
    !dataPayload ||
    typeof dataPayload !== "object" ||
    Array.isArray(dataPayload)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Payload kamar wajib berupa object.",
    );
  }

  if (dataPayload.lantai === undefined || !dataPayload["tipe-kamar"]) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format request tidak lengkap! 'lantai' dan 'tipe-kamar' wajib diisi.",
      { kebutuhan_payload: kontrakTambahKamar },
    );
  }

  const kamarBaru = await kamarService.tambahKamarBaru(dataPayload);
  res.status(201).json({
    status: "sukses",
    pesan: `Kamar ${kamarBaru["nama-kamar"]} (tipe ${kamarBaru["tipe-kamar"]}) berhasil ditambahkan`,
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

  const isUpdateFoto = Array.isArray(dataUpdate.foto);

  const kamarDiperbarui = await kamarService.ubahDataKamar(
    req.params.id,
    dataUpdate,
  );

  const pesanSukses = isUpdateFoto
    ? `Data kamar berhasil diperbarui dan galeri foto disinkronkan ke seluruh kamar bertipe '${kamarDiperbarui["tipe-kamar"]}'.`
    : "Data kamar berhasil diperbarui";

  res.status(200).json({
    status: "sukses",
    pesan: pesanSukses,
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

  const hasil = await kamarService.resetKamar(idKamar, catatan);

  const pesanRefund =
    hasil.refund > 0
      ? ` Terdapat sisa saldo sewa sebesar Rp ${hasil.refund.toLocaleString("id-ID")} yang wajib dikembalikan (refund) dan telah dicatat sebagai pengeluaran di Buku Kas.`
      : " Tidak ada sisa saldo sewa untuk dikembalikan.";

  res.status(200).json({
    status: "sukses",
    pesan: `Kamar berhasil direset menjadi kosong dan riwayat penghuni telah diarsipkan.${pesanRefund}`,
    data: {
      kamar: hasil.kamar,
      "total-refund": hasil.refund,
    },
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
  const metodeNormalized = dataSewa["metode-pembayaran"].toLowerCase().trim();
  if (!["tunai", "transfer"].includes(metodeNormalized)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Metode pembayaran tidak valid! Gunakan 'tunai' atau 'transfer'.",
      { kebutuhan_payload: kontrakInputPenghuni },
    );
  }

  if (metodeNormalized === "transfer" && !dataSewa["id-rekening"]) {
    throw new AppError(
      "VALIDATION_ERROR",
      "ID Rekening tujuan wajib dipilih jika metode pembayaran adalah 'transfer'.",
      { kebutuhan_payload: kontrakInputPenghuni },
    );
  }
  if (
    dataSewa["metode-pembayaran"].toLowerCase() === "transfer" &&
    !dataSewa["id-rekening"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "ID Rekening tujuan wajib dipilih jika metode pembayaran adalah 'transfer'.",
    );
  }

  if (typeof dataSewa["durasi-bulan"] !== "number") {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format salah! 'durasi-bulan' wajib berupa angka murni (contoh: 3).",
    );
  }

  const teleponBaku = normalisasiNomorHP(
    dataPengguna["nomor-telepon"],
    "Nomor telepon",
  );
  const daruratBaku = normalisasiNomorHP(
    dataPengguna["nomor-kontak-darurat"],
    "Nomor kontak darurat",
  );

  if (teleponBaku === daruratBaku) {
    throw new AppError(
      "BAD_REQUEST",
      "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!",
    );
  }

  dataPengguna["nomor-telepon"] = teleponBaku;
  dataPengguna["nomor-kontak-darurat"] = daruratBaku;

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

  const teleponBaku = normalisasiNomorHP(
    dataPengguna["nomor-telepon"],
    "Nomor telepon",
  );
  const daruratBaku = normalisasiNomorHP(
    dataPengguna["nomor-kontak-darurat"],
    "Nomor kontak darurat",
  );

  if (teleponBaku === daruratBaku) {
    throw new AppError(
      "BAD_REQUEST",
      "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!",
    );
  }

  dataPengguna["nomor-telepon"] = teleponBaku;
  dataPengguna["nomor-kontak-darurat"] = daruratBaku;

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
