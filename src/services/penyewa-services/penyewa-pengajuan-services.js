import Pengajuan from "../../models/pengajuan-model.js";
import Pengguna from "../../models/pengguna-model.js";
import Tagihan from "../../models/tagihan-model.js";
import { AppError } from "../../errors.js";
import { kirimEmail } from "../../utils/mail-service.js";
import {
  templatePengajuanDibuat,
  templatePembatalanOlehPenyewa, 
  templateNotifikasiBatalKeAdmin,
} from "../../utils/email-templates.js";
import Kamar from "../../models/kamar-model.js"; 

export const getRiwayatPengajuan = async (idPengguna) => {
  const riwayat = await Pengajuan.find({ "id-pengguna": idPengguna }).sort({
    "dibuat-pada": -1,
  });

  return riwayat;
};

export const buatPengajuan = async (idPengguna, payload) => {
  const pengguna = await Pengguna.findById(idPengguna);
  if (!pengguna || !pengguna["id-kamar"]) {
    throw new AppError("BAD_REQUEST", "Anda belum terdaftar di kamar manapun.");
  }

  if (!payload["tanggal-target"]) {
    throw new AppError("BAD_REQUEST", "Tanggal target wajib diisi.");
  }

  const rawTarget = isNaN(payload["tanggal-target"])
    ? payload["tanggal-target"]
    : Number(payload["tanggal-target"]);

  const tanggalTarget = new Date(rawTarget);

  if (isNaN(tanggalTarget.getTime())) {
    throw new AppError(
      "BAD_REQUEST",
      "Format tanggal target tidak valid. Gunakan format YYYY-MM-DD.",
    );
  }

  const tanggalHariIni = new Date();
  tanggalHariIni.setHours(0, 0, 0, 0);

  const tanggalTargetClean = new Date(tanggalTarget);
  tanggalTargetClean.setHours(0, 0, 0, 0);

  /* ini awal nya buat ngecek h-14 itu hari minimal peneywa buat bikin pengajuan
  jadi kalau misal nya sekarang tanggal 3 itu kalau h-14 berarti minimal tanggal 17
  pengajuan nya boleh di buat, nanti tanya auvia mau gimana buat pengajuan nya */
  
  const selisihWaktu = tanggalTargetClean.getTime() - tanggalHariIni.getTime();
  const selisihHari = Math.round(selisihWaktu / (1000 * 3600 * 24));

//   if (selisihHari < 14) {
//     throw new AppError(
//       "BAD_REQUEST",
//       `Pengajuan minimal H-14. Tanggal yang Anda pilih berjarak ${selisihHari} hari dari sekarang.`,
//     );
//   }


  const cekTunggakan = await Tagihan.findOne({
    "id-pengguna": idPengguna,
    status: "menunggak"
  });

  if (cekTunggakan) {
    throw new AppError("FORBIDDEN", "Anda masih memiliki tagihan yang menunggak. Harap lunasi terlebih dahulu untuk mengajukan berhenti sewa.");
  }

  const pengajuanAktif = await Pengajuan.findOne({
    "id-pengguna": idPengguna,
    status: { $in: ["menunggu-konfirmasi", "disetujui"] }
  });

  if (pengajuanAktif) {
    throw new AppError("BAD_REQUEST", "Anda masih memiliki pengajuan aktif. Harap tunggu proses selesai atau batalkan pengajuan sebelumnya.");
  }

  const jenisPengajuan = payload["jenis-pengajuan"];
  let idKamarTujuan = null;

  if (jenisPengajuan === "pindah-kamar") {
    idKamarTujuan = payload["id-kamar-tujuan"];
    
    if (!idKamarTujuan) {
      throw new AppError("BAD_REQUEST", "ID Kamar Tujuan wajib diisi untuk pengajuan Pindah Kamar.");
    }
    
    if (idKamarTujuan === pengguna["id-kamar"]) {
      throw new AppError("BAD_REQUEST", "Kamar tujuan tidak boleh sama dengan kamar Anda saat ini.");
    }

    const kamarTujuanDb = await Kamar.findById(idKamarTujuan);
    
    if (!kamarTujuanDb) {
      throw new AppError("NOT_FOUND", `Kamar tujuan dengan ID ${idKamarTujuan} tidak ditemukan.`);
    }

    if (kamarTujuanDb.status !== "kosong") {
      throw new AppError("BAD_REQUEST", `Kamar ${kamarTujuanDb['id-kamar'] || kamarTujuanDb._id} saat ini berstatus '${kamarTujuanDb.status}' dan tidak dapat dipilih.`);
    }
  }

  const sekarang = new Date();
  const yyyy = sekarang.getFullYear();
  const mm = String(sekarang.getMonth() + 1).padStart(2, "0");
  const dd = String(sekarang.getDate()).padStart(2, "0");
  const tglStr = `${yyyy}${mm}${dd}`;

  let customId = `${idPengguna}${tglStr}`;

  const idSudahAda = await Pengajuan.exists({ _id: customId });
  if (idSudahAda) {
    customId = `${idPengguna}${tglStr}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const pengajuanBaru = new Pengajuan({
    _id: customId, 
    "id-pengguna": idPengguna,
    "jenis-pengajuan": jenisPengajuan,
    "id-kamar-sekarang": pengguna["id-kamar"],
    "id-kamar-tujuan": idKamarTujuan, 
    "tanggal-target": payload["tanggal-target"],
    alasan: payload.alasan,
  });

  await pengajuanBaru.save();

  const subjectEmail = `[Menunggu Konfirmasi] Pengajuan ${jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`;
  
  kirimEmail({
    to: pengguna.email,
    subject: subjectEmail,
    html: templatePengajuanDibuat(
      pengguna["nama-lengkap"], 
      jenisPengajuan, 
      payload["tanggal-target"]
    )
  }).catch(err => console.error(`[MAIL ERROR] Gagal mengirim email pengajuan ke ${pengguna.email}:`, err.message));

  return pengajuanBaru;
};

export const batalkanPengajuan = async (idPengguna, idPengajuan) => {
  const pengajuan = await Pengajuan.findOne({
    _id: idPengajuan,
    "id-pengguna": idPengguna
  });

  if (!pengajuan) {
    throw new AppError("NOT_FOUND", "Pengajuan tidak ditemukan.");
  }

  if (pengajuan.status !== "menunggu-konfirmasi") {
    throw new AppError(
      "BAD_REQUEST", 
      `Pengajuan tidak dapat dibatalkan karena saat ini berstatus: ${pengajuan.status}.`
    );
  }

  pengajuan.status = "dibatalkan-penyewa";
  await pengajuan.save();

  const pengguna = await Pengguna.findById(idPengguna);
  if (pengguna) {
    const jenis = pengajuan["jenis-pengajuan"];
    const subjectUser = `[Dibatalkan] Pengajuan ${jenis === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`;
    const subjectAdmin = `[Penyewa Batal] Pengajuan dari Kamar ${pengajuan["id-kamar-sekarang"]}`;
    const emailAdmin = process.env.ADMIN_EMAIL || "admin@kostrumahku.com";

    kirimEmail({
      to: pengguna.email,
      subject: subjectUser,
      html: templatePembatalanOlehPenyewa(pengguna["nama-lengkap"], jenis)
    }).catch(err => console.error(`[MAIL ERROR] Gagal email batal ke penyewa:`, err.message));

    kirimEmail({
      to: emailAdmin,
      subject: subjectAdmin,
      html: templateNotifikasiBatalKeAdmin(pengguna["nama-lengkap"], pengajuan["id-kamar-sekarang"], jenis)
    }).catch(err => console.error(`[MAIL ERROR] Gagal email batal ke admin:`, err.message));
  }
  
  return pengajuan;
};