// 0:42 - 0:44 - Le menu complet : 15 tuiles, « 15 JEUX » qui claque, puis
// tout se replie en un seul bouton. Un quart de temps de silence.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, brutalButton, touchDot } from '../components.js';
import { CUTS } from '../timeline.js';
import { GAMES } from '../data.js';

const [start, end] = CUTS.grille; // 42 -> 44
export const BTN = { x: 960 - 560, y: 540 - 130, w: 1120, h: 260, off: 26 };
const COLS = [C.purple, C.butter, C.gold, C.yellow, C.amber, C.yellow, C.butter, C.amber, C.gold, C.yellow, C.butter, C.amber, C.gold, C.yellow, C.butter];

let grid, tiles, dim, big, sub, btn, touch;

export default {
  id: 'grille',
  start,
  end,
  pre: 0.25,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    const tw = 330, th = 276, gx = 22, gy = 22;
    const x0 = (1920 - (5 * tw + 4 * gx)) / 2, y0 = (1080 - (3 * th + 2 * gy)) / 2;
    tiles = GAMES.map((g, i) => {
      const cx = x0 + (i % 5) * (tw + gx), cy = y0 + Math.floor(i / 5) * (th + gy);
      const d = el('div', { class: 'abs', style: { left: `${cx}px`, top: `${cy}px`, width: `${tw}px`, height: `${th}px`, boxSizing: 'border-box', background: COLS[i], border: `6px solid ${C.ink}`, borderRadius: '16px', boxShadow: `10px 10px 0 ${C.ink}` } });
      const n = el('div', { class: 'abs mono', style: { left: '22px', top: '18px', fontSize: '22px', fontWeight: 700, color: i === 0 ? C.yellow : C.ink2 } });
      n.textContent = String(i + 1).padStart(2, '0');
      const tl = el('div', { class: 'abs display', style: { left: '22px', right: '16px', bottom: '22px', fontSize: '56px', lineHeight: '0.9', color: i === 0 ? C.cream : C.ink } });
      tl.textContent = g.name.toUpperCase();
      d.append(n, tl);
      root.appendChild(d);
      return { d, cx: cx + tw / 2, cy: cy + th / 2 };
    });
    dim = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', background: rgba(C.purple, 0.72) } });
    root.appendChild(dim);
    big = el('div', { class: 'abs center', style: { left: '0px', top: '250px', width: '1920px', gap: '40px' } });
    big.innerHTML = `<div class="display" style="font-size:520px;line-height:.86;color:${C.yellow};text-shadow:22px 22px 0 ${C.ink}">15</div>
      <div class="display" style="font-size:300px;line-height:.86;color:${C.cream};text-shadow:14px 14px 0 ${C.ink};align-self:flex-end">JEUX</div>`;
    sub = el('div', { class: 'abs body', style: { left: '0px', top: '760px', width: '1920px', textAlign: 'center', fontSize: '54px', fontWeight: 700, color: C.cream } });
    sub.textContent = 'Un seul geste lance la soirée.';
    root.append(big, sub);
    btn = brutalButton(root, { ...BTN, text: 'LANCE LA SOIRÉE', size: 158, border: 12, bg: C.yellow, shadow: C.night });
    touch = touchDot(root);
  },
  update(lt, t) {
    grid.draw(t, { pump: 0.3 * pulse(lt, 0, 0.01, 0.2) });
    // Tuiles : arrivent en cascade depuis le centre, repli à 43.0.
    tiles.forEach((tl, i) => {
      const dist = Math.hypot(tl.cx - 960, tl.cy - 540) / 1000;
      const t0 = -0.22 + dist * 0.18;
      // La tuile 03 est la dernière carte de la rafale qui atterrit.
      const s = i === 2 ? (lt < 0 ? 0 : 1) : lt < t0 ? 0 : spring(lt - t0, 3, 0.45);
      const fold = E.inBack(prog(lt, 0.9 + dist * 0.12, 1.2 + dist * 0.12), 1.8);
      T(tl.d, { s: s * (1 - fold), x: (960 - tl.cx) * fold, y: (540 - tl.cy) * fold, r: (1 - Math.min(1, s)) * 12 + fold * 90 * (i % 2 ? 1 : -1) });
    });
    const bIn = lt < 0 ? 0 : spring(lt, 3.2, 0.38);
    const bOut = E.inBack(prog(lt, 0.86, 1.1), 2);
    T(big, { s: bIn * (1 - bOut), o: 1 });
    op(dim, prog(lt, -0.02, 0.1) * (1 - prog(lt, 0.9, 1.2)));
    T(sub, { y: 40 * (1 - E.outCubic(prog(lt, 0.5, 0.75))) , o: prog(lt, 0.5, 0.62) * (1 - prog(lt, 0.86, 0.96)) });
    // Le bouton jaillit, puis respire pendant le silence.
    const b = lt - 1.12;
    const breath = lt > 1.75 ? 1 + 0.025 * Math.sin((lt - 1.75) * 40) * prog(lt, 1.75, 1.8) : 1;
    T(btn.root, { s: (b < 0 ? 0 : spring(b, 2.8, 0.36)) * breath, r: b < 0 ? 0 : -4 * (1 - spring(b, 2, 0.5)) });
    btn.root.style.transformOrigin = '50% 50%';
    // Le doigt arrive par la droite et survole.
    const k = E.inOutCubic(prog(lt, 1.35, 1.78));
    touch.set(lerp(1900, 1210, k), lerp(1150, 610, k), { o: prog(lt, 1.35, 1.45), press: 0 });
  },
  sfx: () => [
    { t: 41.76, id: 'whooshDown', g: 0.5, dur: 0.3 },
    ...Array.from({ length: 6 }, (_, i) => ({ t: 41.8 + i * 0.03, id: 'cardSlide', g: 0.25, p: (i - 3) * 0.3 })),
    { t: 42.0, id: 'slamBig', g: 0.9 },
    { t: 42.5, id: 'shimmer', g: 0.3, dur: 0.5 },
    { t: 42.9, id: 'suck', g: 0.6, dur: 0.3 },
    { t: 43.12, id: 'pop', g: 0.7, note: 67 },
  ],
  fx: { shakes: [{ t: 42.0, amp: 14, decay: 0.16 }] },
};
