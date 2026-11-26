import express from "express";
import {
  getSemuaReview,
  getDetailReview,
  postReviewAdmin,
  patchReviewAdmin,
  deleteReviewAdmin,
} from "../../controllers/admin-controllers/admin-review-controller.js";
import {
  verifikasiToken,
  otorisasiPeran,
} from "../../middlewares/auth-middleware.js";

const router = express.Router();

router.use(verifikasiToken, otorisasiPeran("admin", "pemilik"));

router.get("/", getSemuaReview);
router.get("/:id", getDetailReview);
router.post("/", postReviewAdmin);
router.patch("/:id", patchReviewAdmin);
router.delete("/:id", deleteReviewAdmin);

export default router;