// 0:16 - 0:24 - Dénouer. Un fil tendu porte un nœud (trochoïde allongée :
// des boucles là où l'amplitude dépasse le pas). L'amplitude retombe, les
// boucles se défont d'elles-mêmes, le fil devient une onde calme.
import { E, el, frag, T, op, prog, clamp, lerp } from '../engine.js';
import { W, H, CX, CY, pick } from '../format.js';
import { O } from '../brand.js';
import { softText } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.denouer;
const Y0 = pick(CY + 40, CY);
const LAMBDA = 104, SIGMA = pick(150, 120);

let path, t1, t2;

// Fil paramétré : x = s + A(s) sin(θ), y = Y0 - A(s)(1 - cos θ) + onde.
function thread(a, lt) {
  const pts = [];
  for (let s = -40; s <= W + 40; s += 3) {
    const env = Math.exp(-(((s - CX) / SIGMA) ** 2));
    const A = a * env;
    const th = (2 * Math.PI * (s - CX)) / LAMBDA + Math.PI;
    const wave = 7 * Math.sin(s / 180 - lt * 1.4) * (1 - env * 0.6);
    pts.push(`${(s + A * Math.sin(th)).toFixed(1)},${(Y0 - A * (1 - Math.cos(th)) * 0.9 + A * 0.9 + wave).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

export default {
  id: 'denouer',
  start,
  end,
  pre: 0.6,
  build(root) {
    root.appendChild(el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: O.bg } }));
    const svg = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="${W}" height="${H}"><path fill="none" stroke="${O.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
    root.appendChild(svg);
    path = svg.querySelector('path');
    t1 = softText(root, { x: pick(0, 60), y: pick(230, 420), w: pick(W, W - 120), text: 'Dénouer ce qui pèse,', serif: true, italic: true, size: pick(112, 104), color: O.ink, weight: 400 });
    t2 = softText(root, { x: pick(0, 60), y: pick(Y0 + 150, Y0 + 190), w: pick(W, W - 120), text: 'retrouver votre paix intérieure.', serif: true, italic: true, size: pick(84, 78), color: O.blue, weight: 400 });
  },
  update(lt) {
    op(this.root, E.inOutSine(prog(lt, -0.6, 0)));
    // Le nœud se resserre un peu, puis se défait.
    const a = lerp(62, 70, E.inOutSine(prog(lt, 0.3, 1.4))) * (1 - E.inOutCubic(prog(lt, 1.5, 4.6)));
    path.setAttribute('d', thread(a, lt));
    const draw = E.inOutCubic(prog(lt, -0.4, 0.9));
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${(1 - draw) * len}`;
    t1.update(lt - 0.5, prog(lt, 7.2, 7.9), 0.14, 1.0);
    t2.update(lt - 4.4, prog(lt, 7.2, 7.9), 0.12, 1.0);
    T(path.parentNode, { y: -30 * E.inOutSine(prog(lt, 7.0, 8.0)), o: 1 - E.inOutSine(prog(lt, 7.1, 8.0)) });
  },
  sfx: () => [
    { t: 15.6, id: 'string', g: 0.35, dur: 1.2 },
    { t: 17.5, id: 'untie', g: 0.45, dur: 3.2 },
    { t: 20.4, id: 'chime', g: 0.35, note: 78 },
  ],
};
