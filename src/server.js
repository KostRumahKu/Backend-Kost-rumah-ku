import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 3000;

// gua pakai await di sini biar nunggu database connect dulu baru jalanin servernya, kalau gak di await bisa aja server jalan tapi database belum connect
// sementara ini di matiin baut test sampai models nya ada
// await connectDatabase();

app.listen(PORT, () => {
  console.log(
    `server berjalan di ${PORT} mode ${process.env.NODE_ENV || "development"} mode`, // mode dev jadi default kalau gak diisi
  );
});
