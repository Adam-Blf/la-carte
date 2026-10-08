// Moteur d'animation déterministe : tout est fonction du temps t (secondes).
// Aucune horloge interne, aucun état accumulé : n'importe quelle image peut
// être calculée dans n'importe quel ordre, ce qui permet le rendu parallèle
// et le sur-échantillonnage temporel (flou de mouvement).

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const prog = (t, a, b) => clamp(invLerp(a, b, t));
export const remap = (v, a, b, c, d) => lerp(c, d, invLerp(a, b, v));
export const smoothstep = (a, b, v) => {
  const x = prog(v, a, b);
  return x * x * (3 - 2 * x);
};

// ---------------------------------------------------------------- easings
const PI = Math.PI;
export const E = {
  linear: (x) => x,
  inQuad: (x) => x * x,
  outQuad: (x) => 1 - (1 - x) * (1 - x),
  inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inQuart: (x) => x * x * x * x,
  outQuart: (x) => 1 - Math.pow(1 - x, 4),
  inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  inQuint: (x) => x ** 5,
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
  outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) =>
    x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inSine: (x) => 1 - Math.cos((x * PI) / 2),
  outSine: (x) => Math.sin((x * PI) / 2),
  inOutSine: (x) => -(Math.cos(PI * x) - 1) / 2,
  inCirc: (x) => 1 - Math.sqrt(1 - x * x),
  outCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
  inBack: (x, s = 1.70158) => (s + 1) * x * x * x - s * x * x,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  inOutBack: (x, s = 1.70158 * 1.525) =>
    x < 0.5
      ? (Math.pow(2 * x, 2) * ((s + 1) * 2 * x - s)) / 2
      : (Math.pow(2 * x - 2, 2) * ((s + 1) * (x * 2 - 2) + s) + 2) / 2,
  outElastic: (x) =>
    x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * PI) / 3)) + 1,
  outBounce: (x) => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  },
};

// Courbe de Bézier cubique (comme en CSS), résolue par Newton + dichotomie.
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (x > v) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
// Courbes « maison » : attaque franche, fin très douce (typo qui claque).
E.snap = bezier(0.2, 0.9, 0.1, 1);
E.swift = bezier(0.65, 0, 0.35, 1);
E.brand = bezier(0.4, 0, 0.2, 1); // --motion-easing du site

// Ressort amorti (réponse indicielle) : 0 -> 1 avec dépassement.
// f = fréquence propre en Hz, z = taux d'amortissement (0 < z < 1).
export function spring(t, f = 2.2, z = 0.42) {
  if (t <= 0) return 0;
  const w = 2 * PI * f;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
}
// Vitesse du ressort (dérivée exacte), utile pour déduire squash & stretch.
export function springV(t, f = 2.2, z = 0.42) {
  if (t <= 0) return 0;
  const w = 2 * PI * f;
  const wd = w * Math.sqrt(1 - z * z);
  return ((w * w) / wd) * Math.exp(-z * w * t) * Math.sin(wd * t);
}
// Ressort déclenché à t0, interpolé entre a et b.
export const springTo = (t, t0, a, b, f, z) => lerp(a, b, spring(t - t0, f, z));

// Oscillation amortie autour de 0 (vibration, secousse, rebond d'impact).
export function wobble(t, f = 6, decay = 6) {
  if (t <= 0) return 0;
  return Math.sin(2 * PI * f * t) * Math.exp(-decay * t);
}

// Interpolation par segment : tw(t, t0, t1, a, b, ease)
export function tw(t, t0, t1, a, b, ease = E.outCubic) {
  if (t <= t0) return a;
  if (t >= t1) return b;
  return lerp(a, b, ease((t - t0) / (t1 - t0)));
}

// Piste de keyframes : [[t, v], [t, v, ease], ...]. L'ease d'une clé
// s'applique au segment qui y arrive. Valeurs numériques ou tableaux.
export function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease = E.inOutCubic] = keys[i];
    if (t < t1) {
      const [t0, v0] = keys[i - 1];
      const p = ease((t - t0) / (t1 - t0));
      if (Array.isArray(v0)) return v0.map((a, j) => lerp(a, v1[j], p));
      return lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}

