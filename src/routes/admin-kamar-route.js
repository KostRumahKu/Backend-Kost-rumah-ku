import express from "express";
import * as kamarController from "../controllers/admin-kamar-controller.js";
import { verifikasiToken, otorisasiPeran } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Semua rute di bawah ini wajib login dan wajib memiliki peran admin atau pemilik
router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.post("/", kamarController.tambahKamar); //done test
router.get("/", kamarController.lihatDaftarKamar); //done test
router.get("/:id", kamarController.lihatDetailKamar); //done test
router.put("/:id", kamarController.ubahKamar); //done test
router.delete("/:id", kamarController.hapusKamar); //done test
router.post("/:id/reset", kamarController.resetKamar); //done test

router.post("/:id/input-penghuni-manual", kamarController.inputPenghuniManual); //done test

/* kurang email service */
router.post("/:id/entry-data-lama", kamarController.entryDataLama);//done test

/* kurang email service */
router.post("/pindah", kamarController.pindahKamar);

export default router;
