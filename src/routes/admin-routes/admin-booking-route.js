import express from "express";
import {
  postValidasiBooking,
  getDaftarBooking,
} from "../../controllers/admin-controllers/admin-booking-controller.js";
import { verifikasiToken, otorisasiPeran } from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

/*
GET /api/admin/booking
GET /api/admin/booking?status=menunggu-validasi
GET /api/admin/booking?status=menunggu-pembayaran
GET /api/admin/booking?status=menunggu-validasi&sort=terlama
*/
router.get("/", getDaftarBooking);
router.post("/:idPemesanan/validasi", postValidasiBooking);

export default router;