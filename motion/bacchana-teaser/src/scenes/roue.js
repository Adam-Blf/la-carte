// 0:26 - 0:28 - La roue du destin. Entrée par retournement (suite de
// Borderland), la roue ralentit, le cliquet claque à chaque case, arrêt sur
// GAGE pile sur le temps. Sortie : le moyeu s'ouvre en iris.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, titleBlock, Burst, fxCanvas, starPath } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome, typedLabel, flipIn } from '../vignette.js';

const [start, end] = CUTS.roue; // 26 -> 28
export const WHEEL = { x: 1400, y: 566, r: 372 };
const SEG = [
  { t: 'GAGE', bg: C.purple, fg: C.cream },
  { t: 'JOKER', bg: C.cream, fg: C.ink },
  { t: 'DÉFI', bg: C.orange, fg: C.ink },
  { t: '×2', bg: C.butter, fg: C.ink },
  { t: 'VÉRITÉ', bg: C.ink, fg: C.yellow },
  { t: 'PASSE', bg: C.cream, fg: C.ink },
  { t: 'BONUS', bg: C.amber, fg: C.ink },
  { t: 'CHEF', bg: C.purpleSoft, fg: C.cream },
];
const STOP = 1.5; // 27.5
const T0 = -0.2;
const SPAN = 3 * 360 + 110;
// Angle de la roue (degrés, sens horaire). Décélération en loi de puissance,
// petit recul quand le cliquet la retient.
export function wheelAngle(lt) {
  const p = prog(lt, T0, STOP);
  let a = -SPAN * Math.pow(1 - p, 3.1);
  if (lt > STOP) a += -2.4 * wobble(lt - STOP, 2.2, 5);
  return a;
}

let grid, wheel, bulbs, pointer, labels, ch, title, label, fx, burst, gage;

