import { E, el, frag, T, op, prog, clamp, lerp, mulberry32, splitWords } from './engine.js';
import { W, H } from './format.js';
import { O } from './brand.js';
import { SUN_C, SUN_R, DISK, RAYS } from './sun.js';

export { W, H };

// ------------------------------------------------------------------ couleurs
function hex(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
export function mix(a, b, p) {
  const A = hex(a), B = hex(b), q = clamp(p);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(',')})`;
}
// Mélange entre deux palettes (listes de couleurs de même longueur).
export const mixList = (A, B, p) => A.map((c, i) => mix(c, B[i], p));

// Ciel : dégradé vertical dont les arrêts évoluent au fil du temps.
export function sky(parent) {
  const d = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px` } });
  parent.appendChild(d);
  return {
    root: d,
    set(stops, angle = 180) {
      d.style.background = `linear-gradient(${angle}deg, ${stops.map((c, i) => `${c} ${Math.round((i / (stops.length - 1)) * 100)}%`).join(', ')})`;
    },
  };
}

// Soleil du logo : disque + rayons en flammes, animables séparément.
// size = diamètre du disque en px ; (cx, cy) = centre du disque à l'écran.
export function makeSun(parent, size) {
  const k = size / (2 * SUN_R);
  const box = 1500 * k;
  const svg = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="${box}" height="${box}" viewBox="0 0 1500 1500">
    <g class="rays"><path d="${RAYS}" fill="${O.ray}"/></g>
    <path class="disk" d="${DISK}" fill="${O.orange}"/></svg>`);
  parent.appendChild(svg);
  const rays = svg.querySelector('.rays'), disk = svg.querySelector('.disk');
  return {
    svg,
    set({ cx, cy, s = 1, raysS = 1, raysR = 0, raysO = 1, o = 1 }) {
      T(svg, { x: cx - SUN_C[0] * k, y: cy - SUN_C[1] * k, o });
      svg.style.transformOrigin = `${SUN_C[0] * k}px ${SUN_C[1] * k}px`;
      svg.style.transform += ` scale(${s.toFixed(4)})`;
      rays.setAttribute('transform', `translate(${SUN_C[0]} ${SUN_C[1]}) rotate(${raysR.toFixed(3)}) scale(${Math.max(0.0001, raysS).toFixed(4)}) translate(${-SUN_C[0]} ${-SUN_C[1]})`);
      rays.style.opacity = raysO;
    },
  };
}

// Texte qui apparaît mot par mot : montée douce + fondu, sans masque dur.
export function softText(parent, o) {
  const d = el('div', {
    class: `abs ${o.serif ? 'serif' : 'sans'}`,
    style: {
      left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, textAlign: o.align || 'center', fontSize: `${o.size}px`,
      color: o.color, fontStyle: o.italic ? 'italic' : 'normal', fontWeight: o.weight || (o.serif ? 500 : 400),
      lineHeight: o.lh || (o.serif ? 1.12 : 1.45), letterSpacing: o.track || '0',
    },
  });
  const words = splitWords(d, o.text);
  words.forEach((w) => (w.parentElement.style.overflow = 'visible'));
  parent.appendChild(d);
  return {
    root: d,
    update(t, out = 0, stagger = 0.09, dur = 0.9) {
      words.forEach((w, i) => {
        const p = E.outCubic(prog(t, i * stagger, i * stagger + dur));
        const q = E.inOutSine(prog(out, 0, 1));
        T(w, { y: (1 - p) * 26 - q * 14, o: p * (1 - q) });
      });
    },
  };
}

export function fxCanvas(parent) {
  const cv = el('canvas', { width: W, height: H, class: 'abs', style: { left: '0px', top: '0px', pointerEvents: 'none' } });
  parent.appendChild(cv);
  return cv.getContext('2d');
}

// Poussières de lumière qui dérivent lentement (position analytique).
export function motes(n, seed = 3) {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => ({ x: r() * W, y: r() * H, s: 1.5 + r() * 3.5, v: 8 + r() * 22, ph: r() * 6.28, a: 0.25 + r() * 0.5 }));
}
export function drawMotes(c, list, t, color, alpha = 1) {
  c.fillStyle = color;
  for (const m of list) {
    const y = ((m.y - m.v * t) % (H + 40) + H + 40) % (H + 40) - 20;
    const x = m.x + Math.sin(t * 0.6 + m.ph) * 18;
    c.globalAlpha = alpha * m.a * (0.6 + 0.4 * Math.sin(t * 1.3 + m.ph));
    c.beginPath();
    c.arc(x, y, m.s, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}
