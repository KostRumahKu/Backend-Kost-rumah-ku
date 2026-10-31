import Pengguna from "../../models/pengguna-model.js";
import Kamar from "../../models/kamar-model.js";
import { AppError } from "../../errors.js";
import Tagihan from "../../models/tagihan-model.js";
import Pengumuman from "../../models/pengumuman-model.js";
import { kirimEmail } from "../../utils/mail-service.js";
import { templateOtpGantiEmail } from "../../utils/email-templates.js";
import crypto from "node:crypto";

export const ambilProfilDashboard = async (idPengguna) => {
  const profil = await Pengguna.findById(idPengguna)
    .select("nama-lengkap email nomor-telepon foto-profil nama-kontak-darurat nomor-kontak-darurat id-kamar")
    .select("-kata-sandi -otp-reset -otp-kedaluwarsa")
    .lean();

  if (!profil) {
    throw new AppError("USER_NOT_FOUND", "Data profil tidak ditemukan.");
  }
  let dataKamar = null;
  if (profil["id-kamar"]) {
    dataKamar = await Kamar.findById(profil["id-kamar"])
      .select("nama-kamar tipe-kamar lantai fasilitas foto") 
      .lean();
  }

  return {
    profil,
    kamarAktif: dataKamar,
  };
};

export const ambilTagihanPenyewa = async (idPengguna, query = {}) => {
  const filter = { "id-pengguna": idPengguna };

  if (query.filter === "aktif") {
    filter.status = { $ne: "lunas" };
  } else if (query.filter === "riwayat") {
    filter.status = "lunas";
  }

  const sortOrder = query.filter === "riwayat" ? -1 : 1;

  const daftarTagihan = await Tagihan.find(filter)
    .sort({ "tanggal-jatuh-tempo": sortOrder })
    .lean();
  if (query.filter === "aktif") {
    const hariIni = new Date();
    daftarTagihan.forEach((tagihan) => {
      const jatuhTempo = new Date(tagihan["tanggal-jatuh-tempo"]);
      const selisihWaktu = jatuhTempo.getTime() - hariIni.getTime();
      const sisaHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));

      tagihan.sisaHari = sisaHari; 
      tagihan.isTerlambat = sisaHari < 0;
    });
  }

  return daftarTagihan;
};

export const ambilPengumumanPenyewa = async () => {
  const daftarPengumuman = await Pengumuman.find()
    .select("-dibuat-oleh") 
    .sort({ "dibuat-pada": -1 })
    .lean();

  const waktuSekarang = new Date();
  const BATAS_WAKTU_BARU_MS = 60 * 60 * 1000; 

  const hasil = daftarPengumuman.map((pengumuman) => {
    const waktuDibuat = new Date(pengumuman["dibuat-pada"]);
    const selisihWaktu = waktuSekarang - waktuDibuat;

    const isBaru = selisihWaktu <= BATAS_WAKTU_BARU_MS;

    return {
      ...pengumuman,
      isBaru,
    };
  });

  return hasil;
};

