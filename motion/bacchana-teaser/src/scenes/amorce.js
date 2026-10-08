// 0:00 - 0:04 - L'amorce : l'écran de chargement du site, rejoué comme
// l'enseigne d'un bar qu'on allume. Puis l'éclat traverse l'écran.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, mixColor, splitChars } from '../engine.js';
import { DotGrid, makeStar } from '../components.js';
import { CUTS, BEAT } from '../timeline.js';
import { W, CX, pick } from '../format.js';

// Centre de l'éclat, et décalage vertical de l'ensemble en 9:16.
const SY = pick(400, 760), DY = SY - 400;

const [start, end] = CUTS.amorce;
const TEXT = 'ON OUVRE LA MAISON';
const TYPE0 = 0.5, TYPE_DT = 0.062;
const STAR_IN = 2.0;
const ZOOM0 = 3.62;

let grid, starWrap, label, chars, cursor, dots;

// Allumage des néons : niveaux tenus (pas d'interpolation), façon starter.
const LIGHTS = [[0, 0], [2.5, 0.75], [2.55, 0.05], [2.62, 0.55], [2.66, 0.12], [2.74, 0.9], [2.78, 0.35], [2.84, 1]];
function lights(t) {
  let v = 0;
  for (const [k, lv] of LIGHTS) if (t >= k) v = lv;
  return v;
}

export default {
  id: 'amorce',
  start,
  end,
  build(root) {
    grid = new DotGrid(root, { bg: C.night, dot: C.cream, alpha: 0.09 });
    starWrap = el('div', { class: 'abs', style: { left: `${CX - 95}px`, top: `${SY - 95}px`, width: '190px', height: '190px' } });
    starWrap.appendChild(makeStar(190));
    label = el('div', { class: 'abs mono', style: { left: '0px', top: `${548 + DY}px`, width: `${W}px`, textAlign: 'center', fontSize: '34px', color: C.cream, fontWeight: 400 } });
    chars = splitChars(label, TEXT);
    cursor = el('div', { class: 'abs', style: { left: '0px', top: `${553 + DY}px`, width: '22px', height: '36px', background: C.yellow } });
    const row = el('div', { class: 'abs', style: { left: '0px', top: `${640 + DY}px`, width: `${W}px`, display: 'flex', justifyContent: 'center', gap: '20px' } });
    dots = [];
    for (let i = 0; i < 5; i++) {
      const b = el('div', { style: { width: '16px', height: '16px', borderRadius: '50%', background: C.cream } });
      row.appendChild(b);
      dots.push(b);
    }
    root.append(label, cursor, row, starWrap);
  },
  update(t) {
    const lv = lights(t);
    const exit = E.inCubic(prog(t, 3.2, 3.55));
    grid.draw(t, {
      bg: mixColor(C.night, C.purple, lv),
      alpha: 0.09 * lv,
      ripples: [{ x: CX, y: SY, t0: 2.84, speed: 1500, amp: 2.2, width: 55, decay: 1.3 }],
      pump: 0.25 * pulse(t, 3.0, 0.01, 0.2) + 0.25 * pulse(t, 3.5, 0.01, 0.2),
    });

    // Frappe du texte, curseur jaune qui clignote à la croche.
    const n = Math.floor((t - TYPE0) / TYPE_DT) + 1;
    chars.forEach((ch, i) => op(ch, i < n ? 1 : 0));
    const typing = t > TYPE0 && n <= chars.length;
    const blink = Math.floor(t / (BEAT / 2)) % 2 === 0;
    // Le curseur se cale après la dernière lettre tapée (positions mesurées
    // une fois, la mise en page du texte ne bouge pas).
    if (!chars.pos) chars.pos = chars.map((c) => c.offsetLeft + c.offsetWidth);
    const k = clamp(n, 0, chars.length);
    const cx = k > 0 ? chars.pos[k - 1] + 10 : chars.pos[0] - chars[0].offsetWidth;
    op(cursor, 0); // pas de curseur de terminal (cliché)
    T(cursor, { x: cx, y: exit * 26 });
    T(label, { y: exit * 26, o: 1 - exit });

    // Les 5 points : s'allument sur les croches puis ondulent comme sur le site.
    dots.forEach((b, i) => {
      const on = i * BEAT * 0.5;
      if (t < on) return op(b, 0);
      const pop = spring(t - on, 3.2, 0.4);
      const ph = (t - 0.125 * i) / (2 * BEAT);
      const wave = 0.15 + 0.85 * (0.5 - 0.5 * Math.cos(2 * Math.PI * ph));
      const o = t < 1.25 ? Math.max(wave, 1 - prog(t, on, on + 0.3)) : wave;
      T(b, { s: pop, y: exit * 26, o: o * (1 - exit) });
    });

    // L'éclat : entrée en ressort, pulsation sur chaque temps, puis zoom à travers.
    if (t < STAR_IN) return op(starWrap, 0);
    let s = spring(t - STAR_IN, 2.6, 0.36);
    let r = lerp(-140, 0, E.outBack(prog(t, STAR_IN, STAR_IN + 0.5), 1.4));
    for (const bt of [2.5, 3.0, 3.5]) s *= 1 + 0.16 * pulse(t, bt, 0.012, 0.14);
    let x = 0, y = 0;
    if (t > 3.5) {
      const a = E.outCubic(prog(t, 3.5, ZOOM0));
      s *= lerp(1, 0.78, a);
      r -= 18 * a;
    }
    if (t > ZOOM0) {
      const z = prog(t, ZOOM0, end);
      s *= lerp(1, 70, E.inExpo(z));
      r += 110 * E.inCubic(z);
      y = pick(140, 200) * E.inOutCubic(z);
    }
    T(starWrap, { x, y, s, r, o: 1 });
  },
  sfx: () => {
    const out = [];
    for (let i = 0; i < 5; i++) out.push({ t: i * 0.25, id: 'blip', g: 0.35, p: (i - 2) * 0.25, note: 84 + [0, 3, 5, 7, 10][i] });
    for (let i = 0; i < TEXT.length; i++) if (TEXT[i] !== ' ') out.push({ t: TYPE0 + i * TYPE_DT, id: 'type', g: 0.22, p: (i / TEXT.length - 0.5) * 0.6 });
    out.push({ t: STAR_IN, id: 'pop', g: 0.7, note: 79 });
    out.push({ t: 2.5, id: 'neon', g: 0.5 });
    out.push({ t: ZOOM0 - 0.12, id: 'whooshUp', g: 0.8, dur: 0.5 });
    return out;
  },
};
