import KasKost from "../../models/kas-model.js";
import { AppError } from "../../errors.js";

export const ambilRingkasanKas = async () => {
  const agregasi = await KasKost.aggregate([
    {
      $group: {
        _id: "$tipe-transaksi",
        total: { $sum: "$nominal" },
      },
    },
  ]);

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  for (const item of agregasi) {
    if (item._id === "pemasukan") totalPemasukan = item.total;
    if (item._id === "pengeluaran") totalPengeluaran = item.total;
  }

  const saldo = totalPemasukan - totalPengeluaran;

  return {
    "total-pemasukan": totalPemasukan,
    "total-pengeluaran": totalPengeluaran,
    saldo,
  };
};

export const ambilRiwayatKas = async (query = {}) => {
  const filter = {};

  if (query.tipe) {
    filter["tipe-transaksi"] = query.tipe;
  }
  if (query.kategori) {
    filter.kategori = query.kategori;
  }

  if (query["tanggal-mulai"] && query["tanggal-akhir"]) {
    const startDate = new Date(query["tanggal-mulai"]);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(query["tanggal-akhir"]);
    endDate.setHours(23, 59, 59, 999);

    filter["tanggal-transaksi"] = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const daftarKas = await KasKost.find(filter).sort({
    "tanggal-transaksi": -1,
  });
  return daftarKas;
};

export const catatKasManual = async (payload) => {
  const {
    "tipe-transaksi": tipeTransaksi,
    kategori,
    nominal,
    keterangan,
  } = payload;

  const nominalAngka = Number(nominal);

  if (tipeTransaksi === "pengeluaran") {
    const ringkasanSaatIni = await ambilRingkasanKas();

    if (ringkasanSaatIni.saldo < nominalAngka) {
      throw new AppError(
        "BAD_REQUEST",
        `Transaksi ditolak! Saldo kas tidak mencukupi. Sisa saldo: Rp ${ringkasanSaatIni.saldo.toLocaleString("id-ID")}, sedangkan pengeluaran: Rp ${nominalAngka.toLocaleString("id-ID")}.`,
      );
    }
  }

  const transaksiBaru = new KasKost({
    "tipe-transaksi": tipeTransaksi,
    kategori,
    nominal: nominalAngka,
    keterangan,
  });

  await transaksiBaru.save();

  const ringkasanTerbaru = await ambilRingkasanKas();

  return {
    transaksi: transaksiBaru,
    "sisa-kas": ringkasanTerbaru.saldo,
  };
};