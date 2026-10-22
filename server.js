require('dotenv').config();
const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const root = __dirname;
const uploadDir = path.join(root, 'uploads');
const dataDir = path.join(root, 'data');

// Ensure directories exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

// Database initialization
const db = new Database(path.join(dataDir, 'site.db'));
db.pragma('journal_mode=WAL');

// Create database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK(id=1),
    name TEXT,
    field TEXT,
    tagline TEXT,
    bio TEXT,
    email TEXT,
    linkedin TEXT,
    cv_file TEXT
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    cover TEXT,
    status TEXT DEFAULT 'draft',
    published_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    type TEXT,
    status TEXT,
    summary TEXT,
    content TEXT,
    cover TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    issuer TEXT,
    year TEXT,
    file TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    period TEXT,
    company TEXT,
    description TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    institution TEXT,
    period TEXT,
    description TEXT,
    updated_at TEXT
  );
`);

// Seed default profile if not exists
if (!db.prepare('SELECT id FROM profile WHERE id=1').get()) {
  db.prepare(`
    INSERT INTO profile (id, name, field, tagline, bio, email, linkedin)
    VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run(
    'Muhammad Julda Al Hafiz',
    'Human Resources',
    'From Numbers to Human Impact.',
    'Bekerja di bidang Human Resources dengan pengalaman pada HR Generalist, Recruitment, HR Operations, HR Administration, Payroll, dan General Affairs.',
    'hafizjulda@gmail.com',
    'https://www.linkedin.com/in/muhammadjuldaalhafiz/'
  );
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// App configuration & middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(root, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(root, 'public')));
app.use('/uploads', express.static(uploadDir));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Global view variables
app.locals.siteUrl = SITE_URL;

// Helper utilities
const now = () => new Date().toISOString();
const clean = (val) => String(val || '').trim();
const slug = (val) => slugify(val, { lower: true, strict: true, trim: true });

const uniqueSlug = (table, val, currentId) => {
  const base = slug(val) || 'untitled';
  let candidate = base;
  let counter = 2;
  while (true) {
    const query = currentId
      ? `SELECT id FROM ${table} WHERE slug=? AND id<>?`
      : `SELECT id FROM ${table} WHERE slug=?`;
    const params = currentId ? [candidate, currentId] : [candidate];
    const exists = db.prepare(query).get(...params);
    if (!exists) break;
    candidate = `${base}-${counter++}`;
  }
  return candidate;
};

// Admin authentication middleware
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  next();
}

// Global middleware for views (navigation items, profile, sections & settings)
app.use((req, res, next) => {
  try {
    res.locals.navItems = db.prepare('SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC').all();
    res.locals.profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
    
    // Load sections as a key-indexed map
    const secRows = db.prepare('SELECT * FROM site_sections ORDER BY display_order ASC, id ASC').all();
    const secMap = {};
    secRows.forEach(s => { secMap[s.section_key] = s; });
    res.locals.siteSections = secMap;

    // Load settings as a key-value map
    const setRows = db.prepare('SELECT key, value FROM settings').all();
    const setMap = {};
    setRows.forEach(s => { setMap[s.key] = s.value; });
    res.locals.siteSettings = setMap;

    res.locals.currentPath = req.path;
  } catch (e) {
    res.locals.navItems = [];
    res.locals.profile = null;
    res.locals.siteSections = {};
    res.locals.siteSettings = {};
    res.locals.currentPath = req.path;
  }
  next();
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Homepage
app.get('/', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  const articles = db
    .prepare("SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC, id DESC LIMIT 3")
    .all();
  const projects = db.prepare('SELECT * FROM projects WHERE is_public=1 ORDER BY display_order ASC, id DESC LIMIT 6').all();
  const highlights = db.prepare('SELECT * FROM highlights ORDER BY display_order ASC, id ASC').all();
  res.render('home', { profile, projects, articles, highlights });
});

// About
app.get('/about', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  res.render('about', { profile });
});

// Experience
app.get('/experience', (req, res) => {
  const experiences = db.prepare('SELECT * FROM experiences ORDER BY id ASC').all();
  const education = db.prepare('SELECT * FROM education ORDER BY id DESC').all();
  res.render('experience', { experiences, education });
});

