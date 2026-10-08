// 0:40 - 0:48 - Signature. Un arc-en-ciel pastel se trace, le soleil du logo
// se lève sur son horizon, OHYPNOZEN se resserre, puis Nawel Beloucif, le
// lieu, l'adresse du site et la mention de complémentarité médicale.
import { E, el, frag, T, op, prog, clamp, lerp, splitChars } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { O } from '../brand.js';
import { softText, makeSun } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.signature;
const HZ = pick(455, 880); // horizon du logo
const SUN_D = pick(210, 250);
const RB = pick(440, 470); // rayon extérieur de l'arc-en-ciel
const BANDS = ['#F4B6C2', '#D7B8E8', '#AFC6EE', '#BFE2CF', '#F7E3A3', '#F7C39B'];
const BW = pick(20, 22);
const Y = pick({ word: 490, name: 640, job: 724, place: 772, url: 850, legal: 990 }, { word: 915, name: 1070, job: 1150, place: 1198, url: 1290, legal: 1440 });

let arcs, sunBox, sun, line, word, chars, name, job, place, url, urlLine, legal, veil;

export default {
  id: 'signature',
  start,
  end,
  pre: 0.5,
  build(root) {
    root.appendChild(el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: O.bg } }));
    const svg = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="${W}" height="${H}">${BANDS.map((c, i) => {
      const r = RB - BW / 2 - i * BW;
      return `<path d="M${CX - r} ${HZ} A${r} ${r} 0 0 1 ${CX + r} ${HZ}" fill="none" stroke="${c}" stroke-width="${BW + 1}"/>`;
    }).join('')}</svg>`);
    root.appendChild(svg);
    arcs = [...svg.querySelectorAll('path')];
    sunBox = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${HZ}px`, overflow: 'hidden' } });
    sun = makeSun(sunBox, SUN_D);
    root.appendChild(sunBox);
    line = el('div', { class: 'abs', style: { left: `${CX - pick(520, 460)}px`, top: `${HZ - 1}px`, width: `${pick(1040, 920)}px`, height: '3px', background: O.ink } });
    root.appendChild(line);
    word = el('div', { class: 'abs sans', style: { left: '0px', top: `${Y.word}px`, width: `${W}px`, textAlign: 'center', fontSize: `${pick(104, 80)}px`, fontWeight: 300, color: O.ink, whiteSpace: 'nowrap' } });
    chars = splitChars(word, 'OHYPNOZEN');
    root.appendChild(word);
    const tw = pick(W, W - 120), tx = pick(0, 60);
    name = softText(root, { x: tx, y: Y.name, w: tw, text: 'Nawel Beloucif', serif: true, italic: true, size: pick(60, 58), color: O.ink, weight: 400 });
    job = softText(root, { x: tx, y: Y.job, w: tw, text: 'Thérapie Humaniste Intégrative', size: 32, color: O.ink, weight: 600 });
    place = softText(root, { x: tx, y: Y.place, w: tw, text: 'Paris 11e et téléconsultation', size: 30, color: O.muted, weight: 500 });
    url = softText(root, { x: tx, y: Y.url, w: tw, text: 'ohypnozen.com', size: pick(48, 50), color: O.ink, weight: 800 });
    urlLine = el('div', { class: 'abs', style: { left: `${CX - 150}px`, top: `${Y.url + pick(64, 68)}px`, width: '300px', height: '5px', borderRadius: '3px', background: O.orange, transformOrigin: '0 50%' } });
    root.appendChild(urlLine);
    legal = softText(root, { x: pick(160, 80), y: Y.legal, w: pick(W - 320, W - 160), text: 'Accompagnement complémentaire, qui ne se substitue pas à un suivi médical.', size: pick(22, 24), color: O.muted, weight: 500 });
    veil = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, background: O.bg, opacity: '0' } });
    root.appendChild(veil);
  },
  update(lt) {
    op(this.root, E.inOutSine(prog(lt, -0.5, 0)));
    // Arc-en-ciel : chaque bande se trace de gauche à droite, en décalé.
    arcs.forEach((a, i) => {
      const len = a.getTotalLength();
      const p = E.inOutCubic(prog(lt, 0.0 + i * 0.12, 1.6 + i * 0.12));
      a.style.strokeDasharray = `${len}`;
      a.style.strokeDashoffset = `${(1 - p) * len}`;
    });
    T(line, { sx: E.inOutCubic(prog(lt, 0.4, 1.5)) + 0.0001 });
    line.style.transformOrigin = '50% 50%';
    const rise = E.inOutSine(prog(lt, 0.8, 3.0));
    sun.set({ cx: CX, cy: lerp(HZ + SUN_D * 0.7, HZ - SUN_D * 0.05, rise), raysS: lerp(0.5, 1, E.outCubic(prog(lt, 1.4, 3.6))), raysR: lerp(-30, 0, E.outCubic(prog(lt, 1.2, 4.2))) + lt * 1.2, raysO: prog(lt, 1.2, 2.0) });
    // OHYPNOZEN : les lettres arrivent et l'approche se resserre (0,7 -> 0,42 em).
    word.style.letterSpacing = `${lerp(0.7, 0.42, E.outCubic(prog(lt, 1.9, 3.6))).toFixed(3)}em`;
    word.style.paddingLeft = word.style.letterSpacing;
    chars.forEach((c, i) => op(c, E.inOutSine(prog(lt, 1.9 + i * 0.07, 2.6 + i * 0.07))));
    name.update(lt - 3.2);
    job.update(lt - 3.6, 0, 0.05);
    place.update(lt - 3.9, 0, 0.05);
    url.update(lt - 4.4);
    T(urlLine, { sx: E.inOutCubic(prog(lt, 4.9, 5.6)) + 0.0001 });
    legal.update(lt - 5.2, 0, 0.03, 0.8);
    op(veil, E.inOutSine(prog(lt, 7.35, 8.0)));
  },
  sfx: () => [
    { t: 39.6, id: 'airUp', g: 0.3, dur: 1 },
    { t: 40.0, id: 'harp', g: 0.5, dur: 1.8 },
    { t: 41.8, id: 'bowl', g: 0.6, note: 50 },
    { t: 44.4, id: 'chime', g: 0.35, note: 86 },
  ],
};
