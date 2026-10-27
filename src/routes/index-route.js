import express from "express";
import authRoutes from "./auth-route.js";
import kamarRoutes from "./admin-kamar-route.js";
import { getKamarPublikData } from "../controllers/public-controller.js";

// import pemilikRoutes from "./pemilik.route.js";
// import pelangganRoutes from "./pelanggan.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/kamar", kamarRoutes);
router.get("/public/data-kamar", getKamarPublikData);

export default router;
