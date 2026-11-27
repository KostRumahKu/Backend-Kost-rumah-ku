import express from "express";
import {
  getProfilAdminSendiri,
  patchProfilAdminSendiri,
  getDaftarPenyewa,
  getDetailPenyewa,
  patchProfilPenyewa,
} from "../../controllers/admin-controllers/admin-edit-pengguna-controller.js";
import {
  verifikasiToken,
  otorisasiPeran,
} from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/profil-admin", getProfilAdminSendiri);
router.get("/", getDaftarPenyewa); 
router.get("/:id", getDetailPenyewa);
router.patch("/:id", patchProfilPenyewa);
router.patch("/profil-admin", patchProfilAdminSendiri);

export default router;