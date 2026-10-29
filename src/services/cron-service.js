import cron from "node-cron";
import Pengguna from "../models/pengguna-model.js.js";
import Kamar from "../models/kamar-model.js";
import Tagihan from "../models/tagihan-model.js";
import { kirimEmail } from "../utils/mail-service.js";
import { templateTagihanBaru } from "../utils/email-templates.js";

// ===== H-10 =====
export const generateTagihanBulanan = async () => {
  console.log("Cron job berhasil berjalan");
  
  const hariIni = new Date();
  const bulanDepan = new Date(hariIni.getFullYear(), hariIni.getMonth() + 1, 1);
  const namaBulanDepan = bulanDepan.toLocaleString("id-ID", { month: "long", year: "numeric" });

  const penyewaAktif = await Pengguna.find({
    peran: "penyewa",
    "id-kamar": { $ne: null }
  });

  for (const penyewa of penyewaAktif) {
    const tagihanAda = await Tagihan.findOne({
      "id-pengguna": penyewa._id,
      "bulan-tagihan": namaBulanDepan
    });

    if (!tagihanAda) {
      const kamar = await Kamar.findById(penyewa["id-kamar"]);
      if (!kamar) continue;

      const nomorInvoice = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // PATOKAN DEADLINE: Tanggal 2 Bulan Depan Jam 23:59
      const jatuhTempo = new Date(bulanDepan.getFullYear(), bulanDepan.getMonth(), 2, 23, 59, 59);

      const tagihanBaru = new Tagihan({
        "id-pengguna": penyewa._id,
        "id-kamar": kamar._id,
        "nomor-tagihan": nomorInvoice,
        "bulan-tagihan": namaBulanDepan,
        "jumlah-tagihan": kamar.harga,
        "tanggal-jatuh-tempo": jatuhTempo,
        status: "belum-bayar"
      });

      await tagihanBaru.save();

      // Email H-10 Tagihan Terbit
      kirimEmail({
        to: penyewa.email,
        subject: `[Tagihan Terbit] Sewa Kost Periode ${namaBulanDepan}`,
        html: templateTagihanBaru(
          penyewa["nama-lengkap"],
          nomorInvoice,
          namaBulanDepan,
          kamar.harga,
          jatuhTempo
        )
      }).catch(err => console.error(`[CRON MAIL ERROR] Gagal email ke ${penyewa.email}:`, err.message));

      console.log(`✅ [CRON] Tagihan ${namaBulanDepan} berhasil dibuat untuk ${penyewa["nama-lengkap"]}`);
    }
  }
};

// ===== reminder hari H ======
export const kirimPengingatTagihan = async (tipePengingat) => {
  console.log(`Cron job tagihan hari H: ${tipePengingat}`);
  
  const tagihanBelumLunas = await Tagihan.find({ status: "belum-bayar" });

  for (const tagihan of tagihanBelumLunas) {
    const penyewa = await Pengguna.findById(tagihan["id-pengguna"]);
    if (!penyewa) continue;

    let subjek = "";
    if (tipePengingat === "H-3") {
      subjek = `[Pengingat H-3] Tagihan Kost ${tagihan["bulan-tagihan"]} Jatuh Tempo 2 Hari Lagi`;
    } else if (tipePengingat === "H-1") {
      subjek = `[PENTING H-1] Besok Batas Akhir Pembayaran Kost ${tagihan["bulan-tagihan"]}`;
    } else if (tipePengingat === "LATE") {
      subjek = `[TERLAMBAT] Tagihan Kost ${tagihan["bulan-tagihan"]} Telah Melewati Jatuh Tempo`;
    }

    kirimEmail({
      to: penyewa.email,
      subject: subjek,
      html: templateTagihanBaru(
        penyewa["nama-lengkap"],
        tagihan["nomor-tagihan"],
        tagihan["bulan-tagihan"],
        tagihan["jumlah-tagihan"],
        tagihan["tanggal-jatuh-tempo"]
      )
    }).catch(err => console.error(`[REMINDER ERROR] Email ke ${penyewa.email} gagal:`, err.message));
  }
};

// ==== JADWAL CRON JOB (08:00 WIB) ====
export const inisialisasiCronJob = () => {
  // Tanggal 23 Jam 08:00 Pagi -> Generate Tagihan Bulan Depan (H-10)
  cron.schedule("0 8 23 * *", () => generateTagihanBulanan());

  // Tanggal 30/31 Jam 08:00 Pagi -> Pengingat H-3
  cron.schedule("0 8 30 * *", () => kirimPengingatTagihan("H-3"));

  // Tanggal 1 Jam 08:00 Pagi -> Pengingat H-1 (Besok Deadline)
  cron.schedule("0 8 1 * *", () => kirimPengingatTagihan("H-1"));

  // Tanggal 3 Jam 08:00 Pagi -> Pengingat Keterlambatan (H+1)
  cron.schedule("0 8 3 * *", () => kirimPengingatTagihan("LATE"));

  console.log("semua jadwal cron job berhasil dijalankan!");
};