import * as authService from "../services/auth-service.js";

// Fungsi pembungkus untuk menangani login berdasarkan peran
const loginBerdasarkanPeran = (peran) => async (req, res) => {
  try {
    const { email, "kata-sandi": kataSandi } = req.body;

    if (!email || !kataSandi) {
      return res.status(400).json({
        status: "gagal",
        pesan: "Email dan kata sandi wajib diisi"
      });
    }

    const hasilLogin = await authService.prosesLogin(email, kataSandi, peran);

    res.status(200).json({
      status: "sukses",
      pesan: `Berhasil login sebagai ${peran}`,
      data: hasilLogin
    });
  } catch (error) {
    res.status(401).json({
      status: "gagal",
      pesan: error.message
    });
  }
};

// semua role yang ada kalau nambah role nambah kesini
export const loginPemilik = loginBerdasarkanPeran("pemilik");
export const loginAdmin = loginBerdasarkanPeran("admin");
export const loginPenyewa = loginBerdasarkanPeran("penyewa");