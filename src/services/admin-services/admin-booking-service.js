import Pemesanan from "../../models/pemesanan-model.js";
import Kamar from "../../models/kamar-model.js";
import Pengguna from "../../models/pengguna-model.js";
import Tagihan from "../../models/tagihan-model.js";
import { AppError } from "../../errors.js";
import { kontrakAdminValidasiBooking } from "../../contracts/admin-booking-contract.js";
import { kirimEmail } from "../../utils/mail-service.js"; 
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  templatePembayaranDitolak,
  templateSelamatDatangPenyewa,
  templatePemesananDibatalkanAdmin,
} from "../../utils/email-templates.js";
import { generateIdPengguna } from "../penyewa-services/pengguna-service.js"; 
import mongoose from "mongoose"; 
import KasKost from "../../models/kas-model.js";

export const ambilDaftarPemesananAdmin = async (query) => {
  const { status, sort } = query;
  
  const filter = {};
  if (status) filter.status = status;

  let pengurutan = { _id: -1 }; 
  if (sort === "terlama") pengurutan = { _id: 1 };

  const daftarPemesanan = await Pemesanan.find(filter)
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai harga")
    .sort(pengurutan)
    .lean(); 

  const daftarDenganTotal = daftarPemesanan.map(pesanan => {
    const hargaPerBulan = pesanan["id-kamar"] ? pesanan["id-kamar"].harga : 0;
    
    return {
      ...pesanan,
      "total-tagihan": hargaPerBulan * pesanan["durasi-bulan"]
    };
  });

  return daftarDenganTotal;
};

