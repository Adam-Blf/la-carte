// Captures ponctuelles pour la relecture : node tools/snap.mjs 0.5 2.1 8.0 ...
// Option --sheet : planche contact de toutes les captures.
import path from 'node:path';
import fs from 'node:fs';
import { serve } from './serve.mjs';
import { launch } from './browser.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const sheet = args.includes('--sheet');
const outDir = path.join(root, 'out', 'snaps');
fs.mkdirSync(outDir, { recursive: true });
let times = args.filter((a) => !a.startsWith('--')).map(Number);
const range = args.find((a) => a.startsWith('--range='));
if (range) {
  const [a, b, step] = range.slice(8).split(':').map(Number);
  for (let t = a; t <= b + 1e-9; t += step) times.push(+t.toFixed(4));
}

const { server, port } = await serve(root);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('console', m.text()));
await page.goto(`http://127.0.0.1:${port}/index.html?render`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const files = [];
for (const t of times) {
  await page.evaluate((t) => window.renderAt(t), t);
  const f = path.join(outDir, `t${t.toFixed(3).padStart(7, '0')}.png`);
  await page.screenshot({ path: f });
  files.push({ t, f });
}
if (sheet) {
  const cols = Math.min(4, files.length);
  const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},480px);gap:4px">${files
    .map(({ t, f }) => `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:480px;display:block"><span style="position:absolute;left:4px;top:2px;color:#fff;font:bold 14px monospace;text-shadow:0 0 3px #000">${t.toFixed(2)}</span></div>`)
    .join('')}</body></html>`;
  const rows = Math.ceil(files.length / cols);
  await page.setViewportSize({ width: cols * 484, height: rows * 274 });
  await page.setContent(html);
  const sf = path.join(outDir, `sheet-${times[0].toFixed(2)}-${times[times.length - 1].toFixed(2)}.png`);
  await page.screenshot({ path: sf, fullPage: true });
  console.log(sf);
} else files.forEach(({ f }) => console.log(f));
await browser.close();
server.close();
