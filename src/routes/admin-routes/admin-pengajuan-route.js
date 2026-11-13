import express from "express";
import {
  prosesPengajuan,
  getSemuaPengajuan,
  getDetailPengajuan,
  rollbackPersetujuan,
  selesaikanPengajuan,
} from "../../controllers/admin-controllers/admin-pengajuan-controller.js";

const router = express.Router();

router.get("/", getSemuaPengajuan);
router.get("/:id", getDetailPengajuan);
router.put("/:id/proses", prosesPengajuan);
router.put("/:id/rollback", rollbackPersetujuan);
router.put("/:idPengajuan/selesai", selesaikanPengajuan);

export default router;