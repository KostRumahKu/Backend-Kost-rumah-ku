import { AppError } from "../errors.js";

export const normalisasiNomorHP = (nomor, namaField = "Nomor telepon") => {
  if (!nomor) return nomor;

  let bersih = String(nomor).replace(/[\s\-()+]/g, "");

  if (bersih.startsWith("0")) {
    bersih = "62" + bersih.slice(1);
  }

  // ini jadi kalau penyewa input 081232 -> otomatis jadi +81232 kalau indo itu 08128912 -> +62 jadi fe input nya +62 kode negara diutamakan
  const regexInternasional = /^[1-9][0-9]{7,14}$/;
  if (!regexInternasional.test(bersih)) {
    throw new AppError(
      "VALIDATION_ERROR",
      `${namaField} tidak valid! Gunakan nomor HP yang benar beserta kode negara atau awalan 08 (contoh: 081234567890, +6281234567890, atau +819012345678).`,
    );
  }

  return bersih;
};