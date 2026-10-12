import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Pengguna from "./models/pengguna-model.js";
import { config } from "dotenv";
import { connectDatabase } from "./config/database.js";

config();

const seedData = async () => {
  try {
    await connectDatabase(); 
    console.log("Terhubung ke database untuk seeding...");

    await Pengguna.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("rahasia123", salt);

    const penggunaDummy = [
      {
        "nama-lengkap": "Bapak Pemilik Kost",
        email: "owner@kost.com",
        "kata-sandi": hashedPassword,
        peran: "pemilik",
        "nomor-telepon": "08111111111",
      },
      {
        "nama-lengkap": "Admin Penjaga Kost",
        email: "admin@kost.com",
        "kata-sandi": hashedPassword,
        peran: "admin",
        "nomor-telepon": "08222222222",
      },
      {
        "nama-lengkap": "Penyewa Budi",
        email: "budi@penyewa.com",
        "kata-sandi": hashedPassword,
        peran: "penyewa",
        "nomor-telepon": "08333333333",
      },
    ];

    await Pengguna.insertMany(penggunaDummy);
    console.log("Berhasil insert data dummy (Pemilik, Admin, Penyewa)!");
    process.exit();
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  }
};

seedData();