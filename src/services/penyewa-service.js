import Pengguna from "../models/pengguna-model.js";
import Kamar from "../models/kamar-model.js";
import { AppError } from "../errors.js";
import Tagihan from "../models/tagihan-model.js";
import Pengumuman from "../models/pengumuman-model.js";

export const ambilProfilDashboard = async (idPengguna) => {
  const profil = await Pengguna.findById(idPengguna)
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
