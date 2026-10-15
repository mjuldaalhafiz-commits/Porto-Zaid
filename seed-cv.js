const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data', 'site.db'));
db.pragma('journal_mode=WAL');

console.log('Seeding CV data for Muhammad Julda Al Hafiz...');

// 1. Profile
db.prepare(`
  UPDATE profile SET
    name = ?,
    field = ?,
    tagline = ?,
    bio = ?,
    email = ?,
    linkedin = ?
  WHERE id = 1
`).run(
  'Muhammad Julda Al Hafiz',
  'HR Generalist | Recruitment · Payroll · HR Operations · HRGA',
  'From Numbers to Human Impact.',
  `HR Generalist bersertifikat BNSP dengan pengalaman lebih dari 1 tahun di perusahaan manufaktur dan distribusi dengan 100+ karyawan. Berpengalaman membangun dan menstandarkan proses HR, meliputi rekrutmen end-to-end, payroll, administrasi ketenagakerjaan, penyusunan SOP, serta General Affairs. Memiliki pendekatan kerja yang berorientasi pada data, dokumentasi, dan perbaikan proses untuk mendukung operasional yang lebih terstruktur dan terkendali.

📍 Bekasi, Indonesia | 📞 0812-2075-4070 | ✉️ mjuldahafiz@gmail.com
🔗 Portofolio: bit.ly/portomjuldahafiz`,
  'mjuldahafiz@gmail.com',
  'https://linkedin.com/in/mjuldahafiz'
);

