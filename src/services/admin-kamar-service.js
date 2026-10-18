import Kamar from "../models/kamar-model.js";
import Pengguna from "../models/pengguna-model.js.js";
import RiwayatSewa from "../models/riwayat-sewa-model.js";
import Pemesanan from "../models/pemesanan-model.js";
import Tagihan from "../models/tagihan-model.js";
import Pembayaran from "../models/pembayaran-model.js";
import bcrypt from "bcrypt";

import { generateIdPengguna } from "./pengguna-service.js";
// ============== Fungsi Service untuk Admin/Pemilik ==============
// ============= FUNGSI MMEBUAT KAMAR BARU ==============
export const tambahKamarBaru = async (dataKamar) => {
  const { lantai } = dataKamar;

  if (!lantai) {
    throw new Error("Lantai wajib diisi untuk menentukan nomor kamar");
  }

  const kamarTerakhir = await Kamar.findOne({ lantai: lantai }).sort({
    _id: -1,
  });

  let idBaru;
  if (kamarTerakhir) {
    idBaru = kamarTerakhir._id + 1;
  } else {
    idBaru = lantai * 1000 + 1;
  }

  if (
    dataKamar["tipe-kamar"] &&
    !["ekonomi", "eksekutif"].includes(dataKamar["tipe-kamar"])
  ) {
    throw new Error("Tipe kamar harus 'ekonomi' atau 'eksekutif'");
  }

  if (dataKamar["harga"] && dataKamar["harga"] < 0) {
    throw new Error("Harga kamar tidak boleh negatif");
  }

  const payloadKamar = {
    ...dataKamar,
    _id: idBaru,
    "nama-kamar": dataKamar["nama-kamar"] || idBaru.toString(),
  };

  const kamarBaru = new Kamar(payloadKamar);
  return await kamarBaru.save();
};

export const ambilSemuaKamar = async (query = {}) => {
  const filter = {};
  if (query.diarsipkan === "true") {
    filter.diarsipkan = true;
  } else if (query.diarsipkan === "false") {
    filter.diarsipkan = false;
  } else {
    filter.diarsipkan = { $ne: true };
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.lantai) {
    filter.lantai = parseInt(query.lantai, 10);
  }

  if (query["tipe-kamar"]) {
    filter["tipe-kamar"] = query["tipe-kamar"];
  }
  if (query.search) {
    filter["nama-kamar"] = { $regex: query.search, $options: "i" };
  }
  return await Kamar.find(filter).sort({ _id: 1 });
};

export const ambilDetailKamar = async (idKamar) => {
  const kamar = await Kamar.findById(idKamar).lean();

  if (!kamar) {
    throw new Error("Kamar tidak ditemukan");
  }

  let penghuniAktif = null; // default null karena gak ada orang yang nempatin

  if (kamar.status === "terisi") {
    penghuniAktif = await Pengguna.findOne({
      "id-kamar": idKamar,
      peran: "penyewa",
    }).select("-kata-sandi");
  }

  const riwayatSewa = await RiwayatSewa.find({ "id-kamar": idKamar }).sort({
    "tanggal-masuk": -1,
  });

  kamar["penghuni-aktif"] = penghuniAktif;
  kamar["riwayat-sewa"] = riwayatSewa;

  return kamar;
};

export const ubahDataKamar = async (idKamar, dataUpdate) => {
  const kamarSaatIni = await Kamar.findById(idKamar);
  if (!kamarSaatIni) throw new Error("Kamar tidak ditemukan");
  if (dataUpdate.status && dataUpdate.status !== kamarSaatIni.status) {
    if (kamarSaatIni.status === 'terisi') {
      throw new Error("Gagal! Kamar sedang terisi. Silakan gunakan fitur Reset/Checkout terlebih dahulu sebelum mengubah status kamar menjadi kosong atau perbaikan.");
    }

    if (dataUpdate.status === 'terisi') {
      throw new Error("Gagal! Anda tidak bisa mengubah status menjadi 'terisi' secara manual. Harap gunakan fitur Input Penghuni / Entry Data untuk mengisi kamar.");
    }
  }

  delete dataUpdate._id;
  delete dataUpdate.lantai;
  delete dataUpdate.harga; 
  delete dataUpdate.diarsipkan;
  delete dataUpdate["tipe-kamar"]; 

  // if (dataUpdate['tipe-kamar']) {
  //   const tipeBaru = dataUpdate['tipe-kamar'].toLowerCase();
  //   if (tipeBaru === 'teratai') {
  //     dataUpdate.harga = 300000;
  //   } else if (tipeBaru === 'tulip') {
  //     dataUpdate.harga = 500000;
  //   }
  // }
  const kamarDiperbarui = await Kamar.findByIdAndUpdate(idKamar, dataUpdate, {
    new: true,
    runValidators: true,
  });

  return kamarDiperbarui;
};

