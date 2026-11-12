export const kontrakAuth = {
 email: "string (wajib) - alamat email yang valid dan terdaftar di sistem",
  password: "string (wajib) - password valid yang terdaftar dan benar",
};

export const kontrakRequestOTP = {
  email: "string (wajib) - Alamat email valid yang sudah terdaftar di sistem",
};

export const kontrakKonfirmasiOTP = {
  email: "string (wajib) - Alamat email yang terdaftar",
  otp: "string (wajib) - 6 digit angka OTP dari email",
  passwordBaru: "string (wajib) - Kata sandi baru yang ingin digunakan",
};