export const ubahProfilPenyewa = async (idPengguna, dataUpdate) => {
  const pengguna = await Pengguna.findById(idPengguna);
  if (!pengguna) throw new AppError("NOT_FOUND", "Pengguna tidak ditemukan.");

  let adaPerubahan = false;

  if (dataUpdate["nama-lengkap"] !== pengguna["nama-lengkap"]) adaPerubahan = true;
  if (dataUpdate["nomor-telepon"] !== pengguna["nomor-telepon"]) adaPerubahan = true;
  if (dataUpdate["nama-kontak-darurat"] !== pengguna["nama-kontak-darurat"]) adaPerubahan = true;
  if (dataUpdate["nomor-kontak-darurat"] !== pengguna["nomor-kontak-darurat"]) adaPerubahan = true;
  if (dataUpdate["foto-profil"] !== undefined && dataUpdate["foto-profil"] !== pengguna["foto-profil"]) adaPerubahan = true;

  if (!adaPerubahan) {
    throw new AppError("BAD_REQUEST", "Tidak ada perubahan data yang dilakukan.");
  }

  if (dataUpdate["nomor-telepon"] !== pengguna["nomor-telepon"]) {
    const cekNoHp = await Pengguna.findOne({ "nomor-telepon": dataUpdate["nomor-telepon"] });
    if (cekNoHp) throw new AppError("BAD_REQUEST", "Nomor telepon sudah terdaftar di akun lain.");
    pengguna["nomor-telepon"] = dataUpdate["nomor-telepon"];
  }

  pengguna["nama-lengkap"] = dataUpdate["nama-lengkap"];
  pengguna["nama-kontak-darurat"] = dataUpdate["nama-kontak-darurat"];
  pengguna["nomor-kontak-darurat"] = dataUpdate["nomor-kontak-darurat"];
  
  if (dataUpdate["foto-profil"] !== undefined) {
    pengguna["foto-profil"] = dataUpdate["foto-profil"];
  }

  await pengguna.save();
  return pengguna;
};

export const hapusFotoPenyewa = async (idPengguna) => {
  const pengguna = await Pengguna.findById(idPengguna);
  if (!pengguna) throw new AppError("NOT_FOUND", "Pengguna tidak ditemukan.");

  const defaultFoto = "https://uploader.danafxc.my.id/images/8c67c844-421b-470a-aa42-476429f8cce2.png";

  if (pengguna["foto-profil"] === defaultFoto) {
    throw new AppError(
      "BAD_REQUEST",
      "Foto profil sudah merupakan foto bawaan.",
    );
  }

  pengguna["foto-profil"] = defaultFoto;
  await pengguna.save();

  return pengguna;
};

export const requestOtpGantiEmail = async (idPengguna, emailBaru) => {

  const otp = crypto.randomInt(100000, 1000000).toString();
  const kedaluwarsa = new Date(Date.now() + 5 * 60 * 1000);

  const pengguna = await Pengguna.findById(idPengguna);
  if (pengguna.email === emailBaru)
    throw new AppError(
      "BAD_REQUEST",
      "Email baru tidak boleh sama dengan email saat ini.",
    );

  const cekEmail = await Pengguna.findOne({ email: emailBaru });
  if (cekEmail)
    throw new AppError("BAD_REQUEST", "Email sudah terdaftar pada akun lain.");

  pengguna["otp-reset"] = otp;
  pengguna["otp-kedaluwarsa"] = kedaluwarsa;
  pengguna["email-baru-sementara"] = emailBaru;
  await pengguna.save();

  await kirimEmail({
    to: emailBaru,
    subject: "Verifikasi Perubahan Email - KostRumahKu",
    html: templateOtpGantiEmail(pengguna["nama-lengkap"], otp)
  });
};

export const verifikasiOtpGantiEmail = async (idPengguna, emailBaru, otpInput) => {
  const pengguna = await Pengguna.findById(idPengguna);

  if (!pengguna["otp-reset"] || pengguna["otp-reset"] !== otpInput) {
    throw new AppError("BAD_REQUEST", "Kode OTP salah atau tidak valid.");
  }

  if (new Date() > pengguna["otp-kedaluwarsa"]) {
    throw new AppError("BAD_REQUEST", "Kode OTP sudah kedaluwarsa. Silakan request ulang.");
  }

  if (pengguna["email-baru-sementara"] !== emailBaru) {
    throw new AppError("BAD_REQUEST", "Email tidak cocok dengan permintaan OTP awal.");
  }

  const cekEmail = await Pengguna.findOne({ email: emailBaru });
  if (cekEmail) throw new AppError("BAD_REQUEST", "Email sudah terdaftar pada akun lain.");

  pengguna.email = emailBaru;
  pengguna["otp-reset"] = null;
  pengguna["otp-kedaluwarsa"] = null;
  pengguna["email-baru-sementara"] = null;
  await pengguna.save();

  return pengguna.email;
};