const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'data', 'site.db');
const db = new Database(dbPath);
db.pragma('journal_mode=WAL');

console.log('Running Database Migration v3...');

// 1. Create Admins Table & Seed default admin if empty
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    last_login TEXT,
    created_at TEXT
  );
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const adminCount = db.prepare('SELECT COUNT(*) c FROM admins').get().c;
if (adminCount === 0) {
  const initialPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
  const initialUsername = process.env.ADMIN_USERNAME || 'admin';
  const hashed = hashPassword(initialPassword);
  db.prepare(`
    INSERT INTO admins (username, password_hash, created_at)
    VALUES (?, ?, ?)
  `).run(initialUsername, hashed, new Date().toISOString());
  console.log('✅ Created default admin account with hashed password.');
}

// 2. Enhance Certifications Table
const certCols = db.prepare('PRAGMA table_info(certifications)').all().map(c => c.name);
const certAdditions = [
  ['issue_date', 'TEXT'],
  ['expiry_date', 'TEXT'],
  ['credential_id', 'TEXT'],
  ['description', 'TEXT'],
  ['display_order', 'INTEGER DEFAULT 0'],
  ['status', 'TEXT DEFAULT "published"'],
  ['is_downloadable', 'INTEGER DEFAULT 1']
];

for (const [col, type] of certAdditions) {
  if (!certCols.includes(col)) {
    db.prepare(`ALTER TABLE certifications ADD COLUMN ${col} ${type}`).run();
    console.log(`✅ Added column ${col} to certifications`);
  }
}

// Ensure existing certifications have status='published' and display_order set
db.prepare("UPDATE certifications SET status='published' WHERE status IS NULL").run();
db.prepare("UPDATE certifications SET is_downloadable=1 WHERE is_downloadable IS NULL").run();
db.prepare("UPDATE certifications SET display_order=id WHERE display_order IS NULL OR display_order=0").run();

// 3. Enhance Articles Table
const articleCols = db.prepare('PRAGMA table_info(articles)').all().map(c => c.name);
const articleAdditions = [
  ['tags', 'TEXT'],
  ['display_order', 'INTEGER DEFAULT 0']
];
for (const [col, type] of articleAdditions) {
  if (!articleCols.includes(col)) {
    db.prepare(`ALTER TABLE articles ADD COLUMN ${col} ${type}`).run();
    console.log(`✅ Added column ${col} to articles`);
  }
}

// 4. Create Skills Table & Seed with skills from CV
db.exec(`
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    level TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    updated_at TEXT
  );
`);

const skillCount = db.prepare('SELECT COUNT(*) c FROM skills').get().c;
if (skillCount === 0) {
  const defaultSkills = [
    // Recruitment
    ['Recruitment & Talent', 'End-to-End Recruitment', 'Advanced (45+ hires)', '🎯', 1],
    ['Recruitment & Talent', 'Manpower Planning (MPP)', 'Advanced', '📊', 2],
    ['Recruitment & Talent', 'Job Analysis & JD Design', 'Advanced', '📝', 3],
    ['Recruitment & Talent', 'Behavioral Event Interview (BEI)', 'Proficient', '💬', 4],
    ['Recruitment & Talent', 'Talent Sourcing & Candidate Database', 'Advanced', '🔍', 5],
    ['Recruitment & Talent', 'Onboarding & Offboarding', 'Proficient', '🤝', 6],
    
    // HR Operations
    ['HR Operations & Payroll', 'Excel-Based Payroll Administration', 'Advanced (100+ employees)', '💰', 7],
    ['HR Operations & Payroll', 'Attendance & Overtime Management', 'Advanced (Google Forms + Excel)', '⏱️', 8],
    ['HR Operations & Payroll', 'Employee Database & Master Records', 'Proficient', '📁', 9],
    ['HR Operations & Payroll', 'PKWT & PKWTT Administration', 'Proficient', '📑', 10],
    ['HR Operations & Payroll', 'BPJS Ketenagakerjaan & Kesehatan', 'Basic / Operational', '🏥', 11],

    // HR Governance
    ['HR Governance & Strategy', 'SOP Development (10+ SOPs)', 'Advanced', '📜', 12],
    ['HR Governance & Strategy', 'Employment Regulations & Compliance', 'Proficient', '⚖️', 13],
    ['HR Governance & Strategy', 'Disciplinary Regulations & Sanctions (SP)', 'Proficient', '🛡️', 14],
    ['HR Governance & Strategy', 'Organizational Structure & Escalation Flow', 'Advanced', '🏛️', 15],
    ['HR Governance & Strategy', 'Six Sigma DMAIC for HR Systems', 'Certified / Framework', '🔄', 16],

    // General Affairs & Tools
    ['General Affairs & Tools', 'Office Asset & Facilities Administration', 'Proficient', '🏢', 17],
    ['General Affairs & Tools', 'Vendor Coordination & Procurement', 'Proficient', '📦', 18],
    ['General Affairs & Tools', 'Microsoft Excel (Advanced Formulas & Dashboards)', 'Expert', '📗', 19],
    ['General Affairs & Tools', 'Google Workspace Suite', 'Proficient', '💻', 20],
    ['General Affairs & Tools', 'HRIS Functional Requirements (FRD)', 'Proficient', '⚙️', 21]
  ];

  const skillStmt = db.prepare(`
    INSERT INTO skills (category, name, level, icon, display_order, is_public, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);

  for (const s of defaultSkills) {
    skillStmt.run(s[0], s[1], s[2], s[3], s[4], new Date().toISOString());
  }
  console.log(`✅ Seeded ${defaultSkills.length} default skills from CV.`);
}

// 5. Create Media Files Table & Scan existing files
db.exec(`
  CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE,
    original_name TEXT,
    file_path TEXT,
    mime_type TEXT,
    file_size INTEGER,
    is_private INTEGER DEFAULT 0,
    uploaded_at TEXT
  );
`);

// 6. Create Navigation Items Table & Seed default nav
db.exec(`
  CREATE TABLE IF NOT EXISTS navigation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );
