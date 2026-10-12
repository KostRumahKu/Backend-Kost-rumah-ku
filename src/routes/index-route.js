import express from "express";
import authRoutes from "./auth-route.js";
// import pemilikRoutes from "./pemilik.route.js";
// import pelangganRoutes from "./pelanggan.route.js";

const router = express.Router();

router.use("/auth", authRoutes); 

export default router;
