// 0:00 - 0:08 - Respirer. L'aube, encore prune. Un horizon se trace, un
// cercle respire avec nous : 4 s d'inspiration, 4 s d'expiration.
import { E, el, T, op, prog, clamp, lerp } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { O } from '../brand.js';
import { sky, softText, mixList } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.souffle;
export const HY = pick(H * 0.64, H * 0.6); // ligne d'horizon, partagée
export const NIGHT = [O.night, O.ink, '#3B3A63'];
export const DUSK = ['#3E4A7E', O.blue, '#8C82B4'];

let sk, line, ring, disc, inTxt, outTxt;

export default {
  id: 'souffle',
  start,
  end,
  build(root) {
    sk = sky(root);
    const ground = el('div', { class: 'abs', style: { left: '0px', top: `${HY}px`, width: `${W}px`, height: `${H - HY}px`, background: O.night } });
    root.appendChild(ground);
    disc = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(253,247,242,0.07)' } });
    ring = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '200px', height: '200px', borderRadius: '50%', border: '2px solid rgba(253,247,242,0.75)', boxSizing: 'border-box' } });
    line = el('div', { class: 'abs', style: { left: '0px', top: `${HY - 1}px`, width: `${W}px`, height: '2px', background: 'rgba(253,247,242,0.7)', transformOrigin: '50% 50%' } });
    root.append(disc, ring, line);
    const ty = HY + pick(90, 120);
    inTxt = softText(root, { x: 0, y: ty, w: W, text: 'Inspirez.', serif: true, italic: true, size: pick(96, 104), color: O.bg, weight: 400 });
    outTxt = softText(root, { x: 0, y: ty, w: W, text: 'Expirez.', serif: true, italic: true, size: pick(96, 104), color: O.bg, weight: 400 });
  },
  update(t) {
    sk.set(mixList(NIGHT, DUSK, E.inOutSine(prog(t, 2, 8))));
    // Horizon : se trace depuis le centre.
    T(line, { sx: E.inOutCubic(prog(t, 0.4, 2.4)) + 0.0001 });
    // Respiration : 0-4 s on inspire, 4-8 s on expire.
    const breath = t < 4 ? E.inOutSine(prog(t, 0, 4)) : 1 - E.inOutSine(prog(t, 4, 8));
    const r = lerp(46, pick(210, 230), breath);
    const cy = lerp(HY - pick(260, 330), HY, E.inOutCubic(prog(t, 6.6, 8)));
    const shrink = 1 - 0.85 * E.inOutCubic(prog(t, 6.8, 8));
    for (const n of [ring, disc]) {
      T(n, { x: CX - 100, y: cy - 100, s: (r / 100) * shrink, o: prog(t, 0.2, 1) });
    }
    inTxt.update(t - 0.5, prog(t, 3.3, 4.1));
    outTxt.update(t - 4.5, prog(t, 7.2, 8));
  },
  sfx: () => [
    { t: 0.0, id: 'bowl', g: 0.5, note: 50 },
    { t: 0.0, id: 'breathIn', g: 0.35, dur: 4 },
    { t: 4.0, id: 'breathOut', g: 0.35, dur: 4 },
  ],
};
