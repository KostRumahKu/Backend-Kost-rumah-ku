import Kamar from "../models/kamar-model.js";

export const ambilDataPublicKamar= async (query = {}) => {
  const matchStage = { diarsipkan: { $ne: true } };

  if (query.tipe) {
    matchStage['tipe-kamar'] = query.tipe;
  }
  
  if (query.status) {
    matchStage.status = query.status;
  }

  if (query.minHarga || query.maxHarga) {
    matchStage.harga = {};
    if (query.minHarga) matchStage.harga.$gte = Number(query.minHarga);
    if (query.maxHarga) matchStage.harga.$lte = Number(query.maxHarga);
  }

  const totalKamar = await Kamar.countDocuments(matchStage);
  const kamarKosong = await Kamar.countDocuments({ 
    ...matchStage, 
    status: 'kosong' 
  });

  const katalogKamar = await Kamar.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$tipe-kamar",
        harga: { $first: "$harga" },
        fasilitas: { $first: "$fasilitas" },
        foto: { $first: "$foto" },
        jumlahTersedia: {
          $sum: { $cond: [{ $eq: ["$status", "kosong"] }, 1, 0] }
        }
      }
    },
    { $sort: { harga: 1 } },
    {
      $project: {
        _id: 0,
        tipeKamar: "$_id",
        harga: 1,
        fasilitas: 1,
        foto: 1,
        jumlahTersedia: 1
      }
    }
  ]);

  let hargaMulaiDari = 0;
  let hargaTertinggi = 0;
  
  if (katalogKamar.length > 0) {
    hargaMulaiDari = katalogKamar[0].harga;
    hargaTertinggi = katalogKamar[katalogKamar.length - 1].harga;
  }

  return {
    ketersediaan: {
      total: totalKamar,
      kosong: kamarKosong,
      isPenuh: kamarKosong === 0 
    },
    harga: {
      termurah: hargaMulaiDari,
      termahal: hargaTertinggi
    },
    katalog: katalogKamar
  };
};