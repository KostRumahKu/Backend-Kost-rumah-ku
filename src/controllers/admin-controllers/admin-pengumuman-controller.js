import * as pengumumanService from "../../services/admin-services/admin-pengumuman-service.js";
import { AppError } from "../../errors.js";
import { kontrakKirimPengumuman } from "../../contracts/admin-pengumuman-contract.js";

export const broadcastPengumuman = async (req, res) => {
  const dataPayload = req.body;
  const { judul, pesan, gambar } = dataPayload ?? {};
  const idAdmin = req.pengguna._id || req.pengguna.id;
  
  if (!judul || !pesan) {
    throw new AppError(
    "VALIDATION_ERROR",
    "Data broadcast tidak lengkap",
    { kebutuhan_payload: kontrakKirimPengumuman },
    );
  }

  const hasil = await pengumumanService.buatBroadcastPengumuman({ judul, pesan, gambar }, idAdmin);

  res.status(201).json({
    status: "sukses",
    pesan: "Pengumuman berhasil dibuat dan sedang dikirimkan ke email penyewa aktif.",
    data: hasil
  });
};

export const lihatRiwayatPengumuman = async (req, res) => {
  const riwayat = await pengumumanService.ambilRiwayatPengumuman();
  
  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil memuat riwayat pengumuman.",
    data: riwayat
  });
};