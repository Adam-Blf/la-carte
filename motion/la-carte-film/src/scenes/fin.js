// 0:42 - 0:50 - Signature. La couverture se referme sur l'invitation, puis
// la promesse, l'adresse du site soulignée de laiton, et « table pour deux ».
import { E, el, T, op, prog, clamp, lerp, spring, wobble } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { L } from '../brand.js';
import { box, reveal } from '../components.js';
import { buildCover, Y } from '../cover.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.fin;
const CLOSE = [41.7, 42.9];

let cv, tag, url, uline, table, fade;

export default {
  id: 'fin',
  start,
  end,
  z: 16,
  build(root) {
    cv = buildCover(root);
    const f = cv.front;
    tag = reveal(f, { x: CX - pick(470, 440), y: Y.tag + pick(10, 10), w: pick(940, 880), text: "Composez le rendez-vous idéal. L'addition est déjà réglée.", cls: 'body it', size: pick(38, 42), color: L.inkSoft, lh: 1.35 });
    url = reveal(f, { x: 0, y: Y.btn - pick(6, 0), w: W, text: 'la-carte.beloucif.com', cls: 'disp', size: pick(72, 70), color: L.ink, style: { fontWeight: 400 } });
    uline = box(CX - pick(330, 320), Y.btn + pick(92, 96), pick(660, 640), 3, { background: L.brass, transformOrigin: '0 50%' });
    f.appendChild(uline);
    table = reveal(f, { x: 0, y: Y.table, w: W, text: 'Table pour deux - service unique', cls: 'sc', size: pick(24, 28), color: L.inkSoft });
    fade = box(0, 0, W, H, { background: L.night, opacity: '0' });
    root.appendChild(fade);
  },
  update(lt) {
    const t = lt + start;
    // La couverture se referme (déjà imprimée : tout est en place).
    const c = E.inOutCubic(prog(t, CLOSE[0], CLOSE[1]));
    const settle = 1.6 * wobble(t - CLOSE[1], 3.2, 7);
    cv.angle(-112 * (1 - c) - settle);
    cv.frame(1);
    // Au claquement, les étoiles d'angle font un quart de tour.
    cv.corners(9);
    cv.maison(9);
    cv.logo(9);
    cv.rdv(9);
    cv.fleuron(9);
    tag.update(t - 43.3, 0, 0.05, 0.9);
    url.update(t - 44.2, 0, 0.1, 1.0, 30);
    T(uline, { sx: Math.max(0.0001, E.inOutCubic(prog(t, 44.8, 45.6))) });
    table.update(t - 45.5);
    op(fade, E.inOutSine(prog(t, 49.0, 50.0)));
  },
  fx: { shakes: [{ t: CLOSE[1], amp: 5, decay: 0.1, freq: 20, rot: 0.02 }] },
  sfx: () => [
    { t: CLOSE[0], id: 'page', g: 0.5, dur: 1.2 },
    { t: CLOSE[1], id: 'close', g: 0.8 },
    { t: 44.8, id: 'pencil', g: 0.2, dur: 0.8 },
  ],
};
