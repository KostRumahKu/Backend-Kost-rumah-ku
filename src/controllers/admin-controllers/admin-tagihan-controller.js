import * as adminTagihanService from "../../services/admin-services/admin-tagihan-service.js";
import { AppError } from "../../errors.js";
import { KontrakAdminTagihan } from "../../contracts/admin-tagihan-contract.js";
export const ambilSemuaTagihan = async (req, res, next) => {
  try {
    const data = await adminTagihanService.ambilSemuaTagihan(req.query);
    res.status(200).json({
      status: "sukses",
      pesan: "Berhasil memuat daftar tagihan.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// export const ambilDetailTagihan = async (req, res, next) => {
//   try {
//     const data = await adminTagihanService.ambilDetailTagihan(req.params.id);
//     res.status(200).json({
//       status: "sukses",
//       data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const cariTagihan = async (req, res, next) => {
  const dataPayload = req.body;
  const { "id-atau-invoice": idAtauInvoice } = dataPayload ?? {};

  if (!idAtauInvoice) {
    throw new AppError(
      "BAD_REQUEST",
      "id-atau-invoice pencarian tidak boleh kosong.",
      { kebutuhan_payload: KontrakAdminTagihan },
    );
  }
  try {
    const hasil = await adminTagihanService.cariTagihanMulti(req.body);

    res.status(200).json({
      status: "sukses",
      pesan: `Ditemukan ${hasil.length} tagihan.`,
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const validasiPembayaran = async (req, res, next) => {
  try {
    const { id } = req.params; // Menangkap ID Tagihan dari URL
    const { "status-validasi": statusValidasi, "catatan-admin": catatanAdmin } =
      req.body;

    if (!statusValidasi) {
      throw new AppError(
        "BAD_REQUEST",
        "Status validasi wajib diisi ('disetujui' atau 'ditolak').",
      );
    }

    const payload = {
      idTagihan: id,
      statusValidasi,
      catatanAdmin,
    };

    const hasil = await adminTagihanService.validasiPembayaran(payload);

    res.status(200).json({
      status: "sukses",
      pesan: hasil.pesan,
    });
  } catch (error) {
    next(error);
  }
};

export const bayarTunggakanManual = async (req, res, next) => {
  try {
    const dataPayload = req.body;
    const {
      idTagihanDasar,
      jumlahBulan,
      idRekening,
      "catatan-admin": catatanAdmin,
    } = dataPayload ?? {};

    if (!idTagihanDasar || !idRekening) {
      throw new AppError(
        "BAD_REQUEST",
        "ID Tagihan Dasar dan ID Rekening wajib diisi untuk pelunasan manual.",
      );
    }

    const payload = {
      idTagihanDasar,
      jumlahBulan: Number(jumlahBulan) || 1,
      idRekening,
      catatanAdmin,
    };

    const hasil = await adminTagihanService.bayarTunggakanManual(payload);

    res.status(200).json({
      status: "sukses",
      pesan: hasil.pesan,
    });
  } catch (error) {
    next(error);
  }
};