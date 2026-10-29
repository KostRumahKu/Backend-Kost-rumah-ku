import * as penyewaService from "../services/penyewa-service.js";

export const getDashboardPenyewa = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;

  const dataDashboard = await penyewaService.ambilProfilDashboard(idPengguna);

  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil memuat data dashboard penyewa.",
    data: dataDashboard,
  });
};

export const getTagihanPenyewa = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;

  const dataTagihan = await penyewaService.ambilTagihanPenyewa(
    idPengguna,
    req.query,
  );

  res.status(200).json({
    status: "sukses",
    pesan: req.query.filter
      ? `Berhasil memuat tagihan (${req.query.filter}).`
      : "Berhasil memuat semua tagihan.",
    data: dataTagihan,
  });
};

export const getPengumumanPenyewa = async (req, res) => {
  const dataPengumuman = await penyewaService.ambilPengumumanPenyewa();

  res.status(200).json({
    status: "sukses",
    pesan: "Berhasil memuat daftar pengumuman.",
    data: dataPengumuman,
  });
};