// 0:38 - 0:42 - La carte est à vous. Une feuille crème monte (bord déchiré
// du ticket), on invite quelqu'un à son tour : le lien est copié.
import { E, el, frag, T, op, prog, clamp, lerp, spring } from '../engine.js';
import { W, H, CX, pick } from '../format.js';
import { L } from '../brand.js';
import { box, reveal, tapRing, star } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.invite;
const UP = [37.5, 38.4];
const TAP = 40.5;
const Y = pick({ num: 250, title: 300, sub: 500, btn: 690 }, { num: 560, title: 610, sub: 900, btn: 1150 });
const BW = pick(660, 720), BH = pick(96, 106);

let sheet, num, title, sub, btn, fill, t1, t2, st, ring;

export default {
  id: 'invite',
  start,
  end,
  z: 14,
  build(root) {
    sheet = box(0, 0, W, H + 60);
    const n = Math.round(W / 26), tw = W / n;
    let d = `M0 16`;
    for (let i = 0; i < n; i++) d += ` L${(i + 0.5) * tw} 2 L${(i + 1) * tw} 16`;
    sheet.appendChild(frag(`<svg class="abs" style="left:0;top:-14px" width="${W}" height="16"><path d="${d} V16 H0 Z" fill="${L.paper}"/></svg>`));
    sheet.appendChild(box(0, 1, W, H + 60, { background: L.paper }));
    root.appendChild(sheet);
    num = reveal(sheet, { x: 0, y: Y.num, w: W, text: 'VI', cls: 'sc', size: 30, color: L.brass });
    title = reveal(sheet, { x: 40, y: Y.title, w: W - 80, text: 'La carte est à vous', cls: 'disp', size: pick(150, 124), lh: 1.02 });
    sub = reveal(sheet, { x: CX - pick(520, 460), y: Y.sub, w: pick(1040, 920), text: "Vous aussi, invitez quelqu'un. Votre prénom, votre WhatsApp, et la réservation arrivera chez vous.", cls: 'body it', size: pick(38, 40), color: L.inkSoft, lh: 1.3 });
    btn = box(CX - BW / 2, Y.btn, BW, BH, { border: `2px solid ${L.brass}`, boxSizing: 'border-box', overflow: 'hidden' });
    fill = box(0, 0, BW, BH, { background: L.brass, transformOrigin: '0 50%' });
    const lab = (text, color) => el('div', { class: 'abs sc center', style: { left: '0px', top: '0px', width: `${BW}px`, height: `${BH - 4}px`, fontSize: `${pick(28, 30)}px`, color, letterSpacing: '0.22em', whiteSpace: 'nowrap' } }, text);
    t1 = lab("Copier mon lien d'invitation", L.ink);
    t2 = lab('Lien copié, envoyez-le', L.paper);
    btn.append(fill, t1, t2);
    st = star(24, L.paper);
    btn.appendChild(st);
    sheet.appendChild(btn);
    ring = tapRing(sheet);
  },
  update(lt) {
    const t = lt + start;
    const u = E.inOutCubic(prog(t, UP[0], UP[1]));
    T(sheet, { y: lerp(H + 30, 0, u) });
    num.update(t - 38.1);
    title.update(t - 38.25, 0, 0.09, 1.0, 34);
    sub.update(t - 38.8, 0, 0.03, 0.8);
    const b = E.app(prog(t, 39.3, 40.0));
    const press = t > TAP ? 1 - 0.04 * Math.exp(-(t - TAP) * 8) * Math.sin(Math.min(Math.PI, (t - TAP) * 12)) : 1;
    T(btn, { y: (1 - b) * 24, o: b, s: press });
    const f = E.outCubic(prog(t, TAP, TAP + 0.35));
    T(fill, { sx: Math.max(0.0001, f) });
    op(t1, 1 - prog(t, TAP + 0.05, TAP + 0.2));
    const q = E.app(prog(t, TAP + 0.2, TAP + 0.6));
    T(t2, { x: -18, y: (1 - q) * 20, o: q });
    const k = spring(t - TAP - 0.4, 2.4, 0.4);
    T(st, { x: BW / 2 + pick(196, 198), y: BH / 2 - 14, s: Math.max(0.0001, k), r: (1 - k) * 120 });
    ring.set(CX + 60, Y.btn + BH / 2 + 8, t - TAP);
  },
  sfx: () => [
    { t: UP[0], id: 'swish', g: 0.3, dur: 0.9 },
    { t: TAP - 0.2, id: 'approach', g: 0.15 },
    { t: TAP, id: 'tap', g: 0.55 },
    { t: TAP + 0.4, id: 'copied', g: 0.45 },
  ],
};
