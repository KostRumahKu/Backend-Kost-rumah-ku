import * as adminPengajuanService from "../../services/admin-services/admin-pengajuan-service.js";
import { AppError } from "../../errors.js";
import { kontrakAdminProsesPengajuan } from "../../contracts/admin-pengajuan-contract.js"

export const getSemuaPengajuan = async (req, res) => {
  const {
    status,
    "jenis-pengajuan": jenisPengajuan,
    "id-kamar-sekarang": idKamarSekarang,
  } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (jenisPengajuan) filters["jenis-pengajuan"] = jenisPengajuan;
  if (idKamarSekarang) filters["id-kamar-sekarang"] = Number(idKamarSekarang); // pastikan jadi number jika skema ID kamar Anda angka

  const data = await adminPengajuanService.getSemuaPengajuan(filters);

  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil mengambil daftar pengajuan.",
    data: data,
  });
};

export const getDetailPengajuan = async (req, res) => {
  const { id } = req.params;

  const data = await adminPengajuanService.getDetailPengajuan(id);

  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil mengambil detail pengajuan.",
    data: data,
  });
};

export const prosesPengajuan = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    "catatan-admin": catatanAdmin,
    "batalkan-tagihan-aktif": batalkanTagihan,
  } = req.body || {};

  if (!status) {
    throw new AppError("BAD_REQUEST", "Status persetujuan wajib diisi.", {
      kebutuhan_payload: kontrakAdminProsesPengajuan,
    });
  }

  const payload = {
    status,
    "catatan-admin": catatanAdmin,
    "batalkan-tagihan-aktif": batalkanTagihan,
  };

  const hasil = await adminPengajuanService.prosesPengajuan(id, payload);

  res.status(200).json({
    status: "sukses",
    pesan: `Pengajuan berhasil ${status}.`,
    data: hasil,
  });
};

export const rollbackPersetujuan = async (req, res) => {
  const { id } = req.params;
  const { "catatan-admin": catatanAdmin } = req.body || {};

  const hasil = await adminPengajuanService.rollbackPersetujuan(id, catatanAdmin);

  res.status(200).json({
    status: "sukses",
    pesan: "Persetujuan pengajuan berhasil dibatalkan. Data tagihan (jika ada) telah dipulihkan.",
    data: hasil
  });
};