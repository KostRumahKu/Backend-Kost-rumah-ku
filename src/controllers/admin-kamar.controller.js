import * as kamarService from "../services/admin-kamar.service.js";
import { kontrakInputPenghuni } from "../contracts/kamar-contract.js";

export const tambahKamar = async (req, res) => {
  try {
    const kamarBaru = await kamarService.tambahKamarBaru(req.body);
    res.status(201).json({
      status: "sukses",
      pesan: "Kamar berhasil ditambahkan",
      data: kamarBaru
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};

export const lihatDaftarKamar = async (req, res) => {
  try {
    const daftarKamar = await kamarService.ambilSemuaKamar(req.query);
    res.status(200).json({
      status: "sukses",
      data: daftarKamar
    });
  } catch (error) {
    res.status(500).json({ status: "gagal", pesan: error.message });
  }
};

export const lihatDetailKamar = async (req, res) => {
  try {
    const kamar = await kamarService.ambilDetailKamar(req.params.id);
    res.status(200).json({
      status: "sukses",
      data: kamar
    });
  } catch (error) {
    res.status(404).json({ status: "gagal", pesan: error.message });
  }
};

export const ubahKamar = async (req, res) => {
  try {
    const kamarDiperbarui = await kamarService.ubahDataKamar(req.params.id, req.body);
    res.status(200).json({
      status: "sukses",
      pesan: "Data kamar berhasil diperbarui",
      data: kamarDiperbarui
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};

export const hapusKamar = async (req, res) => {
  try {
    const idKamar = req.params.id;
    const isPermanent = req.query.permanent === "true";

    await kamarService.hapusKamar(idKamar, isPermanent);
    
    res.status(200).json({
      status: "sukses",
      pesan: isPermanent 
        ? "Kamar berhasil dihapus permanen" 
        : "Kamar berhasil dipindahkan ke arsip "
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};

export const resetKamar = async (req, res) => {
  try {
    const idKamar = req.params.id;
    // Admin bisa mengirimkan alasan di body JSON: { "catatan": "Pindah ke luar kota" }
    const catatan = req.body.catatan; 

    await kamarService.resetKamar(idKamar, catatan);
    
    res.status(200).json({
      status: "sukses",
      pesan: "Kamar berhasil direset menjadi kosong dan riwayat penghuni telah diarsipkan"
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};

export const inputPenghuniManual = async (req, res) => {
  try {
    const idKamar = req.params.id;
    const dataPayload = req.body; 

    if (!dataPayload.dataPengguna || !dataPayload.dataSewa) {
      return res.status(400).json({
        status: "gagal",
        pesan:
          "Format request tidak sesuai kontrak.",
        kebutuhan_payload: kontrakInputPenghuni, 
      });
    }

    // Validasi basic
    if (!dataPayload.dataPengguna || !dataPayload.dataSewa) {
      return res.status(400).json({ status: "gagal", pesan: "Data Pengguna dan Data Sewa wajib diisi" });
    }

    const hasil = await kamarService.inputPenghuniManual(idKamar, dataPayload);
    
    res.status(201).json({
      status: "sukses",
      pesan: `Berhasil menginput penghuni baru secara manual. Tagihan ${hasil.nomorInvoice} otomatis dibuat dan dilunasi!`,
      data: hasil
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};