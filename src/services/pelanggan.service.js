import { pelanggan } from "../models/pelanggan.model";

export const getAllPelanggan = async () => {
  return await pelanggan.find();
};

export const createPelanggan = async (PelangganData) => {
  const newPelanggan = new pelanggan(PelangganData);
  return await newPelanggan.save();
};
