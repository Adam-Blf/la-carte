// 0:12 - 0:16 - Typo cinétique. LES MEILLEURS / JEUX / DE SOIRÉE sur jaune,
// le pourpre monte comme un verre qu'on remplit, puis RÉUNIS DANS / UNE
// SEULE / APP, et APP rétrécit jusqu'au centre du téléphone.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, springV, splitChars, rgba } from '../engine.js';
import { DotGrid, makeStar, diagClip, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';
import { SCREEN } from '../phone.js';
import { W, H, CX, CY, pick } from '../format.js';

const [start, end] = CUTS.typo; // 12 -> 16
const PRE = 0.5;
const FILL0 = 1.6, FILL1 = 2.06; // 13.6 -> 14.06

let grid, lines1, jeux, jeuxSh, star, liquid, wave1, wave2, bubbles, lines2, app, edge, fx, burst;

function line(parent, text, o) {
  const mask = el('div', { class: 'abs', style: { left: `${o.x}px`, top: `${o.y}px`, width: `${o.w || 1700}px`, overflow: 'hidden', paddingTop: `${o.size * 0.18}px`, paddingBottom: `${o.size * 0.04}px`, textAlign: o.align || 'left' } });
  const inner = el('div', { class: 'display', style: { fontSize: `${o.size}px`, color: o.color, whiteSpace: 'nowrap', lineHeight: '0.86' } });
  const chars = splitChars(inner, text);
  mask.appendChild(inner);
  parent.appendChild(mask);
  return { mask, inner, chars };
}

export default {
  id: 'typo',
  start,
  end,
  pre: PRE,
  build(root) {
    grid = new DotGrid(root, { bg: C.yellow, dot: C.ink, alpha: 0.1 });
    // Hauteur de capitale de Big Shoulders 900 : 0,8125 em ; avec un
    // interlignage de 0,86 le haut des capitales colle au haut de la ligne.
    lines1 = [
      line(root, 'LES MEILLEURS', { x: pick(118, 78), y: pick(116, 420) - 0.18 * pick(180, 130), size: pick(180, 130), color: C.ink }),
      line(root, 'DE SOIRÉE', { x: pick(120, 60), y: pick(817, 990) - 0.18 * pick(180, 150), size: pick(180, 150), color: C.ink, w: pick(1680, 940), align: 'right' }),
    ];
    // JEUX : aplat pourpre, ombre pleine façon sticker (text-shadow par lettre).
    const jw = el('div', { class: 'abs', style: { left: `${pick(104, 66)}px`, top: `${pick(301, 612)}px` } });
    jeuxSh = null;
    jeux = el('div', { class: 'display', style: { position: 'relative', fontSize: `${pick(580, 400)}px`, color: C.purple, lineHeight: '0.86', whiteSpace: 'nowrap' } });
    const jch = splitChars(jeux, 'JEUX');
    jch.forEach((c) => (c.style.transformOrigin = '50% 70%'));
    jw.append(jeux);
    root.appendChild(jw);
    jeux.chars = jch;
    jeux.wrap = jw;
    const ss = pick(400, 330);
    star = el('div', { class: 'abs', style: { left: `${pick(1360, 660)}px`, top: `${pick(330, 1190)}px`, width: `${ss}px`, height: `${ss}px` } });
    star.appendChild(makeStar(ss, C.orange, C.ink, 9));
    root.appendChild(star);

    // Le remplissage : deux vagues pourpres + bulles.
    liquid = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px` } });
    liquid.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0">
      <path class="w2" fill="${C.purpleSoft}"/><path class="w1" fill="${C.purple}" stroke="${C.ink}" stroke-width="10"/></svg>`;
    wave1 = liquid.querySelector('.w1');
    wave2 = liquid.querySelector('.w2');
    root.appendChild(liquid);
    fx = fxCanvas(root);
    burst = new Burst({ seed: 21, t0: FILL1 - 0.02, x: CX, y: 60, count: 26, angle: [Math.PI * 1.1, Math.PI * 1.9], speed: [500, 1300], size: [18, 40], shapes: ['circle', 'ring'], colors: [C.cream, C.lilac], gravity: 1600, drag: 1.4, life: [0.7, 1.2], spread: W * 0.36 });
    bubbles = Array.from({ length: 16 }, (_, i) => ({ x: 80 + ((i * 523) % (W - 160)), r: 12 + ((i * 7) % 5) * 7, sp: 420 + ((i * 131) % 6) * 90, ph: (i * 0.137) % 1 }));

    // Mot à mot, façon rouleau de machine à sous, sur les croches : les mots
    // défilent dans une fenêtre, sans jamais se superposer.
    const win = el('div', { class: 'abs', style: { left: '0px', top: `${CY - 300}px`, width: `${W}px`, height: '600px', overflow: 'hidden' } });
    root.appendChild(win);
    const mkWord = (w, size, color) => {
      const d = el('div', { class: 'abs display', style: { left: '0px', top: `${300 - (0.8125 * size) / 2}px`, width: `${W}px`, textAlign: 'center', fontSize: `${size}px`, color, lineHeight: '0.86', whiteSpace: 'nowrap', transformOrigin: `${CX}px ${(0.8125 * size) / 2}px` } });
      d.textContent = w;
      win.appendChild(d);
      return d;
    };
    lines2 = ['RÉUNIS', 'DANS', 'UNE', 'SEULE'].map((w) => mkWord(w, pick(420, 330), C.cream));
    app = mkWord('APP', 560, C.yellow);
    app.chars = splitChars(app, 'APP');
    app.win = win;


    edge = el('div', { class: 'abs', style: { left: '0px', top: '-200px', width: '14px', height: `${H + 400}px`, background: C.ink, transformOrigin: `7px ${(H + 400) / 2}px` } });
    root.appendChild(edge);
  },
  update(lt, t) {
    // Entrée : volet diagonal depuis la droite, filet d'encre sur le bord.
    if (lt < 0) {
      const p = E.inOutCubic(prog(lt, -PRE, 0));
      const { x } = diagClip(this.root, p, { angle: 14, from: 'right' });
      edge.style.display = 'block';
      T(edge, { x: x - 7, y: 0, r: 14 });
    } else {
      this.root.style.clipPath = 'none';
      edge.style.display = 'none';
    }
    const fillP = E.inOutCubic(prog(lt, FILL0, FILL1));
    grid.draw(t, { pump: 0.3 * [0, 0.5, 1, 1.5].reduce((a, b) => a + pulse(lt, b, 0.01, 0.16), 0) });

    // --- Partie 1
    const drift = lt * 14;
    lines1.forEach((ln, k) => {
      const t0 = k === 0 ? 0.0 : 1.0;
      ln.chars.forEach((c, i) => {
        const p = E.snap(prog(lt, t0 + i * 0.02, t0 + 0.34 + i * 0.02));
        T(c, { y: (1 - p) * 230 });
      });
      T(ln.inner, { x: k === 0 ? -drift : drift });
    });
    // JEUX : claque sur le temps (12.5) avec l'ombre qui se pose.
    const j = lt - 0.5;
    if (j < 0) {
      op(jeux.wrap, 0);
    } else {
      op(jeux.wrap, 1);
      const s = lerp(1.32, 1, E.outExpo(prog(j, 0, 0.3)));
      const off = 18 * E.outCubic(prog(j, 0.04, 0.3));
      T(jeux, { s, r: lerp(-5, 0, E.outCubic(prog(j, 0, 0.3))) });
      jeux.style.transformOrigin = '40% 60%';
      jeux.style.textShadow = `${off.toFixed(1)}px ${off.toFixed(1)}px 0 ${C.ink}`;
      jeux.chars.forEach((c, i) => {
        const d = j - i * 0.035;
        const v = springV(Math.max(0, d), 3, 0.4);
        const sq = clamp(v * 0.03, -0.12, 0.16);
        T(c, { sy: 1 + sq, sx: 1 - sq * 0.5 });
      });
      T(jeux.wrap, { x: drift * 0.5 });
    }
    const sj = lt - 0.5;
    T(star, { s: sj < 0 ? 0 : spring(sj, 2.4, 0.38) * (1 + 0.08 * pulse(lt, 1.0, 0.01, 0.15) + 0.08 * pulse(lt, 1.5, 0.01, 0.15)), r: sj < 0 ? 0 : -120 + 120 * spring(sj, 1.6, 0.5) + lt * 20 });

    // --- Remplissage : vagues sinusoïdales qui montent.
    if (fillP <= 0) {
      liquid.style.display = 'none';
    } else {
      liquid.style.display = 'block';
      const level = lerp(H + 100, -120, fillP);
      const pts1 = [], pts2 = [];
      for (let x = -20; x <= W + 20; x += 24) {
        const y1 = level + 38 * Math.sin(x / 150 + lt * 9) + 18 * Math.sin(x / 61 - lt * 13);
        const y2 = level - 34 + 30 * Math.sin(x / 130 - lt * 7 + 1.3);
        pts1.push(`${x},${y1.toFixed(1)}`);
        pts2.push(`${x},${y2.toFixed(1)}`);
      }
      wave1.setAttribute('d', `M-20,${H + 120} L${pts1.join(' L')} L${W + 20},${H + 120} Z`);
      wave2.setAttribute('d', `M-20,${H + 120} L${pts2.join(' L')} L${W + 20},${H + 120} Z`);
    }
    fx.clearRect(0, 0, W, H);
    if (fillP > 0 && fillP < 1) {
      const level = lerp(H + 100, -120, fillP);
      fx.fillStyle = C.cream;
      fx.strokeStyle = C.ink;
      fx.lineWidth = 5;
      bubbles.forEach((b) => {
        const y = level + 60 + ((b.ph * 900 + (lt - FILL0) * b.sp) % 900);
        if (y > H + 20) return;
        fx.beginPath();
        fx.arc(b.x + Math.sin(lt * 6 + b.ph * 9) * 10, y, b.r, 0, Math.PI * 2);
        fx.fill();
        fx.stroke();
      });
    }
    burst.draw(fx, lt);

    // --- Partie 2 (sur le pourpre)
    const ROLL = 600;
    const roll = (t0) => E.outCubic(prog(lt, t0 - 0.08, t0 + 0.06));
    const words = [...lines2, app];
    words.forEach((w, k) => {
      const t0 = 2.0 + k * 0.25;
      const pin = roll(t0);
      const pout = k < words.length - 1 ? roll(t0 + 0.25) : 0;
      if (pin <= 0 || pout >= 1) return op(w, 0);
      const punch = 1 + 0.1 * pulse(lt, t0 + 0.02, 0.01, 0.12);
      if (w !== app) T(w, { y: (1 - pin) * ROLL - pout * ROLL, s: punch, o: 1 });
    });
    // APP : se réduit ensuite au centre de l'écran du téléphone.
    const a = lt - 3.0;
    if (a < -0.1) op(app, 0);
    else {
      const pin = roll(3.0);
      const shrink = E.inOutCubic(prog(a, 0.28, 0.78));
      const cy = lerp(0, SCREEN.y + SCREEN.h / 2 - CY, shrink);
      const punch = 1 + 0.12 * pulse(lt, 3.02, 0.01, 0.14);
      T(app, { s: punch * lerp(1, 0.34, shrink), y: cy + (1 - pin) * ROLL, o: 1 - E.inQuad(prog(a, 0.74, 0.92)) });
      app.chars.forEach((c, i) => {
        const d = Math.max(0, a - i * 0.045);
        const v = springV(d, 3.2, 0.4);
        const sq = clamp(v * 0.03, -0.12, 0.16);
        T(c, { sy: 1 + sq, sx: 1 - sq * 0.5 });
      });
      app.win.style.overflow = a > 0.1 ? 'visible' : 'hidden';
    }
  },
  sfx: () => [
    { t: 11.5, id: 'whoosh', g: 0.6, dur: 0.5, p: 0.4 },
    { t: 12.0, id: 'slam', g: 0.55 },
    { t: 12.5, id: 'slamBig', g: 0.8 },
    { t: 12.52, id: 'pop', g: 0.5, note: 76 },
    { t: 13.0, id: 'slam', g: 0.55 },
    { t: 13.55, id: 'pour', g: 0.7, dur: 0.6 },
    ...[14.0, 14.25, 14.5, 14.75].map((t) => ({ t, id: 'slot', g: 0.45 })),
    { t: 15.0, id: 'slamBig', g: 0.75 },
    { t: 15.28, id: 'whooshDown', g: 0.5, dur: 0.5 },
  ],
  fx: {
    shakes: [{ t: 12.5, amp: 10, decay: 0.14 }, { t: 15.0, amp: 10, decay: 0.14 }],
  },
};
