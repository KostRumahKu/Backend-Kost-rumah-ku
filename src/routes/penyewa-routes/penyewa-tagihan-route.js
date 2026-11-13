import express from "express";
import * as tagihanPenyewaController from "../../controllers/penyewa-controllers/penyewa-tagihan-controller.js";
import { rateLimiterPDF } from "../../middlewares/pdf-limiter.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.get("/tagihan", tagihanPenyewaController.ambilRiwayatTagihan);

router.get("/generate/:id/pdf", rateLimiterPDF, tagihanPenyewaController.unduhInvoicePDF);

export default router;