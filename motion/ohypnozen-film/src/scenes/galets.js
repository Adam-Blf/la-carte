// 0:32 - 0:40 - Les objectifs. Trois galets se posent l'un sur l'autre, un
// par objectif, d'abord de guingois, puis s'alignent sur « Vous aligner ».
import { E, el, frag, T, op, prog, clamp, lerp } from '../engine.js';
import { W, H, CX, CY, VERT, pick } from '../format.js';
import { O } from '../brand.js';
import { softText } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.galets;
const STONES = [
  { w: 420, h: 150, c: O.blue, off: -46, t: 0.3 },
  { w: 300, h: 124, c: O.s3, off: 52, t: 2.95 },
  { w: 190, h: 104, c: O.orange, off: -30, t: 5.6 },
];
const GOALS = [
  ['Y voir plus clair', 'Une vision plus claire de qui vous êtes.'],
  ['Retrouver confiance', 'Une paix intérieure qui rayonne.'],
  ['Vous aligner', 'Être en accord avec qui vous êtes.'],
];
const ALIGN = 6.3;
const BASE = pick({ x: 1330, y: 800 }, { x: CX, y: 1470 });
const TXT = pick({ x: 140, y: 360, w: 860, align: 'left' }, { x: 60, y: 330, w: W - 120, align: 'center' });

let stones, goals, floor;

// Galet : superellipse légèrement irrégulière.
function pebble(w, h, seed) {
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const r = 1 + 0.035 * Math.sin(3 * a + seed) + 0.02 * Math.cos(5 * a + seed * 2);
    const x = Math.sign(c) * Math.pow(Math.abs(c), 0.72) * (w / 2) * r;
    const y = Math.sign(s) * Math.pow(Math.abs(s), 0.8) * (h / 2) * r * (s > 0 ? 0.92 : 1);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

export default {
  id: 'galets',
  start,
  end,
  build(root) {
    const bg = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: `linear-gradient(180deg, ${O.bg} 0%, ${O.bg} 55%, ${O.s1} 100%)` } });
    root.appendChild(bg);
    floor = el('div', { class: 'abs', style: { left: `${BASE.x - 320}px`, top: `${BASE.y - 2}px`, width: '640px', height: '4px', borderRadius: '2px', background: O.ink, opacity: '0.18' } });
    root.appendChild(floor);
    stones = STONES.map((s, i) => {
      const svg = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="10" height="10"><path d="${pebble(s.w, s.h, i * 1.7 + 0.4)}" fill="${s.c}"/></svg>`);
      root.appendChild(svg);
      return svg;
    });
    goals = GOALS.map(([g, p], i) => ({
      g: softText(root, { x: TXT.x, y: TXT.y + i * pick(150, 118), w: TXT.w, align: TXT.align, text: g, serif: true, italic: true, size: pick(84, 72), color: O.ink, weight: 400 }),
      p: softText(root, { x: TXT.x, y: TXT.y + i * pick(150, 118) + pick(96, 82), w: TXT.w, align: TXT.align, text: p, size: pick(32, 30), color: O.muted, weight: 500 }),
    }));
  },
  update(lt) {
    op(this.root, E.inOutSine(prog(lt, -0.001, 0.5)));
    op(floor, 0.18 * prog(lt, 0, 0.6));
    // Empilement : chaque galet descend doucement et se pose.
    let y = BASE.y;
    const al = E.inOutCubic(prog(lt, ALIGN, ALIGN + 1.1));
    STONES.forEach((s, i) => {
      const rest = y - s.h / 2 + 6;
      const d = E.outCubic(prog(lt, s.t, s.t + 1.2));
      const cy = lerp(rest - 420, rest, d);
      const x = BASE.x + s.off * (1 - al);
      const r = (i % 2 ? 4 : -3) * (1 - al) * d + (1 - d) * (i % 2 ? -8 : 8);
      T(stones[i], { x, y: cy, r, o: prog(lt, s.t, s.t + 0.35) });
      y = rest - s.h / 2 + 6;
    });
    goals.forEach((it, i) => {
      const t0 = STONES[i].t + 0.2;
      const dim = i < 2 ? 0.45 * prog(lt, STONES[i + 1].t, STONES[i + 1].t + 0.6) : 0;
      it.g.update(lt - t0, prog(lt, 7.3, 7.95));
      it.p.update(lt - t0 - 0.3, prog(lt, 7.3, 7.95), 0.05, 0.7);
      op(it.g.root, 1 - dim);
      op(it.p.root, 1 - dim);
    });
  },
  sfx: () => [
    ...STONES.map((s, i) => ({ t: 32 + s.t + 1.0, id: 'stone', g: 0.5, note: [45, 52, 57][i] })),
    { t: 32 + ALIGN + 0.9, id: 'bowl', g: 0.45, note: 62 },
  ],
};