// 2. Experiences
db.prepare('DELETE FROM experiences').run();
const expInsert = db.prepare(`
  INSERT INTO experiences (role, period, company, description, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const experiences = [
  {
    role: 'HR Generalist',
    period: 'Apr 2025 – Sekarang',
    company: 'CV. Sumber Rezeki | Manufaktur & Distribusi',
    description: `• Membangun proses rekrutmen end-to-end yang sebelumnya mengandalkan referral tanpa database kandidat. Mengisi 45+ posisi dengan rata-rata waktu pemenuhan 14 hari kerja untuk posisi produksi dan 20 hari kerja untuk posisi office, serta mengelola onboarding dan offboarding.
• Membangun sistem payroll berbasis Excel dengan cut-off tetap untuk 100+ karyawan, mengintegrasikan data absensi, lembur, dan potongan sebagai dasar perhitungan serta validasi pembayaran.
• Mendigitalisasi pencatatan absensi dan lembur dari buku manual menggunakan Google Forms dan rekap Excel sebagai dasar pengolahan data payroll.
• Menyusun 10+ SOP, kebijakan perusahaan, dan regulasi disiplin sebagai acuan proses kerja, termasuk cuti, lembur, dan potongan karyawan.
• Menyusun perjanjian kerja PKWT/PKWTT tertulis serta mengelola pengarsipan dokumen kepegawaian, surat peringatan, dan perubahan data karyawan.
• Menyusun struktur organisasi, penanggung jawab tiap divisi, job description, dan template analisis jabatan untuk memperjelas tanggung jawab serta menangani potensi tumpang tindih peran.
• Membangun pencatatan aset dan barang kantor untuk mendukung dokumentasi serta keterlacakan administrasi, berkoordinasi dengan vendor, dan memantau pemeliharaan fasilitas.
• Menyusun laporan HR bulanan untuk manajemen serta merancang kebutuhan fungsional HRIS in-house, termasuk validasi data karyawan.
• Merancang dan menjalankan program employee engagement berupa acara tahunan perusahaan dan kegiatan olahraga antar divisi.`
  },
  {
    role: 'HRGA Intern',
    period: 'Mar 2025 – Apr 2025',
    company: 'Perusahaan Manufaktur Otomotif',
    description: `• Menyusun dan mengarsipkan 100+ dokumen HRGA secara sistematis.
• Memonitor perbaikan fasilitas kantor dan pengadaan aset karyawan bersama tim HRGA.`
  }
];

for (const exp of experiences) {
  expInsert.run(exp.role, exp.period, exp.company, exp.description, new Date().toISOString());
}

// 3. Education
db.prepare('DELETE FROM education').run();
const eduInsert = db.prepare(`
  INSERT INTO education (title, institution, period, description, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const educations = [
  {
    title: 'S1 Manajemen (IPK 3,80 / 4,00)',
    institution: 'Universitas Bhayangkara Jakarta Raya',
    period: '2021 – 2025',
    description: 'Fokus pada Manajemen Sumber Daya Manusia dan operasional bisnis. Aktif dalam organisasi kepemimpinan mahasiswa dan asisten laboratorium komputer.'
  }
];

for (const edu of educations) {
  eduInsert.run(edu.title, edu.institution, edu.period, edu.description, new Date().toISOString());
}

// 4. Certifications, Trainings, & Honors
db.prepare('DELETE FROM certifications').run();
const certInsert = db.prepare(`
  INSERT INTO certifications (title, issuer, year, file, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const certs = [
  {
    title: 'BNSP HR Staff',
    issuer: 'LSP Manajemen & Pengembangan SDM',
    year: 'Okt 2025'
  },
  {
    title: 'BNSP Staf Administrasi Pelatihan & Pengembangan',
    issuer: 'LSP Ubhara',
    year: 'Mei 2025'
  },
  {
    title: 'Pelatihan HR Generalist & HR Payroll, Kelas IR Specialist, eBootcamp HR Staff',
    issuer: 'PT MSDM Indonesia',
    year: '2025'
  },
  {
    title: 'Pelatihan Recruitment Staff & KPI, Behavior Event Interview, HRIS',
    issuer: 'Quantum HR Indonesia',
    year: '2025'
  },
  {
    title: 'Pelatihan Membuat Dokumen Legal di Perusahaan',
    issuer: 'Ioda Academy',
    year: '2026'
  },
  {
    title: 'Ketua Divisi (2024–2025) & Wakil Ketua Divisi (2023–2024)',
    issuer: 'UKM Google Developer Students Club (GDSC) Ubhara Jaya',
    year: '2023 – 2025'
  },
  {
    title: 'Asisten Laboratorium Komputer FEB (8–9 Mata Kuliah, 150+ Mahasiswa/Semester)',
    issuer: 'Fakultas Ekonomi dan Bisnis Ubhara Jaya',
    year: '2023 – 2025'
  },
  {
    title: 'Juara 2 Business Case Competition',
    issuer: 'Festival Ekonomi Gemilang',
    year: '2023'
  }
];

for (const c of certs) {
  certInsert.run(c.title, c.issuer, c.year, null, new Date().toISOString());
}

// 5. Projects
db.prepare('DELETE FROM projects').run();
const projInsert = db.prepare(`
  INSERT INTO projects (title, slug, type, status, summary, content, cover, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const projects = [
  {
    title: 'End-to-End Recruitment & Talent Sourcing System',
    slug: 'end-to-end-recruitment-talent-sourcing-system',
    type: 'Recruitment & Talent Acquisition',
    status: 'Completed / Operational',
    summary: 'Membangun proses rekrutmen terstruktur dari nol dan mengisi 45+ posisi dengan time-to-fill 14 hari kerja (posisi produksi) dan 20 hari kerja (posisi office).',
    content: `Sebelumnya proses rekrutmen di perusahaan mengandalkan metode referral informal tanpa database kandidat yang terdata.

Langkah-langkah yang diimplementasikan:
1. Manpower Planning & Job Analysis: Membedah kualifikasi dan kebutuhan nyata divisi terkait sebelum membuka lowongan.
2. Talent Pool & Multi-channel Sourcing: Menjaring kandidat via job portal, LinkedIn, dan komunitas kerja regional.
3. Structured Screening & Interview: Menyusun panduan wawancara berbasis Behavioral Event Interview (BEI) bersama user.
4. Onboarding & Offboarding: Menyiapkan kelengkapan administrasi hari pertama dan checklist orientasi kerja.

Hasil:
Mengisi 45+ posisi secara tepat waktu dengan rata-rata 14 hari (produksi) dan 20 hari (office) serta menurunkan potensi salah rekrut.`
  },
  {
    title: 'Sistem Payroll Berbasis Excel & Digitalisasi Presensi 100+ Karyawan',
    slug: 'sistem-payroll-excel-digitalisasi-presensi',
    type: 'Payroll & HR Operations',
    status: 'Completed / Active',
    summary: 'Membangun sistem payroll otomatis berbasis Excel terintegrasi cut-off tetap dan data absensi digital Google Form untuk 100+ karyawan.',
    content: `Sebelumnya pencatatan absensi dan lembur dilakukan manual melalui buku fisik, yang menimbulkan risiko kesalahan hitung dan proses rekap yang memakan waktu berhari-hari.

Inisiatif:
1. Digitalisasi Form Presensi: Memanfaatkan Google Forms dan rekap data Excel untuk pencatatan kehadiran dan permohonan lembur.
2. Formulasi Payroll Otomatis: Merancang lembar kerja penggajian dengan tanggal cut-off tetap, formula kalkulasi lembur sesuai regulasi ketenagakerjaan, serta potongan yang transparan.
3. Integrasi Pembayaran & Slip Gaji: Menyediakan format slip gaji yang jelas untuk meminimalisasi komplain dan menjaga akuntabilitas audit data.

Hasil:
Penggajian 100+ karyawan selalu tepat waktu, transparan, dan bebas dari selisih hitung manual.`
  },
  {
    title: 'Penyusunan 10+ SOP HR, Regulasi Disiplin & Administrasi PKWT/PKWTT',
    slug: 'penyusunan-sop-hr-regulasi-disiplin-pkwtt',
    type: 'HR Governance & Compliance',
    status: 'Completed',
    summary: 'Menyusun 10+ SOP, kebijakan perusahaan, aturan disiplin, job description, struktur organisasi, dan perjanjian kerja PKWT/PKWTT tertulis.',
    content: `Membangun fondasi tata kelola ketenagakerjaan yang kuat untuk mendukung operasional manufaktur dan distribusi yang tertib dan terkendali.

Ruang Lingkup:
1. Penyusunan 10+ SOP HR: Meliputi prosedur cuti, izin, lembur, absensi, rekrutmen, hingga prosedur sanksi disiplin dan Surat Peringatan (SP).
2. Perjanjian Kerja Tertulis: Menyusun format PKWT dan PKWTT yang taat hukum ketenagakerjaan.
3. Analisis Jabatan & Struktur Organisasi: Menetapkan tanggung jawab tiap posisi dan matriks penanggung jawab divisi untuk mencegah tumpang tindih peran.
4. Dokumentasi Kepegawaian: Sistem pengarsipan dokumen karyawan yang teratur dan aman.`
  },
  {
    title: 'Perancangan Kebutuhan Fungsional HRIS In-House',
    slug: 'kebutuhan-fungsional-hris-in-house',
    type: 'HR Technology & HRIS',
    status: 'Specification & Design',
    summary: 'Merancang Functional Requirements Document (FRD) sistem HRIS internal untuk validasi data karyawan dan laporan manajemen.',
    content: `Merancang blueprint arsitektur sistem informasi HR internal guna memfasilitasi otomasi alur data SDM:
• Modul Master Data Karyawan & Dokumen Pegawai.
• Modul Attendance, Cuti, dan Approval Lembur.
• Modul Rekap Payroll terintegrasi.
• Dashboard metrik bulanan manajemen (headcount, perputaran karyawan, dan biaya SDM).`
  },
  {
    title: 'Administrasi Aset Kantor & Koordinasi General Affairs',
    slug: 'administrasi-aset-kantor-dan-general-affairs',
    type: 'General Affairs',
    status: 'Operational',
    summary: 'Pengelolaan inventaris aset kantor, pemeliharaan fasilitas kerja, koordinasi vendor, dan monitoring pengadaan perlengkapan operasional.',
    content: `Menjalankan fungsi General Affairs untuk memastikan fasilitas kerja 100+ karyawan selalu dalam kondisi prima:
• Pencatatan dan labelisasi seluruh aset dan inventaris kantor.
• Koordinasi dengan pihak ketiga/vendor untuk pengadaan barang dan servis berkala fasilitas.
• Monitoring perbaikan sarana kantor dan pabrik demi kelancaran operasional kerja.`
  }
];

for (const p of projects) {
  projInsert.run(p.title, p.slug, p.type, p.status, p.summary, p.content, null, new Date().toISOString());
}

// 6. Articles
db.prepare('DELETE FROM articles').run();
const artInsert = db.prepare(`
  INSERT INTO articles (title, slug, excerpt, content, category, cover, status, published_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const articles = [
  {
    title: 'Membangun Sistem Payroll Berbasis Excel yang Rapi & Akurat untuk 100+ Karyawan',
    slug: 'membangun-sistem-payroll-excel-100-karyawan',
    category: 'Payroll & Operations',
    excerpt: 'Langkah praktis mengintegrasikan Google Form, rekap lembur, formula otomatis, dan tanggal cut-off tetap untuk meminimalkan human error penggajian.',
    content: `Penggajian (payroll) adalah salah satu proses paling vital sekaligus sensitif di setiap organisasi. Keterlambatan atau kesalahan perhitungan sekecil apa pun dapat berdampak langsung pada motivasi dan kepercayaan karyawan terhadap manajemen.

Bagi perusahaan skala menengah (50–150 karyawan) yang belum mengadopsi software HRIS berbayar bernilai puluhan juta rupiah, spreadsheet Excel tetap menjadi alat yang sangat tangguh jika dirancang dengan disiplin dan arsitektur data yang benar.

Kunci Utama Payroll yang Efektif:
1. Penetapan Cut-off Konsisten: Tentukan tanggal cut-off yang tegas (misal tanggal 21 sampai 20 bulan berikutnya) untuk data lembur dan presensi.
2. Digitalisasi Sumber Data: Tinggalkan buku presensi manual. Menggunakan Google Forms atau file scan terpusat membuat rekap lembur lebih mudah diverifikasi oleh atasan langsung.
3. Pemisahan Lembar Kerja (Separation of Concerns): Pisahkan Master Karyawan, Lembar Presensi/Lembur, Formula Perhitungan, dan Output Slip Gaji.
4. Validasi Silang (Double Check): Selalu lakukan rekonsiliasi antara total pengeluaran bulan lalu dan bulan berjalan sebelum transfer bank dieksekusi.`
  },
  {
    title: 'Strategi Rekrutmen End-to-End: Mengisi 45+ Posisi Cepat Tanpa Agensi',
    slug: 'strategi-rekrutmen-end-to-end-tanpa-agensi',
    category: 'Recruitment & Talent',
    excerpt: 'Bagaimana membangun talent pool, mempercepat time-to-fill menjadi 14 hari, dan menerapkan Behavioral Event Interview secara efektif.',
    content: `Banyak perusahaan manufaktur dan distribusi menghadapi tantangan klasik dalam rekrutmen: mengandalkan jalur "titipan" atau rekomendasi yang tidak terukur, atau sebaliknya harus membayar mahal fee agensi pencari kerja.

Dengan merancang alur rekrutmen end-to-end secara mandiri, saya berhasil mengisi 45+ posisi dengan rata-rata waktu pemenuhan (time-to-fill) 14 hari kerja untuk posisi lini produksi dan 20 hari kerja untuk posisi kantor.

Tahapan Praktis yang Dapat Diterapkan:
1. Job Analysis Tajam: Duduk bersama user department sebelum membuka lowongan. Pastikan kriteria "must have" dan "nice to have" dibedakan dengan jelas.
2. Multi-Channel Sourcing: Manfaatkan kombinasi LinkedIn untuk posisi specialist/office, job portal nasional, serta komunitas tenaga kerja lokal untuk posisi operasional.
3. Behavioral Event Interview (BEI): Ajukan pertanyaan berbasis situasi nyata masa lalu (metode STAR: Situation, Task, Action, Result) untuk menguji kompetensi kerja sesungguhnya ketimbang teori.
4. Standarisasi Onboarding: Pengalaman hari pertama sangat menentukan masa percobaan 3 bulan karyawan. Berikan company handbook dan SOP kerja sejak hari pertama.`
  },
  {
    title: 'Mengapa Perusahaan Perlu Menstandarkan 10+ SOP HR dan Administrasi PKWT/PKWTT',
    slug: 'menstandarkan-sop-hr-dan-administrasi-pkwtt',
    category: 'HR Governance',
    excerpt: 'Menghubungkan kepatuhan hukum ketenagakerjaan dengan kelancaran operasional harian perusahaan manufaktur dan distribusi.',
    content: `Banyak bisnis yang bertumbuh cepat sering kali menomorduakan dokumen formal sampai akhirnya muncul perselisihan hubungan industrial atau audit kepatuhan.

Memiliki Standar Operasional Prosedur (SOP) dan surat perjanjian kerja yang tertulis bukan sekadar formalitas kertas, melainkan panduan keselamatan kerja dan kepastian hukum bagi kedua belah pihak: perusahaan dan pekerja.

Fondasi Utama Tata Kelola HR:
1. Kejelasan Kontrak PKWT/PKWTT: Pastikan klausul masa kerja, hak cuti, kompensasi, dan kewajiban sesuai Undang-Undang Ketenagakerjaan dan regulasi terkini.
2. SOP Penegakan Disiplin: Alur teguran lisan, SP 1, SP 2, hingga SP 3 harus tertulis transparan agar objektif dan terhindar dari kesan perlakuan tidak adil.
3. Job Description & Matriks Tanggung Jawab: Setiap divisi wajib mengetahui batasan perannya agar tidak terjadi tumpang tindih maupun lempar tanggung jawab saat kendala operasional timbul.
4. Pengarsipan Dokumen Terpusat: Seluruh surat peringatan, bukti kepesertaan BPJS Ketenagakerjaan & Kesehatan, dan evaluasi berkala harus tersimpan rapi.`
  }
];

for (const a of articles) {
  artInsert.run(a.title, a.slug, a.excerpt, a.content, a.category, null, 'published', new Date().toISOString(), new Date().toISOString());
}

console.log('✅ ALL CV DATA SUCCESSFULLY POPULATED INTO DATABASE!');
