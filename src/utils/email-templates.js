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

export const templatePindahKamar = (
  nama,
  kamarLamaAsli,
  kamarBaruAsli,
  tipeBaru,
  lantaiBaru,
  hargaBaru,
) => {
  const hargaRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(hargaBaru);

  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}!</h3>
    <p>Pemberitahuan dari Admin: Anda telah berhasil dipindahkan ke kamar baru.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: bold;">DETAIL PEMINDAHAN KAMAR:</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; width: 40%; color: #6b7280;">Kamar Sebelumnya</td>
          <td style="padding: 4px 0; font-weight: bold; color: #ef4444;"><del>${kamarLamaAsli}</del></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Kamar Baru</td>
          <td style="padding: 4px 0; font-weight: bold; color: #10b981;">${kamarBaruAsli}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Tipe Kamar Baru</td>
          <td style="padding: 4px 0; text-transform: capitalize;">${tipeBaru}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Lantai</td>
          <td style="padding: 4px 0;">Lantai ${lantaiBaru}</td>
        </tr>
      </table>
    </div>
    
    <p style="margin-bottom: 8px;"><b>Informasi Tagihan:</b></p>
    <p style="margin-top: 0; color: #4b5563;">Untuk siklus pembayaran bulan depan, tagihan Anda akan otomatis disesuaikan mengikuti harga kamar baru, yaitu sebesar <b>${hargaRupiah}</b>/bulan.</p>
    
    <p style="margin-top: 24px;">Semoga Anda nyaman di kamar yang baru!<br><br>Terima kasih,<br><b>Admin Kost RumahKu</b></p>
  `;

  return baseHtml(konten);
};

export const templateCheckout = (nama, kamarAsli) => {
  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}! 🏠</h3>
    <p>Terima kasih telah mempercayakan Kost RumahKu sebagai tempat hunian Anda.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #4b5563;">
        Sistem kami mencatat bahwa masa sewa Anda untuk <b>${kamarAsli}</b> telah resmi dihentikan (Checkout). 
        Seluruh tagihan dan administrasi untuk kamar ini telah ditutup.
      </p>
    </div>
    
    <p>Kami harap Anda memiliki pengalaman yang menyenangkan dan berkesan selama tinggal di sini.</p>
    
    <p style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #e5e7eb;">
      <b>Kangen dengan Kost RumahKu?</b><br>
      Jika di kemudian hari Anda membutuhkan hunian yang nyaman, aman, dan strategis kembali, pintu kami selalu terbuka! 
      Silakan kunjungi website kami untuk melihat ketersediaan kamar secara *real-time*:<br>
      <a href="https://kostrumahku.com" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Cek Ketersediaan Kamar</a>
    </p>
    
    <p style="margin-top: 24px;">Sukses selalu untuk Anda!<br><b>Admin Kost RumahKu</b></p>
  `;

  return baseHtml(konten);
};