export const prosesValidasiBooking = async (idPemesanan, payload) => {
  const { "status-validasi": statusValidasi, "catatan-admin": catatanAdmin } = payload;

  const pesanan = await Pemesanan.findById(idPemesanan).populate("id-pengguna").populate("id-kamar");
  
  if (!pesanan) {
    throw new AppError("NOT_FOUND", "Data pemesanan tidak ditemukan.");
  }

  if (pesanan.status !== "menunggu-validasi") {
    throw new AppError("CONFLICT", `Pemesanan ini tidak dapat divalidasi karena statusnya: ${pesanan.status}`);
  }

  // SKENARIO PERTAMA ADMIN MENOLAK KARENA BUKTI PEMBAYARAN SALAH
  if (statusValidasi === "tolak") {
    pesanan.status = "menunggu-pembayaran";
    pesanan["bukti-pembayaran"] = null; 
    
    const waktuBaru = new Date();
    waktuBaru.setHours(waktuBaru.getHours() + 1);
    pesanan["batas-waktu-bayar"] = waktuBaru;
    
    await pesanan.save();

   const pengguna = pesanan["id-pengguna"];
   const kamar = pesanan["id-kamar"];

   const urlFrontendUpload = `http://localhost:5173/upload-bukti/${pesanan._id}`;

   const htmlDitolak = templatePembayaranDitolak(
     pengguna["nama-lengkap"],
     kamar["nama-kamar"],
     catatanAdmin,
     waktuBaru,
     urlFrontendUpload 
   );

   await kirimEmail({
     to: pengguna.email,
     subject: "Pemberitahuan: Bukti Pembayaran Kost Ditolak",
     html: htmlDitolak,
   }).catch((err) => console.error("Gagal kirim email penolakan:", err));

    return {
      pesan: "Pembayaran ditolak. Calon penyewa telah diberikan perpanjangan waktu untuk mengunggah ulang bukti.",
      "status-pemesanan": pesanan.status
    };
  }

  // SKENARIO LANGSUG BATLAKAN PESANAN OLEH ADMIN HARD REJECT
  if (statusValidasi === "batal") {
    const pengguna = pesanan["id-pengguna"];
    const kamar = pesanan["id-kamar"];

    const htmlBatalAdmin = templatePemesananDibatalkanAdmin(
      pengguna["nama-lengkap"],
      kamar["nama-kamar"],
      catatanAdmin
    );

    await kirimEmail({
      to: pengguna.email,
      subject: "Pemberitahuan: Pemesanan Kost Dibatalkan Admin",
      html: htmlBatalAdmin
    }).catch(err => console.error("Gagal kirim email hard reject:", err));

    await Kamar.findByIdAndUpdate(kamar._id, { $set: { status: "kosong" } });

    await Pemesanan.findByIdAndDelete(pesanan._id);
    await Pengguna.findByIdAndDelete(pengguna._id);

    return {
      pesan: "Pemesanan dibatalkan secara permanen. Kamar telah dikosongkan dan akun calon penyewa dihapus karena terindikasi iseng (spam).",
      "status-pemesanan": "batal"
    };
  }

  // SKENARIO KETIGA ADMIN MENYETUJUI (SUCCESS TRANSACTIONS DENGAN ID BARU)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const kamar = pesanan["id-kamar"];
    const penggunaLama = pesanan["id-pengguna"]; // ID USR-...
    
    const tglMulai = new Date(pesanan["tanggal-mulai"]);
    const tglBerakhir = new Date(tglMulai);
    tglBerakhir.setMonth(tglBerakhir.getMonth() + pesanan["durasi-bulan"] + 1);
    
    const idResmiBaru = await generateIdPengguna(tglMulai);
    const plainPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Pengguna.findByIdAndDelete(penggunaLama._id).session(session);

    const penggunaBaru = new Pengguna({
      _id: idResmiBaru,
      "nama-lengkap": penggunaLama["nama-lengkap"],
      email: penggunaLama.email,
      "nomor-telepon": penggunaLama["nomor-telepon"],
      "nama-kontak-darurat": penggunaLama["nama-kontak-darurat"],
      "nomor-kontak-darurat": penggunaLama["nomor-kontak-darurat"],
      "kata-sandi": hashedPassword,
      peran: "penyewa",
      "id-kamar": kamar._id,
      "tanggal-mulai": tglMulai,
      "tanggal-berakhir": tglBerakhir,
      "dibuat-pada": penggunaLama["dibuat-pada"],
    });

    await penggunaBaru.save({ session });

    await Kamar.findByIdAndUpdate(
      kamar._id,
      { $set: { status: "terisi" } },
      { session },
    );

    // PERULANGAN UNTUK MEMBUAT TAGIHAN BULANAN
    for (let i = 0; i < pesanan["durasi-bulan"]; i++) {
      const bulanTagihanIni = new Date(tglMulai);
      bulanTagihanIni.setMonth(bulanTagihanIni.getMonth() + i);

      const namaBulanString = bulanTagihanIni.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });
      const nomorInvoice = `INV-DP-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i + 1}`;

      const tagihanBaru = new Tagihan({
        "id-pengguna": idResmiBaru,
        "nama-penyewa": penggunaBaru["nama-lengkap"],
        "id-kamar": kamar._id,
        "nomor-tagihan": nomorInvoice,
        "bulan-tagihan": namaBulanString,
        "jumlah-tagihan": kamar.harga,
        "tanggal-jatuh-tempo": tglMulai,
        status: "lunas",
        "bukti-pembayaran": pesanan["bukti-pembayaran"],
      });

      await tagihanBaru.save({ session });
    }
    const totalPemasukanAwal = kamar.harga * pesanan["durasi-bulan"];

    const kasBaru = new KasKost({
      "tipe-transaksi": "pemasukan",
      kategori: "pembayaran-sewa",
      nominal: totalPemasukanAwal,
      keterangan: `Pembayaran awal sewa kamar ${kamar["nama-kamar"]} (${pesanan["durasi-bulan"]} bulan) oleh penyewa baru ${penggunaBaru["nama-lengkap"]}`,
      "tanggal-transaksi": new Date(),
      "id-referensi": pesanan._id,
    });

    await kasBaru.save({ session });
    pesanan["id-pengguna"] = idResmiBaru;
    pesanan.status = "berhasil";
    await pesanan.save({ session });

    await session.commitTransaction();
    session.endSession();

    const htmlSelamatDatang = templateSelamatDatangPenyewa(
      penggunaBaru["nama-lengkap"],
      kamar["nama-kamar"],
      penggunaBaru.email,
      plainPassword, 
    );

    await kirimEmail({
      to: penggunaBaru.email,
      subject: "Pembayaran Berhasil! Akses Akun Kost Anda",
      html: htmlSelamatDatang,
    }).catch((err) => console.error("Gagal mengirim email selamat datang:", err));

    return {
      pesan: "Pembayaran berhasil disetujui. Akun penyewa telah aktif dengan ID resmi dan email kredensial telah dikirim.",
      "status-pemesanan": pesanan.status,
      "id-pengguna-baru": idResmiBaru
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError("INTERNAL_SERVER_ERROR", "Gagal memvalidasi pembayaran dan memproses ID Pengguna: " + error.message);
  }
};