// Projects
app.get('/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects WHERE is_public=1 ORDER BY display_order ASC, id DESC').all();
  res.render('projects', { projects });
});

// Single Project
app.get('/projects/:slug', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE slug=?').get(req.params.slug);
  if (!project) return res.status(404).render('404');
  res.render('project', { project });
});

// Articles
app.get('/articles', (req, res) => {
  const articles = db
    .prepare("SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC, id DESC")
    .all();
  res.render('articles', { articles });
});

// Single Article
app.get('/articles/:slug', (req, res) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE slug=? AND status='published'")
    .get(req.params.slug);
  if (!article) return res.status(404).render('404');
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  res.render('article', { article, profile, siteUrl: SITE_URL });
});

// Certifications
app.get('/certifications', (req, res) => {
  const certifications = db.prepare("SELECT * FROM certifications WHERE status='published' ORDER BY display_order ASC, id DESC").all();
  res.render('certifications', { certifications });
});

// Contact
app.get('/contact', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  res.render('contact', { profile });
});

// Curriculum Vitae Preview & Download
app.get('/cv', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  if (!profile || !profile.cv_file || profile.show_cv != 1) {
    return res.status(404).render('404');
  }
  res.render('cv', { profile });
});

app.get('/cv/download', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  if (!profile || !profile.cv_file || profile.show_cv != 1) {
    return res.status(404).send('CV tidak tersedia untuk diunduh.');
  }
  const filePath = path.join(uploadDir, profile.cv_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File CV tidak ditemukan di server.');
  }
  res.download(filePath, 'Muhammad-Julda-Al-Hafiz-CV.pdf');
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`
  );
});

// Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const staticUrls = [
    '/',
    '/about',
    '/experience',
    '/projects',
    '/articles',
    '/certifications',
    '/contact'
  ];
  const articles = db
    .prepare("SELECT slug, updated_at FROM articles WHERE status='published'")
    .all();
  const projects = db.prepare('SELECT slug, updated_at FROM projects').all();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
${articles
  .map(
    (a) =>
      `  <url><loc>${SITE_URL}/articles/${a.slug}</loc>${
        a.updated_at ? `<lastmod>${a.updated_at}</lastmod>` : ''
      }</url>`
  )
  .join('\n')}
${projects
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}/projects/${p.slug}</loc>${
        p.updated_at ? `<lastmod>${p.updated_at}</lastmod>` : ''
      }</url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml').send(xml);
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

app.get('/admin/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin-login', {
    error: req.query.error ? 'Username atau password salah.' : null
  });
});

app.post('/admin/login', (req, res) => {
  const username = clean(req.body.username);
  const password = clean(req.body.password);
  const ip = req.ip || req.connection.remoteAddress;

  // Rate limiting: max 5 attempts per IP per 15 minutes
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  try {
    db.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").run(fifteenMinAgo);
    const attempts = db.prepare("SELECT COUNT(*) c FROM login_attempts WHERE ip_address=? AND attempted_at > ?").get(ip, fifteenMinAgo);
    if (attempts && attempts.c >= 5) {
      return res.redirect('/admin/login?error=1');
    }
  } catch (e) { /* login_attempts table may not exist in older DBs */ }

  // Try admins table with scrypt first
  let authenticated = false;
  try {
    const admin = db.prepare("SELECT * FROM admins WHERE username=?").get(username);
    if (admin && admin.password_hash) {
      const crypto = require('crypto');
      const parts = admin.password_hash.split(':');
      if (parts.length === 2) {
        const salt = Buffer.from(parts[0], 'hex');
        const storedHash = parts[1];
        const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
        if (derivedKey === storedHash) {
          authenticated = true;
        }
      }
    }
  } catch (e) { /* admins table may not exist */ }

  // Fallback to .env credentials
  if (!authenticated) {
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'change-this-password';
    if (username === expectedUser && password === expectedPass) {
      authenticated = true;
    }
  }

  if (authenticated) {
    req.session.admin = true;
    return res.redirect('/admin');
  }

  // Record failed attempt
  try {
    db.prepare("INSERT INTO login_attempts (ip_address, username, attempted_at) VALUES (?, ?, ?)").run(ip, username, now());
  } catch (e) { /* ignore */ }

  res.redirect('/admin/login?error=1');
});

app.post('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ==========================================
// ADMIN DASHBOARD & CRUD
// ==========================================

// Dashboard Home
app.get('/admin', requireAdmin, (req, res) => {
  const counts = {
    projects: db.prepare('SELECT COUNT(*) c FROM projects').get().c,
    publicProjects: db.prepare('SELECT COUNT(*) c FROM projects WHERE is_public=1').get().c,
    articles: db.prepare('SELECT COUNT(*) c FROM articles').get().c,
    publishedArticles: db.prepare("SELECT COUNT(*) c FROM articles WHERE status='published'").get().c,
    certifications: db.prepare('SELECT COUNT(*) c FROM certifications').get().c,
    publicCerts: db.prepare("SELECT COUNT(*) c FROM certifications WHERE status='published'").get().c,
    experiences: db.prepare('SELECT COUNT(*) c FROM experiences').get().c,
    skills: db.prepare('SELECT COUNT(*) c FROM skills').get().c,
    media: db.prepare('SELECT COUNT(*) c FROM media_files').get().c
  };
  res.render('admin-dashboard', { counts });
});

// Profile & CV
app.get('/admin/profile', requireAdmin, (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  res.render('admin-profile', { 
    profile, 
    success: req.query.success || null,
    error: req.query.error || null 
  });
});

app.post('/admin/profile', requireAdmin, upload.single('cv'), (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  let cvFile = profile.cv_file;

  if (req.file) {
    cvFile = req.file.filename;
    // Register in media_files
    try {
      db.prepare(`
        INSERT INTO media_files (filename, original_name, mime_type, file_size, file_type, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, 'document', now());
    } catch (e) { /* ignore duplicate */ }
  }

  const showCv = req.body.show_cv !== undefined ? Number(req.body.show_cv) : 0;

  db.prepare(`
    UPDATE profile
    SET name=?, field=?, tagline=?, bio=?, email=?, linkedin=?, cv_file=?, show_cv=?
    WHERE id=1
  `).run(
    clean(req.body.name),
    clean(req.body.field),
    clean(req.body.tagline),
    clean(req.body.bio),
    clean(req.body.email),
    clean(req.body.linkedin),
    cvFile,
    showCv
  );

  // Sync navigation_items for /cv
  try {
    db.prepare("UPDATE navigation_items SET is_active=? WHERE url='/cv'").run(showCv);
  } catch (e) { /* ignore */ }

  res.redirect('/admin/profile?success=1');
});

