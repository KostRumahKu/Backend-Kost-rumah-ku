import * as pengajuanService from "../../services/penyewa-services/penyewa-pengajuan-services.js";
import { AppError } from "../../errors.js";
import { kontrakPenyewaBuatPengajuan } from "../../contracts/penyewa-contract.js";

export const buatPengajuan = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;

  const {
    "jenis-pengajuan": jenisPengajuan,
    "tanggal-target": tanggalTarget,
    alasan,
  } = req.body || {};

  if (!jenisPengajuan || !tanggalTarget || !alasan) {
    throw new AppError(
      "BAD_REQUEST",
      "Jenis pengajuan, tanggal target, dan alasan wajib diisi.",
      { kebtuhan_payload: kontrakPenyewaBuatPengajuan },
    );
  }

  const payload = {
    "jenis-pengajuan": jenisPengajuan,
    "tanggal-target": tanggalTarget,
    alasan: alasan,
  };

  const pengajuan = await pengajuanService.buatPengajuan(idPengguna, payload);

  res.status(201).json({
    status: "sukses",
    pesan: "Pengajuan berhasil dikirim dan sedang menunggu konfirmasi Admin.",
    data: pengajuan,
  });
};

export const batalkanPengajuan = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;
  const { id } = req.params;

  await pengajuanService.batalkanPengajuan(idPengguna, id);

  res.status(200).json({
    status: "sukses",
    pesan: "Pengajuan berhasil dibatalkan.",
  });
};

export const getRiwayatPengajuan = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;

  const riwayat = await pengajuanService.getRiwayatPengajuan(idPengguna);

  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil mengambil riwayat pengajuan.",
    data: riwayat,
  });
};