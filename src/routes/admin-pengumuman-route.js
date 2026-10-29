import express from "express";
import { broadcastPengumuman, lihatRiwayatPengumuman } from "../controllers/admin-pengumuman-controller.js";
import { verifikasiToken, otorisasiPeran } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", lihatRiwayatPengumuman);
router.post("/", broadcastPengumuman);

export default router;