// Delete CV Endpoint
app.post('/admin/profile/delete-cv', requireAdmin, (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  if (profile && profile.cv_file) {
    const filePath = path.join(uploadDir, profile.cv_file);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
    // Remove from media_files if present
    try {
      db.prepare('DELETE FROM media_files WHERE filename=?').run(profile.cv_file);
    } catch (e) { /* ignore */ }

    db.prepare('UPDATE profile SET cv_file=NULL, show_cv=0 WHERE id=1').run();
    try {
      db.prepare("UPDATE navigation_items SET is_active=0 WHERE url='/cv'").run();
    } catch (e) { /* ignore */ }
  }
  res.redirect('/admin/profile?success=2');
});

// Articles CRUD
app.get('/admin/articles', requireAdmin, (req, res) => {
  const articles = db.prepare('SELECT * FROM articles ORDER BY id DESC').all();
  res.render('admin-articles', { articles });
});

app.get('/admin/articles/new', requireAdmin, (req, res) => {
  res.render('admin-article-form', { article: null });
});

app.get('/admin/articles/:id/edit', requireAdmin, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id=?').get(req.params.id);
  if (!article) return res.redirect('/admin/articles');
  res.render('admin-article-form', { article });
});

app.get('/admin/articles/:id', requireAdmin, (req, res) => {
  res.redirect(`/admin/articles/${req.params.id}/edit`);
});