// Enveloppe d'impulsion : montée linéaire puis décroissance exponentielle.
export function pulse(t, t0, attack = 0.01, decay = 0.2) {
  const d = t - t0;
  if (d < 0) return 0;
  if (d < attack) return d / attack;
  return Math.exp(-(d - attack) / decay);
}

// ---------------------------------------------------------------- hasard
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash1(i, seed) {
  let h = (i * 374761393 + seed * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}
// Bruit de valeur 1D lissé, dans [-1, 1].
export function noise1(x, seed = 1) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash1(i, seed), hash1(i + 1, seed), u);
}

// ---------------------------------------------------------------- couleurs
export function hex2rgb(h) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
export function mixColor(a, b, p) {
  const A = hex2rgb(a), B = hex2rgb(b);
  const c = A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
export function rgba(h, a) {
  const [r, g, b] = hex2rgb(h);
  return `rgba(${r},${g},${b},${a})`;
}

// Palette relevée sur bacchana.beloucif.com (tokens.css).
export const C = {
  cream: '#FFF9F0',
  cream2: '#F3E9DC',
  surface: '#FFFDF8',
  ink: '#2A1140',
  ink2: '#4A2470',
  inkMuted: '#6B4A8C',
  purple: '#5B2C87',
  purpleDeep: '#4C2371',
  purpleSoft: '#7E49AE',
  lilac: '#DCCFEA',
  night: '#150A20',
  yellow: '#FFD029',
  amber: '#FFB020',
  butter: '#FFE07A',
  gold: '#E8B81C',
  orange: '#FF5C00',
  black: '#111111',
  red: '#A3202F',
  green: '#1B6B45',
};

// ---------------------------------------------------------------- DOM
export function el(tag, attrs = {}, ...children) {
  const svgTags = /^(svg|g|path|rect|circle|ellipse|line|polyline|polygon|text|defs|clipPath|mask|use|linearGradient|stop|tspan)$/;
  const node = svgTags.test(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'class') node.setAttribute('class', v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

// Construit un élément à partir d'un fragment HTML/SVG.
export function frag(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Applique une transformation 2D/3D. Toutes les clés sont optionnelles.
export function T(node, o) {
  if (!node) return;
  let s = '';
  if (o.x || o.y) s += `translate(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px) `;
  if (o.z) s += `translateZ(${o.z.toFixed(2)}px) `;
  if (o.r) s += `rotate(${o.r.toFixed(3)}deg) `;
  if (o.rx) s += `rotateX(${o.rx.toFixed(3)}deg) `;
  if (o.ry) s += `rotateY(${o.ry.toFixed(3)}deg) `;
  if (o.skx) s += `skewX(${o.skx.toFixed(3)}deg) `;
  const sx = o.sx ?? o.s ?? 1, sy = o.sy ?? o.s ?? 1;
  if (sx !== 1 || sy !== 1) s += `scale(${sx.toFixed(4)},${sy.toFixed(4)}) `;
  node.style.transform = s || 'none';
  if (o.o !== undefined) node.style.opacity = clamp(o.o).toFixed(4);
}
export const show = (node, v) => {
  if (node) node.style.visibility = v ? 'visible' : 'hidden';
};
export const op = (node, v) => {
  if (node) node.style.opacity = clamp(v).toFixed(4);
};

// Découpe un texte en caractères (inline-block) pour l'animer lettre à lettre.
export function splitChars(node, text) {
  node.textContent = '';
  const chars = [];
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch === ' ' ? ' ' : ch;
    node.appendChild(s);
    chars.push(s);
  }
  return chars;
}
export function splitWords(node, text) {
  node.textContent = '';
  const words = [];
  text.split(' ').forEach((w, i, arr) => {
    const outer = document.createElement('span');
    outer.className = 'wmask';
    const inner = document.createElement('span');
    inner.className = 'w';
    inner.textContent = w;
    outer.appendChild(inner);
    node.appendChild(outer);
    if (i < arr.length - 1) node.appendChild(document.createTextNode(' '));
    words.push(inner);
  });
  return words;
}
