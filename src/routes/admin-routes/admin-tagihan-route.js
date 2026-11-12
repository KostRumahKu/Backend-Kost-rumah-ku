import express from "express";
import {
  ambilSemuaTagihan,
  cariTagihan,
} from "../../controllers/admin-controllers/admin-tagihan-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", ambilSemuaTagihan);
router.post("/cari-tagihan", cariTagihan);

export default router;