app.post('/admin/articles/save', requireAdmin, upload.single('cover'), (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const existing = id ? db.prepare('SELECT * FROM articles WHERE id=?').get(id) : null;
  const title = clean(req.body.title);
  const slugVal = uniqueSlug('articles', clean(req.body.slug) || title, id);
  const status = req.body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? (existing?.published_at || now()) : null;
  const cover = req.file ? req.file.filename : (existing?.cover || null);

  if (id && existing) {
    db.prepare(`
      UPDATE articles
      SET title=?, slug=?, excerpt=?, content=?, category=?, cover=?, status=?, published_at=?, updated_at=?
      WHERE id=?
    `).run(
      title,
      slugVal,
      clean(req.body.excerpt),
      clean(req.body.content),
      clean(req.body.category),
      cover,
      status,
      publishedAt,
      now(),
      id
    );
  } else {
    db.prepare(`
      INSERT INTO articles (title, slug, excerpt, content, category, cover, status, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      slugVal,
      clean(req.body.excerpt),
      clean(req.body.content),
      clean(req.body.category),
      cover,
      status,
      publishedAt,
      now()
    );
  }

  res.redirect('/admin/articles');
});

app.post('/admin/articles/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM articles WHERE id=?').run(req.params.id);
  res.redirect('/admin/articles');
});

// Projects CRUD
app.get('/admin/projects', requireAdmin, (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY display_order ASC, id DESC').all();
  res.render('admin-projects', { projects });
});

app.get('/admin/projects/new', requireAdmin, (req, res) => {
  res.render('admin-project-form', { project: null });
});

app.get('/admin/projects/:id/edit', requireAdmin, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!project) return res.redirect('/admin/projects');
  res.render('admin-project-form', { project });
});

app.get('/admin/projects/:id', requireAdmin, (req, res) => {
  res.redirect(`/admin/projects/${req.params.id}/edit`);
});

app.post(
  '/admin/projects/save',
  requireAdmin,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'pdf_file', maxCount: 1 }
  ]),
  (req, res) => {
    const id = req.body.id ? Number(req.body.id) : null;
    const existing = id ? db.prepare('SELECT * FROM projects WHERE id=?').get(id) : null;
    const title = clean(req.body.title);
    const slugVal = uniqueSlug('projects', clean(req.body.slug) || title, id);
    const category = clean(req.body.category) || 'General';
    const type = clean(req.body.type) || category;
    const status = clean(req.body.status) || 'Operational';
    const summary = clean(req.body.summary);
    const problem = clean(req.body.problem);
    const contribution = clean(req.body.contribution);
    const processText = clean(req.body.process);
    const outcome = clean(req.body.outcome);
    const disclosure = clean(req.body.disclosure);
    const gallery = clean(req.body.gallery) || (existing?.gallery || '[]');
    const displayOrder = req.body.display_order ? Number(req.body.display_order) : 0;
    const isPublic = req.body.is_public !== undefined ? Number(req.body.is_public) : 1;

    // Handle files
    const coverFile = req.files?.cover?.[0]?.filename || existing?.cover || null;
    const pdfFile = req.files?.pdf_file?.[0]?.filename || existing?.pdf_file || null;

    if (id && existing) {
      db.prepare(`
        UPDATE projects
        SET title=?, slug=?, type=?, category=?, status=?, summary=?, content=?,
            problem=?, contribution=?, process=?, outcome=?, disclosure=?,
            cover=?, pdf_file=?, gallery=?, display_order=?, is_public=?, updated_at=?
        WHERE id=?
      `).run(
        title,
        slugVal,
        type,
        category,
        status,
        summary,
        summary, // content fallback
        problem,
        contribution,
        processText,
        outcome,
        disclosure,
        coverFile,
        pdfFile,
        gallery,
        displayOrder,
        isPublic,
        now(),
        id
      );
    } else {
      db.prepare(`
        INSERT INTO projects (
          title, slug, type, category, status, summary, content,
          problem, contribution, process, outcome, disclosure,
          cover, pdf_file, gallery, display_order, is_public, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title,
        slugVal,
        type,
        category,
        status,
        summary,
        summary,
        problem,
        contribution,
        processText,
        outcome,
        disclosure,
        coverFile,
        pdfFile,
        gallery,
        displayOrder,
        isPublic,
        now()
      );
    }

    res.redirect('/admin/projects');
  }
);

app.post('/admin/projects/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.redirect('/admin/projects');
});

