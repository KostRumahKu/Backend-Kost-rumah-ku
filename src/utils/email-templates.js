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

export const templateOTP = (nama, otp) => {
  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}! 🔐</h3>
    <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Kost RumahKu Anda.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 24px; margin: 24px 0; border-radius: 4px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">KODE OTP ANDA:</p>
      <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</p>
    </div>
    
    <p style="color: #ef4444; font-size: 14px;"><b>⚠️ Penting:</b> Kode ini hanya berlaku selama <b>5 menit</b>. Jangan berikan kode ini kepada siapa pun, termasuk admin.</p>
    <p>Jika Anda tidak pernah meminta pengaturan ulang kata sandi, abaikan email ini.</p>
    <br>
    <p>Terima kasih,<br><b>Admin Kost RumahKu</b></p>
  `;
  return baseHtml(konten);
};

export const templateTagihanBaru = (
  nama,
  nomorInvoice,
  bulanTagihan,
  totalHarga,
  tanggalJatuhTempo,
) => {
  const hargaRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalHarga);
  const tglFormatted = new Date(tanggalJatuhTempo).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}! 📄</h3>
    <p>Tagihan sewa kost Anda untuk periode <b>${bulanTagihan}</b> telah diterbitkan.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; color: #4b5563;"><b>Nomor Tagihan:</b> ${nomorInvoice}</p>
      <p style="margin: 0 0 8px 0; color: #4b5563;"><b>Total Tagihan:</b> ${hargaRupiah}</p>
      <p style="margin: 0; color: #ef4444;"><b>Batas Pembayaran:</b> ${tglFormatted}</p>
    </div>
    
    <p>Silakan melakukan pembayaran dan upload bukti transfer melalui aplikasi KostRumahKu sebelum tanggal jatuh tempo.</p>
    <p style="margin-top: 24px;">Terima kasih,<br><b>Admin Kost RumahKu</b></p>
  `;
  return baseHtml(konten);
};

export const templatePengumuman = (judul, pesan, gambarUrl) => {
  const tagGambar = gambarUrl
    ? `<div style="text-align: center; margin-bottom: 20px;">
         <img src="${gambarUrl}" alt="Gambar Pengumuman" style="max-width: 100%; height: auto; border-radius: 8px;" />
       </div>`
    : "";

  const pesanFormat = pesan.replace(/\n/g, "<br>");

  const konten = `
    <h3 style="color: #111827; margin-top: 0;">📢 ${judul}</h3>
    ${tagGambar}
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; color: #374151; line-height: 1.6;">
      ${pesanFormat}
    </div>
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
      Pesan broadcast ini dikirimkan secara otomatis oleh sistem KostRumahKu.
    </p>
  `;
  return baseHtml(konten);
};

export const templateOtpGantiEmail = (nama, otp) => {
  const konten = `
    <h3 style="color: #111827; margin-top: 0;">Halo, ${nama}!</h3>
    <p>Anda menerima email ini karena ada permintaan untuk mengubah alamat email pada akun KostRumahKu Anda.</p>
    
    <div style="background-color: #f3f4f6; text-align: center; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">Kode OTP Verifikasi Email Baru:</p>
      <h1 style="margin: 0; color: #2563eb; letter-spacing: 4px; font-size: 32px;">${otp}</h1>
    </div>
    
    <p style="color: #ef4444; font-size: 14px; margin-bottom: 0;"><b>Perhatian:</b> Kode ini hanya berlaku selama 5 menit.</p>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
  `;
  return baseHtml(konten);
};

