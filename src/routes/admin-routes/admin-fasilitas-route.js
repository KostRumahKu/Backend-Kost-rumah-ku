import express from "express";
import * as fasilitasController from "../../controllers/admin-controllers/admin-fasilitas-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", fasilitasController.ambilSemuaFasilitas);
router.get("/:id", fasilitasController.ambilDetailFasilitas);
router.post("/", fasilitasController.tambahFasilitas);
router.put("/:id", fasilitasController.ubahFasilitas);
router.delete("/:id", fasilitasController.hapusFasilitas);

export default router;
