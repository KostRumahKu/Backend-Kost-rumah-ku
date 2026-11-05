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

export const kontrakPenyewaGantiPassword = {
  "password-lama": "string (wajib, password lama yang digunakan untuk login)",
  "password-baru": "string (wajib, password baru yang akan digunakan untuk login)"
}

export const kontrakPenyewaBuatPengajuan = {
  "jenis-pengajuan": "string (wajib, jenis pengajuan: berhenti-sewa atau pindah-kamar)",
  "tanggal-target": "string (wajib, tanggal target pengajuan dalam format YYYY-MM-DD)",
  "alasan": "string (wajib, alasan pengajuan)"
}