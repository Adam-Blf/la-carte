// Rendu image par image : N navigateurs en parallèle, chacun calcule sa
// tranche d'images (renderAt(t) est déterministe), capture en PNG et pousse
// dans son ffmpeg. Flou de mouvement par sur-échantillonnage temporel :
// --sub 4 capture 4 instants par image sur un obturateur à 180°, moyennés
// par tmix. Puis concaténation et multiplexage avec la bande-son.
//
//   node tools/render.mjs [--sub 4] [--workers 4] [--from 0] [--to 56] [--out out/bacchana.mp4]
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { serve } from './serve.mjs';
import { launch } from './browser.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const FPS = 60;
const SUB = Number(arg('sub', 4));
const SHUTTER = Number(arg('shutter', 180));
const WORKERS = Number(arg('workers', Math.max(1, Math.min(4, os.cpus().length))));
const FROM = Number(arg('from', 0));
const TO = Number(arg('to', 56));
const OUT = path.resolve(root, arg('out', 'out/bacchana.mp4'));
const CRF = arg('crf', '17');
const FFMPEG = process.env.FFMPEG || findFfmpeg();
const VERT = process.argv.includes('--vertical');
const [VW, VH] = VERT ? [1080, 1920] : [1920, 1080];

function findFfmpeg() {
  for (const c of ['ffmpeg', '/tmp/claude-0/venv/lib/python3.11/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2']) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' });
      return c;
    } catch {}
  }
  try {
    return execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  } catch {
    throw new Error('ffmpeg introuvable : définir FFMPEG=/chemin/vers/ffmpeg (ou pip install imageio-ffmpeg)');
  }
}

const f0 = Math.round(FROM * FPS), f1 = Math.round(TO * FPS);
const total = f1 - f0;
const tmp = path.join(root, 'out', arg('tmp', VERT ? 'segments-v' : 'segments'));
fs.mkdirSync(tmp, { recursive: true });
const { server, port } = await serve(root);
const t0 = Date.now();
let done = 0;

async function worker(k, a, b) {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  page.on('pageerror', (e) => console.error(`[w${k}]`, e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?render${VERT ? '&v' : ''}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const cdp = await page.context().newCDPSession(page);
  const seg = path.join(tmp, `seg${String(k).padStart(2, '0')}.mkv`);
  // Moyenne dans l'espace RGB (avant conversion YUV), puis matrice BT.709.
  const vf = [...(SUB > 1 ? [`format=gbrp`, `tmix=frames=${SUB}`, `select='not(mod(n+1\\,${SUB}))'`] : []), `setpts=N/${FPS}/TB`, 'scale=out_color_matrix=bt709:out_range=tv'].join(',');
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'png', '-i', '-', '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'fast', '-qp', '4', '-pix_fmt', 'yuv444p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = (buf) => new Promise((ok) => (ff.stdin.write(buf) ? ok() : ff.stdin.once('drain', ok)));
  for (let f = a; f < b; f++) {
    for (let s = 0; s < SUB; s++) {
      const t = f / FPS + (SUB > 1 ? (s / SUB) * (SHUTTER / 360) / FPS : 0);
      await page.evaluate((t) => window.renderAt(t), t);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
      await write(Buffer.from(data, 'base64'));
    }
    done++;
    if (k === 0 && done % 30 === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r${done}/${total} images, ${(done / el).toFixed(1)} i/s, reste ~${Math.round((total - done) / (done / el))} s   `);
    }
  }
  ff.stdin.end();
  await new Promise((ok) => ff.on('close', ok));
  await browser.close();
  return seg;
}

const per = Math.ceil(total / WORKERS);
const segs = await Promise.all(Array.from({ length: WORKERS }, (_, k) => worker(k, f0 + k * per, Math.min(f1, f0 + (k + 1) * per))));
server.close();
console.log(`\nimages rendues en ${((Date.now() - t0) / 1000).toFixed(0)} s`);

const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
const wav = path.join(root, 'out', 'soundtrack.wav');
const audio = fs.existsSync(wav) ? ['-ss', String(FROM), '-t', String(TO - FROM), '-i', wav] : [];
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, ...audio,
  '-map', '0:v', ...(audio.length ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '256k'] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-movflags', '+faststart', '-shortest', OUT], { stdio: 'inherit' });
console.log(OUT);
