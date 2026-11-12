import Pengumuman from "../../models/pengumuman-model.js";
import Pengguna from "../../models/pengguna-model.js";
import { kirimEmail } from "../../utils/mail-service.js";
import { templatePengumuman } from "../../utils/email-templates.js";

export const buatBroadcastPengumuman = async (dataPengumuman, idAdmin) => {
  const pengumumanBaru = new Pengumuman({
    judul: dataPengumuman.judul,
    pesan: dataPengumuman.pesan,
    gambar: dataPengumuman.gambar || null, 
    "dibuat-oleh": idAdmin
  });
  await pengumumanBaru.save();

  const daftarPenyewa = await Pengguna.find({
    peran: "penyewa",
    "id-kamar": { $ne: null }
  }).select("email nama-lengkap");

  const emailPromises = daftarPenyewa.map(penyewa => {
    return kirimEmail({
      to: penyewa.email,
      subject: `[Pengumuman] ${dataPengumuman.judul}`,
      html: templatePengumuman(dataPengumuman.judul, dataPengumuman.pesan, dataPengumuman.gambar)
    });
  });

  Promise.allSettled(emailPromises).then(results => {
    const sukses = results.filter(r => r.status === "fulfilled").length;
    console.log(`[BROADCAST] Berhasil mengirim email ke ${sukses}/${daftarPenyewa.length} penyewa.`);
  });

  return pengumumanBaru;
};

export const ambilRiwayatPengumuman = async () => {
  return await Pengumuman.find()
    .populate("dibuat-oleh", "nama-lengkap email") 
    .sort({ "dibuat-pada": -1 }) 
    .lean();
};