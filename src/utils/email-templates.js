
export const baseHtml = (konten) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #2563eb; padding: 24px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Kost RumahKu</h2>
    </div>
    
    <div style="padding: 32px 24px; color: #374151; background-color: #ffffff; line-height: 1.6;">
      ${konten}
    </div>
    
    <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">Email ini dikirim secara otomatis oleh Sistem Kost RumahKu.</p>
      <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Kost RumahKu. All rights reserved.</p>
    </div>
  </div>
`;

export const templateAkunBaru = (nama, email, passwordAsli, nomorKamar) => {
  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}! 👋</h3>
    <p>Selamat datang di Kost RumahKu. Admin baru saja mendaftarkan Anda sebagai penghuni untuk <b>Kamar ${nomorKamar}</b>.</p>
    <p>Untuk memudahkan Anda mengakses tagihan, melakukan pembayaran, dan melihat riwayat sewa, kami telah membuatkan akun aplikasi untuk Anda.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">KREDENSIAL LOGIN ANDA:</p>
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${passwordAsli}</span></p>
    </div>
    
    <p style="color: #dc2626; font-size: 13px;"><i>* PENTING: Harap segera ubah password Anda melalui menu pengaturan setelah berhasil login pertama kali.</i></p>
    
    <p style="margin-top: 24px;">Terima kasih,<br><b>Admin Kost RumahKu</b></p>
  `;

  return baseHtml(konten);
};
