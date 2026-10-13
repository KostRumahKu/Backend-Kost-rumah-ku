import jwt from "jsonwebtoken";

export const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "gagal", pesan: "Akses ditolak, token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const terurai = jwt.verify(token, process.env.JWT_SECRET);
    req.pengguna = terurai;
    next();
  } catch (error) {
    res.status(401).json({ status: "gagal", pesan: "Sesi telah habis atau token tidak valid" });
  }
};


export const otorisasiPeran = (...peranDiizinkan) => {
  return (req, res, next) => {
    if (!req.pengguna || !peranDiizinkan.includes(req.pengguna.peran)) {
      return res.status(403).json({ 
        status: "gagal", 
        pesan: "Anda tidak memiliki hak akses untuk halaman ini" 
      });
    }
    next();
  };
};