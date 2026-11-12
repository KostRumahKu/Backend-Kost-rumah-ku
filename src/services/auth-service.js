import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Pengguna from "../models/pengguna-model.js";
import { AppError } from "../errors.js";
import crypto from "crypto";
import { kirimEmail } from "../utils/mail-service.js";
import { templateOTP } from "../utils/email-templates.js";

export const prosesLogin = async (email, kataSandi, peranYangDiharapkan) => {
  const pengguna = await Pengguna.findOne({ email, peran: peranYangDiharapkan });
  
  if (!pengguna) {
    throw new AppError(
      "AUTH_INVALID_CREDENTIALS",
      "Kredensial tidak valid atau peran tidak sesuai",
    );
  }

  const kataSandiValid = await bcrypt.compare(kataSandi, pengguna["kata-sandi"]);
  if (!kataSandiValid) {
    throw new AppError("AUTH_INVALID_CREDENTIALS", "Kata sandi salah");
  }

  const waktuKedaluwarsa = process.env.JWT_EXPIRES_IN;

  const token = jwt.sign(
    { id: pengguna._id, peran: pengguna.peran },
    process.env.JWT_SECRET,
    { expiresIn: waktuKedaluwarsa } 
  );

  return { 
    token, 
    peran: pengguna.peran,
    nama: pengguna["nama-lengkap"] 
  };
};

export const mintaResetPassword = async (email) => {
  const pengguna = await Pengguna.findOne({ email });
  
  if (!pengguna) {
    throw new AppError(
      "USER_NOT_FOUND",
      "Gagal! Email tersebut tidak terdaftar di sistem KostRumahKu.",
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const waktuKedaluwarsa = new Date(Date.now() + 5 * 60 * 1000);

  pengguna["otp-reset"] = otp;
  pengguna["otp-kedaluwarsa"] = waktuKedaluwarsa;
  await pengguna.save();

  kirimEmail({
    to: pengguna.email,
    subject: "Kode OTP Reset Password - Kost RumahKu",
    html: templateOTP(pengguna["nama-lengkap"], otp)
  }).catch(err => console.error("[MAIL ALERT] Gagal kirim OTP:", err.message));
};

export const konfirmasiResetPassword = async (email, otp, passwordBaru) => {
  const pengguna = await Pengguna.findOne({ email });
  
  if (!pengguna || pengguna["otp-reset"] !== otp) {
    throw new AppError("AUTH_INVALID_OTP", "Kode OTP salah atau tidak valid.");
  }

  if (new Date() > pengguna["otp-kedaluwarsa"]) {
    pengguna["otp-reset"] = null;
    pengguna["otp-kedaluwarsa"] = null;
    await pengguna.save();
    throw new AppError("AUTH_EXPIRED_OTP", "Kode OTP sudah kedaluwarsa. Silakan minta ulang.");
  }

  const salt = await bcrypt.genSalt(10);
  pengguna["kata-sandi"] = await bcrypt.hash(passwordBaru, salt);
  pengguna["otp-reset"] = null;
  pengguna["otp-kedaluwarsa"] = null;
  
  await pengguna.save();
};