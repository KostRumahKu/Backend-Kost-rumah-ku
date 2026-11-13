import * as pembayaranService from "../../services/penyewa-services/penyewa-pembayaran-tagihan-service.js";
import { AppError } from "../../errors.js";

export const prosesBayarTagihan = async (req, res, next) => {
  try {
    const idPengguna = req.user?._id || req.user?.id || req.pengguna?._id || req.pengguna?.id;
    const {
      idTagihanDasar,
      jumlahBulan,
      buktiPembayaran,
      "id-rekening": idRekening,
    } = req.body;

    if (!idTagihanDasar || !buktiPembayaran) {
      throw new AppError("BAD_REQUEST", "ID Tagihan dan URL Bukti Pembayaran wajib dikirimkan.");
    }

    const payload = {
      idTagihanDasar,
      jumlahBulan: Number(jumlahBulan) || 1, // Jika tidak dikirim, otomatis dihitung 1 bulan
      buktiPembayaran,
      idRekening
    };

    const hasil = await pembayaranService.bayarTagihan(idPengguna, payload);

    res.status(200).json({
      status: "sukses",
      pesan: `Berhasil mengunggah bukti pembayaran untuk ${payload.jumlahBulan} bulan. Tagihan saat ini berstatus menunggu validasi Admin.`,
      data: hasil
    });
  } catch (error) {
    next(error);
  }
};