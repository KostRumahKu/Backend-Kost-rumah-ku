import express from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth-controllers/auth-controller";

const router = express.Router();

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    status: "gagal",
    code: "TOO_MANY_REQUESTS",
    pesan: "Terlalu banyak permintaan reset password. Tunggu 15 menit lagi.",
  },
});

const konfirmasiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: "gagal",
    code: "TOO_MANY_REQUESTS",
    pesan: "Terlalu banyak percobaan OTP yang salah. Tunggu 15 menit lagi.",
  },
});

router.post("/pemilik/login", authController.loginPemilik);
router.post("/admin/login", authController.loginAdmin);
router.post("/penyewa/login", authController.loginPenyewa);
router.post("/lupa-password", resetLimiter, authController.requestLupaPassword);
router.post("/lupa-password/konfirmasi", konfirmasiLimiter, authController.konfirmasiLupaPassword);

export default router;