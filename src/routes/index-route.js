import express from "express";
import authRoutes from "./auth-route.js";
import kamarRoutes from "./admin-routes/admin-kamar-route.js";
import {
  getKamarPublikData,
  postBookingKamar,
  postUploadBuktiBooking,
} from "../controllers/public-controllers/public-controller.js";
import penyewaRoute from "./penyewa-routes/penyewa-route.js";
import adminDashboardRoute from "./admin-routes/admin-dashboard-route.js";
import adminPengumumanRoute from "./admin-routes/admin-pengumuman-route.js"
import adminPengajuanRoute from "./admin-routes/admin-pengajuan-route.js";
import { getDaftarRekeningPublik } from "../controllers/public-controllers/public-controller.js";
import rekeningRoutes from "./admin-routes/admin-rekening-route.js";
import adminBookingRoutes from "./admin-routes/admin-booking-route.js";
import adminPeraturanRoutes from "./admin-routes/admin-peraturan-route.js";
import { ambilSemuaPeraturan } from "../controllers/admin-controllers/admin-peraturan-controller.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/kamar", kamarRoutes);
router.get("/public/data-kamar", getKamarPublikData);
router.post("/public/booking", postBookingKamar);
router.post("/public/booking/upload-bukti", postUploadBuktiBooking); 
router.use("/penyewa", penyewaRoute);
router.use("/admin/dashboard", adminDashboardRoute);
router.use("/admin/pengumuman", adminPengumumanRoute);
router.use("/admin/pengajuan", adminPengajuanRoute);
router.get("/public/rekening", getDaftarRekeningPublik);
router.use("/admin/rekening", rekeningRoutes);
router.use("/admin/booking", adminBookingRoutes);
router.use("/admin/peraturan", adminPeraturanRoutes);
router.get("/public/semuaPeraturan", ambilSemuaPeraturan);
export default router;
