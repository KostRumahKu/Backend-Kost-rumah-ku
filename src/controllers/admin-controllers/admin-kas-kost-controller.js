import * as adminKasKostService from "../../services/admin-services/admin-kas-kost-service.js";
import { AppError } from "../../errors.js";
import { kontrakAdminKasKost } from "../../contracts/admin-kas-kost-contract.js";

export const getRingkasanKas = async (req, res, next) => {
  try {
    const ringkasan = await adminKasKostService.ambilRingkasanKas();
    
    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat ringkasan keuangan dan saldo kost.",
      data: ringkasan
    });
  } catch (error) {
    next(error);
  }
};

export const getRiwayatKas = async (req, res, next) => {
  try {
    const riwayat = await adminKasKostService.ambilRiwayatKas(req.query);
    
    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat riwayat transaksi kas.",
      data: riwayat
    });
  } catch (error) {
    next(error);
  }
};

export const postKasManual = async (req, res, next) => {
  try {
    const dataPayload = req.body;
    const { 
      "tipe-transaksi": tipeTransaksi, 
      kategori, 
      nominal, 
      keterangan 
    } = dataPayload ?? {};

    if (!tipeTransaksi || !kategori || !nominal || !keterangan) {
      throw new AppError("BAD_REQUEST", "Format data tidak lengkap! Semua kolom transaksi wajib diisi.", {
        kebutuhan_payload: kontrakAdminKasKost
      });
    }

    if (Number(nominal) <= 0) {
      throw new AppError("BAD_REQUEST", "Nominal transaksi tidak boleh kurang dari atau sama dengan nol.");
    }

    const hasil = await adminKasKostService.catatKasManual(dataPayload);
    
    res.status(201).json({
      status: "sukses",
      pesan: "Berhasil mencatat transaksi manual ke buku kas.",
      data: hasil
    });
  } catch (error) {
    next(error);
  }
};