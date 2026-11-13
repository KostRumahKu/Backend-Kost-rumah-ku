import Kamar from "../models/kamar-model.js";
import Pengguna from "../models/pengguna-model.js";
import Pemesanan from "../models/pemesanan-model.js";
import { AppError } from "../errors.js";
import { kirimEmail } from "../utils/mail-service.js";
import {
  templateBookingBerhasil,
  templateNotifikasiPembayaranBaru,
} from "../utils/email-templates.js";
import { ambilDaftarRekening } from "./admin-services/admin-rekening-service.js";
import RekeningKost from "../models/rekening-model.js";

export const ambilDetailPemesananPublik = async (idPemesanan) => {
  const pesanan = await Pemesanan.findById(idPemesanan)
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai harga");

  if (!pesanan) {
    throw new AppError("NOT_FOUND", "Data pemesanan tidak ditemukan atau sudah kedaluwarsa.");
  }

  const daftarRekeningMentah = await ambilDaftarRekening();
  const daftarRekeningAman = daftarRekeningMentah.map((rek) => ({
    "id-rekening": rek._id,
    "nama-bank": rek["nama-bank"],
    "nama-pemilik": rek["nama-pemilik"],
    "nomor-rekening": rek["nomor-rekening"],
    jenis: rek.jenis,
    "logo-bank": rek["logo-bank"],
    "foto-qris": rek["foto-qris"],
  }));

  const hargaPerBulan = pesanan["id-kamar"] ? pesanan["id-kamar"].harga : 0;
  const totalTagihan = hargaPerBulan * pesanan["durasi-bulan"];

  return {
    "id-pemesanan": pesanan._id,
    "status-pemesanan": pesanan.status,
    "batas-waktu-bayar": pesanan["batas-waktu-bayar"],
    "penyewa": pesanan["id-pengguna"],
    "kamar": pesanan["id-kamar"],
    "durasi-bulan": pesanan["durasi-bulan"],
    "total-tagihan": totalTagihan,
    "bukti-pembayaran": pesanan["bukti-pembayaran"] || null,
    "opsi-pembayaran": daftarRekeningAman
  };
};

export const ambilDataPublicKamar= async (query = {}) => {
  const matchStage = { diarsipkan: { $ne: true } };

  if (query.tipe) {
    matchStage['tipe-kamar'] = query.tipe;
  }
  
  if (query.status) {
    matchStage.status = query.status;
  }

  if (query.minHarga || query.maxHarga) {
    matchStage.harga = {};
    if (query.minHarga) matchStage.harga.$gte = Number(query.minHarga);
    if (query.maxHarga) matchStage.harga.$lte = Number(query.maxHarga);
  }

  const totalKamar = await Kamar.countDocuments(matchStage);
  const kamarKosong = await Kamar.countDocuments({ 
    ...matchStage, 
    status: 'kosong' 
  });

  const katalogKamar = await Kamar.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$tipe-kamar",
        harga: { $first: "$harga" },
        fasilitas: { $first: "$fasilitas" },
        foto: { $first: "$foto" },
        jumlahTersedia: {
          $sum: { $cond: [{ $eq: ["$status", "kosong"] }, 1, 0] }
        }
      }
    },
    { $sort: { harga: 1 } },
    {
      $project: {
        _id: 0,
        tipeKamar: "$_id",
        harga: 1,
        fasilitas: 1,
        foto: 1,
        jumlahTersedia: 1
      }
    }
  ]);

  let hargaMulaiDari = 0;
  let hargaTertinggi = 0;
  
  if (katalogKamar.length > 0) {
    hargaMulaiDari = katalogKamar[0].harga;
    hargaTertinggi = katalogKamar[katalogKamar.length - 1].harga;
  }

  return {
    ketersediaan: {
      total: totalKamar,
      kosong: kamarKosong,
      isPenuh: kamarKosong === 0 
    },
    harga: {
      termurah: hargaMulaiDari,
      termahal: hargaTertinggi
    },
    katalog: katalogKamar
  };
};

