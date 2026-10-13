import Kamar from "../models/kamar-model.js";
import Pengguna from "../models/pengguna-model.js";
import RiwayatSewa from "../models/riwayat-sewa-model.js";
import Pemesanan from "../models/pemesanan-model.js";
import Tagihan from "../models/tagihan-model.js";
import Pembayaran from "../models/pembayaran-model.js";
import bcrypt from "bcrypt";

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
  delete dataUpdate._id;
  delete dataUpdate.lantai;

  const kamarDiperbarui = await Kamar.findByIdAndUpdate(idKamar, dataUpdate, {
    new: true,
    runValidators: true,
  });

  if (!kamarDiperbarui) throw new Error("Kamar tidak ditemukan");
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

    penghuni["id-kamar"] = null;
    penghuni["tanggal-mulai"] = null;
    penghuni["tanggal-berakhir"] = null;
    await penghuni.save();
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
  if (kamar.status !== "kosong") throw new Error("Kamar tidak kosong! Harap reset kamar terlebih dahulu.");

  let penyewa = await Pengguna.findOne({ email: dataPengguna.email });
  
  const tanggalMulai = new Date(dataSewa['tanggal-mulai']);
  const tanggalBerakhir = new Date(tanggalMulai);
  tanggalBerakhir.setMonth(tanggalBerakhir.getMonth() + dataSewa['durasi-bulan']);

  if (!penyewa) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("rahasia123", salt);

    penyewa = new Pengguna({
      'nama-lengkap': dataPengguna['nama-lengkap'],
      'email': dataPengguna.email,
      'nomor-telepon': dataPengguna['nomor-telepon'],
      'kata-sandi': hashedPassword,
      'peran': 'penyewa',
      'id-kamar': idKamar,
      'tanggal-mulai': tanggalMulai,
      'tanggal-berakhir': tanggalBerakhir
    });
  } else {
    penyewa.peran = 'penyewa';
    penyewa['id-kamar'] = idKamar;
    penyewa['tanggal-mulai'] = tanggalMulai;
    penyewa['tanggal-berakhir'] = tanggalBerakhir;
  }
  await penyewa.save();

  const pemesananBaru = new Pemesanan({
    'id-pengguna': penyewa._id,
    'id-kamar': idKamar,
    'durasi-bulan': dataSewa['durasi-bulan'],
    'status': 'disetujui',
    'tanggal-mulai': tanggalMulai,
    'batas-waktu-bayar': new Date() 
  });
  await pemesananBaru.save();

  const totalHarga = kamar.harga * dataSewa['durasi-bulan'];
  const nomorInvoice = `INV-${Date.now()}`;
  const namaBulan = tanggalMulai.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const tagihanBaru = new Tagihan({
    'id-pengguna': penyewa._id,
    'id-kamar': idKamar,
    'nomor-tagihan': nomorInvoice,
    'bulan-tagihan': namaBulan,
    'jumlah-tagihan': totalHarga,
    'tanggal-jatuh-tempo': new Date(),
    'status': 'lunas' 
  });
  await tagihanBaru.save();

  const pembayaranBaru = new Pembayaran({
    'id-tagihan': tagihanBaru._id,
    'jumlah-bayar': totalHarga,
    'metode-pembayaran': dataSewa['metode-pembayaran'] || 'tunai', 
    'status': 'terverifikasi',
    'tanggal-bayar': new Date()
  });
  await pembayaranBaru.save();

  kamar.status = 'terisi';
  await kamar.save();

  return {
    penyewa,
    nomorInvoice,
    totalHarga
  };
};