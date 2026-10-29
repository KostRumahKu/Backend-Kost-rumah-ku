import express from "express";
import { getDashboardAdmin } from "../controllers/admin-dashboard-controller.js";
import { verifikasiToken, otorisasiPeran } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", getDashboardAdmin);

export default router;