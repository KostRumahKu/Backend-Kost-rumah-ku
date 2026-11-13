import rateLimit from "express-rate-limit";

export const rateLimiterPDF = rateLimit({
  windowMs: 3 * 1000, // 5 detik
  max: 1, 
  
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return req.user._id.toString();
    }
    return "unauthenticated-user"; 
  },
  
  message: {
    status: "gagal",
    code: "TOO_MANY_REQUESTS",
    pesan: "Sistem sedang memproses dokumen Anda. Harap tunggu 3 detik sebelum mencoba mengunduh lagi."
  },
  standardHeaders: true,
  legacyHeaders: false,
});