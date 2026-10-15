# Muhammad Julda Al Hafiz — Editable CMS

Public personal HR portfolio + private admin dashboard. Visitor hanya dapat melihat konten publik; pemilik dapat login ke `/admin/login` untuk mengelola profile, CV, articles, projects, experience, certifications, dan education.

## Run
1. Install Node.js LTS.
2. `npm install`
3. Copy `.env.example` -> `.env`.
4. Ubah `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
5. `npm run dev`
6. Public: `http://localhost:3000`
7. Admin: `http://localhost:3000/admin/login`

## Google-ready article structure
Each published article has its own URL `/articles/<slug>`, is included in `sitemap.xml`, is allowed by `robots.txt`, and outputs Article JSON-LD. Google indexing/ranking is not guaranteed; after the real domain is live, connect Google Search Console and submit the sitemap.

## Production hardening
Before public deployment: password hashing/user table, CSRF protection, HTTPS/secure cookies, login rate limiting, strict file validation, persistent database, persistent/object media storage, rich text editor, preview, backups, and proper edit forms for every content type.
