// src/app.html ni bulutga ulab, dist/ papkasini yaratadi (Vercel shu skriptni ishlatadi).
const fs = require('fs');
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) { console.error('SUPABASE_URL va SUPABASE_ANON_KEY muhit o\'zgaruvchilari kerak'); process.exit(1); }
let html = fs.readFileSync('src/app.html', 'utf8');
const tail = /initCleanData\(\);(\s*<\/script>\s*<\/body>)/;
if (!tail.test(html) || !html.includes('</head>')) throw new Error('app.html tuzilishi kutilganidan farq qiladi');
const inject = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>\n' +
  '<script>window.BSB_CONFIG=' + JSON.stringify({ url, key }) + ';</script>\n<script src="cloud.js"></script>\n';
html = html.replace('</head>', () => inject + '<link rel="icon" href="favicon.ico">\n</head>');
html = html.replace(tail, (m, rest) =>
  'window.cloudReady.then(function(){ window.exitApp = window.BSBCloud.logout; initCleanData(); });' + rest);
fs.rmSync('dist', { recursive: true, force: true }); fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', html);
fs.copyFileSync('src/cloud.js', 'dist/cloud.js'); fs.copyFileSync('src/favicon.ico', 'dist/favicon.ico');
console.log('dist/ tayyor');
