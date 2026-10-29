import Pengguna from "../models/pengguna-model.js";

export const generateIdPengguna = async (tanggalMasuk = new Date()) => {
  const waktu = new Date(tanggalMasuk);
  const bulan = (waktu.getMonth() + 1).toString().padStart(2, '0'); 
  const tahun = waktu.getFullYear().toString(); 

  const penggunaTerakhir = await Pengguna.findOne().sort({ 'dibuat-pada': -1 });

  let nomorUrut = 1;

  if (penggunaTerakhir && penggunaTerakhir._id) {
    const tigaDigitPertama = penggunaTerakhir._id.substring(0, 3);
    const urutanTerakhir = parseInt(tigaDigitPertama, 10);
    
    if (!isNaN(urutanTerakhir)) {
      nomorUrut = urutanTerakhir + 1;
    }
  }

  if (nomorUrut > 999) {
    throw new Error("Kapasitas maksimal urutan penghuni (999) telah tercapai.");
  }

  const urutanString = nomorUrut.toString().padStart(3, '0');
  const kodeSpesial = "00";

  return `${urutanString}${kodeSpesial}${bulan}${tahun}`;
};