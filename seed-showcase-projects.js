const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data', 'site.db'));
db.pragma('journal_mode=WAL');

console.log('Seeding Comprehensive Project Showcases from Portfolios...');

// Clean existing projects to establish the complete curated showcase
db.prepare('DELETE FROM projects').run();

const insertStmt = db.prepare(`
  INSERT INTO projects (
    title, slug, type, category, status, summary, content,
    problem, contribution, process, outcome, disclosure,
    cover, pdf_file, gallery, display_order, is_public, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?
  )
`);

const projects = [
  {
    title: 'HR System Standardization & Strengthening — DMAIC Framework',
    slug: 'hr-system-standardization-dmaic',
    type: 'HR Governance & Continuous Improvement',
    category: 'HR Governance & Strategy',
    status: 'Framework & Transformation Model',
    summary: 'Membangun fondasi HR yang terstruktur, menstandardisasi proses kerja, dan memperkuat documentation & control pada perusahaan manufaktur & distribusi melalui pendekatan Six Sigma DMAIC.',
    content: `Transformasi sistematis pengelolaan Human Resources pada perusahaan bertumbuh menggunakan metodologi Six Sigma DMAIC (Define, Measure, Analyze, Improve, Control). Menghubungkan People, Process, Data, dan Governance untuk menciptakan keandalan bisnis yang terukur.`,
    problem: `Pertumbuhan volume bisnis berjalan jauh lebih cepat dibandingkan kematangan tata kelola HR. Pengelolaan karyawan masih bertumpu pada praktik informal dan manual tanpa SOP tertulis, tidak ada struktur organisasi formal, ketiadaan reporting line & eskalasi jelas, absensi manual yang memicu ketidaksesuaian data, serta ketiadaan cut-off payroll yang mengakibatkan risiko salah bayar dan eksposur cashflow.`,
    contribution: `Memimpin perancangan dan standarisasi fondasi sistem HR:
• Menyelaraskan 4 ruang lingkup utama: People & Organization, HR Process, Documentation & Governance, dan Operational Control.
• Menelusuri baseline evidence dan memetakan 6 control gap kritis (Attendance, Payroll Control, Periodisasi Payroll, Data Karyawan, Barang/Transaksi, Komunikasi).
• Menganalisis akar masalah menggunakan Fishbone Diagram dan 5 Why Analysis.
• Merancang transformasi komprehensif: 10/10 Core HR Processes tercakup, 100% posisi memiliki Job Description tertulis, employee database terstruktur, 10+ SOP & kebijakan kerja, perjanjian kerja tertulis (PKWT/PKWTT), serta siklus kontrol PDCA.`,
    process: `1. DEFINE: Menetapkan business context, problem statement, project goal, dan batasan ruang lingkup kerja.
2. MEASURE: Mengumpulkan bukti kondisi awal (baseline evidence) dan memetakan alur Temuan → Control Gap → Risiko.
3. ANALYZE: Mengurai inkonsistensi proses operasional melalui Fishbone Diagram lintas 6 dimensi (People, Process, Policy, Governance, Documentation, Communication) serta 5 Why Analysis guna menemukan akar penyebab (root cause).
4. IMPROVE: Mengeksekusi matriks transformasi dari status 'Informal & Manual' menuju 'Structured, Standardized, Documented, and Controlled'. Merestrukturisasi bagan organisasi dengan alur filtering masalah di level Head/PIC Divisi.
5. CONTROL: Membangun mekanisme kontrol berkelanjutan melalui siklus PDCA (Plan, Do, Check, Act) dan 7 lapisan kontrol operasional harian.`,
    outcome: `• Role Clarity: Struktur organisasi resmi dan Job Description tertulis memperjelas akuntabilitas dan menghilangkan tumpang tindih peran.
• Communication & Escalation Flow: Masalah operasional tersaring di tingkat PIC divisi sebelum mencapai Owner/Manajemen puncak.
• Process Consistency: Seluruh proses rekrutmen, presensi, cuti, penggajian, dan terminasi berjalan konsisten berlandaskan SOP.
• Cashflow & Fraud Control: Periodisasi cut-off dan validasi ganda mencegah pembayaran ganda serta meminimalkan risiko deviasi transaksi.
• Organizational Reliability: Sinergi People + Process + Data + Governance membangun lingkungan kerja yang tangguh dan siap tumbuh bersama bisnis.`,
    disclosure: 'Dokumentasi Framework DMAIC Resmi | Diadaptasi untuk Portofolio Profesional 2026 | Data & Contoh Telah Dianonimkan',
    cover: 'evidence/doc1_page_01.png',
    pdf_file: 'documents/Muhammad-Julda-Al-Hafiz-Portofolio-HRBP.pdf',
    gallery: JSON.stringify([
      { src: 'evidence/doc1_page_02.png', caption: 'Konteks Organisasi & Ruang Lingkup Project (People, Process, Governance, Control)' },
      { src: 'evidence/doc1_page_03.png', caption: 'Measure: Baseline Evidence (Kondisi Awal Tanpa Standar & Kontrol)' },
      { src: 'evidence/doc1_page_04.png', caption: 'Measure: Pemetaan Temuan → Control Gap → Risiko Operasional' },
      { src: 'evidence/doc1_page_05.png', caption: 'Analyze: Fishbone Diagram (Analisis Inkonsistensi Proses Operasional)' },
      { src: 'evidence/doc1_page_06.png', caption: 'Analyze: 5 Why Analysis Menemukan Root Cause Ketiadaan Sistem HR' },
      { src: 'evidence/doc1_page_07.png', caption: 'Improve: Matriks Transformasi Sistem HR (Sebelum vs Sesudah)' },
      { src: 'evidence/doc1_page_08.png', caption: 'Improve: Struktur Organisasi Baru & Mekanisme Penyaringan Eskalasi' },
      { src: 'evidence/doc1_page_09.png', caption: 'Control: Siklus PDCA & 7 Lapisan Kontrol Berkelanjutan' },
      { src: 'evidence/doc1_page_10.png', caption: 'Business Impact: 7 Dampak Nyata Fondasi HR Terhadap Keandalan Bisnis' },
      { src: 'evidence/doc1_page_11.png', caption: 'Prinsip Kerja: People → Process → Data → Business Reliability' }
    ]),
    display_order: 1,
    is_public: 1
  },
  {
    title: 'Manpower Planning & Headcount Budgeting System',
    slug: 'manpower-planning-headcount-budgeting',
    type: 'Talent Planning & Strategy',
    category: 'Talent Acquisition & Planning',
    status: 'Operational System',
    summary: 'Menyusun perencanaan kebutuhan tenaga kerja dan proyeksi anggaran headcount lintas departemen berdasarkan ekspansi bisnis dan target pemenuhan kuartalan.',
    content: `Perancangan sistem Manpower Planning (MPP) untuk mengontrol kebutuhan karyawan baru, penggantian posisi (replacement), dan ekspansi cabang dengan estimasi biaya gaji serta legalitas approval pimpinan.`,
    problem: `Permintaan penambahan tenaga kerja sering diajukan mendadak tanpa data pendukung yang valid, proyeksi biaya gaji tahunan tidak terprediksi dengan rapi, dan belum ada sinkronisasi antara target ekspansi outlet/cabang dengan kesiapan tim rekrutmen.`,
    contribution: `Merancang format Manpower Planning (MPP) terpadu:
• Memetakan kebutuhan tenaga kerja per departemen (HRD, Finance, Marketing & Sales, Produksi & Operasional).
• Mengelompokkan alasan kebutuhan: Replacement karyawan resign, penambahan formasi akibat ekspansi cabang/outlet, atau pemenuhan standar regulasi.
• Mengalokasikan alokasi headcount per lokasi (Head Office, Cabang Bandung, Outlet Depok/Bekasi/Bogor, Gudang).
• Menghitung estimasi biaya gaji per orang serta total anggaran biaya tenaga kerja.
• Mengintegrasikan kolom monitoring status rekrutmen, target tanggal pemenuhan, dan legalitas approval pimpinan.`,
    process: `1. Mengumpulkan data proyeksi formasi bersama para Kepala Departemen / SPV.
2. Melakukan sinkronisasi antara kebutuhan personel dengan batas anggaran operasional (OPEX) perusahaan.
3. Menetapkan skala prioritas dan target tanggal pemenuhan (Target Tgl Pemenuhan) berdasarkan kuartal bisnis.
4. Menghubungkan matriks MPP dengan tracker pelaksanaan rekrutmen harian tim HR.`,
    outcome: `Alur perencanaan kebutuhan tenaga kerja menjadi lebih terstruktur, transparan, dan berfungsi sebagai acuan tunggal untuk mengendalikan biaya tenaga kerja sekaligus mempercepat koordinasi pemenuhan rekrutmen.`,
    disclosure: 'Format Sistem Operasional | Seluruh Nama PT, Posisi, dan Angka Nominal Bersifat Data Ilustratif / Anonymized',
    cover: 'evidence/doc2_page_07.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=7',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_07.png', caption: 'Manpower Planning (MPP) Matrix: Departemen, Alasan Kebutuhan, Alokasi Headcount, Estimasi Biaya, Target Pemenuhan & Status Approval' }
    ]),
    display_order: 2,
    is_public: 1
  },
  {
    title: 'Recruitment Requisition & Hiring Tracker',
    slug: 'recruitment-requisition-hiring-tracker',
    type: 'Recruitment Operations',
    category: 'Talent Acquisition & Planning',
    status: 'Operational Tool',
    summary: 'Membangun visibilitas menyeluruh terhadap proses rekrutmen dari permintaan tenaga kerja (Man Request), alur persetujuan, hingga status pemenuhan kandidat.',
    content: `Pengembangan tracker rekrutmen komprehensif yang mengintegrasikan alur: Request => Approval Manager => Recruitment Pipeline => Candidate Status => Hiring.`,
    problem: `Permintaan rekrutmen dari manajer divisi tersebar dalam berbagai catatan informal, status posisi yang sedang dibuka tidak transparan, dan pimpinan kesulitan memantau posisi mana yang sudah terisi atau masih mengalami keterlambatan (*bottleneck*).`,
    contribution: `Membangun dashboard Requisition & Hiring Tracker:
• Menetapkan kode registrasi Man Request (MR) yang unik dan teratur.
• Mengkategorikan collar type (White Collar vs Blue Collar) dan jenis ikatan kerja (PKWT / PKWTT).
• Menetapkan level prioritas (High, Medium, Low), batas tanggal target hire, dan rentang budget gaji.
• Menugaskan PIC HR yang bertanggung jawab dan mencatat verifikasi persetujuan manajer.
• Menghubungkan sheet Master Data, Requisition Tracker, Candidate Pipeline, Talent Pool, dan Time-to-Hire analysis.`,
    process: `1. Penerimaan formulir permintaan tenaga kerja resmi dari departemen pengguna.
2. Verifikasi kesesuaian permintaan terhadap alokasi Manpower Planning yang telah disetujui.
3. Pencatatan ke sistem monitoring dan penentuan target timeline seleksi.
4. Pembaruan berkala status pemenuhan (Open, In Progress, On Hold, Closed) yang dapat diakses oleh manajemen.`,
    outcome: `Menciptakan satu sistem monitoring terpusat yang membantu HR dan jajaran manajerial memantau progres rekrutmen secara real-time, mendeteksi hambatan sourcing lebih awal, dan menjaga akuntabilitas waktu pemenuhan jabatan.`,
    disclosure: 'Format Tracker Operasional | Data Ilustratif / Anonymized untuk Menjaga Kerahasiaan Data Internal',
    cover: 'evidence/doc2_page_08.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=8',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_08.png', caption: 'Recruitment Requisition & Hiring Tracker: Register Permintaan Karyawan, Prioritas, Target Hire, Budget, dan Tracking Pipeline' }
    ]),
    display_order: 3,
    is_public: 1
  },
  {
    title: 'Job Analysis & Job Description Standardization',
    slug: 'job-analysis-job-description-standardization',
    type: 'Organizational Development',
    category: 'Organizational Development',
    status: 'Standardization Reference',
    summary: 'Menyusun dasar analisa jabatan dan uraian tugas tertulis yang terstruktur lintas departemen sebagai fondasi rekrutmen, KPI, dan evaluasi kinerja.',
    content: `Perancangan template Analisis Jabatan komprehensif yang digunakan di berbagai divisi untuk memetakan tanggung jawab, wewenang, relasi kerja, dan kriteria kualifikasi peran secara objektif.`,
    problem: `Banyak posisi di perusahaan tidak memiliki uraian tugas tertulis, memicu tumpang tindih tanggung jawab antar karyawan, kebingungan jalur pelaporan (reporting line), dan kriteria rekrutmen yang tidak konsisten antar pewawancara.`,
    contribution: `Merancang formulir baku Analisa Jabatan (Job Analysis Template) yang mencakup 7 komponen inti:
• Identitas Posisi & Tujuan Pekerjaan (Job Purpose).
• Rincian Tanggung Jawab Utama yang dapat diukur.
• Dimensi Pekerjaan: Dimensi keuangan (pengelolaan anggaran/kas) dan non-keuangan (arsip dokumen, peralatan).
• Matriks Hubungan Kerja: Internal (antar divisi terkait) dan Eksternal (vendor, perbankan, instansi pemerintah).
• Batasan Wewenang dalam pengeluaran dan verifikasi operasional.
• Spesifikasi Jabatan Terperinci: Pendidikan formal, pengalaman kerja minimum, pelatihan wajib, dan keterampilan khusus.
• Penempatan posisi dalam struktur organisasi lengkap dengan kolom legalitas persetujuan (Disusun HR, Diperiksa SPV, Disetujui Direktur).`,
    process: `1. Melakukan wawancara dan observasi kerja bersama pemegang jabatan dan atasan langsung.
2. Menyusun draf analisa jabatan menggunakan bahasa tindakan yang jelas dan terukur.
3. Melakukan sinkronisasi wewenang lintas departemen guna mengeliminasi celah tumpang tindih peran.
4. Finalisasi dokumen sebagai pedoman kerja resmi yang ditandatangani oleh manajemen.`,
    outcome: `Menghasilkan standar tertulis yang menjadi acuan langsung penyusunan lowongan kerja, kriteria screening kandidat, panduan masa orientasi karyawan, dan tolok ukur penilaian kinerja berkala (Performance Reference).`,
    disclosure: 'Template Standarisasi Organisasi | Data Jabatan, Nama Pejabat, dan Kriteria Telah Dianonimkan / Ilustratif',
    cover: 'evidence/doc2_page_09.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=9',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_09.png', caption: 'Template Analisa Jabatan Lengkap Lintas Departemen: Tanggung Jawab, Wewenang, Spesifikasi, dan Bagan Struktur Organisasi' },
      { src: 'evidence/doc1_page_08.png', caption: 'Struktur Organisasi & Jalur Komunikasi Baru yang Mengatur Level Eskalasi' }
    ]),
    display_order: 4,
    is_public: 1
  },
  {
    title: 'Job Posting & Initial Screening Workflow',
    slug: 'job-posting-initial-screening-workflow',
    type: 'Talent Sourcing',
    category: 'Talent Acquisition & Planning',
    status: 'Recruitment Execution',
    summary: 'Menghubungkan kebutuhan posisi dengan kandidat yang relevan melalui materi publikasi lowongan yang komunikatif dan matriks penapisan awal yang efisien.',
    content: `Pengembangan alur publikasi lowongan dan penapisan berkas lamaran (Job Requirement => Job Posting => CV Screening => Candidate Shortlist).`,
    problem: `Banyak lowongan kerja dipublikasikan dengan informasi yang terlalu minim atau rancu, sehingga menarik pelamar yang tidak sesuai kualifikasi dan membebani rekruter dengan ratusan berkas yang tidak relevan.`,
    contribution: `Menata alur penapisan awal rekrutmen:
• Merumuskan materi publikasi lowongan (Job Posting) yang profesional, jelas, dan memikat pelamar kompeten.
• Menyusun informasi lowongan lengkap: Uraian tanggung jawab utama, persyaratan pendidikan & pengalaman, keahlian software wajib, serta benefit yang ditawarkan.
• Membangun alur screening bertahap untuk menyaring pelamar berdasarkan kriteria mutlak (hard requirements) sebelum masuk ke tahap psikotes dan wawancara.`,
    process: `1. Menerjemahkan hasil Analisa Jabatan menjadi profil lowongan yang ringkas dan menarik.
2. Mempublikasikan lowongan melalui multi-channel yang tepat (Job Portal, LinkedIn, dan kanal komunitas).
3. Melakukan penapisan awal terhadap berkas masuk berdasarkan kesesuaian kualifikasi teknis.
4. Menghasilkan daftar kandidat terpilih (Candidate Shortlist) untuk diundang ke tahapan seleksi psikotes & wawancara.`,
    outcome: `Mempersingkat waktu skrining berkas lamaran, meningkatkan rasio kesesuaian kandidat yang diundang ke sesi wawancara, serta memberikan citra profesional bagi calon karyawan.`,
    disclosure: 'Alur Publikasi & Seleksi Awal | Materi Poster dan Data Kompensasi Merupakan Contoh Ilustratif Portofolio',
    cover: 'evidence/doc2_page_10.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=10',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_10.png', caption: 'Alur Job Requirement → Job Posting → CV Screening → Candidate Shortlist & Contoh Desain Lowongan Senior Accounting' }
    ]),
    display_order: 5,
    is_public: 1
  },
  {
    title: 'End-to-End Recruitment: 8-Stage Selection Funnel (45+ Positions Filled)',
    slug: 'end-to-end-recruitment-8-stage-funnel',
    type: 'Talent Acquisition & Hiring',
    category: 'Talent Acquisition & Planning',
    status: 'Demonstrated Achievement',
    summary: 'Mengelola siklus rekrutmen dari kebutuhan posisi hingga onboarding karyawan dengan 8 tahapan terstruktur, berhasil memenuhi 45+ posisi kerja secara mandiri.',
    content: `Eksekusi proses rekrutmen menyeluruh yang mencakup Sourcing, CV Screening, Psikotes, HR Interview, User Interview, Offering, Kontrak Kerja, hingga Onboarding karyawan.`,
    problem: `Sebelumnya proses rekrutmen sangat mengandalkan referral informal tanpa database kandidat. Waktu pemenuhan (*time-to-fill*) tidak terukur, seleksi tidak memiliki filter kepribadian dan kompetensi teknis yang jelas, serta proses onboarding tidak terkelola dengan baik.`,
    contribution: `Membangun dan memimpin proses rekrutmen end-to-end:
• Menerapkan funnel 8 tahapan seleksi terstruktur.
• Melakukan penyaringan manual terhadap 500+ berkas pelamar masuk hingga tersaring 50 kandidat memenuhi kriteria teknis.
• Menggunakan tes psikotes (MBTI & DISC) untuk menyaring kandidat dengan profil kepribadian analitis, teliti, dan sesuai budaya kerja.
• Melakukan wawancara HR mendalam terkait komitmen, inisiatif, dan motivasi kerja.
• Mengoordinasikan wawancara pengguna (User Interview) berbasis Behavioral Event Interview (BEI).
• Mengelola penyampaian Offering Letter, administrasi kontrak kerja, dan program onboarding hari pertama.`,
    process: `01 Sourcing → 02 Screening → 03 Test (MBTI + DISC) → 04 HR Interview → 05 User Interview → 06 Offering → 07 Contract Administration → 08 Onboarding.`,
    outcome: `• Berhasil memenuhi 45+ posisi kerja secara mandiri tanpa agensi eksternal.
• Rata-rata waktu pemenuhan (time-to-fill) 14 hari kerja untuk posisi operasional lini produksi.
• Rata-rata waktu pemenuhan 20 hari kerja untuk posisi kantor / staf profesional.
• Terbentuknya talent pool terpusat untuk kebutuhan rekrutmen berulang di masa mendatang.`,
    disclosure: 'Pencapaian Profesional Riil (Tercantum pada CV & Portofolio) | Angka Rincian Funnel pada Tabel Menggunakan Data Ilustratif Terstandar',
    cover: 'evidence/doc2_page_11.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=11',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_11.png', caption: 'Funnel Rekrutmen 8 Tahap: Rincian Jumlah Kandidat Lolos/Gugur di Setiap Tahapan Seleksi hingga Onboarding' }
    ]),
    display_order: 6,
    is_public: 1
  },
  {
    title: 'HR Documentation & Employment Contract Administration (PKWT/PKWTT)',
    slug: 'hr-documentation-employment-contract-pkwtt',
    type: 'HR Legal & Compliance',
    category: 'HR Governance & Strategy',
    status: 'Legal Compliance System',
    summary: 'Menjaga keteraturan dokumentasi penerimaan karyawan dari formulir wawancara, offering letter, hingga surat perjanjian kerja waktu tertentu (PKWT) yang sah.',
    content: `Penyusunan paket administrasi legal penerimaan karyawan dengan mengacu pada ketentuan Undang-Undang Ketenagakerjaan dan regulasi hubungan industrial yang berlaku.`,
    problem: `Banyak hubungan kerja di masa lalu hanya disepakati secara lisan tanpa kontrak tertulis yang rinci, tidak ada scoring wawancara yang terdokumentasi, dan ketentuan masa percobaan serta penalti sering menimbulkan sengketa di kemudian hari.`,
    contribution: `Menyusun dan menerapkan paket lengkap administrasi penerimaan karyawan:
• Formulir Wawancara Terstandar: Lembar penilaian objektif mencakup inisiatif, komunikasi, pemecahan masalah, keterampilan teknis, kepemimpinan, dan motivasi kerja lengkap dengan scoring bobot.
• Surat Rekomendasi / Tindakan: Format disposisi keputusan manajemen (diterima, dipertimbangkan, atau ditolak) dengan usulan paket kompensasi.
• Offering Letter Resmi: Menjelaskan rincian gaji pokok, tunjangan kehadiran/transportasi/jabatan, jam kerja operasional, kewajiban potongan BPJS & PPh21, dan batas waktu konfirmasi.
• Perjanjian Kerja PKWT/PKWTT: Naskah kontrak hukum resmi yang memuat hak dan kewajiban kedua belah pihak, ketentuan evaluasi masa percobaan, kerahasiaan data, serta mekanisme penyelesaian perselisihan.`,
    process: `1. Evaluasi berkas wawancara menggunakan formulir berbobot nilai.
2. Pengajuan surat rekomendasi dan persetujuan kompensasi kepada pimpinan perusahaan.
3. Penerbitan dan pengiriman surat penawaran kerja (offering letter) kepada kandidat terpilih.
4. Penandatanganan kontrak kerja tertulis sebelum hari pertama efektif bekerja.
5. Pengarsipan fisik dan digital ke dalam berkas induk kepegawaian (employee personal file).`,
    outcome: `Menjamin kepastian hukum dan perlindungan hak bagi karyawan maupun pengusaha, mencegah risiko perselisihan hubungan industrial, serta memastikan setiap karyawan memiliki catatan administrasi yang tertata sejak hari pertama.`,
    disclosure: 'Standarisasi Tata Kelola Legal HR | Seluruh Nama Perusahaan, Pejabat, Kandidat, dan Nominal Adalah Data Ilustratif / Anonymized',
    cover: 'evidence/doc2_page_12.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=12',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_12.png', caption: 'Paket Dokumen Legal: Formulir Wawancara Scoring, Surat Rekomendasi Hasil Seleksi, Offering Letter Resmi, dan Surat Perjanjian Kerja (PKWT)' }
    ]),
    display_order: 7,
    is_public: 1
  },
  {
    title: 'Excel-Based Automated Payroll & Attendance System (100+ Employees)',
    slug: 'excel-based-automated-payroll-attendance-system',
    type: 'Payroll & HR Operations',
    category: 'HR Operations & Systems',
    status: 'Core Operational System',
    summary: 'Membangun sistem penggajian otomatis berbasis Excel terintegrasi database presensi digital, lembur, tunjangan, dan slip gaji untuk 100+ karyawan.',
    content: `Transformasi proses penggajian dari pencatatan manual buku menjadi sistem rekapitulasi terintegrasi satu alur kerja dengan formula otomatis dan batas tanggal cut-off yang tertib.`,
    problem: `Penggajian untuk 100+ karyawan sebelumnya dihitung berdasarkan tanggal masuk karyawan tanpa cut-off tetap dan mengandalkan catatan absensi fisik. Hal ini memakan waktu rekap yang sangat lama, rentan salah hitung manual, potongan lembur/keterlambatan sering terlewat, dan pernah terjadi pembayaran ganda.`,
    contribution: `Mengembangkan sistem payroll berbasis Excel workbook terpadu:
• Menetapkan tanggal cut-off penggajian yang konsisten untuk seluruh karyawan.
• Menggantikan pencatatan absensi buku manual dengan Google Forms digital dan rekap formula Excel dinamis.
• Mengintegrasikan 8 sheet terhubung dalam satu workbook: Database Karyawan, Master Jabatan, Rekap Absensi, Perhitungan Lembur Depnaker, Tunjangan Jabatan/Transport/Makan, Perhitungan BPJS Ketenagakerjaan & Kesehatan, Estimasi PPh21, dan Generator Slip Gaji Otomatis.
• Membangun sistem rekonsiliasi dan validasi pembayaran sebelum eksekusi transfer dana.`,
    process: `1. Restrukturisasi master database karyawan dan pengelompokan status ikatan kerja (PKWT, PKWTT, Probation).
2. Penyelarasan formula perhitungan upah lembur per jam sesuai ketentuan peraturan ketenagakerjaan resmi.
3. Integrasi data kehadiran dan izin dari formulir digital ke dalam lembar perhitungan gaji.
4. Uji akurasi dan rekonsiliasi total pengeluaran payroll terhadap anggaran kas operasional.
5. Pencetakan dan pengiriman slip gaji transparan kepada seluruh personel karyawan.`,
    outcome: `• Menghilangkan risiko salah bayar dan pembayaran gaji ganda secara permanen.
• Menghemat waktu rekapitulasi penggajian bulanan dari berhari-hari menjadi hitungan jam.
• Memberikan transparansi perhitungan komponen kompensasi bagi seluruh 100+ karyawan.
• Menyediakan data arsip payroll yang tertata rapi dan siap diaudit sewaktu-waktu oleh manajemen.`,
    disclosure: 'Implementasi Penggajian Riil (CV & Portofolio) | Data NIP, Nama Karyawan, Nomor Rekening, dan Nominal Gaji pada Contoh Adalah Data Ilustratif / Anonymized',
    cover: 'evidence/doc2_page_13.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=13',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_13.png', caption: 'Sistem Payroll Terintegrasi Excel: Rekap Gaji 100+ Karyawan, Formula Lembur, Tunjangan, Potongan Kehadiran, BPJS, PPh21, dan Slip Gaji Otomatis' }
    ]),
    display_order: 8,
    is_public: 1
  },
  {
    title: 'General Affairs & Operational Asset Administration',
    slug: 'general-affairs-operational-asset-administration',
    type: 'General Affairs & Facilities',
    category: 'General Affairs & Operations',
    status: 'Operational Administration',
    summary: 'Membangun keteraturan administrasi aset, pemeliharaan fasilitas kerja, sistem tiket work order, hubungan vendor, dan perizinan operasional kantor & pabrik.',
    content: `Perancangan sistem monitoring kebutuhan operasional General Affairs untuk mendukung produktivitas kerja harian 100+ karyawan secara tertata dan efisien.`,
    problem: `Aset peralatan kantor dan sarana operasional belum terdata secara sistematis, riwayat perbaikan fasilitas tidak terdokumentasi, pengadaan barang habis pakai sering melebihi anggaran (*over-budget*), dan masa berlaku perizinan operasional kantor berisiko terlewat.`,
    contribution: `Membangun dashboard dan database administrasi General Affairs (GA) terpadu:
• Master Database Aset: Kodefikasi unik seluruh aset (elektronik, mesin, kendaraan, furniture), lokasi ruangan, penanggung jawab, harga perolehan, nilai buku, dan jadwal penyusutan (depresiasi).
• Work Order System: Sistem pencatatan status perbaikan sarana (Open, In-Progress, Closed) untuk memastikan penanganan fasilitas tepat waktu.
• Vendor & Contract Management: Pencatatan kontrak rekanan aktif, evaluasi kinerja vendor, serta monitoring batas kedaluwarsa izin operasional (contract & permit expiry tracking).
• Kontrol Anggaran (Budget Monitoring): Tracking realisasi anggaran ATK, perbaikan sarana, dan pengeluaran operasional YTD terhadap plafon anggaran yang disetujui.`,
    process: `1. Pelaksanaan stock opname fisik seluruh aset di area kantor dan fasilitas operasional.
2. Penomoran dan labelisasi fisik pada setiap unit inventaris kerja.
3. Pembuatan alur pengajuan perbaikan fasilitas melalui formulir work order terstandar.
4. Evaluasi penawaran vendor pihak ketiga untuk mendapatkan efisiensi biaya pengadaan terbaik.
5. Pembaruan rutin dashboard operasional untuk pelaporan berkala kepada manajemen.`,
    outcome: `Meningkatkan akuntabilitas kepemilikan aset perusahaan, memperpanjang masa pakai fasilitas kerja melalui pemeliharaan berkala, mencegah pemborosan anggaran pengadaan, dan memastikan seluruh kepatuhan izin operasional tetap aktif.`,
    disclosure: 'Sistem Administrasi Fasilitas & Aset | Kode Aset, Nilai Finansial, dan Nama Vendor Merupakan Data Ilustratif / Anonymized',
    cover: 'evidence/doc2_page_14.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=14',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_14.png', caption: 'Dashboard General Affairs & Master Asset: Pencatatan Kodefikasi Aset, Status Work Order, Monitoring Vendor, Legal Permit Expiry, dan Budget Realization YTD' }
    ]),
    display_order: 9,
    is_public: 1
  },
  {
    title: 'Comprehensive HR Foundation & Business Impact Summary',
    slug: 'hr-foundation-business-impact-summary',
    type: 'Continuous Improvement & Retrospective',
    category: 'HR Governance & Strategy',
    status: 'Transformation Retrospective',
    summary: 'Rangkuman komprehensif transformasi 8 pilar sistem HR dan GA: dari ketiadaan dokumen dan pencatatan tertulis menjadi sistem operasional yang terstandar dan andal.',
    content: `Tinjauan retrospektif pembangunan fondasi Human Resources dan General Affairs dari titik awal ketiadaan standar hingga terciptanya kepastian operasional yang mendukung pertumbuhan bisnis perusahaan.`,
    problem: `Perusahaan bertumbuh pesat namun fondasi pendukung manajemen belum terbangun. Setiap permasalahan diselesaikan secara spontan tanpa acuan kebijakan tertulis, menimbulkan inkonsistensi perlakuan terhadap karyawan dan risiko kepatuhan hukum yang tinggi.`,
    contribution: `Membangun fondasi tata kelola pada 8 area kunci organisasi:
1. Manpower Planning: Kebutuhan tenaga kerja terencana per departemen dengan estimasi biaya jelas.
2. Requisition & Hiring Tracker: Sistem monitoring permintaan hingga pemenuhan kandidat.
3. Analisis Jabatan (Jobdesk): Uraian tugas tertulis untuk 100% posisi kerja.
4. Rekrutmen End-to-End: Pemenuhan 45+ posisi dengan time-to-fill 14-20 hari kerja.
5. Perjanjian Kerja: Kepastian hukum tertulis melalui kontrak kerja PKWT/PKWTT.
6. Kebijakan Kerja & Regulasi: 10+ SOP tertulis mencakup cuti, lembur, dan penegakan disiplin.
7. Sistem Payroll: Pembayaran gaji 100+ karyawan berbasis Excel cut-off tetap terintegrasi absensi digital.
8. General Affairs: Inventarisasi aset kantor, monitoring vendor, dan kontrol fasilitas kerja.`,
    process: `Penerapan pendekatan People → Process → Data → Business:
• Mendengarkan kebutuhan operasional para pemangku kepentingan (*stakeholders*).
• Merancang instrumen kerja yang sederhana, aplikatif, dan mudah dijalankan oleh tim.
• Melakukan sosialisasi intensif mengenai regulasi baru.
• Menjalankan kontrol berkala dan penyesuaian berkelanjutan (*continuous improvement*).`,
    outcome: `• Menghilangkan kebingungan peran dan memperjelas jalur pertanggungjawaban karyawan.
• Mengamankan arus kas perusahaan dari risiko salah bayar gaji dan kebocoran transaksi aset.
• Memperkuat kepatuhan terhadap regulasi ketenagakerjaan pemerintah.
• Meletakkan fondasi manajemen orang yang siap diskalakan seiring perluasan bisnis perusahaan di masa depan.`,
    disclosure: 'Rangkuman Rekam Jejak Portofolio Profesional | Merefleksikan Kontribusi Riil Muhammad Julda Al Hafiz',
    cover: 'evidence/doc2_page_15.png',
    pdf_file: 'documents/Portofolio-Muhammad-Julda-Al-Hafiz.pdf#page=15',
    gallery: JSON.stringify([
      { src: 'evidence/doc2_page_15.png', caption: 'Matriks Ringkasan Dampak: Perbandingan Kondisi Awal, Yang Dibangun, dan Dampak Nyata di 8 Area HR & GA' },
      { src: 'evidence/doc1_page_10.png', caption: '7 Dampak Bisnis Nyata Transformasi Fondasi HR Menuju Keandalan Operasional Perusahaan' },
      { src: 'evidence/doc1_page_11.png', caption: 'Filosofi HR: People → Process → Data → Business Reliability' }
    ]),
    display_order: 10,
    is_public: 1
  }
];

for (const p of projects) {
  insertStmt.run(
    p.title, p.slug, p.type, p.category, p.status, p.summary, p.content,
    p.problem, p.contribution, p.process, p.outcome, p.disclosure,
    p.cover, p.pdf_file, p.gallery, p.display_order, p.is_public, new Date().toISOString()
  );
  console.log('✅ Seeded project:', p.title);
}

console.log('ALL 10 SHOWCASE PROJECTS SEEDED SUCCESSFULLY!');