export const hapusKamar = async (idKamar, isPermanent = false) => {
  const kamar = await Kamar.findById(idKamar);
  if (!kamar) throw new Error("Kamar tidak ditemukan");

  if (kamar.status === "terisi" || kamar.status === "dipesan") {
    throw new Error(
      "Kamar tidak dapat dihapus karena sedang dipesan atau terisi",
    );
  }

  if (isPermanent) {
    return await Kamar.findByIdAndDelete(idKamar);
  } else {
    kamar.diarsipkan = true;
    kamar.status = "kosong";
    return await kamar.save();
  }
};

export const resetKamar = async (
  idKamar,
  catatanAdmin = "Selesai masa sewa",
) => {
  const kamar = await Kamar.findById(idKamar);
  if (!kamar) throw new Error("Kamar tidak ditemukan");

  if (kamar.status !== "terisi") {
    throw new Error("Kamar tidak dapat direset karena statusnya belum terisi");
  }

  const penghuni = await Pengguna.findOne({
    "id-kamar": idKamar,
    peran: "penyewa",
  });

  if (penghuni) {
    const riwayatBaru = new RiwayatSewa({
      "id-kamar": idKamar,
      "id-pengguna": penghuni._id,
      "nama-penyewa": penghuni["nama-lengkap"],
      "tanggal-masuk": penghuni["tanggal-mulai"] || penghuni["dibuat-pada"],
      "tanggal-keluar": new Date(),
      catatan: catatanAdmin,
    });
    await riwayatBaru.save();

    await Pengguna.findByIdAndUpdate(penghuni._id, {
      $set: {
        "id-kamar": null,
        "tanggal-mulai": null,
        "tanggal-berakhir": null,
      },
    });
  }

  kamar.status = "kosong";
  await kamar.save();

  return kamar;
};

