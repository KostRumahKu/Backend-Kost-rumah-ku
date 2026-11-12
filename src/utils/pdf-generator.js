import PDFDocument from "pdfkit";
import Tagihan from "../models/tagihan-model.js"; 
import { AppError } from "../errors.js";


export const generateInvoicePdfBuffer = async (idTagihan) => {
  const tagihan = await Tagihan.findById(idTagihan)
    .populate("id-pengguna", "nama-lengkap email nomor-telepon")
    .populate("id-kamar", "nama-kamar tipe-kamar lantai");

  if (!tagihan) {
    throw new AppError("NOT_FOUND", "Data tagihan tidak ditemukan.");
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const formatRupiah = new Intl.NumberFormat("id-ID", { 
        style: "currency", currency: "IDR", maximumFractionDigits: 0
      }).format(tagihan["jumlah-tagihan"]);

      const formatTanggal = (isoDate) => {
        return new Date(isoDate).toLocaleDateString("id-ID", {
          day: "2-digit", month: "long", year: "numeric"
        });
      };

      const tglDibuat = formatTanggal(tagihan["dibuat-pada"]);
      const tglJatuhTempo = formatTanggal(tagihan["tanggal-jatuh-tempo"]);
      const tglBayar = formatTanggal(tagihan["diperbarui-pada"]); 
      
      const isLunas = tagihan.status === "lunas";

      doc.fontSize(22).font("Helvetica-Bold").text("KOST RUMAHKU", 50, 50, { align: "right" });
      doc.fontSize(10).font("Helvetica").text("Jl. Margonda Raya No. 100, Depok, Jawa Barat", { align: "right" });
      doc.text("Telepon: +62 812-3456-7890 | Email: admin@kostrumahku.com", { align: "right" });
      doc.moveDown(1.5);

      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1.5).stroke();
      doc.moveDown(2);

      doc.fontSize(16).font("Helvetica-Bold").text(isLunas ? "KUITANSI PEMBAYARAN" : "INVOICE TAGIHAN", 50, doc.y);
      doc.moveDown(1.5);
      const topGridY = doc.y;

      doc.fontSize(10).font("Helvetica-Bold").text("Informasi Tagihan:", 50, topGridY);
      doc.font("Helvetica").text("Nomor Invoice", 50, topGridY + 15).text(`: ${tagihan["nomor-tagihan"]}`, 130, topGridY + 15);
      doc.text("Tanggal Terbit", 50, topGridY + 30).text(`: ${tglDibuat}`, 130, topGridY + 30);
      doc.text("Jatuh Tempo", 50, topGridY + 45).text(`: ${tglJatuhTempo}`, 130, topGridY + 45);
      
      if (isLunas) {
        doc.text("Tanggal Lunas", 50, topGridY + 60).text(`: ${tglBayar}`, 130, topGridY + 60);
      }

      const statusY = isLunas ? topGridY + 75 : topGridY + 60;
      doc.font("Helvetica-Bold").text("Status", 50, statusY);
      doc.fillColor(isLunas ? "green" : "red").text(`: ${tagihan.status.toUpperCase()}`, 130, statusY);
      doc.fillColor("black");

      const rightColX = 300;
      const peng = tagihan["id-pengguna"];
      
      doc.font("Helvetica-Bold").text("Ditagihkan Kepada:", rightColX, topGridY);
      doc.font("Helvetica").text("ID Penyewa", rightColX, topGridY + 15).text(`: ${peng._id}`, rightColX + 75, topGridY + 15);
      doc.text("Nama", rightColX, topGridY + 30).text(`: ${peng["nama-lengkap"]}`, rightColX + 75, topGridY + 30);
      doc.text("No. HP", rightColX, topGridY + 45).text(`: ${peng["nomor-telepon"]}`, rightColX + 75, topGridY + 45);
      doc.text("Email", rightColX, topGridY + 60).text(`: ${peng.email}`, rightColX + 75, topGridY + 60);

      doc.moveDown(5);

      const tableTop = Math.max(statusY, topGridY + 60) + 40;
      doc.rect(50, tableTop, 495, 25).fillAndStroke("#f5f5f5", "#cccccc");
      doc.fillColor("black").font("Helvetica-Bold").fontSize(10);
      doc.text("Deskripsi Layanan", 60, tableTop + 7);
      doc.text("Periode Bayar", 260, tableTop + 7);
      doc.text("Lantai / Tipe", 350, tableTop + 7);
      doc.text("Total", 440, tableTop + 7, { width: 95, align: "right" });

      const rowY = tableTop + 35;
      const kmr = tagihan["id-kamar"];
      doc.font("Helvetica");
      doc.text(`Sewa Kamar ${kmr["nama-kamar"]}`, 60, rowY, { width: 190 });
      doc.text(tagihan["bulan-tagihan"], 260, rowY);
      doc.text(`Lt. ${kmr.lantai} / ${kmr["tipe-kamar"].toUpperCase()}`, 350, rowY);
      doc.text(formatRupiah, 440, rowY, { width: 95, align: "right" });

      const totalY = rowY + 30;
      doc.moveTo(50, totalY - 10).lineTo(545, totalY - 10).lineWidth(1).stroke();
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("TOTAL BAYAR", 260, totalY);
      doc.text(formatRupiah, 440, totalY, { width: 95, align: "right" });
      
      const noteY = totalY + 60;
      doc.fontSize(10).font("Helvetica-Bold").text("Keterangan & Catatan:", 50, noteY);
      
      doc.font("Helvetica").fontSize(9);
      if (isLunas) {
        doc.text("Pembayaran telah diverifikasi dan diterima oleh pengelola Kost RumahKu.", 50, noteY + 15);
        doc.text("Terima kasih atas pembayaran Anda yang tepat waktu.", 50, noteY + 28);
      } else {
        doc.text("Harap segera melakukan pembayaran sebelum tanggal jatuh tempo.", 50, noteY + 15);
        doc.text("Pembayaran dapat dilakukan melalui transfer atau tunai langsung kepada Admin.", 50, noteY + 28);
      }
      doc.fontSize(8).fillColor("#888888");
      doc.text(`System Ref ID: ${tagihan._id}`, 50, noteY + 60);
      doc.text(
        "Dokumen ini diterbitkan secara elektronik oleh Sistem Manajemen Kost RumahKu dan bertindak sebagai bukti transaksi yang sah.", 
        50, 
        doc.page.height - 60, 
        { align: "center", width: 495 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};