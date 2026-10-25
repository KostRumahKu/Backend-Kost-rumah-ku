import jwt from "jsonwebtoken";
import { AppError } from "../errors.js";

export const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("UNAUTHORIZED", "Token tidak ditemukan."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const terurai = jwt.verify(token, process.env.JWT_SECRET);
    req.pengguna = terurai;
    next();
  } catch (error) {
    return next(
      new AppError("UNAUTHORIZED", "Sesi telah habis atau token tidak valid."),
    );
  }
};


export const otorisasiPeran = (...peranDiizinkan) => {
  return (req, res, next) => {
    if (!req.pengguna || !peranDiizinkan.includes(req.pengguna.peran)) {
      return next(
        new AppError(
          "FORBIDDEN",
          "Anda tidak memiliki hak akses untuk halaman ini",
        ),
      );
    }
    next();
  };
};