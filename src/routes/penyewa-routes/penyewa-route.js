import express from "express";
import { getDashboardPenyewa, getTagihanPenyewa, getPengumumanPenyewa } from "../../controllers/penyewa-controllers/penyewa-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";
import { generateTagihanBulanan } from "../../services/cron-service.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.get("/dashboard", getDashboardPenyewa);
router.get("/tagihan", getTagihanPenyewa);
router.get("/pengumuman", getPengumumanPenyewa);
router.post("/test-trigger-cron", async (req, res) => {
  await generateTagihanBulanan();
  res.json({ status: "sukses", pesan: "Cron job berhasil dijalankan secara manual." });
});

export default router;