export default {
  id: 'roue',
  start,
  end,
  pre: 0.2,
  build(root) {
    grid = new DotGrid(root, { bg: C.yellow, dot: C.ink, alpha: 0.1 });
    label = typedLabel(root, { x: 126, y: 290, text: 'ON ENCHAÎNE AVEC', color: C.ink2, size: 28 });
    title = titleBlock(root, { x: 120, y: 338, width: 820, lines: ['LA ROUE', 'DU DESTIN'], size: 176, color: C.ink, tag: 'Fais-la tourner, assume le sort.', tagColor: C.ink2, tagSize: 44, tagGap: 30 });

    const { x, y, r } = WHEEL;
    const segPath = (i) => {
      const a0 = ((i * 45 - 22.5 - 90) * Math.PI) / 180, a1 = ((i * 45 + 22.5 - 90) * Math.PI) / 180;
      return `M0 0 L${(Math.cos(a0) * r).toFixed(2)} ${(Math.sin(a0) * r).toFixed(2)} A${r} ${r} 0 0 1 ${(Math.cos(a1) * r).toFixed(2)} ${(Math.sin(a1) * r).toFixed(2)} Z`;
    };
    const svg = frag(`<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
      <circle cx="${x + 18}" cy="${y + 18}" r="${r + 34}" fill="${C.ink}"/>
      <circle cx="${x}" cy="${y}" r="${r + 34}" fill="${C.ink}"/>
      <g class="wheel" transform="translate(${x} ${y})">
        ${SEG.map((s, i) => `<path d="${segPath(i)}" fill="${s.bg}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`).join('')}
        ${SEG.map((s, i) => {
          const a = i * 45;
          return `<g transform="rotate(${a}) translate(0 ${-r * 0.6}) rotate(-90)"><text class="lbl" x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="BS" font-weight="900" font-size="${s.t.length > 5 ? 70 : 84}" fill="${s.fg}">${s.t}</text></g>`;
        }).join('')}
        ${Array.from({ length: 8 }, (_, i) => `<circle cx="${(Math.cos(((i * 45 + 22.5 - 90) * Math.PI) / 180) * (r - 6)).toFixed(2)}" cy="${(Math.sin(((i * 45 + 22.5 - 90) * Math.PI) / 180) * (r - 6)).toFixed(2)}" r="11" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/>`).join('')}
      </g>
      <g class="bulbs">${Array.from({ length: 24 }, (_, i) => {
        const a = ((i * 15 - 90) * Math.PI) / 180;
        return `<circle cx="${(x + Math.cos(a) * (r + 18)).toFixed(2)}" cy="${(y + Math.sin(a) * (r + 18)).toFixed(2)}" r="8.5" fill="${C.cream}"/>`;
      }).join('')}</g>
      <circle class="hub" cx="${x}" cy="${y}" r="64" fill="${C.cream}" stroke="${C.ink}" stroke-width="10"/>
      <g transform="translate(${x} ${y}) scale(0.56) translate(-256 -146)"><path d="${starPath}" fill="${C.orange}" stroke="${C.ink}" stroke-width="12" stroke-linejoin="round"/></g>
      <g class="pointer"><path d="M${x - 44} ${y - r - 96} L${x + 44} ${y - r - 96} L${x} ${y - r + 18} Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
        <circle cx="${x}" cy="${y - r - 96}" r="16" fill="${C.cream}" stroke="${C.ink}" stroke-width="7"/></g>
    </svg>`);
    root.appendChild(svg);
    wheel = svg.querySelector('.wheel');
    bulbs = [...svg.querySelectorAll('.bulbs circle')];
    pointer = svg.querySelector('.pointer');
    labels = [...svg.querySelectorAll('.lbl')];
    gage = labels[0];
    fx = fxCanvas(root);
    burst = new Burst({ seed: 44, t0: STOP, x, y: y - r * 0.62, count: 22, speed: [700, 1700], size: [30, 60], shapes: ['star', 'circle'], colors: [C.cream, C.yellow, C.orange], gravity: 1600, drag: 2.2, life: [0.5, 0.9] });
    ch = chrome(root, { n: 2, color: C.ink });
  },
  update(lt, t) {
    flipIn(this.root, prog(lt, -0.2, 0.04));
    grid.draw(t, { ripples: [{ x: WHEEL.x, y: WHEEL.y, t0: STOP, speed: 1600, amp: 2, width: 55 }] });
    ch.update(lt);
    label.update(lt - 0.05);
    title.update(lt - 0.05);

    const a = wheelAngle(lt);
    wheel.setAttribute('transform', `translate(${WHEEL.x} ${WHEEL.y}) rotate(${a.toFixed(3)})`);
    // Cliquet : un picot arrive tous les 45 degrés.
    const psi = (((a + 22.5) % 45) + 45) % 45;
    let defl = psi > 30 ? ((psi - 30) / 15) * 24 : 24 * Math.exp(-psi / 5) * Math.cos(psi * 0.5);
    if (lt > STOP) defl = 4 * wobble(lt - STOP, 4, 7);
    pointer.setAttribute('transform', `rotate(${(-defl).toFixed(2)} ${WHEEL.x} ${WHEEL.y - WHEEL.r - 96})`);
    // Ampoules : chenillard qui accélère avec la roue, puis clignote sur le temps.
    const chase = Math.floor(-a / 15);
    bulbs.forEach((b, i) => {
      const on = lt < STOP ? (i + chase) % 3 === 0 : (i % 2 === 0) === (Math.floor((lt - STOP) / 0.125) % 2 === 0);
      b.setAttribute('fill', on ? C.yellow : C.cream);
    });
    // Arrêt sur GAGE : la case gonfle, éclats.
    const g = lt - STOP;
    gage.setAttribute('font-size', (84 * (1 + (g > 0 ? 0.3 * Math.exp(-5 * g) * Math.cos(2 * Math.PI * 2.5 * g) + 0.12 * (1 - Math.exp(-6 * g)) : 0))).toFixed(2));
    fx.clearRect(0, 0, 1920, 1080);
    burst.draw(fx, lt);
  },
  sfx: () => {
    const out = [];
    // Un tic à chaque picot qui passe sous le cliquet (calculé sur la même
    // courbe que l'image).
    let prev = null;
    for (let lt = T0; lt <= STOP; lt += 0.0005) {
      const k = Math.floor((wheelAngle(lt) + 22.5) / 45);
      if (prev !== null && k !== prev) out.push({ t: start + lt, id: 'tick', g: 0.5, p: 0.35 });
      prev = k;
    }
    out.push({ t: start + STOP, id: 'ding', g: 0.8, note: 84 });
    out.push({ t: start - 0.2, id: 'spin', g: 0.5, dur: 1.6 });
    return out;
  },
};
