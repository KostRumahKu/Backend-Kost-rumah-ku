import {
  prosesValidasiBooking,
  ambilDaftarPemesananAdmin,
} from "../../services/admin-services/admin-booking-service.js";
import { kontrakAdminValidasiBooking } from "../../contracts/admin-booking-contract.js";
import { AppError } from "../../errors.js";


export const getDaftarBooking = async (req, res, next) => {
  try {
    const daftarBooking = await ambilDaftarPemesananAdmin(req.query);

    res.status(200).json({
      status: "sukses",
      pesan: Object.keys(req.query).length > 0 
        ? "Berhasil memuat daftar pemesanan (Filtered)." 
        : "Berhasil memuat seluruh daftar pemesanan.",
      data: daftarBooking
    });
  } catch (error) {
    next(error);
  }
};

export const postValidasiBooking = async (req, res, next) => {
  const dataPayload = req.body;
  const { "status-validasi": statusValidasi, "catatan-admin": catatanAdmin } = dataPayload ?? {};

  if (!dataPayload) {
    throw new AppError("BAD_REQUEST", "Payload wajib diisi.", {
      kebutuhan_payload: kontrakAdminValidasiBooking
    });
  }
  if (!statusValidasi || !["setujui", "tolak", "batal"].includes(statusValidasi)) {
        throw new AppError("BAD_REQUEST", "Status validasi wajib diisi ('setujui' atau 'tolak').", {
      kebutuhan_payload: kontrakAdminValidasiBooking
    });
  }
  
  try {
    const idPemesanan = req.params.idPemesanan; 
    
    const hasilValidasi = await prosesValidasiBooking(idPemesanan, req.body);

    res.status(200).json({
      status: "sukses",
      pesan: hasilValidasi.pesan,
      data: {
        "status-pemesanan": hasilValidasi["status-pemesanan"]
      }
    });
  } catch (error) {
    next(error);  
  }
};