// Experience CRUD
app.get('/admin/experience', requireAdmin, (req, res) => {
  const experiences = db.prepare('SELECT * FROM experiences ORDER BY id DESC').all();
  const editItem = req.query.edit
    ? db.prepare('SELECT * FROM experiences WHERE id=?').get(req.query.edit)
    : null;
  res.render('admin-experience', { experiences, editItem });
});

app.post('/admin/experience/save', requireAdmin, (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const role = clean(req.body.role);
  const period = clean(req.body.period);
  const company = clean(req.body.company);
  const description = clean(req.body.description);

  if (id) {
    db.prepare(`
      UPDATE experiences
      SET role=?, period=?, company=?, description=?, updated_at=?
      WHERE id=?
    `).run(role, period, company, description, now(), id);
  } else {
    db.prepare(`
      INSERT INTO experiences (role, period, company, description, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(role, period, company, description, now());
  }

  res.redirect('/admin/experience');
});

app.post('/admin/experience/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM experiences WHERE id=?').run(req.params.id);
  res.redirect('/admin/experience');
});

// Certifications CRUD
app.get('/admin/certifications', requireAdmin, (req, res) => {
  const certifications = db.prepare('SELECT * FROM certifications ORDER BY id DESC').all();
  const editItem = req.query.edit
    ? db.prepare('SELECT * FROM certifications WHERE id=?').get(req.query.edit)
    : null;
  res.render('admin-certifications', { certifications, editItem });
});

app.post('/admin/certifications/save', requireAdmin, upload.single('file'), (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const existing = id ? db.prepare('SELECT * FROM certifications WHERE id=?').get(id) : null;
  const title = clean(req.body.title);
  const issuer = clean(req.body.issuer);
  const year = clean(req.body.year);
  const issue_date = clean(req.body.issue_date) || null;
  const expiry_date = clean(req.body.expiry_date) || null;
  const credential_id = clean(req.body.credential_id) || null;
  const description = clean(req.body.description) || null;
  const status = req.body.status === 'published' ? 'published' : 'draft';
  const is_downloadable = req.body.is_downloadable ? 1 : 0;
  const file = req.file ? req.file.filename : (existing?.file || null);

  if (id && existing) {
    db.prepare(`
      UPDATE certifications
      SET title=?, issuer=?, year=?, issue_date=?, expiry_date=?, credential_id=?,
          description=?, status=?, is_downloadable=?, file=?, updated_at=?
      WHERE id=?
    `).run(title, issuer, year, issue_date, expiry_date, credential_id,
           description, status, is_downloadable, file, now(), id);
  } else {
    db.prepare(`
      INSERT INTO certifications (title, issuer, year, issue_date, expiry_date, credential_id,
                                  description, status, is_downloadable, file, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, issuer, year, issue_date, expiry_date, credential_id,
           description, status, is_downloadable, file, now());
  }

  res.redirect('/admin/certifications');
});

app.post('/admin/certifications/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM certifications WHERE id=?').run(req.params.id);
  res.redirect('/admin/certifications');
});

// Education CRUD
app.get('/admin/education', requireAdmin, (req, res) => {
  const education = db.prepare('SELECT * FROM education ORDER BY id DESC').all();
  const editItem = req.query.edit
    ? db.prepare('SELECT * FROM education WHERE id=?').get(req.query.edit)
    : null;
  res.render('admin-education', { education, editItem });
});

