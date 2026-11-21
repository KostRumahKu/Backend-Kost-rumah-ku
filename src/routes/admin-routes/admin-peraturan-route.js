import express from "express";
import * as peraturanController from "../../controllers/admin-controllers/admin-peraturan-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.post("/", peraturanController.tambahPeraturan);
router.get("/", peraturanController.ambilSemuaPeraturan);
router.get("/:id", peraturanController.ambilDetailPeraturan);
router.put("/:id", peraturanController.ubahPeraturan);
router.delete("/:id", peraturanController.hapusPeraturan);

export default router;
