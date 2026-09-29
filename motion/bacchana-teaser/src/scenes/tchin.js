// 0:04 - 0:12 - Pousser la porte, puis le tchin : les deux verres du logo
// se rencontrent pile sur le drop, l'éclat jaillit, le logo se forme.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, springV, wobble, splitChars, splitWords, rgba } from '../engine.js';
import { DotGrid, makeLogo, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.tchin; // 4 -> 12
const L = (x) => x - start; // temps absolu -> local
const OPEN = L(4.5), GLIDE0 = L(4.62), GLIDE1 = L(7.5), WIND = L(7.78), HIT = L(8.0);
const PULL0 = L(8.14), PULL1 = L(9.0);
const WORD0 = L(9.0), WORD_DT = 0.0625;
const TAG0 = L(9.75);
const SPELL = [L(6.0), L(6.5), L(7.0), L(7.5), L(7.75)]; // T C H I N

let grid, logoWrap, logo, doors, doorL, doorR, doorTxt, word, letters, tagWords, fx, bursts, spell, spellChars;

function cam(t) {
  // k = échelle (px par unité du viewBox du logo), (cx, cy) = position écran
  // du point (256, 236) du logo.
  const pull = E.inOutQuart(prog(t, PULL0, PULL1));
  const push = lerp(2.5, 2.74, E.inOutSine(prog(t, OPEN, HIT)));
  const k = lerp(push, 1.1, pull) * (1 + 0.015 * E.inOutSine(prog(t, PULL1, L(12))));
  const cy = lerp(560, 318, pull);
  return { k, cx: 960, cy };
}
const toStage = (c, ux, uy) => [c.cx + (ux - 256) * c.k, c.cy + (uy - 236) * c.k];

export default {
  id: 'tchin',
  start,
  end,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });

    // TCHIN épelé en fond sur les temps, en capitales détourées.
    spell = el('div', { class: 'abs display', style: { left: '0px', top: '150px', width: '1920px', textAlign: 'center', fontSize: '780px', lineHeight: '1', color: 'transparent', WebkitTextStroke: `5px ${rgba(C.cream, 0.28)}`, letterSpacing: '0.02em' } });
    spellChars = splitChars(spell, 'TCHIN');
    spellChars.forEach((c) => (c.style.transformOrigin = '50% 60%'));
    root.appendChild(spell);

    logo = makeLogo(512);
    logoWrap = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '512px', height: '512px', transformOrigin: '256px 236px' } });
    logoWrap.appendChild(logo.svg);
    root.appendChild(logoWrap);
    fx = fxCanvas(root);

    // Mot-symbole : chaque lettre jaillit d'un masque placé sous la ligne.
    const mask = el('div', { class: 'abs', style: { left: '0px', top: '380px', width: '1920px', height: '452px', overflow: 'hidden' } });
    word = el('div', { class: 'abs display', style: { left: '0px', top: '186px', width: '1920px', textAlign: 'center', fontSize: '262px', color: C.yellow, lineHeight: '1' } });
    letters = splitChars(word, 'BACCHANA');
    mask.appendChild(word);
    const tag = el('div', { class: 'abs body', style: { left: '0px', top: '858px', width: '1920px', textAlign: 'center', fontSize: '46px', fontWeight: 500, color: C.lilac } });
    tagWords = splitWords(tag, 'Les meilleurs jeux de soirée, servis au comptoir.');
    root.append(mask, tag);

    // Les battants : deux portes de saloon qui s'ouvrent vers la salle.
    doors = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', perspective: '1500px', perspectiveOrigin: '960px 540px' } });
    doorTxt = [];
    const mk = (side) => {
      const d = el('div', {
        class: 'abs',
        style: {
          left: side === 'L' ? '0px' : '960px', top: '0px', width: '960px', height: '1080px', boxSizing: 'border-box',
          background: C.yellow, border: `12px solid ${C.ink}`, transformOrigin: side === 'L' ? '0% 50%' : '100% 50%',
        },
      });
      const panel = el('div', { class: 'abs', style: { left: '70px', top: '90px', right: '70px', bottom: '90px', border: `9px solid ${C.ink}`, borderRadius: '26px' } });
      const txt = el('div', { class: 'abs display center', style: { left: '70px', right: '70px', top: '0px', bottom: '0px', fontSize: '210px', color: C.ink, whiteSpace: 'nowrap', paddingTop: '18px' } });
      txt.textContent = side === 'L' ? 'POUSSER' : 'LA PORTE';
      doorTxt.push(txt);
      const knob = el('div', { class: 'abs', style: { top: '760px', width: '46px', height: '46px', borderRadius: '50%', background: C.orange, border: `9px solid ${C.ink}`, [side === 'L' ? 'right' : 'left']: '22px' } });
      d.append(panel, txt, knob);
      return d;
    };
    doorL = mk('L');
    doorR = mk('R');
    doors.append(doorL, doorR);
    root.appendChild(doors);
    bursts = null;
  },
  update(t) {
    const c = cam(t);
    const hit = t - HIT;
    const hc = cam(HIT);
    const [ex, ey] = toStage(hc, 256, 146);

    grid.draw(t, {
      ripples: [{ x: ex, y: ey, t0: HIT, speed: 1650, amp: 2.6, width: 55, decay: 1.1 }],
      pump: 0.22 * [L(9), L(10), L(11)].reduce((a, b) => a + pulse(t, b, 0.01, 0.18), 0),
    });

    // --- T C H I N sur les temps, puis éclate au choc.
    spellChars.forEach((ch, i) => {
      const t0 = SPELL[i];
      if (t < t0) return op(ch, 0);
      const pop = spring(t - t0, 3.4, 0.38);
      const out = E.inCubic(prog(hit, 0, 0.28));
      const flashOn = hit >= 0 && hit < 0.08;
      ch.style.webkitTextStroke = `5px ${rgba(flashOn ? C.yellow : C.cream, flashOn ? 0.9 : 0.28)}`;
      T(ch, { s: pop * (1 + 0.9 * out), o: 1 - out, y: -40 * out * (i - 2) });
    });

    // --- Les verres (dx en unités du logo, positif = vers la droite).
    let dx;
    if (t < GLIDE0) dx = 470;
    else if (t < GLIDE1) dx = lerp(470, 58, E.inOutSine(prog(t, GLIDE0, GLIDE1)));
    else if (t < WIND) dx = lerp(58, 100, E.outCubic(prog(t, GLIDE1, WIND)));
    else if (t < HIT) dx = lerp(100, 0, E.inQuart(prog(t, WIND, HIT)));
    else dx = -26 * wobble(hit, 3.1, 5.2);
    const bob = t < HIT ? Math.sin((t - GLIDE0) * Math.PI) * 7 * (1 - prog(t, GLIDE1, HIT)) : 0;
    const tilt = t < HIT
      ? lerp(16, 0, E.inOutSine(prog(t, GLIDE0, HIT))) + 8 * E.outCubic(prog(t, GLIDE1, WIND)) * (1 - prog(t, WIND, HIT))
      : 4 * wobble(hit, 2.6, 4.5);
    const sq = hit >= 0 ? Math.exp(-9 * hit) * Math.cos(2 * Math.PI * 4 * hit) : 0;
    const beats = [L(9), L(9.5), L(10), L(10.5), L(11), L(11.5)];
    logo.set({
      t,
      fizz: 1,
      L: { dx: -dx, dy: bob, r: -tilt, sx: 1 - 0.1 * sq, sy: 1 + 0.07 * sq },
      R: { dx, dy: -bob, r: tilt, sx: 1 - 0.1 * sq, sy: 1 + 0.07 * sq },
      star: {
        s: hit < 0 ? 0 : spring(hit, 2.9, 0.3) * (1 + 0.06 * beats.reduce((a, b) => a + pulse(t, b, 0.01, 0.15), 0)),
        r: hit < 0 ? 0 : -110 * (1 - spring(hit, 2.2, 0.45)) + 5 * Math.sin((t - HIT) * 2.1) * prog(t, PULL1, PULL1 + 1),
      },
      rays: hit < 0 ? 0 : prog(hit, 0.03, 0.36),
      raysX: 256,
      raysY: 146,
      raysR0: 88,
      raysR1: 150,
      raysLen: 40,
    });
    T(logoWrap, { x: c.cx - 256, y: c.cy - 236, s: c.k });

    // --- Étincelles et gouttes de mousse (repère écran).
    if (!bursts) {
      const [lx, ly] = toStage(hc, 170, 226);
      const [rx, ry] = toStage(hc, 342, 226);
      bursts = [
        new Burst({ seed: 3, t0: HIT, x: ex, y: ey, count: 16, speed: [900, 2000], size: [44, 78], shapes: ['star'], colors: [C.yellow, C.cream, C.butter], gravity: 1300, drag: 2.4, life: [0.55, 0.95] }),
        new Burst({ seed: 5, t0: HIT, x: lx, y: ly, count: 10, angle: [Math.PI * 1.1, Math.PI * 1.55], speed: [800, 1600], size: [26, 46], shapes: ['circle'], colors: [C.cream], gravity: 2600, drag: 1.4, life: [0.6, 1.0] }),
        new Burst({ seed: 9, t0: HIT, x: rx, y: ry, count: 10, angle: [Math.PI * 1.45, Math.PI * 1.9], speed: [800, 1600], size: [26, 46], shapes: ['circle'], colors: [C.cream], gravity: 2600, drag: 1.4, life: [0.6, 1.0] }),
      ];
    }
    fx.clearRect(0, 0, 1920, 1080);
    bursts.forEach((b) => b.draw(fx, t));

    // --- BACCHANA : chaque lettre jaillit, s'étire en montant, s'écrase en
    // retombant (squash & stretch déduit de la vitesse du ressort).
    letters.forEach((ch, i) => {
      const tl = WORD0 + i * WORD_DT;
      const d = t - tl;
      if (d <= 0) return T(ch, { y: 330, o: 1 });
      const f = 2.6, z = 0.36;
      const y = 330 * (1 - spring(d, f, z));
      const v = springV(d, f, z); // > 0 : monte
      const st = clamp(v * 0.055, -0.22, 0.34);
      T(ch, { y, sy: 1 + st, sx: 1 / Math.sqrt(1 + st), o: 1 });
    });
    tagWords.forEach((w, i) => {
      const p = E.outCubic(prog(t, TAG0 + i * 0.045, TAG0 + 0.38 + i * 0.045));
      T(w, { y: (1 - p) * 64, o: p });
    });

    // --- Portes : fermées, texte qui claque, ouverture amortie.
    if (t < OPEN + 1.25) {
      doors.style.display = 'block';
      const a = t < OPEN ? 0 : spring(t - OPEN, 1.35, 0.42) * 101;
      doorL.style.transform = `rotateY(${a.toFixed(3)}deg)`;
      doorR.style.transform = `rotateY(${(-a).toFixed(3)}deg)`;
      const stampIn = E.outBack(prog(t, 0, 0.16), 2);
      doorTxt.forEach((d) => (d.style.transform = `scale(${lerp(1.22, 1, stampIn).toFixed(4)})`));
    } else doors.style.display = 'none';
  },
  sfx: () => [
    { t: 4.0, id: 'thud', g: 0.6 },
    { t: 4.5, id: 'whoosh', g: 0.55, dur: 0.45, p: 0 },
    { t: 4.66, id: 'creak', g: 0.3 },
    { t: 5.02, id: 'knock', g: 0.3, p: -0.6 },
    { t: 5.06, id: 'knock', g: 0.26, p: 0.6 },
    ...[6.0, 6.5, 7.0, 7.5, 7.75].map((t, i) => ({ t, id: 'spell', g: 0.34 + i * 0.05, note: 67 + [0, 2, 4, 7, 12][i] })),
    { t: 7.5, id: 'reverse', g: 0.7, dur: 0.5 },
    { t: 8.0, id: 'clink', g: 1.0 },
    { t: 8.0, id: 'impact', g: 0.9 },
    { t: 8.0, id: 'fizz', g: 0.4, dur: 1.4 },
    ...Array.from({ length: 8 }, (_, i) => ({ t: 9.0 + i * WORD_DT, id: 'tock', g: 0.26, p: (i - 3.5) * 0.12, note: 72 + [0, 2, 4, 7, 9, 12, 14, 16][i] })),
    { t: 9.75, id: 'shimmer', g: 0.22, dur: 0.8 },
  ],
  fx: {
    shakes: [{ t: 8.0, amp: 24, decay: 0.2, freq: 24 }],
    flashes: [{ t: 8.0, dur: 0.1, a: 0.24, color: C.cream }],
  },
};
