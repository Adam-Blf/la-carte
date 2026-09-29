// 0:32 - 0:34 - Tu préfères. Deux moitiés qui se rencontrent en diagonale,
// les votes tombent (3 contre 1), la minorité prend le tampon PÉNALITÉ.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, wobble } from '../engine.js';
import { DotGrid, stamp } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome } from '../vignette.js';

const [start, end] = CUTS.prefere; // 32 -> 34
const PRE = 0.25;
const TOPX = 1110, BOTX = 810; // ligne de partage
const VOTES = [
  { n: 'L', bg: C.yellow, side: 0, x: 330, t: 0.62 },
  { n: 'H', bg: C.orange, side: 0, x: 490, t: 0.74 },
  { n: 'I', bg: C.butter, side: 0, x: 650, t: 0.86 },
  { n: 'M', bg: C.cream, side: 1, x: 1400, t: 1.0 },
];

let A, B, gA, gB, ou, banner, tag, votes, pctA, pctB, pen, ch, seam;

function half(root, side) {
  const h = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px' } });
  h.style.clipPath = side === 0
    ? `polygon(-60px -60px, ${TOPX + 16}px -60px, ${BOTX - 16}px 1140px, -60px 1140px)`
    : `polygon(${TOPX + 16}px -60px, 1980px -60px, 1980px 1140px, ${BOTX - 16}px 1140px)`;
  root.appendChild(h);
  return h;
}

