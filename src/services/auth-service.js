import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Pengguna from "../models/pengguna-model.js.js";

export const prosesLogin = async (email, kataSandi, peranYangDiharapkan) => {
  const pengguna = await Pengguna.findOne({ email, peran: peranYangDiharapkan });
  
  if (!pengguna) {
    throw new Error("Kredensial tidak valid atau peran tidak sesuai");
  }

  const kataSandiValid = await bcrypt.compare(kataSandi, pengguna["kata-sandi"]);
  if (!kataSandiValid) {
    throw new Error("Kata sandi salah");
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