// ============ INPUT PENGHUNI ==========
export const inputPenghuniManual = async (idKamar, dataPayload) => {
  const { dataPengguna, dataSewa } = dataPayload;

  const kamar = await Kamar.findById(idKamar);
  if (!kamar) throw new Error("Kamar tidak ditemukan");
  if (kamar.status !== 'kosong') {
    if (kamar.status === 'dipesan') {
      throw new Error("Gagal! Kamar saat ini sedang 'dipesan'. Harap ubah statusnya menjadi 'kosong' terlebih dahulu melalui menu Edit Kamar jika Anda benar-benar ingin memasukkan penghuni ini.");
    } else if (kamar.status === 'perbaikan') {
      throw new Error("Gagal! Kamar sedang dalam 'perbaikan' dan tidak bisa diisi penghuni baru.");
    } else if (kamar.status === 'terisi') {
      throw new Error("Gagal! Kamar sudah 'terisi'. Harap lakukan Reset/Checkout pada penghuni sebelumnya.");
    }
  }

  const hargaBulanan = kamar.harga;

  const durasiBulan = dataSewa["durasi-bulan"];
  const tanggalMulai = new Date(dataSewa["tanggal-mulai"]);
  const tanggalBerakhir = new Date(tanggalMulai);
  tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + durasiBulan);

  let penyewa = await Pengguna.findOne({ email: dataPengguna.email });

  if (penyewa && penyewa["id-kamar"] && penyewa["id-kamar"] !== idKamar) {
    throw new Error(
      `Gagal! Akun dengan email ini masih aktif menyewa kamar ${penyewa["id-kamar"]}. Harap checkout terlebih dahulu.`,
    );
  }

  const cekTelepon = await Pengguna.findOne({
    "nomor-telepon": dataPengguna["nomor-telepon"],
  });
  if (
    cekTelepon &&
    (!penyewa || cekTelepon._id.toString() !== penyewa._id.toString())
  ) {
    throw new Error("Nomor telepon penyewa sudah digunakan oleh akun lain!");
  }

  if (!penyewa) {
    const customId = await generateIdPengguna(tanggalMulai);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("rahasia123", salt);

    penyewa = new Pengguna({
      _id: customId,
      "nama-lengkap": dataPengguna["nama-lengkap"],
      email: dataPengguna.email,
      "nomor-telepon": dataPengguna["nomor-telepon"],
      "nama-kontak-darurat": dataPengguna["nama-kontak-darurat"],
      "nomor-kontak-darurat": dataPengguna["nomor-kontak-darurat"],
      "kata-sandi": hashedPassword,
      peran: "penyewa",
      "id-kamar": idKamar,
      "tanggal-mulai": tanggalMulai,
      "tanggal-berakhir": tanggalBerakhir,
    });
  } else {
    penyewa.peran = "penyewa";
    penyewa["id-kamar"] = idKamar;
    penyewa["tanggal-mulai"] = tanggalMulai;
    penyewa["tanggal-berakhir"] = tanggalBerakhir;
    if (dataPengguna["nama-kontak-darurat"])
      penyewa["nama-kontak-darurat"] = dataPengguna["nama-kontak-darurat"];
    if (dataPengguna["nomor-kontak-darurat"])
      penyewa["nomor-kontak-darurat"] = dataPengguna["nomor-kontak-darurat"];
  }
  await penyewa.save();

  const pemesananBaru = new Pemesanan({
    "id-pengguna": penyewa._id,
    "id-kamar": idKamar,
    "durasi-bulan": durasiBulan,
    status: "disetujui",
    "tanggal-mulai": tanggalMulai,
    "batas-waktu-bayar": new Date(),
  });
  await pemesananBaru.save();

  const totalHarga = hargaBulanan * durasiBulan;
  const nomorInvoice = `INV-${Date.now()}`;
  const namaBulan = tanggalMulai.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const tagihanBaru = new Tagihan({
    "id-pengguna": penyewa._id,
    "id-kamar": idKamar,
    "nomor-tagihan": nomorInvoice,
    "bulan-tagihan": namaBulan,
    "jumlah-tagihan": totalHarga,
    "tanggal-jatuh-tempo": new Date(),
    status: "lunas",
  });
  await tagihanBaru.save();

  const pembayaranBaru = new Pembayaran({
    "id-tagihan": tagihanBaru._id,
    "jumlah-bayar": totalHarga,
    "metode-pembayaran": dataSewa["metode-pembayaran"] || "tunai",
    status: "terverifikasi",
    "tanggal-bayar": new Date(),
  });
  await pembayaranBaru.save();

  kamar.status = "terisi";
  await kamar.save();

  const penyewaResponse = penyewa.toObject();
  delete penyewaResponse["kata-sandi"];
  const kamarResponse = {
    "_id": kamar._id,
    "nama-tampilan": `Kamar ${penyewa['nama-lengkap']}`, 
    "nama-asli": `kamar ${kamar['nama-kamar']}`,
    "tipe-kamar": kamar['tipe-kamar'],
    "lantai": kamar.lantai,
    "harga": kamar.harga
  };

  return {
    penyewa: penyewaResponse,
    kamar: kamarResponse,
    nomorInvoice,
    totalHarga,
  };
};