app.post('/admin/education/save', requireAdmin, (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const title = clean(req.body.title);
  const institution = clean(req.body.institution);
  const period = clean(req.body.period);
  const description = clean(req.body.description);

  if (id) {
    db.prepare(`
      UPDATE education
      SET title=?, institution=?, period=?, description=?, updated_at=?
      WHERE id=?
    `).run(title, institution, period, description, now(), id);
  } else {
    db.prepare(`
      INSERT INTO education (title, institution, period, description, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, institution, period, description, now());
  }

  res.redirect('/admin/education');
});

app.post('/admin/education/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM education WHERE id=?').run(req.params.id);
  res.redirect('/admin/education');
});

// ==========================================
// SKILLS & TOOLS CRUD
// ==========================================

app.get('/admin/skills', requireAdmin, (req, res) => {
  const skills = db.prepare('SELECT * FROM skills ORDER BY display_order ASC, id ASC').all();
  const editItem = req.query.edit
    ? db.prepare('SELECT * FROM skills WHERE id=?').get(req.query.edit)
    : null;
  res.render('admin-skills', { skills, editItem });
});

app.post('/admin/skills/save', requireAdmin, (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const name = clean(req.body.name);
  const category = clean(req.body.category) || 'Other';
  const level = clean(req.body.level);
  const icon = clean(req.body.icon) || '🎯';
  const display_order = req.body.display_order ? Number(req.body.display_order) : 0;
  const is_public = req.body.is_public !== undefined ? Number(req.body.is_public) : 1;

  if (id) {
    db.prepare(`
      UPDATE skills SET name=?, category=?, level=?, icon=?, display_order=?, is_public=?, updated_at=?
      WHERE id=?
    `).run(name, category, level, icon, display_order, is_public, now(), id);
  } else {
    db.prepare(`
      INSERT INTO skills (name, category, level, icon, display_order, is_public, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, level, icon, display_order, is_public, now());
  }

  res.redirect('/admin/skills');
});

app.post('/admin/skills/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM skills WHERE id=?').run(req.params.id);
  res.redirect('/admin/skills');
});

// ==========================================
// MEDIA & FILE LIBRARY
// ==========================================

app.get('/admin/media', requireAdmin, (req, res) => {
  const files = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC, id DESC').all();
  res.render('admin-media', { files });
});

