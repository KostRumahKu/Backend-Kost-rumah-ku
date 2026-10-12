// ====== app.js ======
import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes/index-route.js";
import { verifyInternalKey } from "./middlewares/apikey-middleware.js";

const app = express(); 

const ENV = process.env.NODE_ENV || "development";
const loggerFormat = ENV === "production" ? "combined" : "dev";
app.use(morgan(loggerFormat));
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

export default app;