import * as dashboardService from "../../services/admin-services/admin-dashboard-service.js";

export const getDashboardAdmin = async (req, res) => {
  const dataDashboard = await dashboardService.ambilDataDashboard(req.query);

  res.status(200).json({
    status: "sukses",
    pesan: req.query.filter
      ? `Berhasil memuat daftar ${req.query.filter}.`
      : "Berhasil memuat ringkasan utama dashboard.",
    data: dataDashboard,
  });
};
