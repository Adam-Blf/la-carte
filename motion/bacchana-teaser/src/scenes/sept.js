// 0:28 - 0:30 - 7 secondes. Le titre est le chrono : 7 SECONDES, 6, 5...
// sur les croches, jusqu'à 0 SECONDE. Le sablier se vide grain par grain.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, mulberry32 } from '../engine.js';
import { DotGrid, circleClip } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome, typedLabel } from '../vignette.js';
import { WHEEL } from './roue.js';

const [start, end] = CUTS.sept; // 28 -> 30
const HG = { x: 1540, y: 548, w: 330, h: 620 };
const OUT0 = 1.8;

let grid, num, word, tag, label, ch, hg, sandTop, sandBot, stream, grains, ring, hgSvg;

export default {
  id: 'sept',
  start,
  end,
  pre: 0.25,
  build(root) {
    grid = new DotGrid(root, { bg: C.cream, dot: C.ink, alpha: 0.1 });
    label = typedLabel(root, { x: 126, y: 262, text: 'ON ENCHAÎNE AVEC', color: C.purple, size: 28 });
    // Chiffre + SECONDES alignés sur la ligne de base.
    const row = el('div', { class: 'abs', style: { left: '112px', top: '318px', display: 'flex', alignItems: 'flex-end', gap: '26px' } });
    num = el('div', { class: 'display', style: { fontSize: '470px', color: C.ink, lineHeight: '0.86', width: '250px', textAlign: 'center', transformOrigin: '50% 80%' } });
    word = el('div', { class: 'display', style: { fontSize: '168px', color: C.ink, lineHeight: '0.86', marginBottom: '0px', whiteSpace: 'nowrap' } });
    word.textContent = 'SECONDES';
    row.append(num, word);
    tag = el('div', { class: 'abs body', style: { left: '124px', top: '740px', fontSize: '46px', fontWeight: 500, color: C.ink2 } });
    tag.textContent = 'Réponds avant le dernier grain.';
    root.append(row, tag);

    // Sablier : montants, deux bulbes, sable, filet qui coule, grains.
    const { w, h } = HG;
    const bw = w - 60, top = 58, bot = h - 58, mid = h / 2;
    const bulb = `M${30} ${top} H${w - 30} C${w - 30} ${mid - 120} ${w / 2 + 26} ${mid - 40} ${w / 2 + 16} ${mid}
      C${w / 2 + 26} ${mid + 40} ${w - 30} ${bot - 120 + 120 - 120} ${w - 30} ${bot} H30
      C30 ${bot - 120} ${w / 2 - 26} ${mid + 40} ${w / 2 - 16} ${mid} C${w / 2 - 26} ${mid - 40} 30 ${mid - 120} 30 ${top} Z`;
    hgSvg = frag(`<svg class="abs" style="left:${HG.x - w / 2}px;top:${HG.y - h / 2}px;overflow:visible" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><clipPath id="hgc"><path d="${bulb}"/></clipPath></defs>
      <rect x="16" y="16" width="${w}" height="${h}" rx="30" fill="none"/>
      <path d="${bulb}" transform="translate(14 14)" fill="${C.ink}"/>
      <path d="${bulb}" fill="${C.surface}"/>
      <g clip-path="url(#hgc)">
        <rect class="st" x="0" y="0" width="${w}" height="0" fill="${C.amber}"/>
        <path class="sb" d="" fill="${C.amber}"/>
        <rect class="sm" x="${w / 2 - 5}" y="${mid}" width="10" height="0" fill="${C.amber}"/>
        <g class="gr"></g>
      </g>
      <path d="${bulb}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
      <rect x="0" y="0" width="${w}" height="${top}" rx="14" fill="${C.purple}" stroke="${C.ink}" stroke-width="9"/>
      <rect x="0" y="${bot}" width="${w}" height="${top}" rx="14" fill="${C.purple}" stroke="${C.ink}" stroke-width="9"/>
      <rect x="18" y="${top}" width="16" height="${bot - top}" fill="${C.ink}"/>
      <rect x="${w - 34}" y="${top}" width="16" height="${bot - top}" fill="${C.ink}"/>
    </svg>`);
    root.appendChild(hgSvg);
    hgSvg.style.transformOrigin = `${w / 2}px ${h / 2}px`;
    sandTop = hgSvg.querySelector('.st');
    sandBot = hgSvg.querySelector('.sb');
    stream = hgSvg.querySelector('.sm');
    const g = hgSvg.querySelector('.gr');
    const rnd = mulberry32(77);
    grains = Array.from({ length: 14 }, () => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', (4 + rnd() * 3).toFixed(1));
      c.setAttribute('fill', C.orange);
      g.appendChild(c);
      return { c, ph: rnd(), dx: (rnd() - 0.5) * 14 };
    });
    hg = { w, h, top, bot, mid };
    ring = el('div', { class: 'abs', style: { left: '0px', top: '0px', borderRadius: '50%', border: `10px solid ${C.ink}`, boxSizing: 'border-box' } });
    root.appendChild(ring);
    ch = chrome(root, { n: 3, color: C.ink });
  },
  update(lt, t) {
    // Entrée : le moyeu de la roue s'ouvre en iris.
    if (lt < 0.02) {
      const r = lerp(64, 2300, E.inCubic(prog(lt, -0.25, 0.02)));
      circleClip(this.root, r, WHEEL.x, WHEEL.y);
      ring.style.display = 'block';
      Object.assign(ring.style, { left: `${WHEEL.x - r}px`, top: `${WHEEL.y - r}px`, width: `${2 * r}px`, height: `${2 * r}px` });
    } else {
      this.root.style.clipPath = 'none';
      ring.style.display = 'none';
    }
    // Sortie : l'écran monte, la vignette suivante pousse par dessous.
    T(this.root, { y: -1080 * E.inOutQuart(prog(lt, OUT0, 2.0)) });

    grid.draw(t, { pump: 0.3 * [0, 0.5, 1, 1.5].reduce((a, b) => a + pulse(lt, b, 0.01, 0.14), 0), ripples: [{ x: 300, y: 500, t0: 1.75, speed: 1800, amp: 2.2, width: 60 }] });
    ch.update(lt);
    label.update(lt);

    // Compte à rebours sur les croches.
    const n = lt < 0 ? 7 : Math.max(0, 7 - Math.floor(lt / 0.25));
    num.textContent = String(n);
    word.textContent = n <= 1 ? 'SECONDE' : 'SECONDES';
    const tick = lt - Math.floor(Math.max(0, lt) / 0.25) * 0.25;
    const punch = 1 + 0.22 * Math.exp(-tick * 22) * (lt >= 0 ? 1 : 0);
    const col = n <= 1 ? C.orange : n % 2 ? C.ink : C.purple;
    num.style.color = col;
    T(num, { s: punch, r: n === 0 ? 5 * wobble(lt - 1.75, 7, 6) : 0 });
    T(tag, { o: prog(lt, 0.15, 0.35), y: 30 * (1 - E.outCubic(prog(lt, 0.15, 0.4))) });

    // Sablier : retourné à l'entrée (ressort), se vide jusqu'à 29.75.
    const flip = lt < 0 ? 180 : 180 * (1 - spring(lt, 1.8, 0.45));
    const buzz = lt > 1.75 ? 4 * wobble(lt - 1.75, 11, 5) : 0;
    T(hgSvg, { r: flip + buzz, y: 0 });
    const f = clamp(prog(lt, 0.15, 1.75));
    const { w, top, bot, mid } = hg;
    const topH = (mid - top) * 0.8 * (1 - f);
    sandTop.setAttribute('y', (mid - 18 - topH).toFixed(1));
    sandTop.setAttribute('height', topH.toFixed(1));
    const pile = 20 + (bot - mid - 40) * 0.72 * f;
    sandBot.setAttribute('d', `M0 ${bot} L0 ${bot - pile * 0.55} Q${w / 2} ${bot - pile * 1.25} ${w} ${bot - pile * 0.55} L${w} ${bot} Z`);
    const flowing = lt > 0.15 && lt < 1.75;
    stream.setAttribute('height', flowing ? (bot - mid).toFixed(1) : '0');
    grains.forEach((g) => {
      if (!flowing) return g.c.setAttribute('cy', '-50');
      const ph = (g.ph + lt * 2.4) % 1;
      g.c.setAttribute('cx', (w / 2 + g.dx * ph).toFixed(1));
      g.c.setAttribute('cy', (mid + ph * (bot - mid - pile * 0.9)).toFixed(1));
    });
  },
  sfx: () => [
    { t: 27.75, id: 'iris', g: 0.5, dur: 0.3 },
    ...Array.from({ length: 7 }, (_, i) => ({ t: 28 + i * 0.25, id: 'clock', g: 0.55 + i * 0.04, note: i % 2 ? 76 : 81 })),
    { t: 28.0, id: 'whoosh', g: 0.35, dur: 0.3, p: 0.5 },
    { t: 29.75, id: 'buzzer', g: 0.8 },
    { t: 29.8, id: 'whooshUp', g: 0.45, dur: 0.25 },
  ],
  fx: { shakes: [{ t: 29.75, amp: 16, decay: 0.16 }] },
};
