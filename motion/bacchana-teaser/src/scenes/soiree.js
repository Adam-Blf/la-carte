// 0:44 - 0:48 - Lance la soirée. Le doigt appuie, le bouton s'enfonce dans
// son ombre, onde de choc, confettis, le jaune inonde, trois bandeaux
// défilent en croisé. Puis tout implose vers le centre.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba, mulberry32 } from '../engine.js';
import { DotGrid, brutalButton, touchDot, Burst, fxCanvas, circleClip, makeStar, starPath } from '../components.js';
import { CUTS } from '../timeline.js';
import { BTN } from './grille.js';

const [start, end] = CUTS.soiree; // 44 -> 48
const IMP = 3.5; // implosion à 47.5

const BANDS = [
  { a: -9, y: 250, bg: C.purple, fg: C.cream, star: C.yellow, txt: ['ZÉRO PUB', 'HORS LIGNE', '15 JEUX'], v: 260, t0: 0.34 },
  { a: 5, y: 560, bg: C.ink, fg: C.yellow, star: C.orange, txt: ['LANCE LA SOIRÉE'], v: -330, t0: 0.42 },
  { a: -4, y: 860, bg: C.orange, fg: C.ink, star: C.cream, txt: ['TA TABLE DÉCIDE', 'AVEC OU SANS ALCOOL'], v: 220, t0: 0.5 },
];

let base, flood, gridP, gridY, world, btn, touch, ring, fx, bursts, bands, pops;

