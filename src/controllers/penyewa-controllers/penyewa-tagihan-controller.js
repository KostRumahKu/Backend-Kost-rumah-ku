import * as penyewaTagihanService from "../../services/penyewa-services/penyewa-tagihan-service.js";
import { unduhInvoicePDF } from "../utils-controllers/tagihan-controller.js"; 

export const ambilRiwayatTagihan = async (req, res, next) => {
  try {
    const penggunaLogin = req.user || req.pengguna; 
    
    const data = await penyewaTagihanService.ambilRiwayatTagihan(penggunaLogin._id);

    res.status(200).json({
      status: "sukses",
      pesan: "Riwayat tagihan berhasil dimuat.",
      data
    });
  } catch (error) {
    next(error);
  }
};

export const permintaanTagihanBerikutnya = async (req, res, next) => {
  try {
    const idPengguna =
      req.user?._id || req.user?.id || req.pengguna?._id || req.pengguna?.id;

    const tagihanBaru =
      await penyewaTagihanService.buatPermintaanTagihan(idPengguna);

    res.status(201).json({
      status: "sukses",
      pesan: `Berhasil membuat tagihan untuk periode ${tagihanBaru["bulan-tagihan"]}. Tagihan sudah siap dibayar.`,
      data: tagihanBaru,
    });
  } catch (error) {
    next(error);
  }
};

export { unduhInvoicePDF };