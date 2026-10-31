export const kontrakPenyewaUpdateProfil = {
  "nama-lengkap": "string (wajib)",
  "nomor-telepon": "string (wajib)",
  "nama-kontak-darurat": "string (nanti optional)",
  "nomor-kontak-darurat": "string (nanti optional)",
  "foto-profil": "String (Optional) foto profil abru dari penyewa, kalau bisa ini webp yah",
};

export const kontrakPenyewaMintaGantiEmail = {
  "email-baru": "string (wajib, alamat email yang terdaftar)"
}

export const kontrakPenyewaKonfirmasiEmailDanaOtp = {
    "email-baru": "string (wajib, alamat email yang terdaftar)",
    "otp": "string (wajib) otp yang dikirimkan ke alamat email ketika request ganti email"
}