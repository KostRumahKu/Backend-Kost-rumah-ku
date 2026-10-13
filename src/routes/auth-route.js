import express from "express";
import * as authController from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/pemilik/login", authController.loginPemilik);
router.post("/admin/login", authController.loginAdmin);
router.post("/penyewa/login", authController.loginPenyewa);

export default router;