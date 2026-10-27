import { AppError } from "../errors.js";

export const verifyInternalKey = (req, res, next) => {
  const clientKey = req.headers["x-internal-key"]; // header key, value ambil dari .env
  const serverKey = process.env.INTERNAL_KEY; // kalau mau di bikin || boleh cuma gak aman

  if (!clientKey || clientKey !== serverKey) {
    return next(new AppError("UNAUTHORIZED", "Akses tidak diizinkan."));
  }

  next();
};
