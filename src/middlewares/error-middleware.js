import { AppError } from "../errors.js";

export const errorHandler = (error, req, res, next) => {
  // 1. Log error asli tepat di pintu masuk middleware
  console.log("\n🔥 ERROR ASLI DITANGKAP MIDDLEWARE:");
  console.log(error);
  console.log("=====================================\n");

  if (res.headersSent) return next(error);

  let apiError = error;
  
  if (error?.type === "entity.parse.failed") {
    apiError = new AppError("BAD_REQUEST", "Format JSON tidak valid.");
  } 
  else if (error?.name === "ValidationError") {
    apiError = new AppError("VALIDATION_ERROR", `Validasi Database Gagal: ${error.message}`);
  } 
  else if (error?.name === "CastError") {
    apiError = new AppError("VALIDATION_ERROR", `Tipe data salah (CastError): ${error.message}`);
  } 
  else if (error?.code === 11000) {
    apiError = new AppError("VALIDATION_ERROR", "Data yang dikirim sudah digunakan (Duplikat).");
  } 
  else if (!(error instanceof AppError)) {
    console.error(error);
    apiError = new AppError(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan pada server.",
    );
  }

  const response = {
    status: "gagal",
    code: apiError.code,
    pesan: apiError.message,
  };

  if (apiError.details !== undefined) response.details = apiError.details;

  return res.status(apiError.statusCode || 500).json(response);
};