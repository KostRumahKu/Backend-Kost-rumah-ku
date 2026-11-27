import express from "express";
import {
  getReviewPenyewa,
  postReviewPenyewa,
  patchReviewPenyewa,
  patchPengaturanReview,
} from "../../controllers/penyewa-controllers/penyewa-review-controller.js";
import {
  verifikasiToken,
  otorisasiPeran,
} from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("penyewa"));

router.get("/", getReviewPenyewa);
router.post("/", postReviewPenyewa);
router.patch("/", patchReviewPenyewa);
router.patch("/pengaturan", patchPengaturanReview);

export default router;