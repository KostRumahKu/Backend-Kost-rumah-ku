import express from "express";
import {
  ambilSemuaTagihan,
  cariTagihan,
  validasiPembayaran,
  bayarTunggakanManual,
} from "../../controllers/admin-controllers/admin-tagihan-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", ambilSemuaTagihan);
router.post("/cari-tagihan", cariTagihan);
router.put("/:id/validasi", validasiPembayaran);
router.post("/tunggakan/manual", bayarTunggakanManual);

export default router;  