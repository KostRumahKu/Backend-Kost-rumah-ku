import {
  ambilDataPublicKamar,
  prosesBookingKamar,
  uploadBuktiPembayaranBooking,
} from "../../services/public-service.js";
import { ambilDaftarRekening } from "../../services/admin-services/admin-rekening-service.js"; 
import { AppError } from "../../errors.js";
import {
  kontrakPublicBooking,
  kontrakPublicUploadBukti,
} from "../../contracts/public-booking-contract.js";


export const getKamarPublikData = async (req, res) => {
  const dataLandingPage = await ambilDataPublicKamar(req.query);

  res.setHeader("Cache-Control", "public, max-age=60");

  res.status(200).json({
    status: "sukses",
    pesan:
      Object.keys(req.query).length > 0
        ? "Berhasil memuat data katalog kamar (Filtered)."
        : "Berhasil memuat data katalog kamar untuk Landing Page.",
    data: dataLandingPage,
  });
};

export const getDaftarRekeningPublik = async (req, res, next) => {
  try {
    const daftarRekening = await ambilDaftarRekening();

    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat daftar rekening/metode pembayaran aktif.",
      data: daftarRekening,
    });
  } catch (error) {
    next(error);
  }
};

export const postBookingKamar = async (req, res, next) => {
  const dataPayload = req.body;
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
  } = dataPayload ?? {};

    if (!namaLengkap || !email || !nomorTelepon || !namaKontakDarurat || !nomorKontakDarurat || !tipeKamar || !lantai|| !durasiBulan || !tanggalMulai) {
      throw new AppError("BAD_REQUEST", "Semua data pendaftaran wajib diisi dengan lengkap.", {
        kebutuhan_payload: kontrakPublicBooking
      });
    }
  
  try {
    const hasilBooking = await prosesBookingKamar(req.body);

    res.status(201).json({
      status: "sukses",
      pesan:
        "Pemesanan berhasil! Kamar telah dikunci untuk Anda. Silakan selesaikan pembayaran sebelum batas waktu habis.",
      data: hasilBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const postUploadBuktiBooking = async (req, res, next) => {
  const dataPayload = req.body;
  const { "id-pemesanan": idPemesanan, "id-rekening": idRekening, "bukti-pembayaran": buktiPembayaran } = dataPayload ?? {};

  if (!idPemesanan || !buktiPembayaran || !idRekening) { 
    throw new AppError("BAD_REQUEST", "ID Pemesanan, ID Rekening, dan URL Bukti Pembayaran wajib diisi.", {
      kebutuhan_payload: kontrakPublicUploadBukti
    });
  }

  try {
    const hasilUpload = await uploadBuktiPembayaranBooking(req.body);

    res.status(200).json({
      status: "sukses",
      pesan: hasilUpload.pesan,
      data: {
        "id-pemesanan": hasilUpload["id-pemesanan"],
        "status-pemesanan": hasilUpload.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