app.post('/admin/media/upload', requireAdmin, upload.single('media'), (req, res) => {
  if (!req.file) {
    const files = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC').all();
    return res.render('admin-media', { files, error: 'Tidak ada file yang dipilih.' });
  }

  const f = req.file;
  try {
    db.prepare(`
      INSERT INTO media_files (filename, original_name, mime_type, file_size, file_type, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(f.filename, f.originalname, f.mimetype, f.size, f.mimetype.split('/')[0], now());
  } catch (e) { /* ignore duplicate */ }

  const files = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC').all();
  res.render('admin-media', { files, success: `File "${f.originalname}" berhasil diupload.` });
});

app.post('/admin/media/delete', requireAdmin, (req, res) => {
  const filename = clean(req.body.filename);
  if (!filename) return res.redirect('/admin/media');

  // Check if file is used by any content
  const usedInProfile = db.prepare("SELECT id FROM profile WHERE cv_file=?").get(filename);
  const usedInArticle = db.prepare("SELECT id FROM articles WHERE cover=?").get(filename);
  const usedInProject = db.prepare("SELECT id FROM projects WHERE cover=? OR pdf_file=?").get(filename, filename);
  const usedInCert = db.prepare("SELECT id FROM certifications WHERE file=?").get(filename);

  if (usedInProfile || usedInArticle || usedInProject || usedInCert) {
    const files = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC').all();
    return res.render('admin-media', {
      files,
      error: 'File ini masih digunakan oleh konten lain. Hapus referensi terlebih dahulu.'
    });
  }

  // Delete from DB and filesystem
  db.prepare("DELETE FROM media_files WHERE filename=?").run(filename);
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
  }

  const files = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC').all();
  res.render('admin-media', { files, success: 'File berhasil dihapus.' });
});

// ==========================================
// SECTIONS & NAVIGATION
// ==========================================

app.get('/admin/sections', requireAdmin, (req, res) => {
  const navItems = db.prepare('SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC').all();
  const sections = db.prepare('SELECT * FROM site_sections ORDER BY display_order ASC, id ASC').all();
  const highlights = db.prepare('SELECT * FROM highlights ORDER BY display_order ASC, id ASC').all();
  res.render('admin-sections', { 
    navItems, 
    sections, 
    highlights, 
    success: req.query.success || null 
  });
});

app.post('/admin/sections/nav/update', requireAdmin, (req, res) => {
  const id = Number(req.body.id);
  const label = clean(req.body.label);
  const url = clean(req.body.url);
  const display_order = Number(req.body.display_order) || 0;
  const is_active = req.body.is_active !== undefined ? Number(req.body.is_active) : 1;

  db.prepare(`
    UPDATE navigation_items SET label=?, url=?, display_order=?, is_active=?, updated_at=?
    WHERE id=?
  `).run(label, url, display_order, is_active, now(), id);

  res.redirect('/admin/sections?success=nav');
});

app.post('/admin/sections/nav/add', requireAdmin, (req, res) => {
  const label = clean(req.body.label);
  const url = clean(req.body.url);
  const display_order = Number(req.body.display_order) || 0;

  db.prepare(`
    INSERT INTO navigation_items (label, url, display_order, is_active, updated_at)
    VALUES (?, ?, ?, 1, ?)
  `).run(label, url, display_order, now());

  res.redirect('/admin/sections?success=nav');
});

app.post('/admin/sections/update', requireAdmin, (req, res) => {
  const section_key = clean(req.body.section_key);
  const kicker = clean(req.body.kicker);
  const title = clean(req.body.title);
  const subtitle = clean(req.body.subtitle);
  const content = req.body.content !== undefined ? req.body.content.trim() : null;
  const display_order = Number(req.body.display_order) || 0;
  const is_visible = req.body.is_visible !== undefined ? Number(req.body.is_visible) : 1;

  db.prepare(`
    UPDATE site_sections SET kicker=?, title=?, subtitle=?, content=?, display_order=?, is_visible=?, updated_at=?
    WHERE section_key=?
  `).run(kicker, title, subtitle, content, display_order, is_visible, now(), section_key);

  res.redirect('/admin/sections?success=section');
});

// Highlights CRUD
app.post('/admin/highlights/save', requireAdmin, (req, res) => {
  const id = req.body.id ? Number(req.body.id) : null;
  const meta = clean(req.body.meta);
  const title = clean(req.body.title);
  const description = clean(req.body.description);
  const display_order = Number(req.body.display_order) || 0;

  if (id) {
    db.prepare('UPDATE highlights SET meta=?, title=?, description=?, display_order=? WHERE id=?')
      .run(meta, title, description, display_order, id);
  } else {
    db.prepare('INSERT INTO highlights (meta, title, description, display_order) VALUES (?, ?, ?, ?)')
      .run(meta, title, description, display_order);
  }

  res.redirect('/admin/sections?success=highlight');
});

app.post('/admin/highlights/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM highlights WHERE id=?').run(req.params.id);
  res.redirect('/admin/sections?success=highlight_deleted');
});

// ==========================================
// SEO & WEBSITE SETTINGS
// ==========================================

app.get('/admin/settings', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.render('admin-settings', { settings });
});

app.post('/admin/settings/save', requireAdmin, (req, res) => {
  const keys = [
    'site_title', 'site_tagline', 'meta_description', 'site_url',
    'google_analytics_id', 'google_site_verification',
    'contact_phone', 'contact_email', 'contact_location',
    'linkedin_url', 'portfolio_url',
    'enable_sitemap', 'enable_robots', 'allow_public_downloads'
  ];

  const upsert = db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
  `);

  const saveAll = db.transaction(() => {
    keys.forEach(k => {
      const val = clean(req.body[k]);
      upsert.run(k, val, now());
    });
  });

  saveAll();

  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.render('admin-settings', { settings, success: 'Pengaturan berhasil disimpan.' });
});

// ==========================================
// ACCOUNT, SECURITY & BACKUP
// ==========================================

const backupDir = path.join(root, 'backups');
fs.mkdirSync(backupDir, { recursive: true });

app.get('/admin/security', requireAdmin, (req, res) => {
  // Get admin username
  let adminUser = 'admin';
  try {
    const admin = db.prepare('SELECT username FROM admins LIMIT 1').get();
    if (admin) adminUser = admin.username;
  } catch (e) { /* admins table may not exist */ }

  // Get backup files
  let backups = [];
  try {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
    backups = files.map(f => {
      const stat = fs.statSync(path.join(backupDir, f));
      return { filename: f, size: stat.size, mtime: stat.mtime };
    }).sort((a, b) => b.mtime - a.mtime);
  } catch (e) { /* ignore */ }

  res.render('admin-security', { adminUser, backups });
});

app.post('/admin/security/password', requireAdmin, (req, res) => {
  const crypto = require('crypto');
  const username = clean(req.body.username);
  const currentPassword = clean(req.body.current_password);
  const newPassword = clean(req.body.new_password);
  const confirmPassword = clean(req.body.confirm_password);

  if (newPassword !== confirmPassword) {
    let adminUser = username;
    let backups = [];
    try {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
      backups = files.map(f => {
        const stat = fs.statSync(path.join(backupDir, f));
        return { filename: f, size: stat.size, mtime: stat.mtime };
      }).sort((a, b) => b.mtime - a.mtime);
    } catch (e) {}
    return res.render('admin-security', {
      adminUser, backups,
      error: 'Password baru dan konfirmasi tidak cocok.'
    });
  }

  if (newPassword.length < 6) {
    let adminUser = username;
    let backups = [];
    try {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
      backups = files.map(f => {
        const stat = fs.statSync(path.join(backupDir, f));
        return { filename: f, size: stat.size, mtime: stat.mtime };
      }).sort((a, b) => b.mtime - a.mtime);
    } catch (e) {}
    return res.render('admin-security', {
      adminUser, backups,
      error: 'Password baru minimal 6 karakter.'
    });
  }

  // Verify current password
  let verified = false;
  try {
    const admin = db.prepare('SELECT * FROM admins LIMIT 1').get();
    if (admin && admin.password_hash) {
      const parts = admin.password_hash.split(':');
      if (parts.length === 2) {
        const salt = Buffer.from(parts[0], 'hex');
        const storedHash = parts[1];
        const derivedKey = crypto.scryptSync(currentPassword, salt, 64).toString('hex');
        if (derivedKey === storedHash) verified = true;
      }
    }
  } catch (e) {}

  // Fallback: check .env password
  if (!verified) {
    const expectedPass = process.env.ADMIN_PASSWORD || 'change-this-password';
    if (currentPassword === expectedPass) verified = true;
  }

  if (!verified) {
    let backups = [];
    try {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
      backups = files.map(f => {
        const stat = fs.statSync(path.join(backupDir, f));
        return { filename: f, size: stat.size, mtime: stat.mtime };
      }).sort((a, b) => b.mtime - a.mtime);
    } catch (e) {}
    return res.render('admin-security', {
      adminUser: username, backups,
      error: 'Password saat ini tidak valid.'
    });
  }

  // Update password with scrypt
  const salt = crypto.randomBytes(32);
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  const passwordHash = salt.toString('hex') + ':' + hash;

  try {
    db.prepare('UPDATE admins SET username=?, password_hash=?, updated_at=? WHERE id=1').run(username, passwordHash, now());
  } catch (e) {
    // If admins table doesn't exist, create it
    db.exec(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )`);
    db.prepare(`INSERT OR REPLACE INTO admins (id, username, password_hash, created_at, updated_at)
      VALUES (1, ?, ?, ?, ?)`).run(username, passwordHash, now(), now());
  }

  let backups = [];
  try {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
    backups = files.map(f => {
      const stat = fs.statSync(path.join(backupDir, f));
      return { filename: f, size: stat.size, mtime: stat.mtime };
    }).sort((a, b) => b.mtime - a.mtime);
  } catch (e) {}

  res.render('admin-security', {
    adminUser: username, backups,
    success: 'Kredensial admin berhasil diperbarui. Gunakan password baru saat login berikutnya.'
  });
});

app.post('/admin/security/backup/create', requireAdmin, (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace('T', '_').slice(0, 15);
  const backupName = `site_backup_${timestamp}.db`;
  const srcPath = path.join(dataDir, 'site.db');
  const destPath = path.join(backupDir, backupName);

  try {
    fs.copyFileSync(srcPath, destPath);
  } catch (e) {
    // Try using SQLite backup API
    const backupDb = new Database(destPath);
    db.backup(destPath).then(() => {}).catch(() => {});
  }

  res.redirect('/admin/security');
});

app.get('/admin/security/backup/download', requireAdmin, (req, res) => {
  const dbPath = path.join(dataDir, 'site.db');
  if (!fs.existsSync(dbPath)) return res.status(404).send('Database tidak ditemukan.');
  res.download(dbPath, 'site.db');
});

app.get('/admin/security/backup/download/:filename', requireAdmin, (req, res) => {
  const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '');
  const filePath = path.join(backupDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Backup file tidak ditemukan.');
  res.download(filePath, filename);
});

// ==========================================
// 404 CATCH-ALL
// ==========================================
app.use((req, res) => {
  res.status(404).render('404');
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running at ${SITE_URL}`);
});
