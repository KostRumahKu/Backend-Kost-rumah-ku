import Tagihan from "../../models/tagihan-model.js";
import mongoose from "mongoose";
import { AppError } from "../../errors.js";
import { kirimEmail } from "../../utils/mail-service.js";
import { templateHasilValidasiTagihan } from "../../utils/email-templates.js";
import KasKost from "../../models/kas-model.js";
import Kamar from "../../models/kamar-model.js";
import Pengguna from "../../models/pengguna-model.js";

export const ambilSemuaTagihan = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { "nomor-tagihan": { $regex: query.search, $options: "i" } },
      { "bulan-tagihan": { $regex: query.search, $options: "i" } },
    ];
  }

  const daftarTagihan = await Tagihan.find(filter)
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 }); 

  return daftarTagihan;
};

// export const ambilDetailTagihan = async (id) => {
//   const tagihan = await Tagihan.findById(id)
//     .populate("id-pengguna", "nama-lengkap email nomor-telepon")
//     .populate("id-kamar", "nama-kamar tipe-kamar lantai");

//   if (!tagihan) {
//     throw new AppError("NOT_FOUND", "Data tagihan tidak ditemukan.");
//   }
//   return tagihan;
// };

export const cariTagihanMulti = async (payload) => {
  const { "id-atau-invoice": idAtauInvoice } = payload;

  const queryOr = [];

  if (mongoose.Types.ObjectId.isValid(idAtauInvoice.trim())) {
    queryOr.push({ _id: idAtauInvoice.trim() });
  }
  queryOr.push({ "nomor-tagihan": { $regex: idAtauInvoice.trim(), $options: "i" } });
  const hasilPencarian = await Tagihan.find({ $or: queryOr })
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai")
    .sort({ "dibuat-pada": -1 });

  return hasilPencarian;
};

export const validasiPembayaran = async (payload) => {
  const { idTagihan, statusValidasi, catatanAdmin } = payload;

  const tagihan = await Tagihan.findById(idTagihan).populate("id-pengguna", "nama-lengkap email");
  
  if (!tagihan) {
    throw new AppError("NOT_FOUND", "Data tagihan tidak ditemukan.");
  }

  if (tagihan.status !== "menunggu-validasi") {
    throw new AppError("BAD_REQUEST", `Tagihan ini berstatus '${tagihan.status}', bukan 'menunggu-validasi'.`);
  }

  if (statusValidasi === "disetujui") {
    const urlBukti = tagihan["bukti-pembayaran"];
    const idPenyewa = tagihan["id-pengguna"]._id;

    const tagihanAkanDilunasi = await Tagihan.find({
      "id-pengguna": idPenyewa,
      "bukti-pembayaran": urlBukti,
      status: "menunggu-validasi"
    });

    if (tagihanAkanDilunasi.length === 0) {
      throw new AppError("BAD_REQUEST", "Tidak ditemukan tagihan yang menunggu validasi.");
    }

    let totalPemasukan = 0;
    const daftarBulan = [];
    const idsTagihanTarget = [];

    for (const t of tagihanAkanDilunasi) {
      totalPemasukan += t["jumlah-tagihan"];
      daftarBulan.push(t["bulan-tagihan"]);
      idsTagihanTarget.push(t._id);
    }

    await Tagihan.updateMany(
      { _id: { $in: idsTagihanTarget } },
      { 
        $set: { 
          status: "lunas", 
          "catatan-admin": catatanAdmin || "Pembayaran tervalidasi." 
        } 
      }
    );

    if (totalPemasukan > 0) {
      await new KasKost({
        "tipe-transaksi": "pemasukan",
        kategori: "pembayaran-sewa",
        nominal: totalPemasukan,
        keterangan: `Pembayaran sewa kamar dari ${tagihan["id-pengguna"]["nama-lengkap"]} untuk periode: ${daftarBulan.join(", ")}`,
        "id-referensi": tagihan._id
      }).save();
    }

    const penyewa = tagihan["id-pengguna"];
    kirimEmail({
      to: penyewa.email,
      subject: `[LUNAS] Pembayaran Tagihan Kost Disetujui`,
      html: templateHasilValidasiTagihan(penyewa["nama-lengkap"], daftarBulan.join(", "), "disetujui", catatanAdmin)
    }).catch(err => console.error(`[MAIL ERROR] Gagal kirim email ACC ke penyewa:`, err.message));

    return { pesan: `Pembayaran disetujui untuk ${idsTagihanTarget.length} tagihan (Rp ${totalPemasukan.toLocaleString("id-ID")}).` };
  } 
  
  else if (statusValidasi === "ditolak") {
    if (!catatanAdmin) {
      throw new AppError("BAD_REQUEST", "Catatan wajib diisi jika menolak pembayaran (misal: 'Struk palsu' atau 'Transfer kurang').");
    }

    const urlBukti = tagihan["bukti-pembayaran"];
    
    const tagihanTerkait = await Tagihan.find({ "bukti-pembayaran": urlBukti, status: "menunggu-validasi" });

    let countDikembalikan = 0;
    let countDihapus = 0;

    for (const t of tagihanTerkait) {
      if (t["pembayaran-multi"] === true) {
        await Tagihan.findByIdAndDelete(t._id);
        countDihapus++;
      } else {
        t.status = "belum-bayar";
        t["bukti-pembayaran"] = null; 
        t["catatan-admin"] = catatanAdmin;
        await t.save();
        countDikembalikan++;
      }
    }
    const penyewa = tagihan["id-pengguna"];
    kirimEmail({
      to: penyewa.email,
      subject: `[DITOLAK] Pembayaran Tagihan Kost Gagal`,
      html: templateHasilValidasiTagihan(penyewa["nama-lengkap"], tagihan["bulan-tagihan"], "ditolak", catatanAdmin)
    }).catch(err => console.error(`[MAIL ERROR] Gagal kirim email REJECT ke penyewa:`, err.message));
    return { 
      pesan: `Pembayaran ditolak. ${countDikembalikan} tagihan dikembalikan, ${countDihapus} tagihan masa depan dihapus otomatis.` 
    };
  }

  throw new AppError("BAD_REQUEST", "Status validasi tidak dikenali. Gunakan 'disetujui' atau 'ditolak'.");
};


