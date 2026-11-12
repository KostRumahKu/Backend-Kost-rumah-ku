import * as publikKamarService from "../../services/public-service";

export const getKamarPublikData= async (req, res) => {
  const dataLandingPage = await publikKamarService.ambilDataPublicKamar(req.query);

  res.setHeader('Cache-Control', 'public, max-age=60');

  res.status(200).json({
    status: "sukses",
    pesan: Object.keys(req.query).length > 0 
      ? "Berhasil memuat data katalog kamar (Filtered)." 
      : "Berhasil memuat data katalog kamar untuk Landing Page.",
    data: dataLandingPage
  });
};