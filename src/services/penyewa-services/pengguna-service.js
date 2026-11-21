import Pengguna from "../../models/pengguna-model.js";
import RiwayatSewa from "../../models/riwayat-sewa-model.js";

export const generateIdPengguna = async (tanggalMasuk = new Date()) => {
  const waktu = new Date(tanggalMasuk);
  const bulan = (waktu.getMonth() + 1).toString().padStart(2, '0'); 
  const tahun = waktu.getFullYear().toString(); 

  let nomorUrutTertinggi = 0;

  const penggunaTerakhir = await Pengguna.findOne({ _id: { $regex: /^\d/ } }).sort({ _id: -1 });
  if (penggunaTerakhir && penggunaTerakhir._id) {
    const tigaDigitPertama = penggunaTerakhir._id.substring(0, 3);
    const urutanPengguna = parseInt(tigaDigitPertama, 10);
    if (!isNaN(urutanPengguna) && urutanPengguna > nomorUrutTertinggi) {
      nomorUrutTertinggi = urutanPengguna;
    }
  }

  const riwayatTerakhir = await RiwayatSewa.findOne({ "id-pengguna": { $regex: /^\d/ } }).sort({ "id-pengguna": -1 });
  if (riwayatTerakhir && riwayatTerakhir["id-pengguna"]) {
    const tigaDigitPertamaRiwayat = riwayatTerakhir["id-pengguna"].substring(0, 3);
    const urutanRiwayat = parseInt(tigaDigitPertamaRiwayat, 10);
    if (!isNaN(urutanRiwayat) && urutanRiwayat > nomorUrutTertinggi) {
      nomorUrutTertinggi = urutanRiwayat;
    }
  }

  let nomorUrut = nomorUrutTertinggi + 1;

  if (nomorUrut > 999) {
    throw new Error("Kapasitas maksimal urutan penghuni (999) telah tercapai.");
  }

  const urutanString = nomorUrut.toString().padStart(3, '0');
  const kodeSpesial = "00";

  return `${urutanString}${kodeSpesial}${bulan}${tahun}`;
};