// untested
export const bayarTunggakanManual = async (payload) => {
  const { idTagihanDasar, jumlahBulan = 1, idRekening, catatanAdmin } = payload;

  if (!idRekening) throw new AppError("BAD_REQUEST", "ID Rekening tujuan pembayaran wajib dipilih.");

  const tagihanDasar = await Tagihan.findById(idTagihanDasar).populate("id-pengguna", "nama-lengkap email");
  if (!tagihanDasar) throw new AppError("NOT_FOUND", "Data tagihan dasar tidak ditemukan.");
  
  if (tagihanDasar.status !== "terlambat" && tagihanDasar.status !== "belum-bayar") {
    throw new AppError("BAD_REQUEST", `Hanya tagihan berstatus 'terlambat' atau 'belum-bayar' yang bisa dilunasi manual. Status saat ini: ${tagihanDasar.status}`);
  }

  const kamar = await Kamar.findById(tagihanDasar["id-kamar"]);
  const penyewa = await Pengguna.findById(tagihanDasar["id-pengguna"]._id);
  
  tagihanDasar.status = "lunas";
  tagihanDasar["rekening-tujuan"] = idRekening;
  tagihanDasar["bukti-pembayaran"] = "PEMBAYARAN-MANUAL-ADMIN";
  tagihanDasar["catatan-admin"] = catatanAdmin || "Tunggakan dilunasi secara manual oleh Admin/Owner.";
  await tagihanDasar.save();

  let totalPemasukan = tagihanDasar["jumlah-tagihan"];
  const daftarBulanLunas = [tagihanDasar["bulan-tagihan"]];

  if (jumlahBulan > 1) {
    for (let i = 1; i < jumlahBulan; i++) {
      const bulanTargetStr = hitungBulanBerikutnya(tagihanDasar["bulan-tagihan"], i);
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
        "id-pengguna": penyewa._id,
        "nama-penyewa": penyewa["nama-lengkap"],
        "id-kamar": kamar._id,
        "nomor-tagihan": nomorBaru,
        "bulan-tagihan": bulanTargetStr,
        "jumlah-tagihan": kamar.harga,
        "tanggal-jatuh-tempo": tglJatuhTempo,
        "bukti-pembayaran": "PEMBAYARAN-MANUAL-ADMIN",
        "rekening-tujuan": idRekening,
        status: "lunas", 
        "catatan-admin": catatanAdmin || "Pembayaran multi-bulan manual via Admin."
      });

      await tagihanBaru.save();
      totalPemasukan += kamar.harga;
      daftarBulanLunas.push(bulanTargetStr);
    }
  }

  await new KasKost({
    "tipe-transaksi": "pemasukan",
    kategori: "pembayaran-sewa",
    nominal: totalPemasukan,
    keterangan: `Pelunasan manual tunggakan dari ${penyewa["nama-lengkap"]} untuk periode: ${daftarBulanLunas.join(", ")}`,
    "id-referensi": tagihanDasar._id
  }).save();

  if (penyewa["status-akun"] === "ditangguhkan") {
    penyewa["status-akun"] = "aktif";
    await penyewa.save();
  }

  kirimEmail({
    to: penyewa.email,
    subject: `[LUNAS] Tunggakan Tagihan Kost Diselesaikan`,
    html: templateHasilValidasiTagihan(penyewa["nama-lengkap"], tagihanDasar["bulan-tagihan"], "disetujui", "Tunggakan Anda telah diselesaikan secara manual oleh Owner. Akun Anda kembali aktif.")
  }).catch(err => console.error(`[MAIL ERROR] Gagal kirim email pelunasan tunggakan:`, err.message));

  return { 
    pesan: `Tunggakan untuk ${jumlahBulan} bulan berhasil dilunasi. Akun penyewa kembali aktif dan uang Rp ${totalPemasukan} tercatat di buku kas.`
  };
};