export const prosesBookingKamar = async (payload) => {
  const {
    "nama-lengkap": namaLengkap,
    email,
    "nomor-telepon": nomorTelepon,
    "nama-kontak-darurat": namaKontakDarurat,
    "nomor-kontak-darurat": nomorKontakDarurat,
    "tipe-kamar": tipeKamar,
    lantai,
    "durasi-bulan": durasiBulan,
    "tanggal-mulai": tanggalMulai,
  } = payload;

  const cekPengguna = await Pengguna.findOne({
    $or: [{ email }, { "nomor-telepon": nomorTelepon }]
  });

  if (cekPengguna) {
    throw new AppError("CONFLICT", "Email atau Nomor Telepon ini sudah terdaftar atau sedang memiliki pemesanan aktif. Silakan tunggu batas waktu habis jika ingin memesan ulang.");
  }

  const kamarLock = await Kamar.findOneAndUpdate(
    { 
      "tipe-kamar": tipeKamar.toLowerCase(), 
      lantai: Number(lantai), 
      status: "kosong", 
      diarsipkan: { $ne: true } 
    },
    { $set: { status: "dipesan" } },
    { new: true }
  );

  if (lantai > 3)
    throw new AppError("BAD_REQUEST", "Jumlah lantai yang di input melebihi batas maksimum 3 lantai.");

  if (!kamarLock) {
    throw new AppError("NOT_FOUND", `Maaf, kamar tipe ${tipeKamar} di lantai ${lantai} saat ini penuh atau baru saja didahului orang lain.`);
  }

  try {
    const idPenggunaSementara = `CALON-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const penggunaBaru = new Pengguna({
      _id: idPenggunaSementara,
      "nama-lengkap": namaLengkap,
      email: email,
      "nomor-telepon": nomorTelepon,
      "nama-kontak-darurat": namaKontakDarurat,
      "nomor-kontak-darurat": nomorKontakDarurat,
      peran: "calon-penyewa",
    });
    await penggunaBaru.save();

    const batasWaktuBayar = new Date();
    batasWaktuBayar.setHours(batasWaktuBayar.getHours() + 1);

    const pemesananBaru = new Pemesanan({
      "id-pengguna": penggunaBaru._id,
      "id-kamar": kamarLock._id,
      "durasi-bulan": Number(durasiBulan),
      "tanggal-mulai": new Date(tanggalMulai),
      "batas-waktu-bayar": batasWaktuBayar,
      status: "menunggu-pembayaran",
    });
    await pemesananBaru.save();

    const totalTagihan = kamarLock.harga * Number(durasiBulan);

    const htmlPendaftaran = templateBookingBerhasil(
      namaLengkap,
      kamarLock["nama-kamar"],
      totalTagihan,
      batasWaktuBayar,
      pemesananBaru._id,
    );

    await kirimEmail({
      to: email,
      subject: "Pemesanan Kamar Berhasil - Kost RumahKu",
      html: htmlPendaftaran,
    }).catch((err) => console.error("Gagal kirim email pendaftaran:", err));

    const daftarRekeningMentah = await ambilDaftarRekening();

    const daftarRekeningAman = daftarRekeningMentah.map((rek) => ({
      "id-rekening": rek._id,
      "nama-bank": rek["nama-bank"],
      "nama-pemilik": rek["nama-pemilik"],
      "nomor-rekening": rek["nomor-rekening"],
      jenis: rek.jenis,
      "logo-bank": rek["logo-bank"],
      "foto-qris": rek["foto-qris"],
    }));

    return {
      "id-pemesanan": pemesananBaru._id,
      "batas-waktu-bayar": batasWaktuBayar,
      "kamar-dipesan": kamarLock["nama-kamar"],
      "harga-per-bulan": kamarLock.harga,
      "durasi-bulan": Number(durasiBulan), 
      "total-tagihan": totalTagihan,
      "opsi-pembayaran": daftarRekeningAman
    };
  } catch (error) {
    await Kamar.findByIdAndUpdate(kamarLock._id, { $set: { status: "kosong" } });
    throw new AppError("INTERNAL_SERVER_ERROR", "Terjadi kesalahan sistem saat memproses pesanan. Silakan coba lagi.");
  }
};

export const uploadBuktiPembayaranBooking = async (payload) => {
  const { "id-pemesanan": idPemesanan, "id-rekening": idRekening, "bukti-pembayaran": buktiPembayaran } = payload;

  const pesanan = await Pemesanan.findById(idPemesanan);
  if (!pesanan) throw new AppError("NOT_FOUND", "Pemesanan tidak ditemukan.");
  if (pesanan.status !== "menunggu-pembayaran") throw new AppError("CONFLICT", "Id pemesanan tidak valid atau sudah tidak terpakai.");

  const rekeningValid = await RekeningKost.findById(idRekening);
  if (!rekeningValid) {
    throw new AppError("NOT_FOUND", "Metode pembayaran (rekening) yang Anda pilih tidak ditemukan di sistem kami.");
  }
  if (rekeningValid.status !== "aktif") {
    throw new AppError("CONFLICT", "Metode pembayaran ini sedang tidak aktif. Silakan pilih metode pembayaran lain.");
  }
  pesanan["bukti-pembayaran"] = buktiPembayaran;
  pesanan["rekening-tujuan"] = idRekening; 
  pesanan.status = "menunggu-validasi";
  await pesanan.save();
 await pesanan.populate([
   { path: "id-pengguna", select: "nama-lengkap" },
   { path: "id-kamar", select: "nama-kamar" },
 ]);

  const namaCalonPenyewa = pesanan["id-pengguna"]["nama-lengkap"];
  const namaKamarDipilih = pesanan["id-kamar"]["nama-kamar"];
  const linkDashboard = "-"

  const htmlNotifAdmin = templateNotifikasiPembayaranBaru(namaCalonPenyewa, namaKamarDipilih, linkDashboard);

  const emailAdmin = "-"; 

  await kirimEmail({
    to: emailAdmin,
    subject: "HORE! Ada Pembayaran Baru Masuk",
    html: htmlNotifAdmin
  }).catch(err => console.error("Gagal kirim email notif admin:", err));
  return {
    "id-pemesanan": pesanan._id,
    status: pesanan.status,
    pesan: "Bukti pembayaran berhasil diunggah. Mohon tunggu validasi dari Admin Kost."
  };
};