import { generateInvoicePdfBuffer } from "../../utils/pdf-generator.js";
import Tagihan from "../../models/tagihan-model.js";
import { AppError } from "../../errors.js";

export const unduhInvoicePDF = async (req, res, next) => {
  try {
    const idTagihan = req.params.id || req.params.idTagihan; 
    
    if (!idTagihan) {
      throw new AppError("BAD_REQUEST", "Parameter ID Tagihan tidak ditemukan di URL.");
    }

    const penggunaLogin = req.user || req.pengguna; 

    const tagihan = await Tagihan.findById(idTagihan);
    if (!tagihan) {
      throw new AppError("NOT_FOUND", `Data tagihan dengan ID ${idTagihan} tidak ditemukan.`);
    }
    if (penggunaLogin && penggunaLogin.peran === "penyewa") {
      if (tagihan["id-pengguna"].toString() !== penggunaLogin.id.toString()) {
        throw new AppError("FORBIDDEN", "Akses ditolak. Anda hanya dapat mengunduh tagihan milik Anda sendiri.");
      }
    }

    const pdfBuffer = await generateInvoicePdfBuffer(idTagihan);

    res.setHeader("Content-Type", "application/pdf");
    
    res.setHeader("Content-Disposition", `inline; filename="Invoice-${tagihan["nomor-tagihan"]}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};