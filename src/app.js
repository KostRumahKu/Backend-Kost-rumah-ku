// entrpoint utama disini untuk backend

// tempat import library
import express from "express";
import cors from "cors";
// import routes from "./routes/index.route.js";

// import middleware
import { verifyInternalKey } from "./middlewares/auth.middleware.js";

const app = express(); // janga di ganggu gugat bagian ini variabel app buat express di atas 

// cors
app.use(cors());
app.use(verifyInternalKey); // middleware buat verifikasi internal key, kalau mau di hapus tinggal hapus aja baris ini, tapi jangan di hapus kalau mau di pake internal key

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ======= routing buat root ======
app.get("/", (req, res) => {
  res.status(200).json({
    status: "sukses",
    message: "backend sudah berhasil berjalan dengan mode " + (process.env.NODE_ENV),
  });
});

// API, kalau mau pakai API versioning bilang aja ke gua -dana
// app.use("/api", verifyInternalKey, routes);

export default app;
