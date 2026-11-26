import KasKost from "../../models/kas-model.js";
import { AppError } from "../../errors.js";

const NAMA_BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getTanggalSekarangWIB = () => {
  const wibMs = Date.now() + 7 * 60 * 60 * 1000;
  const d = new Date(wibMs);
  return {
    tahun: d.getUTCFullYear(),
    bulan: d.getUTCMonth() + 1, // 1 - 12
    hari: d.getUTCDate(), // 1 - 31
    hariDalamMinggu: d.getUTCDay(), // 0 (Minggu) - 6 (Sabtu)
  };
};

// Buat objek Date presisi awal/akhir hari di WIB (+07:00)
const buatBatasTanggalWIB = (tahun, bulan, hari, akhirHari = false) => {
  const mm = String(bulan).padStart(2, "0");
  const dd = String(hari).padStart(2, "0");
  const jam = akhirHari ? "23:59:59.999" : "00:00:00.000";
  return new Date(`${tahun}-${mm}-${dd}T${jam}+07:00`);
};

const getHariTerakhirBulan = (tahun, bulan) => {
  return new Date(Date.UTC(tahun, bulan, 0)).getUTCDate();
};

const bangunFilterKas = (query = {}) => {
  const filter = {};
  const infoFilter = {};
  let butuhRekapBulanan = false;

  if (query.tipe) {
    const tipeNorm = String(query.tipe).toLowerCase().trim();
    if (!["pemasukan", "pengeluaran"].includes(tipeNorm)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Parameter 'tipe' hanya boleh bernilai 'pemasukan' atau 'pengeluaran'.",
      );
    }
    filter["tipe-transaksi"] = tipeNorm;
    infoFilter.tipe = tipeNorm;
  }

  if (query.kategori) {
    filter.kategori = String(query.kategori).trim();
    infoFilter.kategori = filter.kategori;
  }

  if (query.cari) {
    const kataKunci = String(query.cari).trim();
    if (kataKunci) {
      filter.keterangan = { $regex: kataKunci, $options: "i" };
      infoFilter.cari = kataKunci;
    }
  }

  if (query["nominal-min"] !== undefined || query["nominal-max"] !== undefined) {
    filter.nominal = {};
    if (query["nominal-min"] !== undefined) {
      const min = Number(query["nominal-min"]);
      if (isNaN(min) || min < 0) {
        throw new AppError("VALIDATION_ERROR", "Parameter 'nominal-min' tidak valid.");
      }
      filter.nominal.$gte = min;
      infoFilter["nominal-min"] = min;
    }
    if (query["nominal-max"] !== undefined) {
      const max = Number(query["nominal-max"]);
      if (isNaN(max) || max < 0) {
        throw new AppError("VALIDATION_ERROR", "Parameter 'nominal-max' tidak valid.");
      }
      filter.nominal.$lte = max;
      infoFilter["nominal-max"] = max;
    }
  }

  const sekarang = getTanggalSekarangWIB();
  const regexTanggal = /^\d{4}-\d{2}-\d{2}$/;
  let startDate = null;
  let endDate = null;

  if (query["tanggal-mulai"] || query["tanggal-akhir"]) {
    if (query["tanggal-mulai"]) {
      if (!regexTanggal.test(query["tanggal-mulai"])) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Format 'tanggal-mulai' wajib YYYY-MM-DD (contoh: '2026-11-01').",
        );
      }
      const [y, m, d] = query["tanggal-mulai"].split("-").map(Number);
      startDate = buatBatasTanggalWIB(y, m, d, false);
    }

    if (query["tanggal-akhir"]) {
      if (!regexTanggal.test(query["tanggal-akhir"])) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Format 'tanggal-akhir' wajib YYYY-MM-DD (contoh: '2026-11-26').",
        );
      }
      const [y, m, d] = query["tanggal-akhir"].split("-").map(Number);
      endDate = buatBatasTanggalWIB(y, m, d, true);
    }

    if (startDate && endDate && startDate > endDate) {
      throw new AppError(
        "VALIDATION_ERROR",
        "'tanggal-mulai' tidak boleh lebih besar dari 'tanggal-akhir'.",
      );
    }

    infoFilter.mode = "rentang-tanggal";
    if (startDate && endDate) {
      butuhRekapBulanan =
        startDate.getUTCFullYear() !== endDate.getUTCFullYear() ||
        startDate.getUTCMonth() !== endDate.getUTCMonth();
    }
  } else if (query.bulan !== undefined || query.tahun !== undefined) {
    const tahunTarget =
      query.tahun !== undefined ? Number(query.tahun) : sekarang.tahun;

    if (!Number.isInteger(tahunTarget) || tahunTarget < 2000 || tahunTarget > 2100) {
      throw new AppError("VALIDATION_ERROR", "Parameter 'tahun' tidak valid.");
    }

    if (query.bulan !== undefined) {
      const bulanTarget = Number(query.bulan);
      if (!Number.isInteger(bulanTarget) || bulanTarget < 1 || bulanTarget > 12) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Parameter 'bulan' wajib berupa angka 1 sampai 12.",
        );
      }

      const hariAkhir = getHariTerakhirBulan(tahunTarget, bulanTarget);
      startDate = buatBatasTanggalWIB(tahunTarget, bulanTarget, 1, false);
      endDate = buatBatasTanggalWIB(tahunTarget, bulanTarget, hariAkhir, true);
      infoFilter.mode = "bulan-spesifik";
      infoFilter.keterangan = `${NAMA_BULAN_ID[bulanTarget - 1]} ${tahunTarget}`;
    } else {
      startDate = buatBatasTanggalWIB(tahunTarget, 1, 1, false);
      endDate = buatBatasTanggalWIB(tahunTarget, 12, 31, true);
      infoFilter.mode = "tahun-spesifik";
      infoFilter.keterangan = `Tahun ${tahunTarget}`;
      butuhRekapBulanan = true;
    }
  } else if (query["rentang-bulan"] !== undefined) {
    const jumlahBulan = Number(query["rentang-bulan"]);
    if (!Number.isInteger(jumlahBulan) || jumlahBulan < 1 || jumlahBulan > 12) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Parameter 'rentang-bulan' wajib berupa angka bulat antara 1 sampai 12.",
      );
    }

    // hitung mundur berbasis bulan kalendr penuh termasuk bulan berjalan
    let tahunAwal = sekarang.tahun;
    let bulanAwal = sekarang.bulan - (jumlahBulan - 1);
    while (bulanAwal <= 0) {
      bulanAwal += 12;
      tahunAwal -= 1;
    }

    const hariAkhir = getHariTerakhirBulan(sekarang.tahun, sekarang.bulan);
    startDate = buatBatasTanggalWIB(tahunAwal, bulanAwal, 1, false);
    endDate = buatBatasTanggalWIB(sekarang.tahun, sekarang.bulan, hariAkhir, true);

    infoFilter.mode = "rentang-bulan";
    infoFilter.keterangan = `${jumlahBulan} bulan terakhir (${NAMA_BULAN_ID[bulanAwal - 1]} ${tahunAwal} - ${NAMA_BULAN_ID[sekarang.bulan - 1]} ${sekarang.tahun})`;
    butuhRekapBulanan = jumlahBulan >= 2;
  } else if (query.periode) {
    const periodeNorm = String(query.periode).toLowerCase().trim();
    const daftarPeriodeValid = [
      "hari-ini",
      "kemarin",
      "minggu-ini",
      "bulan-ini",
      "bulan-lalu",
      "tahun-ini",
    ];

    if (!daftarPeriodeValid.includes(periodeNorm)) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Parameter 'periode' tidak valid! Pilihan yang tersedia: ${daftarPeriodeValid.join(", ")}.`,
      );
    }

    infoFilter.mode = "preset-periode";
    infoFilter.periode = periodeNorm;

    if (periodeNorm === "hari-ini") {
      startDate = buatBatasTanggalWIB(sekarang.tahun, sekarang.bulan, sekarang.hari, false);
      endDate = buatBatasTanggalWIB(sekarang.tahun, sekarang.bulan, sekarang.hari, true);
    } else if (periodeNorm === "kemarin") {
      const kemarinUtc = new Date(
        Date.UTC(sekarang.tahun, sekarang.bulan - 1, sekarang.hari - 1),
      );
      startDate = buatBatasTanggalWIB(
        kemarinUtc.getUTCFullYear(),
        kemarinUtc.getUTCMonth() + 1,
        kemarinUtc.getUTCDate(),
        false,
      );
      endDate = buatBatasTanggalWIB(
        kemarinUtc.getUTCFullYear(),
        kemarinUtc.getUTCMonth() + 1,
        kemarinUtc.getUTCDate(),
        true,
      );
    } else if (periodeNorm === "minggu-ini") {
      const selisihKeSenin =
        sekarang.hariDalamMinggu === 0 ? 6 : sekarang.hariDalamMinggu - 1;
      const seninUtc = new Date(
        Date.UTC(sekarang.tahun, sekarang.bulan - 1, sekarang.hari - selisihKeSenin),
      );
      const mingguUtc = new Date(
        Date.UTC(
          seninUtc.getUTCFullYear(),
          seninUtc.getUTCMonth(),
          seninUtc.getUTCDate() + 6,
        ),
      );

      startDate = buatBatasTanggalWIB(
        seninUtc.getUTCFullYear(),
        seninUtc.getUTCMonth() + 1,
        seninUtc.getUTCDate(),
        false,
      );
      endDate = buatBatasTanggalWIB(
        mingguUtc.getUTCFullYear(),
        mingguUtc.getUTCMonth() + 1,
        mingguUtc.getUTCDate(),
        true,
      );
    } else if (periodeNorm === "bulan-ini") {
      const hariAkhir = getHariTerakhirBulan(sekarang.tahun, sekarang.bulan);
      startDate = buatBatasTanggalWIB(sekarang.tahun, sekarang.bulan, 1, false);
      endDate = buatBatasTanggalWIB(sekarang.tahun, sekarang.bulan, hariAkhir, true);
    } else if (periodeNorm === "bulan-lalu") {
      const bulanLalu = sekarang.bulan === 1 ? 12 : sekarang.bulan - 1;
      const tahunLalu = sekarang.bulan === 1 ? sekarang.tahun - 1 : sekarang.tahun;
      const hariAkhir = getHariTerakhirBulan(tahunLalu, bulanLalu);
      startDate = buatBatasTanggalWIB(tahunLalu, bulanLalu, 1, false);
      endDate = buatBatasTanggalWIB(tahunLalu, bulanLalu, hariAkhir, true);
    } else if (periodeNorm === "tahun-ini") {
      startDate = buatBatasTanggalWIB(sekarang.tahun, 1, 1, false);
      endDate = buatBatasTanggalWIB(sekarang.tahun, 12, 31, true);
      butuhRekapBulanan = true;
    }
  }

  if (startDate || endDate) {
    filter["tanggal-transaksi"] = {};
    if (startDate) {
      filter["tanggal-transaksi"].$gte = startDate;
      infoFilter.dari = startDate.toISOString();
    }
    if (endDate) {
      filter["tanggal-transaksi"].$lte = endDate;
      infoFilter.sampai = endDate.toISOString();
    }
  }

  return { filter, infoFilter, butuhRekapBulanan };
};

const hitungRingkasanByFilter = async (filter = {}) => {
  const pipeline = [];
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  pipeline.push({
    $group: {
      _id: "$tipe-transaksi",
      total: { $sum: "$nominal" },
      jumlah: { $sum: 1 },
    },
  });

  const agregasi = await KasKost.aggregate(pipeline);

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let jumlahTransaksi = 0;

  for (const item of agregasi) {
    if (item._id === "pemasukan") totalPemasukan = item.total;
    if (item._id === "pengeluaran") totalPengeluaran = item.total;
    jumlahTransaksi += item.jumlah;
  }

  return {
    "total-pemasukan": totalPemasukan,
    "total-pengeluaran": totalPengeluaran,
    selisih: totalPemasukan - totalPengeluaran,
    "jumlah-transaksi": jumlahTransaksi,
  };
};

const hitungRekapBulanan = async (filter = {}) => {
  const pipeline = [];
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          tahun: { $year: { date: "$tanggal-transaksi", timezone: "+07:00" } },
          bulan: { $month: { date: "$tanggal-transaksi", timezone: "+07:00" } },
          tipe: "$tipe-transaksi",
        },
        total: { $sum: "$nominal" },
        jumlah: { $sum: 1 },
      },
    },
    { $sort: { "_id.tahun": 1, "_id.bulan": 1 } },
  );

  const hasilAgregasi = await KasKost.aggregate(pipeline);
  const mapBulan = new Map();

  for (const row of hasilAgregasi) {
    const { tahun, bulan, tipe } = row._id;
    const kunci = `${tahun}-${String(bulan).padStart(2, "0")}`;

    if (!mapBulan.has(kunci)) {
      mapBulan.set(kunci, {
        periode: kunci,
        label: `${NAMA_BULAN_ID[bulan - 1]} ${tahun}`,
        pemasukan: 0,
        pengeluaran: 0,
        selisih: 0,
        "jumlah-transaksi": 0,
      });
    }

    const entry = mapBulan.get(kunci);
    if (tipe === "pemasukan") entry.pemasukan = row.total;
    if (tipe === "pengeluaran") entry.pengeluaran = row.total;
    entry.selisih = entry.pemasukan - entry.pengeluaran;
    entry["jumlah-transaksi"] += row.jumlah;
  }

  return Array.from(mapBulan.values());
};

export const ambilRingkasanKas = async (query = {}) => {
  const { filter, infoFilter, butuhRekapBulanan } = bangunFilterKas(query);
  const ringkasan = await hitungRingkasanByFilter(filter);

  const hasil = {
    "filter-aktif": Object.keys(infoFilter).length > 0 ? infoFilter : "semua-waktu",
    "total-pemasukan": ringkasan["total-pemasukan"],
    "total-pengeluaran": ringkasan["total-pengeluaran"],
    saldo: ringkasan.selisih,
    "jumlah-transaksi": ringkasan["jumlah-transaksi"],
  };

  if (butuhRekapBulanan) {
    hasil["rekap-bulanan"] = await hitungRekapBulanan(filter);
  }

  return hasil;
};

export const ambilRiwayatKas = async (query = {}) => {
  const { filter, infoFilter, butuhRekapBulanan } = bangunFilterKas(query);

  const [daftarKas, ringkasan, rekapBulanan] = await Promise.all([
    KasKost.find(filter).sort({ "tanggal-transaksi": -1 }),
    hitungRingkasanByFilter(filter),
    butuhRekapBulanan ? hitungRekapBulanan(filter) : Promise.resolve(null),
  ]);

  const hasil = {
    "filter-aktif": Object.keys(infoFilter).length > 0 ? infoFilter : "semua-waktu",
    ringkasan,
    transaksi: daftarKas,
  };

  if (rekapBulanan) {
    hasil["rekap-bulanan"] = rekapBulanan;
  }

  return hasil;
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
    const ringkasanSaatIni = await ambilRingkasanKas({});

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

  const ringkasanTerbaru = await ambilRingkasanKas({});

  return {
    transaksi: transaksiBaru,
    "sisa-kas": ringkasanTerbaru.saldo,
  };
};