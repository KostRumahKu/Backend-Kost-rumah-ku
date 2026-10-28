import { Resend } from "resend";
import { AppError } from "../errors.js";

if (!process.env.RESEND_API_KEY || !process.env.SENDER_EMAIL) {
  console.log("RESEND_API_KEY=Belum ada");
  console.log("SENDER_EMAIL=Belum ada");
}

const resend = new Resend(process.env.RESEND_API_KEY);


const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const kirimEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: `Kost RumahKu <${SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`[MAIL SUCCESS] Email terkirim ke ${to} (ID: ${data.id})`);
    return { sukses: true, data };
  } catch (error) {
    console.error(`[MAIL ERROR] Gagal mengirim email ke ${to}:`, error.message);
    throw new AppError(
      "EMAIL_SERVICE_ERROR",
      "Email service bermasalah.",
    );
  }
};
