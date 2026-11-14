import Tagihan from "../../models/tagihan-model.js";
import Kamar from "../../models/kamar-model.js";
import Pengguna from "../../models/pengguna-model.js";
import { kirimEmail } from "../../utils/mail-service.js";
import { templateNotifikasiPembayaranBaru } from "../../utils/email-templates.js";
import { AppError } from "../../errors.js";
import RekeningKost from "../../models/rekening-model.js";

const hitungBulanBerikutnya = (stringBulanTahun, tambahBulan) => {
  const namaBulanIndo = [
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
  const parts = stringBulanTahun.split(" ");
  const idxBulan = namaBulanIndo.indexOf(parts[0]);
  const tahun = parseInt(parts[1]);

  const tanggalBaru = new Date(tahun, idxBulan + tambahBulan, 1);
  return `${namaBulanIndo[tanggalBaru.getMonth()]} ${tanggalBaru.getFullYear()}`;
};

export const bayarTagihan = async (idPengguna, payload) => {
  const { idTagihanDasar, jumlahBulan = 1, buktiPembayaran, idRekening } = payload;
  if (!idRekening) {
    throw new AppError(
      "BAD_REQUEST",
      "ID Rekening tujuan pembayaran wajib dipilih.",
    );
  }
  const rekeningValid = await RekeningKost.findById(idRekening);
  if (!rekeningValid) {
    throw new AppError(
      "NOT_FOUND",
      "Metode pembayaran (rekening) yang Anda pilih tidak ditemukan di sistem.",
    );
  }
  if (rekeningValid.status !== "aktif") {
    throw new AppError(
      "CONFLICT",
      "Metode pembayaran ini sedang tidak aktif. Silakan pilih metode lain.",
    );
  }

  const tagihanDasar = await Tagihan.findOne({
    _id: idTagihanDasar,
    "id-pengguna": idPengguna,
  });
  if (!tagihanDasar) {
    throw new AppError(
      "NOT_FOUND",
      "Data tagihan tidak ditemukan atau bukan milik Anda.",
    );
  }

  if (
    tagihanDasar.status !== "belum-bayar" &&
    tagihanDasar.status !== "terlambat"
  ) {
    throw new AppError(
      "BAD_REQUEST",
      `Pembayaran ditolak. Tagihan ini saat ini berstatus: ${tagihanDasar.status}.`,
    );
  }

  const kamar = await Kamar.findById(tagihanDasar["id-kamar"]);
  if (!kamar) {
    throw new AppError(
      "NOT_FOUND",
      "Data kamar Anda tidak ditemukan di sistem.",
    );
  }

  tagihanDasar.status = "menunggu-validasi";
  tagihanDasar["bukti-pembayaran"] = buktiPembayaran;
  tagihanDasar["rekening-tujuan"] = idRekening;
  tagihanDasar["metode-pembayaran"] = rekeningValid["nama-bank"];
  tagihanDasar["catatan-admin"] = null;
  await tagihanDasar.save();

  const daftarTagihanDiproses = [tagihanDasar];
  const penyewa = await Pengguna.findById(idPengguna);

  if (jumlahBulan > 1) {
    for (let i = 1; i < jumlahBulan; i++) {
      const bulanTargetStr = hitungBulanBerikutnya(
        tagihanDasar["bulan-tagihan"],
        i,
      );

      const parts = bulanTargetStr.split(" ");
      const namaBulanIndo = [
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
      const targetBulanIdx = namaBulanIndo.indexOf(parts[0]);
      const targetTahun = parseInt(parts[1]);

      const tglJatuhTempo = new Date(targetTahun, targetBulanIdx, 5);
      const nomorBaru = `TGH-${targetTahun}${String(targetBulanIdx + 1).padStart(2, "0")}${String(tglJatuhTempo.getDate()).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;

      const tagihanBaru = new Tagihan({
        "id-pengguna": idPengguna,
        "nama-penyewa": penyewa["nama-lengkap"],
        "id-kamar": kamar._id,
        "nomor-tagihan": nomorBaru,
        "bulan-tagihan": bulanTargetStr,
        "jumlah-tagihan": kamar.harga,
        "tanggal-jatuh-tempo": tglJatuhTempo,
        "bukti-pembayaran": buktiPembayaran,
        "rekening-tujuan": idRekening,
        status: "menunggu-validasi",
        "pembayaran-multi": true,
        "metode-pembayaran": rekeningValid["nama-bank"],
      });

      await tagihanBaru.save();
      daftarTagihanDiproses.push(tagihanBaru);
    }
  }
  
  const emailAdmin = process.env.ADMIN_EMAIL || "admin@kostrumahku.com";
  const linkDashboardAdmin = "https://admin.kostrumahku.com/tagihan"; 

  const totalBayar = kamar.harga * jumlahBulan;

  kirimEmail({
    to: emailAdmin,
    subject: `[Pembayaran Masuk] Rp ${totalBayar.toLocaleString("id-ID")} dari Kamar ${kamar["nama-kamar"]}`,
    html: templateNotifikasiPembayaranBaru(
      penyewa["nama-lengkap"],
      kamar["nama-kamar"],
      linkDashboardAdmin,
    ),
  }).catch((err) =>
    console.error(
      `[MAIL ERROR] Gagal kirim notif bayar tagihan ke Admin:`,
      err.message,
    ),
  );

  return daftarTagihanDiproses;
};