import { Pemilik } from "../models/pemilik.model";

export const getAllPemilik = async () => {
  return await Pemilik.find();
};

export const createPemilik = async (PemilikData) => {
  const newPemilik = new Pemilik(PemilikData);
  return await newPemilik.save();
};