export default {
  id: 'prefere',
  start,
  end,
  pre: PRE,
  build(root) {
    A = half(root, 0);
    B = half(root, 1);
    gA = new DotGrid(A, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    gB = new DotGrid(B, { bg: C.orange, dot: C.ink, alpha: 0.12 });
    const opt = (parent, lines, color, cx) => {
      const d = el('div', { class: 'abs display', style: { left: `${cx - 400}px`, top: '410px', width: '800px', textAlign: 'center', fontSize: '128px', color, lineHeight: '0.9' } });
      d.innerHTML = lines.join('<br>');
      parent.appendChild(d);
      return d;
    };
    A.opt = opt(A, ['TOUT DIRE', 'EN RIMES'], C.cream, 480);
    B.opt = opt(B, ['TOUT DIRE', 'EN CHANTANT'], C.ink, 1440);
    pctA = el('div', { class: 'abs display', style: { left: '80px', top: '268px', width: '800px', textAlign: 'center', fontSize: '100px', color: C.yellow } });
    pctB = el('div', { class: 'abs display', style: { left: '1040px', top: '268px', width: '800px', textAlign: 'center', fontSize: '100px', color: C.ink } });
    A.appendChild(pctA);
    B.appendChild(pctB);
    votes = VOTES.map((v) => {
      const d = el('div', { class: 'abs display center', style: { left: `${v.x - 64}px`, top: '720px', width: '128px', height: '128px', boxSizing: 'border-box', borderRadius: '50%', background: v.bg, border: `8px solid ${C.ink}`, boxShadow: `9px 9px 0 ${C.ink}`, fontSize: '72px', color: C.ink, paddingTop: '8px' } });
      d.textContent = v.n;
      (v.side ? B : A).appendChild(d);
      return d;
    });
    pen = stamp(B, { x: 1440, y: 520, text: 'PÉNALITÉ', color: C.ink, bg: C.cream, size: 120, border: 10, double: true });
    seam = el('div', { class: 'abs', style: { left: `${(TOPX + BOTX) / 2 - 8}px`, top: '-100px', width: '16px', height: '1280px', background: C.ink, transform: `rotate(${(Math.atan2(TOPX - BOTX, 1080) * 180) / Math.PI}deg)` } });
    root.appendChild(seam);
    banner = el('div', { class: 'abs display center', style: { left: '560px', top: '66px', width: '800px', height: '170px', boxSizing: 'border-box', background: C.yellow, border: `9px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, fontSize: '146px', color: C.ink, paddingTop: '14px' } });
    banner.textContent = 'TU PRÉFÈRES';
    ou = el('div', { class: 'abs display center', style: { left: `${960 - 95}px`, top: `${560 - 95}px`, width: '190px', height: '190px', boxSizing: 'border-box', borderRadius: '50%', background: C.cream, border: `10px solid ${C.ink}`, fontSize: '104px', color: C.ink, paddingTop: '10px' } });
    ou.textContent = 'OU';
    tag = el('div', { class: 'abs body center', style: { left: '560px', top: '930px', width: '800px', height: '74px', background: C.cream, border: `6px solid ${C.ink}`, boxSizing: 'border-box', fontSize: '34px', fontWeight: 700, color: C.ink } });
    tag.textContent = 'Vote, la minorité prend la pénalité.';
    root.append(banner, ou, tag);
    ch = chrome(root, { n: 5, color: C.cream });
    ch.top.style.display = 'none';
  },
  update(lt, t) {
    // Entrée : les deux moitiés glissent l'une vers l'autre le long de la diagonale.
    const m = E.outQuart(prog(lt, -PRE, 0.02));
    T(A, { x: -(1 - m) * 1100, y: -(1 - m) * 260 });
    T(B, { x: (1 - m) * 1100, y: (1 - m) * 260 });
    op(seam, m);
    gA.draw(t, { ripples: [{ x: 480, y: 760, t0: 0.9, speed: 1500, amp: 1.6, width: 50 }] });
    gB.draw(t, { ripples: [{ x: 1440, y: 520, t0: 1.4, speed: 1700, amp: 2, width: 55 }] });
    ch.update(lt);

    T(banner, { y: (1 - E.outBack(prog(lt, 0.02, 0.3), 1.6)) * -260, r: -2.5 });
    T(ou, { s: spring(lt - 0.02, 2.8, 0.38), r: lerp(-200, 0, E.outCubic(prog(lt, 0.02, 0.45))) });
    T(tag, { y: (1 - E.outCubic(prog(lt, 0.2, 0.45))) * 160, r: 1.5 });
    [A.opt, B.opt].forEach((o, i) => T(o, { y: (1 - E.outCubic(prog(lt, 0.08 + i * 0.06, 0.4 + i * 0.06))) * 60, o: prog(lt, 0.08 + i * 0.06, 0.2 + i * 0.06) }));

    // Votes : chute avec rebond (squash à l'impact).
    votes.forEach((d, i) => {
      const v = VOTES[i];
      if (lt < v.t - 0.3) return op(d, 0);
      const p = prog(lt, v.t - 0.3, v.t);
      const y = lt < v.t ? lerp(-800, 0, E.inQuad(p)) : -46 * Math.abs(Math.sin(2 * Math.PI * 1.6 * (lt - v.t))) * Math.exp(-6 * (lt - v.t));
      const sq = lt >= v.t ? 0.25 * Math.exp(-14 * (lt - v.t)) : 0;
      T(d, { y, sx: 1 + sq, sy: 1 - sq, o: 1 });
    });
    const shown = VOTES.filter((v) => lt >= v.t);
    const a = shown.filter((v) => !v.side).length, b = shown.length - a;
    const pc = (k) => (shown.length ? Math.round((100 * k) / Math.max(shown.length, 1)) : 0);
    pctA.textContent = `${pc(a)}%`;
    pctB.textContent = `${pc(b)}%`;
    op(pctA, prog(lt, 0.6, 0.7));
    op(pctB, prog(lt, 0.6, 0.7));
    pen.set(prog(lt, 1.4, 1.62), -9);

    // Sortie : panoramique filé vers la gauche.
    const w = E.inQuart(prog(lt, 1.76, 2.0));
    this.root.style.transform = w > 0 ? `translateX(${(-1920 * w).toFixed(1)}px)` : 'none';
  },
  sfx: () => [
    { t: 31.75, id: 'whoosh', g: 0.55, dur: 0.3, p: -0.3 },
    { t: 32.0, id: 'slam', g: 0.6 },
    { t: 32.02, id: 'pop', g: 0.5, note: 74 },
    ...VOTES.map((v, i) => ({ t: 32 + v.t, id: 'boing', g: 0.45, p: v.side ? 0.5 : -0.5, note: 67 + i * 3 })),
    { t: 33.4, id: 'stamp', g: 0.9 },
    { t: 33.72, id: 'whip', g: 0.7, dur: 0.3 },
  ],
  fx: { shakes: [{ t: 33.42, amp: 14, decay: 0.15 }] },
};
