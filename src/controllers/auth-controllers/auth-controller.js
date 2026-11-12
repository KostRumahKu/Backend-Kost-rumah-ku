import * as authService from "../../services/auth-service.js";
import { AppError } from "../../errors.js";
import { kontrakAuth, kontrakRequestOTP, kontrakKonfirmasiOTP } from "../../contracts/auth-contract.js";

// Fungsi pembungkus untuk menangani login berdasarkan peran
const loginBerdasarkanPeran = (peran) => async (req, res) => {
  const { email, "kata-sandi": kataSandi } = req.body ?? {};

  if (!email || !kataSandi) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Formar data tidak lengkap!",
      { kebutuhan_payload: kontrakAuth }
    );
  }

  const hasilLogin = await authService.prosesLogin(email, kataSandi, peran);

  res.status(200).json({
    status: "sukses",
    pesan: `Berhasil login sebagai ${peran}`,
    data: hasilLogin
  });
};

// semua role yang ada kalau nambah role nambah kesini
export const loginPemilik = loginBerdasarkanPeran("pemilik");
export const loginAdmin = loginBerdasarkanPeran("admin");
export const loginPenyewa = loginBerdasarkanPeran("penyewa");


export const requestLupaPassword = async (req, res) => {
  const dataPayload = req.body
  const { email } = dataPayload ?? {};
  
  if (!email) {
    throw new AppError(
      "VALIDATION_ERROR", 
      "Format request tidak lengkap! Email wajib diisi.",
      { kebutuhan_payload: kontrakRequestOTP }
    );
  }
  await authService.mintaResetPassword(email);
  res.status(200).json({
    status: "sukses",
    pesan: "Kode OTP berhasil dikirim! Silakan cek kotak masuk atau folder spam email Anda."
  });
};

export const konfirmasiLupaPassword = async (req, res) => {
  const dataPayload = req.body;
  const { email, otp, passwordBaru } = dataPayload ?? {};

  if (!email || !otp || !passwordBaru) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Format request tidak lengkap! Email, PasswordBaru, otp wajib diisi.",
      { kebutuhan_payload: kontrakKonfirmasiOTP },
    );
  }

  await authService.konfirmasiResetPassword(email, otp, passwordBaru);

  res.status(200).json({
    status: "sukses",
    pesan: "Password berhasil diperbarui. Silakan login dengan password baru."
  });
};
