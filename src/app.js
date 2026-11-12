// ====== app.js ======
import express from "express";
import cors from "cors";

import routes from "./routes/index-route.js";
import { verifyInternalKey } from "./middlewares/apikey-middleware.js";
import { errorHandler } from "./middlewares/error-middleware.js";
import { loggerSetup } from "./logger-setup.js";
import { AppError } from "./errors.js";

import "./utils/version-check.js";

const app = express(); 

loggerSetup(app);
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======= routing buat root ======
app.get("/", (req, res) => {
  res.status(200).json({
    status: "sukses",
    message: "backend sudah berhasil berjalan dengan mode " + process.env.NODE_ENV,
  });
});

app.use("/api", verifyInternalKey, routes);

// ini app js
app.use((req, res, next) => {
  next(new AppError("ROUTE_TIDAK_DITEMUKAN", "Rute tidak ditemukan."));
});
app.use(errorHandler);

export default app;
