import express from "express";
import {
  getDashboardPenyewa,
  getTagihanPenyewa,
  getPengumumanPenyewa,
  updateProfilPenyewa,
  hapusFotoProfil,
  requestOtpEmail,
  verifikasiOtpEmail,
} from "../../controllers/penyewa-controllers/penyewa-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.get("/dashboard", getDashboardPenyewa);
router.get("/tagihan", getTagihanPenyewa);
router.get("/pengumuman", getPengumumanPenyewa);
router.put("/profil", updateProfilPenyewa);
router.delete("/profil/foto", hapusFotoProfil);
router.post("/profil/email/request-otp", requestOtpEmail);
router.post("/profil/email/verify-otp", verifikasiOtpEmail);


export default router;