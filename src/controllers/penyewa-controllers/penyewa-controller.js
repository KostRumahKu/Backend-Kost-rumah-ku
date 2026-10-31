import * as penyewaService from "../../services/penyewa-services/penyewa-service";
import { kontrakPenyewaUpdateProfil, kontrakPenyewaMintaGantiEmail, kontrakPenyewaKonfirmasiEmailDanaOtp } from "../../contracts/penyewa-contract"
import { AppError } from "../../errors.js";


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

export const updateProfilPenyewa = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;
  const dataUpdate = req.body || {};

  const fieldWajib = [
      "nama-lengkap", 
      "nomor-telepon", 
      "nama-kontak-darurat", 
      "nomor-kontak-darurat"
    ];
    
    for (const field of fieldWajib) {
      if (!dataUpdate[field]) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Tidak ada data yang dikirim untuk diperbarui.",
          { kebutuhan_payload: kontrakPenyewaUpdateProfil, },
        );
      }
    }
    
  await penyewaService.ubahProfilPenyewa(idPengguna, dataUpdate);
  
  res.status(200).json({
    status: "sukses",
    pesan: "Profil berhasil diperbarui."
  });
};

export const hapusFotoProfil = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;
  
  await penyewaService.hapusFotoPenyewa(idPengguna);
  res.status(200).json({
    status: "sukses",
    pesan: "Foto profil berhasil dihapus."
  });
};

export const requestOtpEmail = async (req, res) => {

  const idPengguna = req.pengguna._id || req.pengguna.id;
  const { "email-baru": emailBaru } = req.body || {};

  if (!emailBaru)
    throw new AppError("BAD_REQUEST", "Email baru wajib diisi.", {
      kebutuhan_payload: kontrakPenyewaMintaGantiEmail,
    });

  await penyewaService.requestOtpGantiEmail(idPengguna, emailBaru);

  res.status(200).json({
    status: "sukses",
    pesan: "Kode OTP telah dikirim ke email baru Anda. Berlaku selama 5 menit."
  });
};

export const verifikasiOtpEmail = async (req, res) => {
  const idPengguna = req.pengguna._id || req.pengguna.id;
  const { "email-baru": emailBaru, otp } = req.body || {};

  if (!emailBaru || !otp)
    throw new AppError("BAD_REQUEST", "Email baru dan otp  wajib diisi.", {
      kebutuhan_payload: kontrakPenyewaKonfirmasiEmailDanaOtp,
    });

  const emailUpdate = await penyewaService.verifikasiOtpGantiEmail(idPengguna, emailBaru, otp);

  res.status(200).json({
    status: "sukses",
    pesan: "Email berhasil diubah.",
    data: { email: emailUpdate }
  });
};