import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { inisialisasiCronJob } from "./services/cron-service.js";
import packageJson from "../package.json";

export const BACKEND_VERSION = packageJson.version;
const PORT = process.env.PORT || 3000;

await connectDatabase();

app.listen(PORT, () => {
  console.log(
    `server berjalan di ${PORT} mode ${process.env.NODE_ENV || "development"} mode di versi:${BACKEND_VERSION}`, // mode dev jadi default kalau gak diisi
  );
  inisialisasiCronJob();
});
