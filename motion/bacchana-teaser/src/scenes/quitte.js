// 0:30 - 0:32 - Quitte ou double. Question, bonne réponse, le multiplicateur
// double sur chaque croche. Sortie : l'écran se fend en diagonale.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, wobble } from '../engine.js';
import { DotGrid, titleBlock, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome, typedLabel } from '../vignette.js';

const [start, end] = CUTS.quitte; // 30 -> 32
const CARD = { x: 1000, y: 214, w: 790, h: 640 };
const PICK = 0.75;
const MULTS = [[1.0, '×2'], [1.25, '×4'], [1.5, '×8'], [1.75, '×16']];

let grid, title, label, ch, card, qTxt, answers, badge, badgeTxt, fx, burst;

export default {
  id: 'quitte',
  start,
  end,
  pre: 0.2,
  build(root) {
    grid = new DotGrid(root, { bg: C.butter, dot: C.ink, alpha: 0.1 });
    label = typedLabel(root, { x: 126, y: 290, text: 'ON ENCHAÎNE AVEC', color: C.purple, size: 28 });
    title = titleBlock(root, { x: 120, y: 338, width: 840, lines: ['QUITTE', 'OU DOUBLE'], size: 176, color: C.ink, tag: 'Ta culture se paie au comptoir.', tagColor: C.ink2, tagSize: 44, tagGap: 30 });

    card = el('div', { class: 'abs', style: { left: `${CARD.x}px`, top: `${CARD.y}px`, width: `${CARD.w}px`, height: `${CARD.h}px`, boxSizing: 'border-box', background: C.cream, border: `8px solid ${C.ink}`, borderRadius: '24px', boxShadow: `18px 18px 0 ${C.ink}`, transformOrigin: '50% 100%' } });
    const q = el('div', { class: 'abs mono', style: { left: '44px', top: '40px', fontSize: '24px', fontWeight: 700, color: C.purple } });
    q.textContent = 'QUESTION 3/10';
    qTxt = el('div', { class: 'abs body', style: { left: '44px', top: '88px', fontSize: '52px', fontWeight: 700, color: C.ink, whiteSpace: 'nowrap' } });
    qTxt.textContent = "Capitale de l'Australie ?";
    card.append(q, qTxt);
    answers = ['SYDNEY', 'CANBERRA', 'MELBOURNE'].map((a, i) => {
      const b = el('div', { class: 'abs display', style: { left: '44px', top: `${196 + i * 134}px`, width: `${CARD.w - 104}px`, height: '110px', boxSizing: 'border-box', background: C.cream2, border: `6px solid ${C.ink}`, borderRadius: '14px', fontSize: '76px', color: C.ink, lineHeight: '1', padding: '18px 0 0 116px' } });
      const k = el('div', { class: 'abs center display', style: { left: '14px', top: '12px', width: '74px', height: '74px', boxSizing: 'border-box', background: C.yellow, border: `5px solid ${C.ink}`, borderRadius: '10px', fontSize: '50px', paddingTop: '4px' } });
      k.textContent = 'ABC'[i];
      b.append(k, document.createTextNode(a));
      card.appendChild(b);
      return b;
    });
    root.appendChild(card);
    badge = el('div', { class: 'abs center', style: { left: `${CARD.x + CARD.w - 150}px`, top: `${CARD.y - 110}px`, width: '250px', height: '250px', borderRadius: '50%', background: C.orange, border: `9px solid ${C.ink}`, boxSizing: 'border-box', boxShadow: `12px 12px 0 ${C.ink}` } });
    badgeTxt = el('div', { class: 'display', style: { fontSize: '130px', color: C.cream, lineHeight: '1', paddingTop: '12px' } });
    badge.appendChild(badgeTxt);
    root.appendChild(badge);
    fx = fxCanvas(root);
    burst = new Burst({ seed: 12, t0: PICK, x: CARD.x + 400, y: CARD.y + 196 + 134 + 55, count: 20, speed: [600, 1500], size: [28, 54], shapes: ['star', 'circle'], colors: [C.yellow, C.purple, C.orange], gravity: 1500, drag: 2.3, life: [0.5, 0.9] });
    ch = chrome(root, { n: 4, color: C.ink });
  },
  update(lt, t) {
    // Entrée : pousse par le bas (la vignette précédente monte).
    T(this.root, { y: 1080 * (1 - E.inOutQuart(prog(lt, -0.2, 0))) });
    grid.draw(t, { ripples: [{ x: 1395, y: 540, t0: 1.0, speed: 1700, amp: 2, width: 55 }] });
    ch.update(lt);
    label.update(lt - 0.02);
    title.update(lt - 0.02);

    const ci = E.outBack(prog(lt, 0.0, 0.4), 1.3);
    T(card, { x: (1 - ci) * 700, r: (1 - ci) * 10 + 1.5 * wobble(lt - PICK, 4, 6) });
    op(qTxt, prog(lt, 0.12, 0.22));
    answers.forEach((b, i) => {
      const t0 = 0.22 + i * 0.07;
      const p = spring(lt - t0, 3, 0.5);
      const picked = i === 1 && lt >= PICK;
      const press = i === 1 ? pulse(lt, PICK, 0.03, 0.12) : 0;
      b.style.background = picked ? C.purple : C.cream2;
      b.style.color = picked ? C.cream : C.ink;
      T(b, { s: (lt < t0 ? 0 : p) * (1 - 0.06 * press), o: lt < t0 ? 0 : 1 });
      if (i !== 1 && lt > PICK) op(b, 1 - 0.55 * prog(lt, PICK, PICK + 0.2));
    });
    // Multiplicateur qui double sur les croches.
    let cur = null;
    for (const [tm, txt] of MULTS) if (lt >= tm) cur = [tm, txt];
    if (!cur) T(badge, { s: 0 });
    else {
      badgeTxt.textContent = cur[1];
      const d = lt - cur[0];
      const first = lt - MULTS[0][0];
      T(badge, { s: spring(first, 3, 0.4) * (1 + 0.25 * Math.exp(-d * 16)), r: -12 + 8 * wobble(d, 5, 6) });
    }
    fx.clearRect(0, 0, 1920, 1080);
    burst.draw(fx, lt);
  },
  sfx: () => [
    { t: 29.8, id: 'whooshUp', g: 0.3, dur: 0.2 },
    { t: 30.05, id: 'cardSlide', g: 0.5, p: 0.5 },
    ...[0, 1, 2].map((i) => ({ t: 30.22 + i * 0.07, id: 'pop', g: 0.3, note: 72 + i * 4 })),
    { t: 30.75, id: 'tap', g: 0.5 },
    { t: 30.75, id: 'correct', g: 0.6 },
    ...MULTS.map(([tm], i) => ({ t: 30 + tm, id: 'coin', g: 0.5 + i * 0.07, note: 79 + i * 5 })),
  ],
};
