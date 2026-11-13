import express from "express";
import {
  prosesPengajuan,
  getSemuaPengajuan,
  getDetailPengajuan,
  rollbackPersetujuan,
  selesaikanPengajuan,
} from "../../controllers/admin-controllers/admin-pengajuan-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", getSemuaPengajuan);
router.get("/:id", getDetailPengajuan);
router.put("/:id/proses", prosesPengajuan);
router.put("/:id/rollback", rollbackPersetujuan);
router.put("/:idPengajuan/selesai", selesaikanPengajuan);

export default router;