export default {
  id: 'soiree',
  start,
  end,
  build(root) {
    base = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    world = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', transformOrigin: '960px 540px' } });
    root.appendChild(world);
    flood = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px' } });
    gridY = new DotGrid(flood, { bg: C.yellow, dot: C.ink, alpha: 0.1 });
    world.appendChild(flood);
    bands = BANDS.map((b) => {
      const wrap = el('div', { class: 'abs', style: { left: '-600px', top: `${b.y - 95}px`, width: '3120px', height: '190px', transform: `rotate(${b.a}deg)` } });
      const strip = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '3120px', height: '190px', boxSizing: 'border-box', background: b.bg, borderTop: `10px solid ${C.ink}`, borderBottom: `10px solid ${C.ink}`, overflow: 'hidden', boxShadow: `0 16px 0 ${rgba(C.ink, 0.9)}` } });
      const row = el('div', { class: 'abs display', style: { left: '0px', top: '26px', whiteSpace: 'nowrap', fontSize: '150px', lineHeight: '1', color: b.fg, display: 'flex', alignItems: 'center', gap: '46px' } });
      for (let i = 0; i < 14; i++) {
        const w = el('span', { style: { paddingTop: '10px' } });
        w.textContent = b.txt[i % b.txt.length];
        row.appendChild(w);
        const st = frag(`<svg width="84" height="84" viewBox="178 68 156 156" style="flex:none"><path d="${starPath}" fill="${b.star}" stroke="${C.ink}" stroke-width="12" stroke-linejoin="round"/></svg>`);
        row.appendChild(st);
      }
      strip.appendChild(row);
      wrap.appendChild(strip);
      world.appendChild(wrap);
      return { wrap, row, strip };
    });
    // Éclats qui claquent sur les temps.
    const rnd = mulberry32(8);
    pops = [2.0, 2.5, 3.0, 2.25, 2.75, 3.25].map((t0, i) => {
      const s = el('div', { class: 'abs', style: { left: `${[260, 1640, 980, 1500, 420, 1180][i] - 90}px`, top: `${[420, 720, 120, 360, 960, 980][i] - 90}px`, width: '180px', height: '180px' } });
      s.appendChild(makeStar(180, [C.cream, C.yellow, C.orange][i % 3], C.ink, 10));
      world.appendChild(s);
      return { s, t0, r: rnd() * 60 - 30 };
    });
    btn = brutalButton(root, { ...BTN, text: 'LANCE LA SOIRÉE', size: 158, border: 12, bg: C.yellow, shadow: C.night });
    btn.root.style.transformOrigin = '50% 50%';
    ring = el('div', { class: 'abs', style: { left: '0px', top: '0px', borderRadius: '50%', border: `14px solid ${C.cream}`, boxSizing: 'border-box' } });
    root.appendChild(ring);
    touch = touchDot(root);
    fx = fxCanvas(root);
    bursts = [
      new Burst({ seed: 101, t0: 0.02, x: 960, y: 540, count: 150, speed: [900, 2600], size: [26, 64], gravity: 1500, drag: 1.7, life: [1.2, 2.2], spread: 140 }),
      new Burst({ seed: 202, t0: 2.0, x: 960, y: -60, count: 60, angle: [Math.PI * 0.2, Math.PI * 0.8], speed: [300, 900], size: [24, 50], gravity: 900, drag: 1.2, life: [1.4, 2.0], spread: 900 }),
    ];
  },
  update(lt, t) {
    base.draw(t);
    // Appui : le bouton rentre dans son ombre, puis remonte.
    const press = lt < 0.02 ? E.inCubic(prog(lt, -0.05, 0.02)) : 1 - E.outBack(prog(lt, 0.1, 0.3), 2);
    btn.press(clamp(press));
    const gone = E.inBack(prog(lt, 0.3, 0.55), 2);
    T(btn.root, { s: (1 + 0.08 * pulse(lt, 0.1, 0.02, 0.1)) * (1 - gone) + 0.0001, o: 1 - prog(lt, 0.5, 0.55) });
    touch.set(1210 - 20 * press, 610 - 20 * press, { o: 1 - prog(lt, 0.15, 0.3), press: clamp(press), ripple: lt > 0 && lt < 0.4 ? lt / 0.4 : -1 });
    // Onde de choc.
    const rr = 2000 * E.outCubic(prog(lt, 0, 0.7));
    Object.assign(ring.style, { left: `${960 - rr}px`, top: `${540 - rr}px`, width: `${2 * rr}px`, height: `${2 * rr}px`, borderWidth: `${lerp(40, 4, prog(lt, 0, 0.7))}px`, opacity: String(1 - prog(lt, 0.3, 0.7)) });
    // Le jaune inonde depuis le bouton.
    const fr = lerp(0, 2300, E.inOutCubic(prog(lt, 0.05, 0.5)));
    circleClip(flood, fr, 960, 540);
    const beats = [1, 1.5, 2, 2.5, 3, 3.5];
    gridY.draw(t, { pump: 0.5 * beats.reduce((a, b) => a + pulse(lt, b, 0.01, 0.14), 0), ripples: beats.map((b) => ({ x: 960, y: 540, t0: b, speed: 1900, amp: 1.2, width: 60, decay: 2 })) });
    // Bandeaux : entrent le long de leur axe, défilent, pompent sur les temps.
    bands.forEach((b, i) => {
      const B = BANDS[i];
      const inP = E.outQuart(prog(lt, B.t0, B.t0 + 0.4));
      const dirIn = i % 2 ? 1 : -1;
      const pump = 1 + 0.07 * beats.reduce((a, bb) => a + pulse(lt, bb + i * 0.0, 0.01, 0.12), 0);
      b.wrap.style.transform = `rotate(${B.a}deg) translateX(${(dirIn * 3200 * (1 - inP)).toFixed(1)}px) scaleY(${pump.toFixed(4)})`;
      T(b.row, { x: -600 + B.v * lt });
    });
    pops.forEach((p) => {
      const d = lt - p.t0;
      if (d < 0) return op(p.s, 0);
      T(p.s, { s: spring(d, 3.4, 0.35) * (1 - E.inBack(prog(d, 0.35, 0.5), 2)), r: p.r + d * 180, o: 1 });
    });
    fx.clearRect(0, 0, 1920, 1080);
    bursts.forEach((b) => b.draw(fx, lt));
    // Implosion : tout est aspiré vers le centre en tournant.
    const imp = E.inBack(prog(lt, IMP, 4.0), 1.6);
    world.style.transform = imp > 0 ? `scale(${Math.max(0.0001, 1 - imp).toFixed(4)}) rotate(${(imp * 40).toFixed(2)}deg)` : 'none';
    fx.canvas.style.opacity = String(1 - prog(lt, IMP, IMP + 0.3));
  },
  sfx: () => [
    { t: 44.0, id: 'tap', g: 0.9 },
    { t: 44.0, id: 'impact', g: 1.0 },
    { t: 44.02, id: 'confetti', g: 0.7, dur: 1.2 },
    ...BANDS.map((b, i) => ({ t: 44 + b.t0, id: 'whoosh', g: 0.5, dur: 0.35, p: i % 2 ? 0.6 : -0.6 })),
    ...[2.0, 2.25, 2.5, 2.75, 3.0, 3.25].map((d, i) => ({ t: 44 + d, id: 'pop', g: 0.4, note: 72 + [0, 4, 7, 12, 7, 16][i], p: (i % 3 - 1) * 0.5 })),
    { t: 47.45, id: 'suck', g: 0.7, dur: 0.5 },
  ],
  fx: { shakes: [{ t: 44.0, amp: 30, decay: 0.24 }], flashes: [{ t: 44.0, dur: 0.1, a: 0.3, color: C.cream }] },
};
