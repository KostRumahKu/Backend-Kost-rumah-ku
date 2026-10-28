import * as authService from "../services/auth-service.js";
import { AppError } from "../errors.js";

// Fungsi pembungkus untuk menangani login berdasarkan peran
const loginBerdasarkanPeran = (peran) => async (req, res) => {
  const { email, "kata-sandi": kataSandi } = req.body ?? {};

  if (!email || !kataSandi) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Email dan kata sandi wajib diisi",
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