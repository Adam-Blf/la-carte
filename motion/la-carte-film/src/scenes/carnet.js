// 0:18 - 0:26 - Le carnet de réservations. La page défile, la grille 7 jours
// x 3 services se dresse, on coche cinq créneaux au rythme, puis on écrit le
// prénom au nom duquel la table sera dressée.
import { E, el, T, op, prog, clamp, lerp, spring, splitChars } from '../engine.js';
import { W, H, CX, pick, VERT } from '../format.js';
import { L } from '../brand.js';
import { box, reveal, tapRing, star } from '../components.js';
import { SCROLL } from './carte.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.carnet;
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const SERV = ['Midi', 'Après-midi', 'Soirée'];
export const SLOTS = [
  { d: 2, s: 2, t: 19.5 },
  { d: 4, s: 2, t: 20.0 },
  { d: 5, s: 1, t: 20.5 },
  { d: 5, s: 2, t: 21.0 },
  { d: 6, s: 0, t: 21.5 },
];
export const NAME = 'Camille';
const TYPE = 22.6;

const LT = pick({ x: 150, w: 620, numY: 196, numH: 300, numSize: 280, title: 520, tSize: 104, align: 'left' },
  { x: 60, w: 960, numY: 250, numH: 220, numSize: 196, title: 470, tSize: 90, align: 'center' });
const G = pick({ x: 830, y: 176, w: 960, dayW: 220, rowH: 90, cellPad: 7 }, { x: 40, y: 716, w: 1000, dayW: 250, rowH: 80, cellPad: 7 });
const NM = pick({ x: 150, y: 758, w: 560, align: 'left' }, { x: CX - 300, y: 1336, w: 600, align: 'center' });

let page, num, title, sub, heads, days, cells, label, underline, nameChars, ring;

