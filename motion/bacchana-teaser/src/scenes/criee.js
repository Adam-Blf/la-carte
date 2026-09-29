// 0:36 - 0:38 - La criée. Entrée en persiennes, les enchères montent en
// bulles sur les croches, puis « TU MENS ! » explose et avale l'écran.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, wobble } from '../engine.js';
import { DotGrid, titleBlock, bubble } from '../components.js';
import { CUTS } from '../timeline.js';
import { VL, chrome, typedLabel } from '../vignette.js';
import { W, H, pick } from '../format.js';

const [start, end] = CUTS.criee; // 36 -> 38
const POS = pick([[1060, 170], [1480, 230], [1110, 590], [1500, 650]], [[90, 790], [720, 850], [130, 1130], [690, 1190]]);
const BIDS = [
  { txt: '3 !', name: 'LÉA', x: POS[0][0], y: POS[0][1], w: 250, h: 170, bg: C.yellow, tail: 'bl', t: 0.25 },
  { txt: '5 !', name: 'HUGO', x: POS[1][0], y: POS[1][1], w: 260, h: 170, bg: C.butter, tail: 'br', t: 0.5 },
  { txt: '8 !', name: 'INÈS', x: POS[2][0], y: POS[2][1], w: 260, h: 170, bg: C.amber, tail: 'bl', t: 0.75 },
  { txt: '12 !', name: 'MALIK', x: POS[3][0], y: POS[3][1], w: 300, h: 170, bg: C.cream2, tail: 'br', t: 1.0 },
];
const LIE = 1.25;
const LIE_C = pick([1350, 520], [540, 1080]);

let grid, title, label, ch, bids, lie;

export default {
  id: 'criee',
  start,
  end,
  pre: 0.25,
  build(root) {
    grid = new DotGrid(root, { bg: C.cream, dot: C.ink, alpha: 0.1 });
    label = typedLabel(root, { x: VL.lx, y: VL.ly + pick(40, 0), text: 'ON ENCHAÎNE AVEC', color: C.purple, size: 28 });
    title = titleBlock(root, { x: VL.tx, y: VL.ty + pick(40, 0), width: VL.tw, lines: ['LA CRIÉE'], size: pick(200, 170), color: C.ink, tag: 'Surenchéris… ou crie « tu mens ! »', tagColor: C.ink2, tagSize: 44, tagGap: 30 });
    bids = BIDS.map((b) => {
      const n = bubble(root, { x: b.x, y: b.y, w: b.w, h: b.h, text: b.txt, bg: b.bg, tail: b.tail, size: 120, name: b.name });
      return n;
    });
    lie = bubble(root, { x: LIE_C[0] - 500, y: LIE_C[1] - 170, w: 1000, h: 340, text: 'TU MENS !', bg: C.purple, ink: C.cream, tail: 'bl', size: 220, r: 60, off: 18, stroke: 10 });
    lie.style.transformOrigin = '50% 50%';
    ch = chrome(root, { n: 7, color: C.ink });
  },
  update(lt, t) {
    // Entrée en persiennes : 6 bandes arrivent de la droite en cascade.
    if (lt < 0.02) {
      const bh = H / 6;
      const pts = [`${W + 70}px -10px`];
      for (let k = 0; k < 6; k++) {
        const x = W * (1 - E.outCubic(prog(lt, -0.25 + k * 0.025, -0.05 + k * 0.025)));
        pts.push(`${x.toFixed(1)}px ${k * bh - (k ? 0 : 10)}px`, `${x.toFixed(1)}px ${(k + 1) * bh + (k === 5 ? 10 : 0)}px`);
      }
      pts.push(`${W + 70}px ${H + 10}px`);
      this.root.style.clipPath = `polygon(${pts.join(',')})`;
    } else this.root.style.clipPath = 'none';

    grid.draw(t, { pump: 0.3 * BIDS.reduce((a, b) => a + pulse(lt, b.t, 0.01, 0.14), 0), ripples: [{ x: LIE_C[0], y: LIE_C[1], t0: LIE, speed: 1800, amp: 2.4, width: 60 }] });
    ch.update(lt);
    label.update(lt);
    title.update(lt);

    // Enchères : chaque bulle éclot sur sa croche, puis « TU MENS ! » les chasse.
    const push = E.outCubic(prog(lt, LIE, LIE + 0.3));
    bids.forEach((n, i) => {
      const b = BIDS[i];
      if (lt < b.t) return op(n, 0);
      const s = spring(lt - b.t, 3.2, 0.36);
      const cx = b.x + b.w / 2 - LIE_C[0], cy = b.y + b.h / 2 - LIE_C[1];
      const d = Math.hypot(cx, cy) || 1;
      T(n, { s: s * (1 - 0.25 * push), x: (cx / d) * 260 * push, y: (cy / d) * 200 * push, r: (i % 2 ? 6 : -6) * push + 3 * wobble(lt - b.t, 3, 5), o: 1 - push * 0.7 });
    });
    // TU MENS ! : jaillit, tremble, puis grossit jusqu'à remplir le cadre (pourpre).
    if (lt < LIE) op(lie, 0);
    else {
      const s = spring(lt - LIE, 2.6, 0.34);
      const eat = E.inExpo(prog(lt, 1.72, 2.0));
      T(lie, { s: s * lerp(1, 7.5, eat), r: -4 + 3 * wobble(lt - LIE, 6, 5) - 4 * eat, o: 1 });
    }
  },
  sfx: () => [
    { t: 35.75, id: 'blinds', g: 0.4, dur: 0.25 },
    ...BIDS.map((b, i) => ({ t: 36 + b.t, id: 'bid', g: 0.55, p: i % 2 ? 0.5 : -0.2, note: 64 + [0, 3, 7, 12][i] })),
    { t: 37.25, id: 'shout', g: 0.9 },
    { t: 37.72, id: 'whooshUp', g: 0.6, dur: 0.3 },
  ],
  fx: { shakes: [{ t: 37.25, amp: 22, decay: 0.18 }] },
};
