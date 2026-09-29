// 0:24 - 0:26 - Borderland. Raccord exact avec la fin du zoom dans la carte
// du hub, puis 4 as en éventail qui se retournent sur les doubles croches.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, starPath } from '../components.js';
import { CUTS } from '../timeline.js';
import { SCREEN, S, BCARD, bcardZoom } from '../phone.js';
import { chrome, typedLabel, flipOut } from '../vignette.js';

const [start, end] = CUTS.borderland; // 24 -> 26

const SUITS = {
  h: 'M50 90 C20 66 5 47 5 31 C5 16 17 6 30 6 C40 6 47 12 50 19 C53 12 60 6 70 6 C83 6 95 16 95 31 C95 47 80 66 50 90 Z',
  d: 'M50 4 L88 50 L50 96 L12 50 Z',
  s: 'M50 4 C36 24 8 38 8 59 C8 73 19 81 31 81 C39 81 45 77 48 72 C47 83 42 91 34 96 L66 96 C58 91 53 83 52 72 C55 77 61 81 69 81 C81 81 92 73 92 59 C92 38 64 24 50 4 Z',
  c: 'M50 8 A19 19 0 0 1 64 40 A19 19 0 1 1 55 71 Q57 86 66 96 L34 96 Q43 86 45 71 A19 19 0 1 1 36 40 A19 19 0 0 1 50 8 Z',
};
const CARDS = [
  { s: 'h', col: C.purple, ang: -21 },
  { s: 's', col: C.ink, ang: -7 },
  { s: 'd', col: C.purple, ang: 7 },
  { s: 'c', col: C.ink, ang: 21 },
];
const PIVOT = [1505, 1250], RAD = 700;
const CW = 260, CH = 364;

let grid, cardC, bTitle, bTag, bPill, fan, big, label, ch;

function playingCard(c) {
  // Perspective sur le conteneur plat : l'ombre reste un calque 2D derrière,
  // seule la carte vit en 3D (sinon la face passe sous l'ombre en tournant).
  const wrap = el('div', { class: 'abs', style: { left: `${-CW / 2}px`, top: `${-CH / 2}px`, width: `${CW}px`, height: `${CH}px`, perspective: '1800px' } });
  const shadow = el('div', { class: 'abs', style: { left: '14px', top: '14px', width: `${CW}px`, height: `${CH}px`, borderRadius: '20px', background: C.ink } });
  const inner = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${CW}px`, height: `${CH}px`, transformStyle: 'preserve-3d' } });
  const face = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${CW}px`, height: `${CH}px`, boxSizing: 'border-box', borderRadius: '20px', background: C.cream, border: `7px solid ${C.ink}`, backfaceVisibility: 'hidden' } });
  const icon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="${SUITS[c.s]}" fill="${c.col}" stroke="${C.ink}" stroke-width="${c.col === C.ink ? 0 : 5}" stroke-linejoin="round"/></svg>`;
  face.innerHTML = `
    <div class="abs display" style="left:20px;top:16px;font-size:74px;color:${c.col};line-height:.86">A</div>
    <div class="abs" style="left:22px;top:84px">${icon(40)}</div>
    <div class="abs" style="left:${CW / 2 - 78}px;top:${CH / 2 - 78}px">${icon(156)}</div>
    <div class="abs" style="right:20px;bottom:16px;transform:rotate(180deg)"><div class="display" style="font-size:74px;color:${c.col};line-height:.86">A</div><div style="margin-top:6px;margin-left:2px">${icon(40)}</div></div>`;
  const back = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${CW}px`, height: `${CH}px`, boxSizing: 'border-box', borderRadius: '20px', background: `repeating-linear-gradient(45deg, ${C.yellow} 0 18px, ${C.amber} 18px 36px)`, border: `7px solid ${C.ink}`, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' } });
  back.innerHTML = `<div class="abs" style="left:18px;top:18px;right:18px;bottom:18px;border:5px solid ${C.ink};border-radius:12px;background:${C.cream}"></div>
    <svg class="abs" style="left:${CW / 2 - 70}px;top:${CH / 2 - 70}px" width="140" height="140" viewBox="178 68 156 156"><path d="${starPath}" fill="${C.yellow}" stroke="${C.ink}" stroke-width="10" stroke-linejoin="round"/></svg>`;
  inner.append(face, back);
  wrap.append(shadow, inner);
  const holder = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '0px', height: '0px' } });
  holder.appendChild(wrap);
  return { holder, wrap, inner, shadow };
}

