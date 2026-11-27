import Tagihan from "../../models/tagihan-model.js";
import Pengguna from "../../models/pengguna-model.js";
import Kamar from "../../models/kamar-model.js";
import { AppError } from "../../errors.js";


export const ambilRiwayatTagihan = async (idPengguna) => {
  const daftarTagihan = await Tagihan.find({ "id-pengguna": idPengguna })
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 });

  return daftarTagihan;
};

export const buatPermintaanTagihan = async (idPengguna) => {
  const tagihanGantung = await Tagihan.findOne({
    "id-pengguna": idPengguna,
    status: { $in: ["belum-bayar", "menunggu-validasi", "terlambat"] }
  });

  if (tagihanGantung) {
    throw new AppError("FORBIDDEN", `Anda masih memiliki tagihan bulan ${tagihanGantung["bulan-tagihan"]} yang belum lunas. Silakan lunasi terlebih dahulu sebelum meminta tagihan bulan berikutnya.`);
  }

  const semuaTagihan = await Tagihan.find({ "id-pengguna": idPengguna }, "bulan-tagihan");
  
  if (semuaTagihan.length === 0) {
    throw new AppError("BAD_REQUEST", "Tidak ditemukan riwayat tagihan dasar. Hubungi Admin.");
  }

  const namaBulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  let maxDate = new Date(0); 

  for (const tag of semuaTagihan) {
    const parts = tag["bulan-tagihan"].split(" ");
    if (parts.length === 2) {
      const blnIdx = namaBulanIndo.indexOf(parts[0]);
      const thn = parseInt(parts[1]);
      
      if (blnIdx !== -1 && !isNaN(thn)) {
        const tgl = new Date(thn, blnIdx, 1);
        if (tgl > maxDate) {
          maxDate = tgl; // Cari tanggal yang paling besar / paling masa depan
        }
      }
    }
  }

  const penyewa = await Pengguna.findById(idPengguna);
  if (!penyewa || !penyewa["id-kamar"]) {
    throw new AppError("NOT_FOUND", "Anda belum terdaftar di kamar aktif.");
  }
  const kamar = await Kamar.findById(penyewa["id-kamar"]);
  if (!kamar) throw new AppError("NOT_FOUND", "Kamar Anda tidak ditemukan.");

  const targetBulanDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);
  const namaBulanDepan = `${namaBulanIndo[targetBulanDate.getMonth()]} ${targetBulanDate.getFullYear()}`;

  const tagihanAda = await Tagihan.findOne({
    "id-pengguna": idPengguna,
    "bulan-tagihan": namaBulanDepan
  });

  if (tagihanAda) {
    throw new AppError("CONFLICT", `Tagihan untuk periode ${namaBulanDepan} sudah tersedia.`);
  }

  const jatuhTempo = new Date(targetBulanDate.getFullYear(), targetBulanDate.getMonth(), 2, 23, 59, 59);
  const nomorInvoice = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const tagihanBaru = new Tagihan({
    "id-pengguna": idPengguna,
    "nama-penyewa": penyewa["nama-lengkap"],
    "id-kamar": kamar._id,
    "nomor-tagihan": nomorInvoice,
    "bulan-tagihan": namaBulanDepan,
    "jumlah-tagihan": kamar.harga,
    "tanggal-jatuh-tempo": jatuhTempo,
    status: "belum-bayar",
  });

  await tagihanBaru.save();

  return tagihanBaru;
};