export const templateNotifikasiKeluarAdmin = (
  namaPenyewa,
  kamarLama,
  kamarBaru,
  jenis,
  tanggalFormat,
  urlDashboard
) => {
  const isPindah = jenis === "pindah-kamar";
  const judul = isPindah ? "Jadwal Pindah Kamar" : "Jadwal Check-out";
  
  const detailAksi = isPindah 
    ? `Penyewa dijadwalkan pindah dari <strong>Kamar ${kamarLama}</strong> menuju <strong>Kamar ${kamarBaru}</strong>.`
    : `Penyewa dijadwalkan melakukan check-out dari <strong>Kamar ${kamarLama}</strong>.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #e74c3c;">[PENTING] ${judul} Hari Ini</h2>
      <p>Halo Admin KostRumahKu,</p>
      
      <p>Ini adalah pengingat otomatis bahwa pada hari ini, <strong>${tanggalFormat}</strong>, terdapat jadwal eksekusi operasional:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
          <li><strong>Nama Penyewa:</strong> ${namaPenyewa}</li>
          <li><strong>Jenis Pengajuan:</strong> ${isPindah ? "Pindah Kamar" : "Berhenti Sewa"}</li>
          <li><strong>Detail:</strong> ${detailAksi}</li>
        </ul>
      </div>

      <p style="background-color: #fff3cd; padding: 15px; border-radius: 4px; color: #856404; font-weight: bold;">
        Tindakan yang Diperlukan:<br/>
        Mohon pastikan serah terima kunci dilakukan hari ini. Setelah penyewa memindahkan barang, Anda WAJIB menekan tombol "Selesaikan Eksekusi" pada dashboard agar sistem dapat mereset data kamar dan tagihan.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${urlDashboard}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Buka Dashboard Admin</a>
      </div>
      
      <p>Sistem Manajemen KostRumahKu</p>
    </div>
  `;
};

export const templatePengajuanDibuat = (namaPenyewa, jenisPengajuan, tanggalTarget) => {
  const jenisTeks = jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa (Check-out)" : "Pindah Kamar";
  
  const tglFormat = new Date(tanggalTarget).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2c3e50;">Pengajuan Anda Sedang Diproses</h2>
      <p>Halo <strong>${namaPenyewa}</strong>,</p>
      <p>Kami telah menerima permohonan <strong>${jenisTeks}</strong> yang Anda ajukan melalui sistem KostRumahKu.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Rincian Pengajuan:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Jenis:</strong> ${jenisTeks}</li>
          <li><strong>Tanggal Target:</strong> ${tglFormat}</li>
          <li><strong>Status Saat Ini:</strong> Menunggu Konfirmasi Admin</li>
        </ul>
      </div>

      <p>Admin kami akan segera meninjau pengajuan ini. Anda akan menerima email pemberitahuan lebih lanjut apabila pengajuan ini telah disetujui atau ditolak.</p>
      <p>Jika Anda merasa tidak melakukan pengajuan ini atau ingin membatalkannya, segera masuk ke dashboard akun Anda.</p>
      
      <p>Terima kasih,<br><strong>Manajemen KostRumahKu</strong></p>
    </div>
  `;
};

export const templatePembatalanOlehPenyewa = (namaPenyewa, jenisPengajuan) => {
  const jenisTeks = jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar";
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #e74c3c;">Pembatalan Pengajuan Berhasil</h2>
      <p>Halo <strong>${namaPenyewa}</strong>,</p>
      <p>Sesuai permintaan Anda, sistem telah membatalkan pengajuan <strong>${jenisTeks}</strong> Anda yang sebelumnya berstatus Menunggu Konfirmasi.</p>
      <p>Anda saat ini tidak memiliki pengajuan aktif. Jika Anda berubah pikiran di kemudian hari, Anda dapat membuat pengajuan baru melalui dashboard akun Anda.</p>
      <p>Terima kasih,<br><strong>Manajemen KostRumahKu</strong></p>
    </div>
  `;
};

