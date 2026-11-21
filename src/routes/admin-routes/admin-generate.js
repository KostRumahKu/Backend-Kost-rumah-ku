import express from "express";
import { unduhInvoicePDF } from "../../controllers/utils-controllers/tagihan-controller.js";
import { rateLimiterPDF } from "../../middlewares/pdf-limiter.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/:idTagihan/pdf", rateLimiterPDF, unduhInvoicePDF);

export default router;