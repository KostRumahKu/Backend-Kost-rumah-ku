import mongoose from "mongoose";
import Pengajuan from "../../models/pengajuan-model.js";
import Kamar from "../../models/kamar-model.js";
import Tagihan from "../../models/tagihan-model.js";
import { AppError } from "../../errors.js";
import { kirimEmail } from "../../utils/mail-service.js";
import {
  templateHasilPengajuan,
  templateRollbackPersetujuan,
} from "../../utils/email-templates.js";
import RiwayatSewa from "../../models/riwayat-sewa-model.js";
import Pengguna from "../../models/pengguna-model.js";


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
      if (batalkanTagihan === true) {
        await Tagihan.updateMany(
          { "id-pengguna": pengguna._id, status: "belum-dibayar" },
          { $set: { status: "dibatalkan" } }
        );
      }
    } 
    
    else if (jenis === "pindah-kamar") {
      const kamarTujuan = await Kamar.findById(pengajuan["id-kamar-tujuan"]);
      
      if (!kamarTujuan) {
         throw new AppError("NOT_FOUND", "Kamar tujuan tidak ditemukan di database.");
      }
      
      if (kamarTujuan.status !== "kosong") {
         throw new AppError("CONFLICT", `Gagal menyetujui. Kamar tujuan saat ini sudah berstatus '${kamarTujuan.status}'.`);
      }
      kamarTujuan.status = "dipesan";
      await kamarTujuan.save();
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
  const catatanFinal = catatanAdmin || (jenis === "berhenti-sewa" 
    ? "Penyewa batal keluar, masa sewa diperpanjang." 
    : "Penyewa batal pindah, tetap di kamar saat ini.");

  pengajuan.status = "dibatalkan-admin";
  pengajuan["catatan-admin"] = catatanFinal;

  if (jenis === "berhenti-sewa") {
    await Tagihan.updateMany(
      { 
        "id-pengguna": pengguna._id,
        status: "dibatalkan" 
      },
      { status: "belum-dibayar" }
    );
  }
  else if (jenis === "pindah-kamar") {
    const kamarTujuan = await Kamar.findById(pengajuan["id-kamar-tujuan"]);
    if (kamarTujuan && kamarTujuan.status === "dipesan") {
      kamarTujuan.status = "kosong";
      await kamarTujuan.save();
    }
  }

  await pengajuan.save();

  kirimEmail({
    to: pengguna.email,
    subject: `[Dibatalkan Admin] Persetujuan Pengajuan ${jenis === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar"}`,
    html: templateRollbackPersetujuan(pengguna["nama-lengkap"], jenis, catatanFinal)
  }).catch(err => console.error(`[MAIL ERROR] Gagal email rollback ke penyewa:`, err.message));

  return pengajuan;
};

export const selesaikanPengajuan = async (idPengajuan) => {
  const pengajuan = await Pengajuan.findById(idPengajuan);
  if (!pengajuan) {
    throw new AppError("NOT_FOUND", "Data pengajuan tidak ditemukan.");
  }

  if (pengajuan.status !== "disetujui") {
    throw new AppError("BAD_REQUEST", "Hanya pengajuan dengan status 'disetujui' yang dapat dieksekusi.");
  }

  const jenis = pengajuan["jenis-pengajuan"];
  const idPengguna = pengajuan["id-pengguna"];
  const idKamarLama = pengajuan["id-kamar-sekarang"];
  const tanggalEksekusi = new Date(); 

  if (jenis === "berhenti-sewa") {
    await Kamar.findByIdAndUpdate(idKamarLama, { status: "kosong" });
    await RiwayatSewa.findOneAndUpdate(
      { "id-pengguna": idPengguna, "id-kamar": idKamarLama, "tanggal-keluar": null },
      { 
        $set: { 
          "tanggal-keluar": tanggalEksekusi,
          catatan: "Selesai masa sewa (Check-out)"
        } 
      }
    );

    await Tagihan.deleteMany({ "id-pengguna": idPengguna, status: "belum-bayar" });
    await Pengguna.findByIdAndDelete(idPengguna);
  } 
  
  else if (jenis === "pindah-kamar") {
    const pengguna = await Pengguna.findById(idPengguna);
    if (!pengguna) throw new AppError("NOT_FOUND", "Data penyewa tidak ditemukan.");

    const idKamarBaru = pengajuan["id-kamar-tujuan"];
    const kamarBaruDb = await Kamar.findById(idKamarBaru);

    if (!kamarBaruDb || kamarBaruDb.status !== "dipesan") {
      throw new AppError("CONFLICT", "Kamar tujuan tidak valid atau statusnya bukan 'dipesan'.");
    }

    await Kamar.findByIdAndUpdate(idKamarLama, { status: "kosong" });
    kamarBaruDb.status = "terisi";
    await kamarBaruDb.save();

    pengguna["id-kamar"] = idKamarBaru;
    pengguna["tanggal-mulai"] = tanggalEksekusi; 
    await pengguna.save();

    await RiwayatSewa.findOneAndUpdate(
      { "id-pengguna": idPengguna, "id-kamar": idKamarLama, "tanggal-keluar": null },
      { 
        $set: { 
          "tanggal-keluar": tanggalEksekusi,
          catatan: `Pindah ke Kamar ${idKamarBaru}`
        } 
      }
    );
    
    const riwayatBaru = new RiwayatSewa({
      "id-kamar": idKamarBaru,
      "id-pengguna": idPengguna,
      "nama-penyewa": pengguna["nama-lengkap"],
      "tanggal-masuk": tanggalEksekusi
    });
    await riwayatBaru.save();

    await Tagihan.deleteMany({ "id-pengguna": idPengguna, status: "belum-bayar" });

    const tglStr = `${tanggalEksekusi.getFullYear()}${String(tanggalEksekusi.getMonth() + 1).padStart(2, "0")}${String(tanggalEksekusi.getDate()).padStart(2, "0")}`;
    const nomorTagihanBaru = `TGH-${tglStr}-${Math.floor(100 + Math.random() * 900)}`;
    
    const bulanDepan = new Date(tanggalEksekusi.getFullYear(), tanggalEksekusi.getMonth() + 1, 1);
    const strBulanTagihan = `${String(bulanDepan.getMonth() + 1).padStart(2, "0")}-${bulanDepan.getFullYear()}`;
    const tglJatuhTempo = new Date(tanggalEksekusi.getFullYear(), tanggalEksekusi.getMonth() + 1, 5);

    const tagihanBaru = new Tagihan({
      "id-pengguna": idPengguna,
      "id-kamar": idKamarBaru,
      "nomor-tagihan": nomorTagihanBaru,
      "bulan-tagihan": strBulanTagihan,
      "jumlah-tagihan": kamarBaruDb.harga, 
      "tanggal-jatuh-tempo": tglJatuhTempo,
      status: "belum-bayar"
    });
    await tagihanBaru.save();
  }

  pengajuan.status = "selesai";
  pengajuan["diperbarui-pada"] = tanggalEksekusi;
  await pengajuan.save();

  return pengajuan;
};