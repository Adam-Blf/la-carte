import { el, T, noise1, clamp } from './engine.js';
import { DURATION, FPS, MUSIC, BPM } from './timeline.js';
import { SCENES } from './scenes/index.js';

let camera, flash;
let SHAKES = [], FLASHES = [];

export function buildFilm(stage) {
  camera = stage.querySelector('#camera');
  SCENES.forEach((s, i) => {
    s.root = el('section', { class: 'scene', 'data-id': s.id, style: { zIndex: String(s.z ?? i + 1) } });
    camera.appendChild(s.root);
    s.build(s.root);
    s._on = false;
  });
  flash = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', pointerEvents: 'none', zIndex: '999', opacity: '0' } });
  stage.appendChild(flash);
  SHAKES = SCENES.flatMap((s) => s.fx?.shakes || []);
  FLASHES = SCENES.flatMap((s) => s.fx?.flashes || []);
}

// Secousse caméra : somme de bruits lissés à enveloppe exponentielle.
function shakeAt(t) {
  let x = 0, y = 0, r = 0;
  SHAKES.forEach((s, i) => {
    const age = t - s.t;
    if (age < 0 || age > 1.6) return;
    const env = (s.amp ?? 16) * Math.exp(-age / (s.decay ?? 0.2));
    const f = s.freq ?? 26;
    x += noise1(age * f, 11 + i * 7) * env;
    y += noise1(age * f, 29 + i * 7) * env;
    r += noise1(age * f * 0.6, 47 + i * 7) * env * (s.rot ?? 0.035);
  });
  return { x, y, r };
}

export function renderAt(t) {
  for (const s of SCENES) {
    const on = t >= s.start - (s.pre || 0) && t < s.end + (s.post || 0);
    if (on !== s._on) {
      s.root.style.display = on ? 'block' : 'none';
      s._on = on;
    }
    if (on) s.update(t - s.start, t);
  }
  const sh = shakeAt(t);
  T(camera, { x: sh.x, y: sh.y, r: sh.r });
  let a = 0, col = '#FFF9F0';
  for (const f of FLASHES) {
    const age = t - f.t;
    if (age < 0 || age > f.dur) continue;
    const v = (f.a ?? 0.5) * Math.pow(1 - age / f.dur, 2);
    if (v > a) {
      a = v;
      col = f.color || col;
    }
  }
  flash.style.opacity = clamp(a).toFixed(4);
  flash.style.background = col;
}

// Liste des évènements sonores (exportée pour la synthèse audio).
export function collectCues() {
  const sfx = SCENES.flatMap((s) => (typeof s.sfx === 'function' ? s.sfx() : s.sfx || []));
  sfx.sort((a, b) => a.t - b.t);
  return { bpm: BPM, fps: FPS, duration: DURATION, music: MUSIC, sfx };
}

export { DURATION, FPS };