export const templateNotifikasiBatalKeAdmin = (namaPenyewa, kamarSekarang, jenisPengajuan) => {
  const jenisTeks = jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar";
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #f39c12;">Informasi Pembatalan Pengajuan</h2>
      <p>Halo Admin,</p>
      <p>Penyewa berikut telah <strong>membatalkan</strong> pengajuan mereka secara mandiri:</p>
      <ul>
        <li><strong>Nama Penyewa:</strong> ${namaPenyewa}</li>
        <li><strong>Kamar:</strong> ${kamarSekarang}</li>
        <li><strong>Jenis Pengajuan:</strong> ${jenisTeks}</li>
      </ul>
      <p>Pengajuan ini sudah ditarik dari antrean "Menunggu Konfirmasi" Anda, sehingga Anda <strong>tidak perlu lagi memprosesnya</strong>.</p>
    </div>
  `;
};

export const templateHasilPengajuan = (namaPenyewa, jenisPengajuan, status, catatanAdmin, tanggalTarget) => {
  const jenisTeks = jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar";
  
  const warnaHeader = status === "disetujui" ? "#27ae60" : "#e74c3c";
  const teksStatus = status === "disetujui" ? "DISETUJUI" : "DITOLAK";
  
  const tglFormat = new Date(tanggalTarget).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: ${warnaHeader};">Pengajuan Anda ${teksStatus}</h2>
      <p>Halo <strong>${namaPenyewa}</strong>,</p>
      <p>Admin telah selesai meninjau pengajuan <strong>${jenisTeks}</strong> yang Anda minta untuk tanggal ${tglFormat}.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${warnaHeader}; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Hasil Tinjauan Admin:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Status Akhir:</strong> <span style="color: ${warnaHeader}; font-weight: bold;">${teksStatus}</span></li>
          <li><strong>Catatan Admin:</strong> ${catatanAdmin || "<em>Tidak ada catatan tambahan.</em>"}</li>
        </ul>
      </div>

      ${status === "disetujui" && jenisPengajuan === "berhenti-sewa" 
        ? `<p>Karena pengajuan disetujui, mohon bersiap untuk menyerahkan kunci kamar Anda pada tanggal <strong>${tglFormat}</strong>.</p>` 
        : ""}
        
      ${status === "disetujui" && jenisPengajuan === "pindah-kamar" 
        ? `<p>Kamar tujuan Anda telah berhasil dipesan (di-booking) oleh sistem. Mohon bersiap untuk memindahkan barang dan menyerahkan kunci kamar lama Anda pada tanggal <strong>${tglFormat}</strong>.</p>` 
        : ""}
      
      ${status === "ditolak" 
        ? `<p>Jika Anda memiliki pertanyaan lebih lanjut mengenai alasan penolakan, silakan hubungi Admin secara langsung.</p>` 
        : ""}
      
      <p>Terima kasih,<br><strong>Manajemen KostRumahKu</strong></p>
    </div>
  `;
};

export const templateRollbackPersetujuan = (namaPenyewa, jenisPengajuan, catatanAdmin) => {
  const jenisTeks = jenisPengajuan === "berhenti-sewa" ? "Berhenti Sewa" : "Pindah Kamar";
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #8e44ad;">Persetujuan Pengajuan Dibatalkan</h2>
      <p>Halo <strong>${namaPenyewa}</strong>,</p>
      <p>Menginformasikan bahwa Admin telah membatalkan persetujuan untuk pengajuan <strong>${jenisTeks}</strong> Anda sebelumnya.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #8e44ad; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Catatan dari Admin:</strong></p>
        <p style="margin: 0; font-style: italic;">"${catatanAdmin || 'Penyewa batal pindah/keluar, masa sewa diperpanjang.'}"</p>
      </div>

      <p>Dengan pembatalan ini, status kamar dan kewajiban tagihan bulanan Anda akan dikembalikan seperti semula (aktif). Harap periksa kembali menu Tagihan di dashboard Anda jika sebelumnya ada tagihan yang sempat dibatalkan.</p>
      
      <p>Terima kasih,<br><strong>Manajemen KostRumahKu</strong></p>
    </div>
  `;
};