export const verifyInternalKey = (req, res, next) => {
  const clientKey = req.headers["x-internal-key"]; // header key, value ambil dari .env
  const serverKey = process.env.INTERNAL_KEY; // kalau mau di biki || boleh cuma gak aman

  if (!clientKey || clientKey !== serverKey) {
    return res.status(401).json({
      status: "error",
      message: "KAMU DI LARANG AKSES!",
    });
  }

  next();
};
