import {
  tambahRekeningBaru,
  ambilDaftarRekening,
  perbaruiRekening,
  hapusRekening,
} from "../../services/admin-services/admin-rekening-service.js";
import { kontrakAdminRekening } from "../../contracts/admin-rekening-contract.js";
import { AppError } from "../../errors.js";

export const getDaftarRekeningAdmin = async (req, res, next) => {

  try {
    const daftarRekening = await ambilDaftarRekening();

    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat daftar rekening untuk CMS.",
      data: daftarRekening,
    });
  } catch (error) {
    next(error);
  }
};

export const postTambahRekening = async (req, res, next) => {
    const dataPayload = req.body;
    const {
      "nama-bank": namaBank,
      "nama-pemilik": namaPemilik,
      "nomor-rekening": nomorRekening,
      jenis,
    } = dataPayload ?? {};

     if (!namaBank || !namaPemilik || !nomorRekening || !jenis) {
       throw new AppError(
         "BAD_REQUEST",
         "Data bank, pemilik, nomor, dan jenis wajib diisi.",
         {
           kebutuhan_payload: kontrakAdminRekening,
         },
       );
     }
    
  try {
    const rekeningBaru = await tambahRekeningBaru(req.body);

    res.status(201).json({
      status: "sukses",
      pesan: "Metode pembayaran baru berhasil ditambahkan.",
      data: rekeningBaru,
    });
  } catch (error) {
    next(error);
  }
};

export const putEditRekening = async (req, res, next) => {
  try {
    const idRekening = req.params.id;
    const rekeningUpdate = await perbaruiRekening(idRekening, req.body);

    res.status(200).json({
      status: "sukses",
      pesan: "Metode pembayaran berhasil diperbarui.",
      data: rekeningUpdate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRekening = async (req, res, next) => {
  try {
    const idRekening = req.params.id;
    await hapusRekening(idRekening);

    res.status(200).json({
      status: "sukses",
      pesan: "Metode pembayaran berhasil dinonaktifkan.",
    });
  } catch (error) {
    next(error);
  }
};
