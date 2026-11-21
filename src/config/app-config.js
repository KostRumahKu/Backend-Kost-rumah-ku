/* FILE INI SEBAGAI VARIABEL YANG BSIA LANGSUNG DI PANGGIL, JADI GAK MANGGIL .env LANGSUNG */
/* KALAU KOSONG BUAT OR STRING NYA ISI PAKAI "-" ATAU KALAU UDAH ADA ISI AJA */
const tanpaTandaSlash = (value) => value.replace(/\/+$/, ""); // timpa

export const APP_NAME = process.env.APP_NAME || "KostRumahKu";
export const ADMIN_NAME = process.env.ADMIN_NAME || `Admin ${APP_NAME}`;
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || APP_NAME;
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "admin@kostrumahku.com";
export const APP_URL = tanpaTandaSlash(
  process.env.APP_URL || "https://kostrumahku.com",
);
export const ADMIN_DASHBOARD_URL = tanpaTandaSlash(
  process.env.ADMIN_DASHBOARD_URL ||
    "-",
);
export const ADMIN_TAGIHAN_URL = tanpaTandaSlash(
  process.env.ADMIN_TAGIHAN_URL || "-",
);

export const BUSINESS_ADDRESS =
  process.env.BUSINESS_ADDRESS || "-";
export const BUSINESS_PHONE = process.env.BUSINESS_PHONE || "-";
export const BUSINESS_WHATSAPP =
  process.env.BUSINESS_WHATSAPP || BUSINESS_PHONE;
export const BUSINESS_EMAIL =
  process.env.BUSINESS_EMAIL || "-";
export const OWNER_EMAIL = process.env.OWNER_EMAIL || "-";
export const BUSINESS_SOCIAL =
  process.env.BUSINESS_SOCIAL || "-";
export const BUSINESS_OPERATING_HOURS =
  process.env.BUSINESS_OPERATING_HOURS || "Sen - Sab (08:00 - 17:00 WIB)";
export const DEFAULT_PROFILE_IMAGE_URL =
  process.env.DEFAULT_PROFILE_IMAGE_URL ||
  "https://uploader.danafxc.my.id/images/8c67c844-421b-470a-aa42-476429f8cce2.png";
