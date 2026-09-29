// 0:08 - 0:16 - Le lever. Le ciel passe du bleu au dégradé du site (pêche,
// rose, lilas), le soleil du logo sort de l'horizon et déploie ses rayons,
// son reflet frémit dans l'eau. Puis la lumière envahit tout (raccord crème).
import { E, el, T, op, prog, clamp, lerp } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { O } from '../brand.js';
import { sky, softText, mix, mixList, makeSun } from '../components.js';
import { CUTS } from '../timeline.js';
import { HY, DUSK } from './souffle.js';

const [start, end] = CUTS.lever;
const DAWN = ['#6F86BE', '#B79CC4', '#E9A7A0', O.s2, O.s1];
const LIGHT = [O.bg, O.bg, O.bg, O.bg, O.bg];
const SUN_D = pick(270, 330);

let sk, ground, sunBox, sun, line, glints, title, veil;

export default {
  id: 'lever',
  start,
  end,
  build(root) {
    sk = sky(root);
    // Le soleil vit dans une boîte coupée à l'horizon : il sort de l'eau.
    sunBox = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${HY}px`, overflow: 'hidden' } });
    sun = makeSun(sunBox, SUN_D);
    root.appendChild(sunBox);
    ground = el('div', { class: 'abs', style: { left: '0px', top: `${HY}px`, width: `${W}px`, height: `${H - HY}px` } });
    root.appendChild(ground);
    // Reflet : traits horizontaux sous le soleil, qui ondulent.
    glints = Array.from({ length: 9 }, (_, i) => {
      const g = el('div', { class: 'abs', style: { left: '0px', top: `${HY + 22 + i * 26}px`, height: '5px', borderRadius: '3px', background: O.ray } });
      root.appendChild(g);
      return g;
    });
    line = el('div', { class: 'abs', style: { left: '0px', top: `${HY - 1}px`, width: `${W}px`, height: '2px', background: 'rgba(50,44,69,0.35)' } });
    root.appendChild(line);
    title = softText(root, { x: pick(0, 60), y: pick(78, 250), w: pick(W, W - 120), text: 'Aborder avec sérénité votre chemin de vie', serif: true, size: pick(84, 86), color: O.ink, lh: 1.1 });
    title.root.style.padding = pick('0 360px', '0');
    title.root.style.boxSizing = 'border-box';
    veil = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: O.bg, opacity: '0' } });
    root.appendChild(veil);
  },
  update(lt) {
    const day = E.inOutSine(prog(lt, 0, 4.5));
    sk.set(mixList(DUSK.length === 3 ? [DUSK[0], DUSK[1], DUSK[1], DUSK[2], DUSK[2]] : DUSK, DAWN, day));
    ground.style.background = `linear-gradient(180deg, ${mix(O.night, '#C98B7A', day)}, ${mix(O.night, O.ink, day)})`;
    // Le soleil monte lentement, les rayons se déploient en tournant.
    const rise = E.inOutSine(prog(lt, 0.2, 5.5));
    const cy = lerp(HY + SUN_D * 0.62, HY - SUN_D * pick(0.3, 0.45), rise);
    sun.set({ cx: CX, cy, raysS: lerp(0.55, pick(0.9, 1), E.outCubic(prog(lt, 1.5, 6.5))), raysR: lerp(-35, 0, E.outCubic(prog(lt, 1.2, 7.5))) + lt * 1.5, raysO: prog(lt, 1.4, 2.6) });
    glints.forEach((g, i) => {
      const w = (SUN_D * (0.9 - i * 0.08)) * rise * (0.8 + 0.2 * Math.sin(lt * 2.2 + i * 1.3));
      Object.assign(g.style, { left: `${CX - w / 2 + Math.sin(lt * 1.6 + i) * 8}px`, width: `${Math.max(0, w)}px`, opacity: String(rise * (0.85 - i * 0.08)) });
    });
    title.update(lt - 3.4, prog(lt, 6.9, 7.6), 0.12, 1.1);
    // Fin : la lumière envahit tout, raccord vers le fond crème.
    op(veil, E.inOutSine(prog(lt, 7.1, 8.0)));
  },
  sfx: () => [
    { t: 8.0, id: 'bowl', g: 0.65, note: 57 },
    { t: 8.2, id: 'swell', g: 0.45, dur: 5 },
    { t: 11.4, id: 'chime', g: 0.3, note: 81 },
    { t: 15.0, id: 'airUp', g: 0.3, dur: 1 },
  ],
};
