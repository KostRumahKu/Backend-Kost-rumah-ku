import bcrypt from "bcrypt";
import Pengguna from "../../models/pengguna-model.js";
import { AppError } from "../../errors.js";

export const ambilProfilAdminSendiri = async (idAdmin) => {
  const admin = await Pengguna.findById(idAdmin).select(
    "-kata-sandi -otp-reset -otp-kedaluwarsa -email-baru-sementara",
  );

  if (!admin) {
    throw new AppError("NOT_FOUND", "Akun admin/pemilik tidak ditemukan.");
  }

  return admin;
};

export const ambilDetailPenyewaOlehAdmin = async (idPenyewa) => {
  const penyewa = await Pengguna.findById(idPenyewa)
    .select("-kata-sandi -otp-reset -otp-kedaluwarsa -email-baru-sementara")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai harga status");

  if (!penyewa) {
    throw new AppError("NOT_FOUND", "Data pengguna tidak ditemukan.");
  }

  if (!["penyewa", "calon-penyewa"].includes(penyewa.peran)) {
    throw new AppError(
      "FORBIDDEN",
      "Anda hanya dapat melihat detail akun penyewa atau calon-penyewa melalui endpoint ini.",
    );
  }

  return penyewa;
};

export const ambilDaftarPenyewa = async (filterQuery = {}) => {
  const kondisi = {
    peran: { $in: ["penyewa", "calon-penyewa"] },
  };

  if (filterQuery.peran && ["penyewa", "calon-penyewa"].includes(filterQuery.peran)) {
    kondisi.peran = filterQuery.peran;
  }

  if (filterQuery.status && ["aktif", "ditangguhkan"].includes(filterQuery.status)) {
    kondisi["status-akun"] = filterQuery.status;
  }

  if (filterQuery.cari) {
    const regexCari = new RegExp(filterQuery.cari.trim(), "i");
    kondisi.$or = [
      { "nama-lengkap": regexCari },
      { email: regexCari },
      { "nomor-telepon": regexCari },
    ];
  }

  return await Pengguna.find(kondisi)
    .select("-kata-sandi -otp-reset -otp-kedaluwarsa -email-baru-sementara")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai harga")
    .sort({ "dibuat-pada": -1 });
};


const prosesPembaruanProfil = async (targetPengguna, dataUpdate) => {
  // 1. Cek keunikan email jika diubah
  if (dataUpdate.email && dataUpdate.email !== targetPengguna.email) {
    const emailTerpakai = await Pengguna.findOne({
      email: dataUpdate.email,
      _id: { $ne: targetPengguna._id },
    });
    if (emailTerpakai) {
      throw new AppError(
        "CONFLICT",
        "Email tersebut sudah digunakan oleh pengguna lain!",
      );
    }
    targetPengguna.email = dataUpdate.email;
  }

  // 2. Cek keunikan nomor telepon jika diubah
  if (
    dataUpdate["nomor-telepon"] &&
    dataUpdate["nomor-telepon"] !== targetPengguna["nomor-telepon"]
  ) {
    const teleponTerpakai = await Pengguna.findOne({
      "nomor-telepon": dataUpdate["nomor-telepon"],
      _id: { $ne: targetPengguna._id },
    });
    if (teleponTerpakai) {
      throw new AppError(
        "CONFLICT",
        "Nomor telepon tersebut sudah digunakan oleh pengguna lain!",
      );
    }
    targetPengguna["nomor-telepon"] = dataUpdate["nomor-telepon"];
  }

  // 3. Perbarui kontak darurat jika dikirim
  if (dataUpdate["nama-kontak-darurat"]) {
    targetPengguna["nama-kontak-darurat"] = dataUpdate["nama-kontak-darurat"];
  }

  if (dataUpdate["nomor-kontak-darurat"]) {
    targetPengguna["nomor-kontak-darurat"] = dataUpdate["nomor-kontak-darurat"];
  }

  // 4. Pastikan nomor telepon akhir dan kontak darurat akhir tidak kembar
  // (Penting jika PATCH hanya mengubah salah satu nomor saja)
  if (
    targetPengguna["nomor-telepon"] &&
    targetPengguna["nomor-kontak-darurat"] &&
    targetPengguna["nomor-telepon"] === targetPengguna["nomor-kontak-darurat"]
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Nomor telepon dan nomor kontak darurat tidak boleh sama!",
    );
  }

  // 5. Perbarui nama lengkap (hanya diizinkan jika flag dipassing dari profil sendiri)
  if (dataUpdate["nama-lengkap"]) {
    targetPengguna["nama-lengkap"] = dataUpdate["nama-lengkap"];
  }

  // 6. Perbarui foto profil jika dikirim
  if (dataUpdate["foto-profil"]) {
    targetPengguna["foto-profil"] = dataUpdate["foto-profil"];
  }

  // 7. Timpa & hash kata sandi baru jika dikirim
  if (dataUpdate["kata-sandi"]) {
    const salt = await bcrypt.genSalt(10);
    targetPengguna["kata-sandi"] = await bcrypt.hash(
      dataUpdate["kata-sandi"],
      salt,
    );
  }

  await targetPengguna.save();

  // Kembalikan data bersih tanpa field sensitif
  const hasilObjek = targetPengguna.toObject();
  delete hasilObjek["kata-sandi"];
  delete hasilObjek["otp-reset"];
  delete hasilObjek["otp-kedaluwarsa"];
  delete hasilObjek["email-baru-sementara"];

  return hasilObjek;
};

export const editProfilAdminSendiri = async (idAdmin, dataUpdate) => {
  const admin = await Pengguna.findById(idAdmin);
  if (!admin) {
    throw new AppError("NOT_FOUND", "Akun admin/pemilik tidak ditemukan.");
  }

  return await prosesPembaruanProfil(admin, dataUpdate);
};

export const editProfilPenyewaOlehAdmin = async (idPenyewa, dataUpdate) => {
  const penyewa = await Pengguna.findById(idPenyewa);
  if (!penyewa) {
    throw new AppError("NOT_FOUND", "Data pengguna tidak ditemukan.");
  }

  if (!["penyewa", "calon-penyewa"].includes(penyewa.peran)) {
    throw new AppError(
      "FORBIDDEN",
      "Anda hanya dapat mengedit profil akun dengan peran penyewa atau calon-penyewa melalui endpoint ini.",
    );
  }

  return await prosesPembaruanProfil(penyewa, dataUpdate);
};