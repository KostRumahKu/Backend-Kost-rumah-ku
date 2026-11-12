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

export { unduhInvoicePDF };