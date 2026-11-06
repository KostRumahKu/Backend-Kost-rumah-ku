import * as pengajuanService from "../../services/penyewa-services/penyewa-pengajuan-services.js";
import { AppError } from "../../errors.js";
import {
  kontrakPenyewaBuatPengajuanKeluarKost,
  kontrakPenyewaBuatPengajuanPindahKamar,
} from "../../contracts/penyewa-contract.js";

export const buatPengajuan = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;

  const {
    "jenis-pengajuan": jenisPengajuan,
    "tanggal-target": tanggalTarget,
    alasan,
    "id-kamar-tujuan": idKamarTujuan,
  } = req.body || {};

  if (!jenisPengajuan || !tanggalTarget || !alasan) {
    throw new AppError(
      "BAD_REQUEST",
      "Jenis pengajuan, tanggal target, dan alasan wajib diisi.",
      { 
        kebtuhan_payload_keluar_kost: kontrakPenyewaBuatPengajuanKeluarKost,
        kebtuhan_payload_pindah_kamar: kontrakPenyewaBuatPengajuanPindahKamar,
        API_note: "Pilih salah satu mau keluar kost atau pindah kamar!"
      },
    );
  }

  // nanti gua cek lagi jangan di nyalain kondisi ini

  // if (jenisPengajuan === "pindah-kamar" && !idKamarTujuan) {
  //   throw new AppError(
  //     "BAD_REQUEST",
  //     "ID kamar tujuan wajib diisi untuk pengajuan pindah kamar.",
  //     { kebtuhan_payload: kontrakPenyewaBuatPengajuanPindahKamar },
  //   );
  // }

  const payload = {
    "jenis-pengajuan": jenisPengajuan,
    "tanggal-target": tanggalTarget,
    alasan: alasan,
    "id-kamar-tujuan": idKamarTujuan,
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