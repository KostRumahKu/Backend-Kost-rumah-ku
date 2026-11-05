import Pengajuan from "../../models/pengajuan-model.js";
import Kamar from "../../models/kamar-model.js";
import Tagihan from "../../models/tagihan-model.js";
import { AppError } from "../../errors.js";
import { kirimEmail } from "../../utils/mail-service.js";
import {
  templateHasilPengajuan,
  templateRollbackPersetujuan,
} from "../../utils/email-templates.js";

export const getSemuaPengajuan = async (filters = {}) => {
  const daftarPengajuan = await Pengajuan.find(filters)
    .populate("id-pengguna", "nama-lengkap nomor-telepon email")
    .sort({ "dibuat-pada": -1 });

  return daftarPengajuan;
};

export const getDetailPengajuan = async (idPengajuan) => {
  const pengajuan = await Pengajuan.findById(idPengajuan)
    .populate("id-pengguna", "nama-lengkap nomor-telepon email");
    
  if (!pengajuan) {
    throw new AppError("NOT_FOUND", "Data pengajuan tidak ditemukan.");
  }
  
  return pengajuan;
};

export const prosesPengajuan = async (idPengajuan, payload) => {
  const pengajuan = await Pengajuan.findById(idPengajuan).populate("id-pengguna", "nama-lengkap email");
  if (!pengajuan) throw new AppError("NOT_FOUND", "Data pengajuan tidak ditemukan.");

  if (pengajuan.status !== "menunggu-konfirmasi") {
    throw new AppError("BAD_REQUEST", `Pengajuan sudah diproses sebelumnya dengan status: ${pengajuan.status}`);
  }

  const { status, "catatan-admin": catatanAdmin, "batalkan-tagihan-aktif": batalkanTagihan } = payload;
  
  const pengguna = pengajuan["id-pengguna"];
  const jenis = pengajuan["jenis-pengajuan"];
  const tglTarget = pengajuan["tanggal-target"];

  if (status === "ditolak") {
    if (!catatanAdmin) {
      throw new AppError("BAD_REQUEST", "Catatan Admin wajib diisi jika pengajuan ditolak.");
    }
    pengajuan.status = "ditolak";
    pengajuan["catatan-admin"] = catatanAdmin;
    await pengajuan.save();
    
    kirimEmail({
      to: pengguna.email,
      subject: `[Ditolak] Hasil Pengajuan ${jenis === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`,
      html: templateHasilPengajuan(pengguna["nama-lengkap"], jenis, status, catatanAdmin, tglTarget)
    }).catch(err => console.error(`[MAIL ERROR] Gagal email ke penyewa:`, err.message));

    return pengajuan;
  }

  if (status === "disetujui") {
    pengajuan.status = "disetujui";
    pengajuan["catatan-admin"] = catatanAdmin || null;

    if (jenis === "berhenti-sewa") {
      const kamar = await Kamar.findOne({ "id-kamar": pengajuan["id-kamar-sekarang"] });
      if (kamar) {
        await kamar.save();
      }

      if (batalkanTagihan === true) {
        await Tagihan.updateMany(
          { "id-pengguna": pengguna._id, status: "belum-dibayar" },
          { $set: { status: "dibatalkan" } }
        );
      }
    }

    await pengajuan.save();

    kirimEmail({
      to: pengguna.email,
      subject: `[Disetujui] Hasil Pengajuan ${jenis === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`,
      html: templateHasilPengajuan(pengguna["nama-lengkap"], jenis, status, catatanAdmin, tglTarget)
    }).catch(err => console.error(`[MAIL ERROR] Gagal email ke penyewa:`, err.message));

    return pengajuan;
  }

  throw new AppError("BAD_REQUEST", "Status tidak valid. Gunakan 'disetujui' atau 'ditolak'.");
};

export const rollbackPersetujuan = async (idPengajuan, catatanAdmin) => {
  const pengajuan = await Pengajuan.findById(idPengajuan).populate("id-pengguna", "nama-lengkap email");
  
  if (!pengajuan) {
    throw new AppError("NOT_FOUND", "Data pengajuan tidak ditemukan.");
  }
  if (pengajuan.status !== "disetujui") {
    throw new AppError("BAD_REQUEST", "Hanya pengajuan yang berstatus 'disetujui' yang dapat dibatalkan (rollback).");
  }

  const pengguna = pengajuan["id-pengguna"];
  const jenis = pengajuan["jenis-pengajuan"];
  const catatanFinal = catatanAdmin || "Penyewa batal keluar, masa sewa diperpanjang.";

  pengajuan.status = "dibatalkan-admin";
  pengajuan["catatan-admin"] = catatanFinal;

  await Tagihan.updateMany(
    { 
      "id-pengguna": pengguna._id,
      status: "dibatalkan" 
    },
    { status: "belum-dibayar" }
  );

  await pengajuan.save();

  kirimEmail({
    to: pengguna.email,
    subject: `[Dibatalkan Admin] Persetujuan Pengajuan ${jenis === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`,
    html: templateRollbackPersetujuan(pengguna["nama-lengkap"], jenis, catatanFinal)
  }).catch(err => console.error(`[MAIL ERROR] Gagal email rollback ke penyewa:`, err.message));

  return pengajuan;
};