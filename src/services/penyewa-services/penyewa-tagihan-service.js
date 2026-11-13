import Tagihan from "../../models/tagihan-model.js";

export const ambilRiwayatTagihan = async (idPengguna) => {
  const daftarTagihan = await Tagihan.find({ "id-pengguna": idPengguna })
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 }); u

  return daftarTagihan;
};