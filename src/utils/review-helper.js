import Review from "../models/review-model.js";

export const formatReviewHybrid = (dokumenReview) => {
  if (!dokumenReview) return null;

  const obj = dokumenReview.toObject ? dokumenReview.toObject() : dokumenReview;
  const penyewaPopulated =
    obj["id-penyewa"] && typeof obj["id-penyewa"] === "object"
      ? obj["id-penyewa"]
      : null;

  const idPenyewaAsli = penyewaPopulated ? penyewaPopulated._id : obj["id-penyewa"];
  const namaTerbaru = penyewaPopulated?.["nama-lengkap"] || obj["nama-penyewa"];
  const fotoTerbaru = penyewaPopulated?.["foto-profil"] || obj["foto-profil"] || null;

  let infoKamarTerbaru = obj["info-kamar"] || null;
  if (penyewaPopulated && penyewaPopulated["id-kamar"]) {
    const kamar = penyewaPopulated["id-kamar"];
    if (typeof kamar === "object" && kamar["nama-kamar"]) {
      const tipeKapital = kamar["tipe-kamar"]
        ? kamar["tipe-kamar"].charAt(0).toUpperCase() + kamar["tipe-kamar"].slice(1)
        : "";
      infoKamarTerbaru = tipeKapital
        ? `Kamar ${kamar["nama-kamar"]} (${tipeKapital})`
        : `Kamar ${kamar["nama-kamar"]}`;
    }
  }

  return {
    _id: obj._id,
    "id-penyewa": idPenyewaAsli,
    "nama-penyewa": namaTerbaru,
    "foto-profil": fotoTerbaru,
    "info-kamar": infoKamarTerbaru,
    bintang: obj.bintang,
    deskripsi: obj.deskripsi,
    terisi: obj.terisi,
    "dibuat-pada": obj["dibuat-pada"],
    "diperbarui-pada": obj["diperbarui-pada"],
  };
};

export const hitungRingkasanRating = async (filterTambahan = { terisi: true }) => {
  const hasilAgregasi = await Review.aggregate([
    { $match: filterTambahan },
    {
      $group: {
        _id: "$bintang",
        jumlah: { $sum: 1 },
      },
    },
  ]);

  const sebaran = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalUlasan = 0;
  let totalSkor = 0;

  for (const item of hasilAgregasi) {
    const skor = item._id;
    if (sebaran[skor] !== undefined) {
      sebaran[skor] = item.jumlah;
      totalUlasan += item.jumlah;
      totalSkor += skor * item.jumlah;
    }
  }

  const rataRata =
    totalUlasan > 0 ? Number((totalSkor / totalUlasan).toFixed(1)) : 0;

  return {
    "rata-rata-rating": rataRata,
    "total-ulasan": totalUlasan,
    "bintang": sebaran,
  };
};