export const entryDataLama = async (idKamar, dataPayload) => {
  const { dataPengguna, dataSewa } = dataPayload;

  const kamar = await Kamar.findById(idKamar);
  if (!kamar) throw new Error("Kamar tidak ditemukan");
  if (kamar.status !== "kosong")
    throw new Error("Kamar tidak kosong! Harap reset kamar terlebih dahulu.");

  const hargaBulanan = kamar.harga;
  const tanggalMasukAsli = new Date(dataSewa["tanggal-mulai"]);

  const tanggalSiklusSekarang = dataSewa["tanggal-siklus-sekarang"]
    ? new Date(dataSewa["tanggal-siklus-sekarang"])
    : new Date();

  const durasiBulan = parseInt(dataSewa["durasi-bulan"], 10);

  const tanggalBerakhir = new Date(tanggalSiklusSekarang);
  tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + durasiBulan);

  let penyewa = await Pengguna.findOne({ email: dataPengguna.email });

  if (penyewa && penyewa["id-kamar"] && penyewa["id-kamar"] !== idKamar) {
    throw new Error(
      `Gagal! Akun ini masih terikat di kamar ${penyewa["id-kamar"]}.`,
    );
  }
  const cekTelepon = await Pengguna.findOne({
    "nomor-telepon": dataPengguna["nomor-telepon"],
  });
  if (
    cekTelepon &&
    (!penyewa || cekTelepon._id.toString() !== penyewa._id.toString())
  ) {
    throw new Error("Nomor telepon penyewa sudah digunakan oleh akun lain!");
  }

  if (!penyewa) {
    const customId = await generateIdPengguna(tanggalMasukAsli);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("rahasia123", salt);

    penyewa = new Pengguna({
      _id: customId,
      "nama-lengkap": dataPengguna["nama-lengkap"],
      email: dataPengguna.email,
      "nomor-telepon": dataPengguna["nomor-telepon"],
      "nama-kontak-darurat": dataPengguna["nama-kontak-darurat"],
      "nomor-kontak-darurat": dataPengguna["nomor-kontak-darurat"],
      "kata-sandi": hashedPassword,
      peran: "penyewa",
      "id-kamar": idKamar,
      "tanggal-mulai": tanggalMasukAsli,
      "tanggal-berakhir": tanggalBerakhir, 
    });
  } else {
    penyewa.peran = "penyewa";
    penyewa["id-kamar"] = idKamar;
    penyewa["tanggal-mulai"] = tanggalMasukAsli;
    penyewa["tanggal-berakhir"] = tanggalBerakhir;
  }
  await penyewa.save();

  // ==========================================
  // opsi 1
  // ==========================================
  const totalHarga = hargaBulanan * durasiBulan;
  const nomorInvoice = `INV-MIGRASI-${Date.now()}`;
  const namaBulan = tanggalSiklusSekarang.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const tagihanBaru = new Tagihan({
    "id-pengguna": penyewa._id,
    "id-kamar": idKamar,
    "nomor-tagihan": nomorInvoice,
    "bulan-tagihan": namaBulan,
    "jumlah-tagihan": totalHarga,
    "tanggal-jatuh-tempo": tanggalSiklusSekarang,
    status: "lunas",
  });
  await tagihanBaru.save();

  const pembayaranBaru = new Pembayaran({
    "id-tagihan": tagihanBaru._id,
    "jumlah-bayar": totalHarga,
    "metode-pembayaran": dataSewa["metode-pembayaran"] || "tunai",
    status: "terverifikasi",
    "tanggal-bayar": tanggalSiklusSekarang,
  });
  await pembayaranBaru.save();

  kamar.status = "terisi";
  await kamar.save();

  // ==========================================
  // [CADANGAN] OPSI 3: AUTO-LOOPING INVOICE (Riwayat Penuh 2024-2026)
  // pas Stakeholder minta saat UAT, matikan kode Opsi 1 di atas, lalu nyalakan komentar ini:
  // ==========================================
  /*
  let totalBulanKeTercatat = (tanggalBerakhir.getFullYear() - tanggalMasukAsli.getFullYear()) * 12;
  totalBulanKeTercatat -= tanggalMasukAsli.getMonth();
  totalBulanKeTercatat += tanggalBerakhir.getMonth();

  for (let i = 0; i < totalBulanKeTercatat; i++) {
    let tglLoop = new Date(tanggalMasukAsli);
    tglLoop.setMonth(tglLoop.getMonth() + i);

    const invNum = `INV-HISTORIS-${Date.now()}-${i}`;
    const blnStr = tglLoop.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const tagihanHist = new Tagihan({
      'id-pengguna': penyewa._id, 'id-kamar': idKamar,
      'nomor-tagihan': invNum, 'bulan-tagihan': blnStr,
      'jumlah-tagihan': hargaBulanan, 'tanggal-jatuh-tempo': tglLoop, 'status': 'lunas'
    });
    await tagihanHist.save();

    const bayarHist = new Pembayaran({
      'id-tagihan': tagihanHist._id, 'jumlah-bayar': hargaBulanan,
      'metode-pembayaran': 'tunai', 'status': 'terverifikasi', 'tanggal-bayar': tglLoop
    });
    await bayarHist.save();
  }
  */

  const penyewaResponse = penyewa.toObject();
  delete penyewaResponse["kata-sandi"];

  const kamarResponse = {
    _id: kamar._id,
    "nama-tampilan": `Kamar ${penyewa["nama-lengkap"]}`,
    "nama-asli": `kamar ${kamar['nama-kamar']}`,
    "tipe-kamar": kamar["tipe-kamar"],
    lantai: kamar.lantai,
    harga: kamar.harga,
  };

  return {
    penyewa: penyewaResponse,
    kamar: kamarResponse,
    nomorInvoice,
    totalHarga,
  };
};