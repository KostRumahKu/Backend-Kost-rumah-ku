import * as kamarService from "../services/admin-kamar-service.js";
import { kontrakInputPenghuni, kontrakUbahKamar } from "../contracts/kamar-contract.js";

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
    const dataUpdate = req.body;

    if (!dataUpdate || Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({
        status: "gagal",
        pesan: "Tidak ada data yang dikirim untuk diperbarui.",
        kebutuhan_payload: kontrakUbahKamar,
      });
    }

    const kamarDiperbarui = await kamarService.ubahDataKamar(
      req.params.id,
      dataUpdate,
    );

    res.status(200).json({
      status: "sukses",
      pesan: "Data kamar berhasil diperbarui",
      data: kamarDiperbarui,
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
    const { dataPengguna, dataSewa } = dataPayload;

    if (
      !dataPengguna || !dataSewa ||
      !dataPengguna["nama-lengkap"] || !dataPengguna["email"] ||
      !dataPengguna["nomor-telepon"] || !dataPengguna["nama-kontak-darurat"] || 
      !dataPengguna["nomor-kontak-darurat"] || !dataSewa["durasi-bulan"] ||
      !dataSewa["tanggal-mulai"] || !dataSewa["metode-pembayaran"]
    ) {
      return res.status(400).json({
        status: "gagal",
        pesan: "Format request tidak lengkap! Harap pastikan semua data yang wajib telah diisi.",
        kebutuhan_payload: kontrakInputPenghuni, 
      });
    }

    if (typeof dataSewa['durasi-bulan'] !== 'number') {
      return res.status(400).json({ 
        status: "gagal", 
        pesan: "Format salah! 'durasi-bulan' wajib berupa angka murni (contoh: 3)." 
      });
    }

    if (dataPengguna['nomor-telepon'] === dataPengguna['nomor-kontak-darurat']) {
      return res.status(400).json({ 
        status: "gagal", 
        pesan: "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!" 
      });
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



export const entryDataLama = async (req, res) => {
  try {
    const idKamar = req.params.id;
    const dataPayload = req.body; 
    const { dataPengguna, dataSewa } = dataPayload;

    if (
      !dataPengguna || !dataSewa ||
      !dataPengguna['nama-lengkap'] || !dataPengguna['email'] ||
      !dataPengguna['nomor-telepon'] || !dataPengguna['nama-kontak-darurat'] || 
      !dataPengguna['nomor-kontak-darurat'] || 
      dataSewa['durasi-bulan'] === undefined || !dataSewa['tanggal-mulai'] ||
      !dataSewa['metode-pembayaran']
    ) {
      return res.status(400).json({ status: "gagal", pesan: "Format request tidak lengkap!" });
    }

    if (typeof dataSewa['durasi-bulan'] !== 'number' || dataSewa['durasi-bulan'] <= 0) {
      return res.status(400).json({ 
        status: "gagal", 
        pesan: "Durasi sewa wajib berupa angka murni dan minimal 1 bulan." 
      });
    }

    if (dataPengguna['nomor-telepon'] === dataPengguna['nomor-kontak-darurat']) {
      return res.status(400).json({ 
        status: "gagal", 
        pesan: "Nomor telepon penyewa dan nomor kontak darurat tidak boleh sama!" 
      });
    }

    const hasil = await kamarService.entryDataLama(idKamar, dataPayload);
    
    res.status(201).json({
      status: "sukses",
      pesan: `Berhasil mendigitalisasi/entry data penghuni lama secara manual. Tagihan otomatis dibuat.`,
      data: hasil
    });
  } catch (error) {
    res.status(400).json({ status: "gagal", pesan: error.message });
  }
};