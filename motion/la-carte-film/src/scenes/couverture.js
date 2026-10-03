// 0:00 - 0:06 - La couverture. Le cadre se trace, les étoiles d'angle
// pivotent, « La Carte » s'écrit, puis on touche « Consulter la carte » et la
// couverture pivote sur sa tranche gauche, comme une vraie carte qu'on ouvre.
import { E, el, T, op, prog, clamp, lerp, spring } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { L } from '../brand.js';
import { box, reveal, tapRing } from '../components.js';
import { buildCover, Y } from '../cover.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.couverture;
const TAP = 4.5;
const OPEN = [5.0, 6.3];
const BW = pick(520, 600), BH = pick(92, 104);

let cv, tag, btn, btnFill, btnTxt, btnTxt2, table, ring;

export default {
  id: 'couverture',
  start,
  end,
  z: 20,
  build(root) {
    cv = buildCover(root);
    const f = cv.front;
    tag = reveal(f, { x: CX - pick(470, 440), y: Y.tag, w: pick(940, 880), text: "Une invitation à composer la soirée idéale. Mise en bouche, plat, dessert. La maison s'occupe du reste.", cls: 'body it', size: pick(36, 40), color: L.inkSoft, lh: 1.35 });
    btn = box(CX - BW / 2, Y.btn, BW, BH, { border: `2px solid ${L.brass}`, boxSizing: 'border-box', overflow: 'hidden' });
    btnFill = box(0, 0, BW, BH, { background: L.brass, transformOrigin: '0 50%' });
    btnTxt = el('div', { class: 'abs sc center', style: { left: '0px', top: '0px', width: `${BW}px`, height: `${BH - 4}px`, fontSize: `${pick(30, 34)}px`, color: L.ink, paddingLeft: '0.32em', boxSizing: 'border-box' } }, 'Consulter la carte');
    btnTxt2 = el('div', { class: 'abs sc center', style: { left: '0px', top: '0px', width: `${BW}px`, height: `${BH - 4}px`, fontSize: `${pick(30, 34)}px`, color: L.paper, paddingLeft: '0.32em', boxSizing: 'border-box' } }, 'Consulter la carte');
    btn.append(btnFill, btnTxt, btnTxt2);
    f.appendChild(btn);
    table = reveal(f, { x: 0, y: Y.table, w: W, text: 'Table pour deux - service unique', cls: 'sc', size: pick(24, 28), color: L.inkSoft });
    ring = tapRing(f);
  },
  update(lt) {
    cv.frame(prog(lt, 0.05, 1.5));
    cv.corners(lt - 1.0);
    cv.maison(lt - 0.5);
    cv.logo(lt - 0.7);
    cv.rdv(lt - 2.0);
    cv.fleuron(lt - 2.3);
    tag.update(lt - 2.5, 0, 0.035, 0.8);
    const b = E.app(prog(lt, 3.2, 4.0));
    const press = lt > TAP ? 1 - 0.035 * Math.exp(-(lt - TAP) * 9) * Math.sin(Math.min(Math.PI, (lt - TAP) * 14)) : 1;
    T(btn, { y: (1 - b) * 24, o: b, s: press });
    const fill = E.outCubic(prog(lt, TAP, TAP + 0.35));
    T(btnFill, { sx: Math.max(0.0001, fill) });
    btnTxt2.style.clipPath = `inset(0 ${(1 - fill) * 100}% 0 0)`;
    table.update(lt - 3.5);
    ring.set(CX + pick(90, 110), Y.btn + BH / 2 + 6, lt - TAP);
    // Ouverture : rotation autour de la tranche gauche.
    const o = E.open(prog(lt, OPEN[0], OPEN[1]));
    cv.angle(-112 * o);
    op(cv.wrap, 1 - E.inCubic(prog(lt, 6.05, 6.35)));
  },
  sfx: () => [
    { t: 0.1, id: 'pencil', g: 0.25, dur: 1.4 },
    ...[1.0, 1.08, 1.16, 1.24].map((t, i) => ({ t, id: 'twinkle', g: 0.22, note: [86, 88, 90, 93][i], p: [-0.6, 0.6, -0.6, 0.6][i] })),
    { t: 4.25, id: 'approach', g: 0.2 },
    { t: 4.5, id: 'tap', g: 0.6 },
    { t: 5.0, id: 'page', g: 0.55, dur: 1.3 },
  ],
};
