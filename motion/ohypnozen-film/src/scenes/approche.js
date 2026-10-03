// 0:24 - 0:32 - L'approche. Les cinq verbes du site, un par souffle court,
// chacun avec sa phrase. Derrière, un halo couleur soleil respire.
import { E, el, T, op, prog, clamp, lerp } from '../engine.js';
import { W, H, CX, CY, pick } from '../format.js';
import { O } from '../brand.js';
import { softText } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.approche;
const VERBS = [
  ['Aider', 'Vous apporter le soutien nécessaire.'],
  ['Accompagner', 'Marcher à vos côtés, sans jugement.'],
  ['Comprendre', 'Explorer les racines de vos blocages.'],
  ['Clarifier', 'Apporter de la lumière sur vos potentiels.'],
  ['Apaiser', 'Retrouver votre paix intérieure.'],
];
const DT = 1.6;

let halo, items;

export default {
  id: 'approche',
  start,
  end,
  build(root) {
    root.appendChild(el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: O.bg } }));
    const d = pick(640, 720); // disque plein, net (pas de halo flou)
    halo = el('div', { class: 'abs', style: { left: `${CX - d / 2}px`, top: `${CY - d / 2 - pick(20, 60)}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%', background: O.s1 } });
    root.appendChild(halo);
    items = VERBS.map(([v, p]) => ({
      v: softText(root, { x: 0, y: CY - pick(130, 150), w: W, text: v, serif: true, italic: true, size: pick(150, 136), color: O.ink, weight: 400 }),
      p: softText(root, { x: pick(0, 70), y: CY + pick(70, 60), w: pick(W, W - 140), text: p, size: pick(40, 40), color: O.muted, weight: 500 }),
    }));
  },
  update(lt) {
    const breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * lt) / 4);
    T(halo, { s: 0.9 + 0.12 * breath, o: E.inOutSine(prog(lt, 0, 0.8)) * (1 - E.inOutSine(prog(lt, 7.4, 8))) });
    items.forEach((it, i) => {
      const t0 = 0.15 + i * DT;
      const out = i < items.length - 1 ? prog(lt, t0 + DT - 0.35, t0 + DT) : prog(lt, 7.3, 7.95);
      it.v.update(lt - t0, out, 0.1, 0.7);
      it.p.update(lt - t0 - 0.25, out, 0.04, 0.6);
    });
  },
  sfx: () => VERBS.map((_, i) => ({ t: 24.15 + i * DT, id: 'piano', g: 0.42, note: [74, 76, 78, 81, 83][i] })),
};