`);

const navCount = db.prepare('SELECT COUNT(*) c FROM navigation_items').get().c;
if (navCount === 0) {
  const defaultNav = [
    ['Home', '/', 1],
    ['About', '/about', 2],
    ['Experience', '/experience', 3],
    ['Projects', '/projects', 4],
    ['Articles', '/articles', 5],
    ['Certifications', '/certifications', 6],
    ['Contact', '/contact', 7]
  ];
  const navStmt = db.prepare('INSERT INTO navigation_items (label, url, display_order, is_active) VALUES (?, ?, ?, 1)');
  for (const n of defaultNav) {
    navStmt.run(n[0], n[1], n[2]);
  }
  console.log('✅ Seeded default navigation items.');
}

// 7. Create Site Sections Table & Seed default sections
db.exec(`
  CREATE TABLE IF NOT EXISTS site_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT UNIQUE,
    title TEXT,
    subtitle TEXT,
    is_visible INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
  );
`);

const secCount = db.prepare('SELECT COUNT(*) c FROM site_sections').get().c;
if (secCount === 0) {
  const defaultSections = [
    ['hero', 'Hero & Profil Utama', 'Headline, Tagline, dan CTA Download CV', 1, 1],
    ['highlights', 'Pencapaian Utama (Highlights)', 'Statistik 45+ posisi, 100+ payroll, 10+ SOP', 1, 2],
    ['projects', 'Featured Project Showcases', 'Cuplikan studi kasus & bukti visual', 1, 3],
    ['skills', 'Core Competencies & Tools', 'Daftar keahlian teknis & sistem kerja', 1, 4],
    ['articles', 'Articles & HR Writing', 'Tulisan dan artikel wawasan praktis HR', 1, 5],
    ['cta', 'Contact & Networking Banner', 'Ajakan terhubung untuk peluang karir', 1, 6]
  ];
  const secStmt = db.prepare('INSERT INTO site_sections (section_key, title, subtitle, is_visible, display_order) VALUES (?, ?, ?, ?, ?)');
  for (const s of defaultSections) {
    secStmt.run(s[0], s[1], s[2], s[3], s[4]);
  }
  console.log('✅ Seeded default website sections.');
}

// 8. Create Settings Table & Seed defaults
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

const defaultSettings = {
  site_title: 'Muhammad Julda Al Hafiz — HR Generalist',
  site_tagline: 'From Numbers to Human Impact.',
  meta_description: 'Portfolio HR Generalist bersertifikat BNSP dengan pengalaman rekrutmen end-to-end, payroll 100+ karyawan, standarisasi 10+ SOP, dan DMAIC continuous improvement.',
  site_url: process.env.SITE_URL || 'http://localhost:3000',
  google_analytics_id: '',
  google_site_verification: '',
  contact_email: 'mjuldahafiz@gmail.com',
  contact_phone: '0812-2075-4070',
  contact_whatsapp: 'https://wa.me/6281220754070',
  contact_location: 'Bekasi, Indonesia',
  linkedin_url: 'https://linkedin.com/in/mjuldahafiz',
  portfolio_url: 'https://bit.ly/portomjuldahafiz',
  enable_sitemap: '1',
  enable_robots: '1',
  allow_public_downloads: '1'
};

const setStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(defaultSettings)) {
  setStmt.run(k, v);
}
console.log('✅ Seeded default website settings.');

// 9. Create Login Attempts Table (Rate limiting)
db.exec(`
  CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT,
    attempt_time INTEGER
  );
`);

// 10. Populate media_files from uploads directory
const mediaStmt = db.prepare(`
  INSERT OR IGNORE INTO media_files (filename, original_name, file_path, mime_type, file_size, is_private, uploaded_at)
  VALUES (?, ?, ?, ?, ?, 0, ?)
`);

function scanDir(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item.startsWith('.')) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, path.join(prefix, item));
    } else {
      const relPath = prefix ? path.join(prefix, item) : item;
      const ext = path.extname(item).toLowerCase();
      let mime = 'application/octet-stream';
      if (['.jpg', '.jpeg'].includes(ext)) mime = 'image/jpeg';
      else if (ext === '.png') mime = 'image/png';
      else if (ext === '.webp') mime = 'image/webp';
      else if (ext === '.pdf') mime = 'application/pdf';

      mediaStmt.run(
        relPath,
        item,
        `/uploads/${relPath}`,
        mime,
        stat.size,
        new Date(stat.mtimeMs).toISOString()
      );
    }
  }
}

scanDir(path.join(__dirname, 'uploads'));
console.log('✅ Scanned and cataloged existing upload files into media_files.');

console.log('🎉 Migration v3 completed successfully!');
