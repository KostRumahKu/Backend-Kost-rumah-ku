import Kamar from "../../models/kamar-model.js";
import Tagihan from "../../models/tagihan-model.js";

export const ambilDataDashboard = async (query = {}) => {
  const hariIni = new Date();

  if (!query.filter) {
    const totalKamar = await Kamar.countDocuments({ diarsipkan: { $ne: true } });
    const kamarKosong = await Kamar.countDocuments({ status: "kosong", diarsipkan: { $ne: true } });
    const kamarTerisi = totalKamar - kamarKosong;

    const tagihanMendatang = await Tagihan.countDocuments({
      status: "belum-bayar", 
      "tanggal-jatuh-tempo": { $gte: hariIni }
    });

    const tagihanNunggak = await Tagihan.countDocuments({
      status: "belum-bayar", 
      "tanggal-jatuh-tempo": { $lt: hariIni }
    });

    return {
      tipe: "ringkasan",
      kamar: {
        total: totalKamar,
        kosong: kamarKosong,
        terisi: kamarTerisi
      },
      tagihan: {
        mendatang: tagihanMendatang,
        nunggak: tagihanNunggak
      }
    };
  }

  let matchStage = {};

  if (query.filter === "tagihan-mendatang") {
    matchStage = {
      status: "belum-bayar",
      "tanggal-jatuh-tempo": { $gte: hariIni }
    };
  } else if (query.filter === "tagihan-nunggak") {
    matchStage = {
      status: "belum-bayar",
      "tanggal-jatuh-tempo": { $lt: hariIni }
    };
  } else if (query.filter === "kamar-kosong") {
    return await Kamar.find({ status: "kosong", diarsipkan: { $ne: true } })
      .select("nama-kamar tipe-kamar harga fasilitas")
      .lean();
  } else {
    return []; 
  }

  const detailTagihan = await Tagihan.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "penggunas", 
        localField: "id-pengguna",
        foreignField: "_id",
        as: "infoPengguna"
      }
    },
    {
      $lookup: {
        from: "kamars",
        localField: "id-kamar",
        foreignField: "_id",
        as: "infoKamar"
      }
    },
    { $unwind: { path: "$infoPengguna", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$infoKamar", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        "nomor-tagihan": 1,
        "bulan-tagihan": 1,
        "jumlah-tagihan": 1,
        "tanggal-jatuh-tempo": 1,
        status: 1,
        "nama-penyewa": "$infoPengguna.nama-lengkap",
        "nomor-telepon": "$infoPengguna.nomor-telepon",
        "nomor-kamar": "$infoKamar.nama-kamar"
      }
    },
    { $sort: { "tanggal-jatuh-tempo": query.filter === "tagihan-nunggak" ? -1 : 1 } }
  ]);

  return detailTagihan;
};