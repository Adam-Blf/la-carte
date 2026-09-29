// 0:38 - 0:40 - Qui de nous. Trois flèches cherchent, puis pivotent toutes
// vers MALIK sur le temps. Projecteur, votes, iris qui se referme.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, titleBlock, pill, circleClip } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome, typedLabel } from '../vignette.js';

const [start, end] = CUTS.quidenous; // 38 -> 40
const CTR = [1400, 560];
const PEOPLE = [
  { n: 'LÉA', x: 1480, y: 200, bg: C.yellow },
  { n: 'HUGO', x: 1200, y: 480, bg: C.orange },
  { n: 'INÈS', x: 1745, y: 480, bg: C.butter },
  { n: 'MALIK', x: 1480, y: 850, bg: C.cream },
];
const SNAP = 1.0; // 39.0
const TARGET = PEOPLE[3];

let grid, title, label, ch, pills, arrows, spot, votes;

export default {
  id: 'quidenous',
  start,
  end,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    spot = el('div', { class: 'abs', style: { left: `${TARGET.x - 260}px`, top: `${TARGET.y - 260}px`, width: '520px', height: '520px', borderRadius: '50%', background: rgba(C.cream, 0.14) } });
    root.appendChild(spot);
    label = typedLabel(root, { x: 126, y: 330, text: 'ON ENCHAÎNE AVEC', color: C.yellow, size: 28 });
    title = titleBlock(root, { x: 120, y: 378, width: 820, lines: ['QUI DE NOUS'], size: 172, color: C.cream, tag: 'La tablée pointe du doigt.', tagColor: C.lilac, tagSize: 44, tagGap: 30 });
    arrows = PEOPLE.slice(0, 3).map((p) => {
      const a = frag(`<svg class="abs" style="left:${p.x - 150}px;top:${p.y - 150}px;overflow:visible" width="300" height="300" viewBox="-150 -150 300 300">
        <g class="ar"><path d="M40 -20 H150 V-52 L220 0 L150 52 V20 H40 Z" transform="translate(8 8)" fill="${C.ink}"/>
        <path d="M40 -20 H150 V-52 L220 0 L150 52 V20 H40 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/></g></svg>`);
      root.appendChild(a);
      return a.querySelector('.ar');
    });
    pills = PEOPLE.map((p) => pill(root, { x: p.x, y: p.y, text: p.n, bg: p.bg, size: 96, border: 8, off: 11, pad: '12px 40px 2px' }));
    votes = el('div', { class: 'abs display center', style: { left: `${TARGET.x + 150}px`, top: `${TARGET.y - 170}px`, width: '150px', height: '150px', boxSizing: 'border-box', borderRadius: '50%', background: C.yellow, border: `8px solid ${C.ink}`, boxShadow: `9px 9px 0 ${C.ink}`, fontSize: '82px', color: C.ink, paddingTop: '8px' } });
    votes.textContent = '×3';
    root.appendChild(votes);
    ch = chrome(root, { n: 8, color: C.cream });
  },
  update(lt, t) {
    grid.draw(t, { ripples: [{ x: TARGET.x, y: TARGET.y, t0: SNAP, speed: 1700, amp: 2.2, width: 55 }] });
    ch.update(lt);
    label.update(lt);
    title.update(lt);
    pills.forEach((p, i) => {
      const t0 = 0.08 + i * 0.07;
      const hot = i === 3 ? 1 + 0.22 * spring(lt - SNAP - 0.1, 2.6, 0.35) : 1;
      T(p.root, { s: (lt < t0 ? 0 : spring(lt - t0, 3, 0.42)) * hot, r: 2 * Math.sin(lt * 4 + i) });
    });
    // Flèches : tournent en cherchant, puis se verrouillent sur MALIK.
    arrows.forEach((a, i) => {
      const p = PEOPLE[i];
      const target = (Math.atan2(TARGET.y - p.y, TARGET.x - p.x) * 180) / Math.PI;
      const seek = (lt * (260 + i * 90) + i * 140) % 360;
      let ang;
      if (lt < SNAP - 0.12) ang = seek;
      else {
        const from = ((SNAP - 0.12) * (260 + i * 90) + i * 140) % 360;
        let d = target - from;
        d = ((d % 360) + 540) % 360 - 180 + 360; // un tour complet de plus : plus nerveux
        ang = from + d * spring(lt - (SNAP - 0.12), 2.4, 0.42);
      }
      const s = lt < 0.25 ? spring(lt - 0.1, 3, 0.4) : 1;
      a.setAttribute('transform', `rotate(${ang.toFixed(2)}) scale(${Math.max(0, s).toFixed(3)})`);
    });
    T(spot, { s: spring(lt - SNAP - 0.05, 2, 0.5), o: prog(lt, SNAP, SNAP + 0.1) });
    T(votes, { s: lt < SNAP + 0.25 ? 0 : spring(lt - SNAP - 0.25, 3.2, 0.38), r: 10 });
    // Sortie : iris qui se referme sur MALIK.
    const iris = E.inCubic(prog(lt, 1.7, 2.0));
    if (iris > 0) circleClip(this.root, lerp(2300, 0, iris), TARGET.x, TARGET.y);
    else this.root.style.clipPath = 'none';
  },
  sfx: () => [
    ...PEOPLE.map((p, i) => ({ t: 38.08 + i * 0.07, id: 'pop', g: 0.4, note: 70 + i * 2 })),
    { t: 38.1, id: 'spin', g: 0.35, dur: 0.8 },
    { t: 38.88, id: 'lock', g: 0.7 },
    { t: 39.0, id: 'spotlight', g: 0.6 },
    { t: 39.25, id: 'coin', g: 0.5, note: 84 },
    { t: 39.7, id: 'iris', g: 0.5, dur: 0.3 },
  ],
};
