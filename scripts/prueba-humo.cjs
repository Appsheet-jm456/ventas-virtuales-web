// Prueba de humo de la web pública y el panel (14 nov 2026, antes de publicar HU-37 a HU-39).
// Recorre Inicio, catálogo con filtros, categorías, fichas, políticas, Nosotros y /admin en
// escritorio y celular: código HTTP, scroll horizontal y errores de consola; revisa que la API
// pública no entregue columnas privadas (RN-04).
// Uso: servidor en 3100 (PORT=3100 npm start) y, en una carpeta aparte con playwright instalado:
//   B=http://localhost:3100 node scripts/prueba-humo.cjs
// Ajustar executablePath si Chromium está en otra ruta.
const { chromium } = require('playwright');
const B = process.env.B || 'http://localhost:3100';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome' });
  const res = []; const ok = (n, c, d = '') => res.push([c ? 'OK ' : 'FAL', n, d]);
  // API pública: solo columnas permitidas (RN-04)
  const api = await (await fetch(B + '/api/products')).json();
  const rows = api.rows || api;
  const PERM = ["Código","Categoría","Descripción","Marca","Modelo","Procesador","Generación","RAM","Almacenamiento","Estado","Precio","Stock","Foto","Video","Ficha","Resumen","Título descripción","Descripción larga","Táctil","Precio antes"];
  const extra = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => !PERM.includes(k));
  ok('API pública sin columnas privadas', extra.length === 0, extra.join(','));
  ok('API pública con productos', rows.length > 0, rows.length + ' filas');
  for (const [w, h, tag] of [[1440, 900, 'pc'], [390, 844, 'cel']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(B + '/categorias', { waitUntil: 'networkidle' });
    const cats = await p.$$eval('a[href^="/productos?categoria="]', as => [...new Set(as.map(a => a.getAttribute('href')))]);
    const pols = await (async () => { await p.goto(B + '/', { waitUntil: 'networkidle' }); return p.$$eval('a[href^="/politicas/"]', as => [...new Set(as.map(a => a.getAttribute('href')))]); })();
    const urls = ['/', '/productos', '/categorias', '/nosotros', '/productos?ofertas=si', '/productos?estado=nuevo', '/productos?estado=usado', '/productos?marca=lenovo', '/productos?q=thinkpad', '/producto/BOD-027', '/producto/100-101-1010-7', '/producto/NO-EXISTE', ...cats, ...pols, '/admin', '/activar'];
    for (const u of urls) {
      errs.length = 0;
      const r = await p.goto(B + u, { waitUntil: 'networkidle' });
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      const st = r.status();
      const esperado = u === '/producto/NO-EXISTE' ? [200, 404] : [200];
      ok(`${tag} ${u}`, esperado.includes(st) && sw <= w && errs.length === 0, `http ${st}${sw > w ? ' scroll ' + sw : ''}${errs.length ? ' errores: ' + errs.join(' | ').slice(0, 160) : ''}`);
    }
    // menú y lateral
    await p.goto(B + '/', { waitUntil: 'networkidle' });
    ok(`${tag} menú: Ofertas/Nuevos/Usados`, await p.locator('.hd-nav a[href="/productos?ofertas=si"]').count() === 1 && await p.locator('.hd-nav a[href="/productos?estado=nuevo"]').count() === 1);
    ok(`${tag} sin Mayoristas/Soporte en menú`, await p.locator('.hd-nav', { hasText: 'Mayoristas' }).count() === 0);
    ok(`${tag} columna categorías`, (await p.locator('.cl').isVisible()) === (tag === 'pc'));
    ok(`${tag} ofertas destacadas`, await p.locator('.ofertas-sec .etq-desc').count() >= 1);
    await p.goto(B + '/admin', { waitUntil: 'networkidle' });
    ok(`${tag} /admin pide ingreso`, await p.locator('input[type="password"]').count() >= 1);
    await ctx.close();
  }
  await b.close();
  const fal = res.filter(r => r[0] === 'FAL');
  console.log(res.map(r => r.join(' ')).filter(l => l.startsWith('FAL') || l.includes('API')).join('\n'));
  console.log(`\n${res.length - fal.length}/${res.length} OK`);
})();