export default {
  id: 'carnet',
  start,
  end,
  z: 2,
  build(root) {
    page = box(0, 0, W, H, { background: L.paper });
    root.appendChild(page);
    num = el('div', { class: 'abs up', style: { left: `${LT.x}px`, top: `${LT.numY}px`, width: `${LT.w}px`, height: `${LT.numH}px`, lineHeight: `${LT.numH}px`, fontSize: `${LT.numSize}px`, fontWeight: 300, color: L.brass, textAlign: LT.align } }, 'V');
    page.appendChild(num);
    title = reveal(page, { x: LT.x, y: LT.title, w: LT.w, text: 'Le carnet de réservations', cls: 'disp', size: LT.tSize, lh: 1.02, align: LT.align });
    if (!VERT) sub = reveal(page, { x: LT.x, y: 760, w: 580, text: 'Cochez tous les services où votre table pourrait être dressée.', cls: 'body it', size: 34, color: L.inkSoft, align: 'left', lh: 1.25 });
    const colW = (G.w - G.dayW) / 3;
    heads = SERV.map((s, i) => {
      const h = el('div', { class: 'abs sc', style: { left: `${G.x + G.dayW + i * colW}px`, top: `${G.y}px`, width: `${colW}px`, textAlign: 'center', fontSize: `${pick(24, 26)}px`, color: L.inkSoft, letterSpacing: '0.16em' } }, s);
      page.appendChild(h);
      return h;
    });
    days = DAYS.map((d, i) => {
      const h = el('div', { class: 'abs sc', style: { left: `${G.x}px`, top: `${G.y + 50 + i * G.rowH}px`, width: `${G.dayW}px`, height: `${G.rowH}px`, display: 'flex', alignItems: 'center', fontSize: `${pick(26, 28)}px`, color: L.inkSoft, letterSpacing: '0.16em' } }, d);
      page.appendChild(h);
      return h;
    });
    cells = DAYS.map((_, di) =>
      SERV.map((_, si) => {
        const x = G.x + G.dayW + si * colW + G.cellPad, y = G.y + 50 + di * G.rowH + G.cellPad;
        const w = colW - 2 * G.cellPad, h = G.rowH - 2 * G.cellPad;
        const c = box(x, y, w, h, { border: `1.5px solid ${L.line}`, boxSizing: 'border-box', transformOrigin: '50% 50%' });
        const f = box(x, y, w, h, { background: L.brass, transformOrigin: '50% 50%' });
        const s = star(30, L.paper);
        page.append(c, f, s);
        return { c, f, s, x, y, w, h };
      }),
    );
    label = reveal(page, { x: NM.x, y: NM.y, w: NM.w, text: 'La table sera dressée au nom de', cls: 'sc', size: pick(24, 26), color: L.inkSoft, align: NM.align });
    underline = box(NM.x, NM.y + pick(132, 118), NM.w, 2, { background: L.line, transformOrigin: NM.align === 'left' ? '0 50%' : '50% 50%' });
    const brassLine = box(0, 0, NM.w, 2, { background: L.brass, transformOrigin: '50% 50%' });
    underline.appendChild(brassLine);
    underline._b = brassLine;
    const nm = el('div', { class: 'abs disp', style: { left: `${NM.x}px`, top: `${NM.y + pick(40, 36)}px`, width: `${NM.w}px`, fontSize: `${pick(72, 70)}px`, color: L.ink, whiteSpace: 'nowrap', textAlign: NM.align } });
    nameChars = splitChars(nm, NAME);
    page.append(underline, nm);
    ring = tapRing(page);
  },
  update(lt) {
    const t = lt + start;
    const sc = E.inOutCubic(prog(t, SCROLL[0], SCROLL[1]));
    T(page, { y: (1 - sc) * H });
    title.update(t - 18.15, 0, 0.08, 0.9, 30);
    const subOut = prog(t, 22.0, 22.4);
    if (sub) sub.update(t - 18.5, subOut, 0.03, 0.8);
    heads.forEach((h, i) => op(h, E.app(prog(t, 18.35 + i * 0.06, 18.9 + i * 0.06))));
    days.forEach((d, i) => op(d, E.app(prog(t, 18.4 + i * 0.05, 18.9 + i * 0.05))));
    cells.forEach((row, di) =>
      row.forEach((c, si) => {
        const p = E.app(prog(t, 18.45 + di * 0.05 + si * 0.02, 18.9 + di * 0.05 + si * 0.02));
        T(c.c, { s: lerp(0.85, 1, p), o: p });
        const slot = SLOTS.find((s) => s.d === di && s.s === si);
        const on = slot ? t - slot.t : -1;
        const k = on > 0 ? spring(on, 3.2, 0.42) : 0;
        T(c.f, { s: Math.max(0.0001, lerp(0.5, 1, E.outCubic(prog(on, 0, 0.25)))), o: E.outCubic(prog(on, 0, 0.12)) });
        T(c.s, { x: c.x + c.w / 2 - 15, y: c.y + c.h / 2 - 15, s: Math.max(0.0001, lerp(0.4, 1, k)), o: prog(on, 0, 0.1) });
      }),
    );
    // Toucher : l'anneau suit le créneau en cours.
    let cur = SLOTS[0];
    for (const s of SLOTS) if (t > s.t - 0.26) cur = s;
    const c = cells[cur.d][cur.s];
    ring.set(c.x + c.w / 2 + 16, c.y + c.h / 2 + 12, t - cur.t);
    // Prénom : le champ prend le focus (filet laiton), les lettres arrivent.
    label.update(t - 22.2);
    T(underline, { sx: Math.max(0.0001, E.inOutCubic(prog(t, 22.2, 22.8))) });
    T(underline._b, { sx: Math.max(0.0001, E.inOutCubic(prog(t, 22.45, 22.9))) });
    nameChars.forEach((ch, i) => {
      const p = E.outCubic(prog(t, TYPE + i * 0.11, TYPE + i * 0.11 + 0.25));
      T(ch, { y: (1 - p) * 14, o: p });
    });
  },
  sfx: () => [
    ...SLOTS.flatMap((s, i) => [
      { t: s.t, id: 'tap', g: 0.5, p: VERT ? 0 : 0.35 },
      { t: s.t + 0.02, id: 'cell', g: 0.5, note: [69, 71, 74, 76, 78][i] },
    ]),
    ...NAME.split('').map((_, i) => ({ t: TYPE + i * 0.11, id: 'key', g: 0.3, p: -0.1 + (i % 3) * 0.1 })),
  ],
};
