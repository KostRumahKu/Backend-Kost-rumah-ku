import express from "express";
import * as pembayaranTagihanController from "../../controllers/penyewa-controllers/penyewa-pembayaran-tagihan-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.post("/pembayaran", pembayaranTagihanController.prosesBayarTagihan);

export default router;