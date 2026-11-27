import express from "express"; 
import {
  postTambahRekening,
  getDaftarRekeningAdmin,
  putEditRekening,
  deleteRekening,
} from "../../controllers/admin-controllers/admin-rekening-controller.js";import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", getDaftarRekeningAdmin);
router.post("/", postTambahRekening);
router.put("/:id", putEditRekening);
router.delete("/:id", deleteRekening);

export default router; 