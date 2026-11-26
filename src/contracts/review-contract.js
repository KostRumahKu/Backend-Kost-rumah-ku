export const kontrakPenyewaBuatReview = {
  "bintang": "Number (Wajib, 1 digit bilangan bulat dari 1 sampai 5)",
  "deskripsi": "String (Wajib, ulasan atau pengalaman tinggal di kost)",
};

export const kontrakPenyewaUbahReview = {
  "bintang": "Number (Opsional, 1 digit bilangan bulat dari 1 sampai 5)",
  "deskripsi": "String (Opsional, ulasan atau pengalaman tinggal di kost)",
};

export const kontrakAdminBuatReview = {
  "id-penyewa": "String (Wajib, ID akun penyewa yang terdaftar)",
  "bintang": "Number (Wajib, 1 digit bilangan bulat dari 1 sampai 5)",
  "deskripsi": "String (Wajib, ulasan atau pengalaman tinggal di kost)",
};

export const kontrakAdminUbahReview = {
  "bintang": "Number (Opsional, 1 digit bilangan bulat dari 1 sampai 5)",
  "deskripsi": "String (Opsional)",
  "terisi": "Boolean (Opsional, true untuk tampil di pop up landing page, false untuk sembunyikan)",
};