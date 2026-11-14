import express from "express";
import * as adminKasKostController from "../../controllers/admin-controllers/admin-kas-kost-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();
router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));


router.get("/ringkasan", adminKasKostController.getRingkasanKas);
router.get("/", adminKasKostController.getRiwayatKas);
router.post("/upload", adminKasKostController.postKasManual);

export default router;