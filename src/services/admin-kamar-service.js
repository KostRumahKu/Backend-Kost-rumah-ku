import Kamar from "../models/kamar-model.js";
import Pengguna from "../models/pengguna-model.js";
import RiwayatSewa from "../models/riwayat-sewa-model.js";
import Pemesanan from "../models/pemesanan-model.js";
import Tagihan from "../models/tagihan-model.js";
import Pembayaran from "../models/pembayaran-model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { kirimEmail } from "../utils/mail-service.js";
import { templateAkunBaru, templatePindahKamar, templateCheckout } from "../utils/email-templates.js";


import { generateIdPengguna } from "./pengguna-service.js";
import { AppError } from "../errors.js";
// ============== Fungsi Service untuk Admin/Pemilik ==============
// ============= FUNGSI MMEBUAT KAMAR BARU ==============
export const tambahKamarBaru = async (dataKamar) => {
  const { lantai } = dataKamar;

  if (!lantai) {
    throw new AppError(
      "KAMAR_FLOOR_REQUIRED",
      "Lantai wajib diisi untuk menentukan nomor kamar",
    );
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
    throw new AppError(
      "KAMAR_INVALID_TYPE",
      "Tipe kamar harus 'ekonomi' atau 'eksekutif'",
    );
  }

  if (dataKamar["harga"] && dataKamar["harga"] < 0) {
    throw new AppError("KAMAR_INVALID_PRICE", "Harga kamar tidak boleh negatif");
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
  if (query.lantai !== undefined && query.lantai !== "") {
    const lantai = Number(query.lantai);

    if (!Number.isInteger(lantai) || lantai < 1) {
      throw new AppError(
        "KAMAR_INVALID_FLOOR",
        "Parameter lantai harus berupa angka bulat positif.",
      );
    }

    filter.lantai = lantai;
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
    throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");
  }

  let penghuniAktif = null;

  if (kamar.status === "terisi") {
    penghuniAktif = await Pengguna.findOne({
      "id-kamar": idKamar,
      peran: "penyewa",
    })
      .select("-kata-sandi")
      .lean();
  }

  const riwayatSewa = await RiwayatSewa.find({ "id-kamar": idKamar })
    .sort({ "tanggal-masuk": -1 })
    .lean();

  const riwayatSewaLengkap = await Promise.all(
    riwayatSewa.map(async (riwayat) => {
      const detailPengguna = await Pengguna.findById(riwayat["id-pengguna"])
        .select("-kata-sandi")
        .lean();

      return {
        ...riwayat,
        "profil-penyewa": detailPengguna || null,
      };
    }),
  );

  kamar["penghuni-aktif"] = penghuniAktif;
  kamar["riwayat-sewa"] = riwayatSewaLengkap;

  return kamar;
};

export const ubahDataKamar = async (idKamar, dataUpdate) => {
  const kamarSaatIni = await Kamar.findById(idKamar);
  if (!kamarSaatIni) {
    throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");
  }
  if (dataUpdate.status && dataUpdate.status !== kamarSaatIni.status) {
    if (kamarSaatIni.status === 'terisi') {
      throw new AppError(
        "KAMAR_STATUS_CONFLICT",
        "Gagal! Kamar sedang terisi. Silakan gunakan fitur Reset/Checkout terlebih dahulu sebelum mengubah status kamar menjadi kosong atau perbaikan.",
      );
    }

    if (dataUpdate.status === 'terisi') {
      throw new AppError(
        "KAMAR_STATUS_CONFLICT",
        "Gagal! Anda tidak bisa mengubah status menjadi 'terisi' secara manual. Harap gunakan fitur Input Penghuni / Entry Data untuk mengisi kamar.",
      );
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
  if (!kamar) throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");

  if (kamar.status === "terisi" || kamar.status === "dipesan") {
    throw new AppError(
      "KAMAR_STATUS_CONFLICT",
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
  if (!kamar) throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");

  if (kamar.status !== "terisi") {
    throw new AppError(
      "KAMAR_STATUS_CONFLICT",
      "Kamar tidak dapat direset karena statusnya belum terisi",
    );
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
    kirimEmail({
      to: penghuni.email,
      subject: "Terima Kasih! Masa Sewa Anda Telah Berakhir",
      html: templateCheckout(
        penghuni["nama-lengkap"],
        kamar["nama-kamar"] || kamar._id,
      ),
    }).catch((err) => {
      console.error("[MAIL ALERT] Gagal mengirim email checkout:", err.message);
    });
  }

  kamar.status = "kosong";
  kamar["penghuni-aktif"] = null;
  await kamar.save();

  const penyewaLama = await Pengguna.findOne({ "id-kamar": idKamar });
  if (penyewaLama) {
    penyewaLama["id-kamar"] = null;
    penyewaLama["tanggal-mulai"] = null;
    penyewaLama["tanggal-berakhir"] = null;
    await penyewaLama.save(); 
  }

  return kamar;
};

// ============ INPUT PENGHUNI ==========
export const inputPenghuniManual = async (idKamar, dataPayload) => {
  const { dataPengguna, dataSewa } = dataPayload;

  const kamar = await Kamar.findById(idKamar);
  if (!kamar) throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");
  if (kamar.status !== 'kosong') {
    if (kamar.status === 'dipesan') {
      throw new AppError("KAMAR_STATUS_CONFLICT", "Gagal! Kamar saat ini sedang 'dipesan'. Harap ubah statusnya menjadi 'kosong' terlebih dahulu melalui menu Edit Kamar jika Anda benar-benar ingin memasukkan penghuni ini.");
    } else if (kamar.status === 'perbaikan') {
      throw new AppError("KAMAR_STATUS_CONFLICT", "Gagal! Kamar sedang dalam 'perbaikan' dan tidak bisa diisi penghuni baru.");
    } else if (kamar.status === 'terisi') {
      throw new AppError("KAMAR_STATUS_CONFLICT", "Gagal! Kamar sudah 'terisi'. Harap lakukan Reset/Checkout pada penghuni sebelumnya.");
    }
  }

  const hargaBulanan = kamar.harga;
  const durasiBulan = dataSewa["durasi-bulan"];
  const tanggalMulai = new Date(dataSewa["tanggal-mulai"]);
  const tanggalBerakhir = new Date(tanggalMulai);
  tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + durasiBulan);

  let penyewa = await Pengguna.findOne({ email: dataPengguna.email });

  if (penyewa && penyewa["id-kamar"] && penyewa["id-kamar"] !== idKamar) {
    const cekKamarLama = await Kamar.findById(penyewa["id-kamar"]);
    if (cekKamarLama && cekKamarLama.status !== "kosong") {
      throw new AppError(
        "KAMAR_STATUS_CONFLICT",
        `Gagal! Akun dengan email ini masih aktif menyewa kamar ${penyewa["id-kamar"]}. Harap checkout terlebih dahulu.`,
      );
    }
    
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
  let isAkunBaru = false; 
  const passwordDefault = crypto.randomBytes(4).toString("hex");

if (!penyewa) {
    isAkunBaru = true; 
    const customId = await generateIdPengguna(tanggalMulai);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordDefault, salt);

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
    penyewa["nomor-telepon"] = dataPengguna["nomor-telepon"];
    if (dataPengguna["nama-kontak-darurat"]) penyewa["nama-kontak-darurat"] = dataPengguna["nama-kontak-darurat"];
    if (dataPengguna["nomor-kontak-darurat"]) penyewa["nomor-kontak-darurat"] = dataPengguna["nomor-kontak-darurat"];
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
  if (isAkunBaru) {
    kirimEmail({
      to: penyewa.email,
      subject: "Selamat Datang! Informasi Akun KostRumahKu",
      html: templateAkunBaru(
        penyewa['nama-lengkap'],
        penyewa.email,
        passwordDefault,
        kamar['nama-kamar'] 
      )
    }).catch(err => {
      console.error("[MAIL ALERT] Gagal mengirim email welcome:", err.message);
    });
  }

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
  
  if (!kamar) throw new AppError("KAMAR_NOT_FOUND", "Kamar tidak ditemukan");
  if (kamar.status !== "kosong")
    throw new AppError(
      "KAMAR_STATUS_CONFLICT",
      "Kamar tidak kosong! Harap reset kamar terlebih dahulu.",
    );

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
    throw new AppError(
      "KAMAR_STATUS_CONFLICT",
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
    throw new AppError(
      "KAMAR_PHONE_ALREADY_USED",
      "Nomor telepon penyewa sudah digunakan oleh akun lain!",
    );
  }

  let isAkunBaru = false;
  const passwordDefault = crypto.randomBytes(4).toString("hex");

if (!penyewa) {
    isAkunBaru = true; 
    const customId = await generateIdPengguna(tanggalMasukAsli);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordDefault, salt);

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

  if (isAkunBaru) {
    kirimEmail({
      to: penyewa.email,
      subject: "Selamat Datang! Akses Akun KostRumahKu Anda",
      html: templateAkunBaru(
        penyewa["nama-lengkap"],
        penyewa.email,
        passwordDefault,
        kamar["nama-kamar"],
      ),
    }).catch((err) => {
      console.error(
        "[MAIL ALERT] Gagal mengirim email (Migrasi):",
        err.message,
      );
    });
  }

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

export const pindahKamar = async (dataPayload) => {
  const { "id-pengguna": idPengguna, "id-kamar-baru": idKamarBaru } =
    dataPayload;

  const penyewa = await Pengguna.findById(idPengguna);

  if (!penyewa)
    throw new AppError("TENANT_NOT_FOUND", "Penyewa tidak ditemukan.");
  if (!penyewa["id-kamar"]) {
    throw new AppError(
      "TENANT_NOT_IN_ROOM",
      "Penyewa ini tidak sedang menempati kamar manapun.",
    );
  }

  const idKamarLama = penyewa["id-kamar"];
  if (Number(idKamarLama) === Number(idKamarBaru)) {
    throw new AppError(
      "TENANT_ALREADY_IN_ROOM",
      "Gagal! Penyewa sudah berada di kamar tersebut.",
    );
  }

  const kamarBaru = await Kamar.findById(idKamarBaru);
  if (!kamarBaru) {
    throw new AppError("KAMAR_NOT_FOUND", "Kamar tujuan tidak ditemukan.");
  }
  if (kamarBaru.status !== "kosong") {
    throw new AppError(
      "ROOM_NOT_AVAILABLE",
      `Kamar tujuan (${idKamarBaru}) tidak berstatus kosong!`,
    );
  }

  const kamarLama = await Kamar.findById(idKamarLama);
  const riwayatBaru = new RiwayatSewa({
    "id-pengguna": penyewa._id,
    "nama-penyewa": penyewa["nama-lengkap"],
    "id-kamar": kamarLama._id,
    "tanggal-masuk": penyewa["tanggal-mulai"],
    "tanggal-keluar": new Date(),
    keterangan: `Pindah dari kamar ${kamarLama._id} ke kamar ${kamarBaru._id}`,
  });

  const errorValidasi = riwayatBaru.validateSync();
  if (errorValidasi) {
    throw new AppError(
      "KAMAR_INVALID_HISTORY",
      `Validasi Riwayat Gagal: ${errorValidasi.message}`,
    );
  }
  penyewa["id-kamar"] = idKamarBaru;
  await penyewa.save();

  kamarBaru.status = "terisi";
  await kamarBaru.save();

  if (kamarLama) {
    kamarLama.status = "kosong";
    await kamarLama.save();
  }

  await riwayatBaru.save();

  kirimEmail({
    to: penyewa.email,
    subject: `Update Kost: Anda pindah ke Kamar ${kamarBaru["nama-kamar"] || kamarBaru._id}`,
    html: templatePindahKamar(
      penyewa["nama-lengkap"],
      kamarLama["nama-kamar"] || kamarLama._id,
      kamarBaru["nama-kamar"] || kamarBaru._id,
      kamarBaru["tipe-kamar"],
      kamarBaru.lantai,
      kamarBaru.harga,
    ),
  }).catch((err) => {
    console.error(
      "[MAIL ALERT] Gagal mengirim email pindah kamar:",
      err.message,
    );
  });
  
  const penyewaResponse = penyewa.toObject();
  delete penyewaResponse["kata-sandi"];

  return {
    penyewa: penyewaResponse,
    kamarLama: { _id: idKamarLama, status: "kosong" },
    kamarBaru: {
      _id: kamarBaru._id,
      "nama-tampilan": `Kamar ${penyewa["nama-lengkap"]}`,
      "tipe-kamar": kamarBaru["tipe-kamar"],
      harga: kamarBaru.harga,
    },
    catatan_keuangan: `Perpindahan berhasil. Tagihan bulan depan akan otomatis menyesuaikan dengan harga kamar baru.`,
  };
};