export default {
  id: 'borderland',
  start,
  end,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    // « 52 » détouré en fond, qui compte.
    big = el('div', { class: 'abs display', style: { left: '1080px', top: '120px', width: '840px', textAlign: 'center', fontSize: '860px', lineHeight: '0.86', color: 'transparent', WebkitTextStroke: `6px ${rgba(C.cream, 0.22)}` } });
    root.appendChild(big);

    // Réplique de la carte du hub, avec la même transformation que la fin du zoom.
    cardC = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${BCARD.w}px`, height: `${BCARD.h}px`, transformOrigin: '0 0' } });
    bTitle = el('div', { class: 'abs display', style: { left: '26.5px', top: '85.5px', fontSize: '40px', color: C.cream, lineHeight: '0.86', whiteSpace: 'nowrap' } });
    bTitle.textContent = 'BORDERLAND';
    bTag = el('div', { class: 'abs body', style: { left: '26.5px', top: '130.5px', fontSize: '13.5px', fontWeight: 700, color: C.cream, whiteSpace: 'nowrap' } });
    bTag.textContent = '52 cartes - 4 règles - 0 pitié.';
    bPill = el('div', { class: 'abs body center', style: { left: '26.5px', top: '166.5px', width: '104px', height: '38px', borderRadius: '999px', background: C.cream, color: C.purple, fontSize: '13.5px', fontWeight: 700, letterSpacing: '0.06em', transformOrigin: '50% 50%' } });
    bPill.textContent = 'JOUER';
    cardC.append(bTitle, bTag, bPill);
    root.appendChild(cardC);
    label = typedLabel(root, { x: 126, y: 286, text: 'ON ENCHAÎNE AVEC', color: C.yellow, size: 28 });

    fan = CARDS.map((c) => {
      const pc = playingCard(c);
      root.appendChild(pc.holder);
      return pc;
    });
    ch = chrome(root, { n: 1, color: C.cream });
  },
  update(lt, t) {
    grid.draw(t, { pump: 0.25 * [0.5, 1.0, 1.5].reduce((a, b) => a + pulse(lt, b, 0.01, 0.16), 0), ripples: [{ x: 1505, y: 560, t0: 1.0, speed: 1700, amp: 1.6, width: 50 }] });
    ch.update(lt);

    // Carte du hub : départ exactement au cadrage de fin du zoom, puis le
    // titre remonte et laisse la place à l'étiquette.
    const { Z, cx: PX, cy: PY, r } = bcardZoom();
    const k = Z * S;
    const x0 = 960 + Z * (r.x - PX), y0 = 540 + Z * (r.y - PY);
    const m = E.inOutCubic(prog(lt, 0.08, 0.5));
    // Cadrage final : haut des capitales du titre en (124, 352), échelle 0,86.
    const k1 = k * 0.86, X1 = 124 - 26.5 * k1, Y1 = 352 - 85.5 * k1;
    const kk = lerp(k, k1, m);
    cardC.style.transform = `translate(${lerp(x0, X1, m).toFixed(2)}px,${lerp(y0, Y1, m).toFixed(2)}px) scale(${kk.toFixed(5)})`;
    T(bPill, { s: 1 - E.inBack(prog(lt, 0.02, 0.26), 2.2), o: 1 - prog(lt, 0.2, 0.26) });
    label.update(lt - 0.28);

    // « 52 » qui compte jusqu'à 52.
    const n = Math.round(52 * E.outCubic(prog(lt, 0.1, 0.7)));
    big.textContent = String(n);
    T(big, { s: 1 + 0.04 * pulse(lt, 0.7, 0.01, 0.2), o: prog(lt, 0.05, 0.2) });

    // Les as : arrivée en éventail, puis retournement un par un.
    fan.forEach((pc, i) => {
      const c = CARDS[i];
      const a = (c.ang * Math.PI) / 180;
      const fx = PIVOT[0] + RAD * Math.sin(a), fy = PIVOT[1] - RAD * Math.cos(a);
      const t0 = 0.06 + i * 0.06;
      const p = E.outCubic(prog(lt, t0, t0 + 0.42));
      const x = lerp(2250, fx, p), y = lerp(1500, fy, p);
      const rot = lerp(70, c.ang, p) + 3 * wobble(lt - t0 - 0.42, 3, 5);
      const beat = 1 + 0.04 * pulse(lt, 1.5, 0.01, 0.15);
      T(pc.holder, { x, y, r: rot, s: beat });
      const f0 = 0.75 + i * 0.125;
      const fp = E.inOutCubic(prog(lt, f0, f0 + 0.24));
      pc.inner.style.transform = `rotateY(${(180 - 180 * fp).toFixed(2)}deg)`;
      T(pc.wrap, { s: 1 + 0.1 * Math.sin(fp * Math.PI) });
      T(pc.shadow, { x: 0, y: 0, s: 1, o: 1 });
      // L'ombre suit la largeur apparente de la carte (nulle de profil).
      const cosA = Math.abs(Math.cos(Math.PI * (1 - fp)));
      pc.shadow.style.transform = `translate(${(14 - 26 * Math.sin(fp * Math.PI)).toFixed(1)}px, ${(14 + 16 * Math.sin(fp * Math.PI)).toFixed(1)}px) scaleX(${cosA.toFixed(4)})`;
    });

    // Sortie : l'écran entier se retourne comme une carte.
    flipOut(this.root, prog(lt, 1.6, 1.8));
  },
  sfx: () => [
    ...[0, 1, 2, 3].map((i) => ({ t: 24.06 + i * 0.06, id: 'cardSlide', g: 0.45, p: 0.5 })),
    ...[0, 1, 2, 3].map((i) => ({ t: 24.75 + i * 0.125, id: 'cardFlip', g: 0.55, p: 0.2 + i * 0.12 })),
    { t: 24.3, id: 'type', g: 0.2 },
    { t: 25.6, id: 'flipBig', g: 0.7, dur: 0.4 },
  ],
};
