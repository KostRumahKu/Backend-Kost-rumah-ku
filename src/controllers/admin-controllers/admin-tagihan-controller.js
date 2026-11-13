import * as adminTagihanService from "../../services/admin-services/admin-tagihan-service.js";
import { AppError } from "../../errors.js";
import { KontrakAdminTagihan } from "../../contracts/admin-tagihan-contract.js"
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
        throw new AppError("BAD_REQUEST", "id-atau-invoice pencarian tidak boleh kosong.",
            { kebutuhan_payload: KontrakAdminTagihan }
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