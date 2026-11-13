import express from "express";
import * as peraturanController from "../../controllers/admin-controllers/admin-peraturan-controller.js";
import { AppError } from "../../errors.js";

const router = express.Router();

router.post("/", peraturanController.tambahPeraturan);
router.get("/", peraturanController.ambilSemuaPeraturan);
router.get("/:id", peraturanController.ambilDetailPeraturan);
router.put("/:id", peraturanController.ubahPeraturan);
router.delete("/:id", peraturanController.hapusPeraturan);

export default router;
