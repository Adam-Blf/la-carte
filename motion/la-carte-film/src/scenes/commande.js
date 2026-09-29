// Barre de commande (CommandBar.tsx), fixe en bas de l'écran de 0:07 à 0:26.
// Les prix choisis s'y envolent ; son message suit l'état de la commande,
// puis le bouton devient « L'addition, s'il vous plaît » et on le touche.
import { E, el, T, op, prog, clamp, lerp, spring, wobble } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { L } from '../brand.js';
import { box, tapRing } from '../components.js';
import { TAPS, FLY } from './carte.js';
import { SLOTS } from './carnet.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.commande;
export const BAR = pick({ x: CX - 520, y: 930, w: 1040, h: 108 }, { x: 50, y: 1500, w: 980, h: 124 });
const BW = pick(430, 420), BH = BAR.h - 30;
export const BILL = 25.0; // on demande l'addition
export const BTN = { x: BAR.x + BAR.w - 15 - BW / 2, y: BAR.y + BAR.h / 2 };
const ARRIVE = TAPS.map((t) => t + 0.85);
const HINTS = [
  [ARRIVE[0], 'Il manque un plat à votre menu'],
  [ARRIVE[1], 'Cochez vos disponibilités'],
  ...SLOTS.map((s, i) => [s.t + 0.1, `4 choix - ${i + 1} ${i ? 'créneaux' : 'créneau'}`]),
];
const READY = SLOTS[0].t + 0.1;

let bar, hints, btn, fillB, t1, t2, flights, ring;

export default {
  id: 'commande',
  start,
  end,
  z: 10,
  build(root) {
    bar = box(BAR.x, BAR.y, BAR.w, BAR.h, { background: 'rgba(246,240,226,0.97)', border: `1.5px solid ${L.line}`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(14,29,49,0.10)' });
    const mask = box(30, 0, BAR.w - BW - 60, BAR.h, { overflow: 'hidden' });
    hints = HINTS.map(([, text]) => {
      const h = el('div', { class: 'abs sc', style: { left: '0px', top: '0px', width: `${BAR.w - BW - 60}px`, height: `${BAR.h - 3}px`, display: 'flex', alignItems: 'center', fontSize: `${pick(24, 26)}px`, color: L.inkSoft, lineHeight: '1.2', letterSpacing: '0.2em' } }, text);
      mask.appendChild(h);
      return h;
    });
    btn = box(BAR.w - 15 - BW, 15 - 1.5, BW, BH, { border: `2px solid ${L.brass}`, boxSizing: 'border-box', overflow: 'hidden', transformOrigin: '50% 50%' });
    fillB = box(0, 0, BW, BH, { background: L.brass, transformOrigin: '0 50%' });
    const lab = (text, color) => el('div', { class: 'abs sc center', style: { left: '0px', top: '0px', width: `${BW}px`, height: `${BH - 4}px`, fontSize: `${pick(23, 24)}px`, color, letterSpacing: '0.2em', whiteSpace: 'nowrap' } }, text);
    t1 = lab('Compléter ma commande', L.brass);
    t2 = lab("L'addition, s'il vous plaît", L.paper);
    btn.append(fillB, t1, t2);
    bar.append(mask, btn);
    root.appendChild(bar);
    flights = FLY.map((f) => {
      const d = el('div', { class: 'abs body it', style: { left: '0px', top: '0px', fontSize: `${f.size}px`, color: L.brass, whiteSpace: 'nowrap', opacity: '0' } }, f.text);
      root.appendChild(d);
      return d;
    });
    // Largeurs des prix pour centrer l'envol (mesure scène affichée).
    const disp = root.style.display;
    root.style.display = 'block';
    flights.forEach((d) => (d._w = d.getBoundingClientRect().width));
    root.style.display = disp;
    ring = tapRing(root);
  },
  update(lt) {
    const t = lt + start;
    // Arrivée de la barre (ressort), petits sursauts à chaque prix reçu.
    const up = spring(t - (TAPS[0] + 0.45), 2.0, 0.6);
    const bump = ARRIVE.reduce((a, s) => a + wobble(t - s, 5, 7), 0) + SLOTS.reduce((a, s) => a + 0.5 * wobble(t - s.t - 0.05, 5, 8), 0);
    T(bar, { y: (1 - up) * (BAR.h + 180), s: 1 + 0.012 * bump });
    // Messages : l'ancien monte, le nouveau arrive par le bas.
    hints.forEach((h, i) => {
      const a = HINTS[i][0], b = HINTS[i + 1]?.[0] ?? 1e9;
      const pin = i === 0 ? 1 : E.inOutCubic(prog(t, a, a + 0.35));
      const pout = E.inOutCubic(prog(t, b, b + 0.35));
      T(h, { y: (1 - pin) * BAR.h * 0.8 - pout * BAR.h * 0.8, o: pin * (1 - pout) });
    });
    // Bouton : contour laiton, puis plein quand la commande est complète.
    const f = E.outCubic(prog(t, READY, READY + 0.4));
    T(fillB, { sx: Math.max(0.0001, f) });
    op(t1, 1 - prog(t, READY, READY + 0.2));
    op(t2, prog(t, READY + 0.15, READY + 0.4));
    const press = t > BILL ? 1 - 0.05 * Math.exp(-(t - BILL) * 8) * Math.sin(Math.min(Math.PI, (t - BILL) * 12)) : 1;
    T(btn, { s: press * (1 + 0.04 * wobble(t - READY, 4, 6)) });
    // Envols des prix, en arc vers le message de la barre.
    const barY = (1 - up) * (BAR.h + 180);
    flights.forEach((d, k) => {
      const f0 = FLY[k], a = TAPS[k] + 0.15, b = ARRIVE[k];
      if (t < a || t > b + 0.05) return op(d, 0);
      const p = E.inOutCubic(prog(t, a, b));
      const tx = BAR.x + 30 + 140, ty = BAR.y + BAR.h / 2 + barY;
      const cx = lerp(f0.x, tx, 0.5) + pick(60, 0), cy = Math.min(f0.y, ty) - pick(160, 220);
      const x = (1 - p) ** 2 * f0.x + 2 * (1 - p) * p * cx + p * p * tx;
      const y = (1 - p) ** 2 * f0.y + 2 * (1 - p) * p * cy + p * p * ty;
      T(d, { x: x - d._w / 2, y: y - f0.size * 0.62, s: lerp(1, 0.7, p), o: prog(t, a, a + 0.08) * (1 - prog(t, b - 0.15, b)) });
    });
    ring.set(BTN.x - pick(40, 30), BTN.y + 8, t - BILL);
  },
  sfx: () => [
    { t: TAPS[0] + 0.45, id: 'barUp', g: 0.3 },
    ...TAPS.map((t) => ({ t: t + 0.15, id: 'fly', g: 0.3, dur: 0.7 })),
    ...ARRIVE.map((t, i) => ({ t, id: 'land', g: 0.45, note: [81, 83, 86, 88][i] })),
    { t: READY, id: 'ready', g: 0.4 },
    { t: BILL - 0.2, id: 'approach', g: 0.18 },
    { t: BILL, id: 'tap', g: 0.65 },
  ],
};
