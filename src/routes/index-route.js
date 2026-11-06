import express from "express";
import authRoutes from "./auth-route.js";
import kamarRoutes from "./admin-routes/admin-kamar-route.js";
import { getKamarPublikData } from "../controllers/public-controllers/public-controller.js";
import penyewaRoute from "./penyewa-routes/penyewa-route.js";
import adminDashboardRoute from "./admin-routes/admin-dashboard-route.js";
import adminPengumumanRoute from "./admin-routes/admin-pengumuman-route.js"
import adminPengajuanRoute from "./admin-routes/admin-pengajuan-route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/kamar", kamarRoutes);
router.get("/public/data-kamar", getKamarPublikData);
router.use("/penyewa", penyewaRoute);
router.use("/admin/dashboard", adminDashboardRoute);
router.use("/admin/pengumuman", adminPengumumanRoute);
router.use("/admin/pengajuan", adminPengajuanRoute);

export default router;
