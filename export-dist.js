const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const outDir = path.join(__dirname, 'dist');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    } else {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    }
  });
}

// Copy public assets & uploads
copyFolderSync(path.join(__dirname, 'public'), outDir);
copyFolderSync(path.join(__dirname, 'uploads'), path.join(outDir, 'uploads'));

// Netlify _redirects file
fs.writeFileSync(path.join(outDir, '_redirects'), '/*    /index.html   200\n');

// Load database to determine active public routes
const db = new Database(path.join(__dirname, 'data', 'site.db'));
const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
const projects = db.prepare('SELECT slug FROM projects WHERE is_public=1').all().map(p => '/projects/' + p.slug);
const articles = db.prepare("SELECT slug FROM articles WHERE status='published'").all().map(a => '/articles/' + a.slug);

const routes = [
  '/',
  '/about',
  '/experience',
  '/projects',
  '/articles',
  '/certifications',
  '/contact',
  '/robots.txt',
  '/sitemap.xml',
  ...projects,
  ...articles
];

// Include CV route if show_cv is enabled and cv_file exists
if (profile && profile.show_cv == 1 && profile.cv_file) {
  routes.push('/cv');
}

console.log(`Starting export for Netlify (${routes.length} routes)...`);

// Query running server
function fetchRoute(route) {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000' + route, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect or ignore
        res.resume();
        return resolve();
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let dest;
        if (route === '/') {
          dest = path.join(outDir, 'index.html');
        } else if (route.endsWith('.txt') || route.endsWith('.xml')) {
          dest = path.join(outDir, route.replace('/', ''));
        } else {
          const subDir = path.join(outDir, route.slice(1));
          fs.mkdirSync(subDir, { recursive: true });
          dest = path.join(subDir, 'index.html');
        }
        fs.writeFileSync(dest, data);
        resolve();
      });
    });
    req.on('error', reject);
  });
}

(async () => {
  try {
    for (const r of routes) {
      await fetchRoute(r);
      console.log(`✓ Exported: ${r}`);
    }
    console.log('\n🎉 Export selesai! Folder dist/ siap diunggah ke Netlify (https://app.netlify.com/drop).');
  } catch (err) {
    console.error('\n⚠️ Gagal export. Pastikan server lokal sudah menyala ("npm start" atau "node server.js") sebelum menjalankan "npm run build".');
    console.error('Error detail:', err.message);
  }
})();
