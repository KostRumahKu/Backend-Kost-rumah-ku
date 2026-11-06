import express from "express";
import {
  getDashboardPenyewa,
  getTagihanPenyewa,
  getPengumumanPenyewa,
  updateProfilPenyewa,
  hapusFotoProfil,
  requestOtpEmail,
  verifikasiOtpEmail,
  updatePasswordPenyewa,
} from "../../controllers/penyewa-controllers/penyewa-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

import {
  buatPengajuan,
  batalkanPengajuan,
  getRiwayatPengajuan,
} from "../../controllers/penyewa-controllers/penyewa-pengajuan-controller.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.get("/dashboard", getDashboardPenyewa);
router.get("/tagihan", getTagihanPenyewa);
router.get("/pengumuman", getPengumumanPenyewa);
router.put("/profil", updateProfilPenyewa);
router.delete("/profil/foto", hapusFotoProfil);
router.post("/profil/email/request-otp", requestOtpEmail);
router.post("/profil/email/verify-otp", verifikasiOtpEmail);
router.put("/profil/ganti-password", updatePasswordPenyewa);

router.get("/pengajuan", getRiwayatPengajuan);
router.post("/pengajuan", buatPengajuan);
router.put("/pengajuan/:id/batalkan", batalkanPengajuan);

export default router;