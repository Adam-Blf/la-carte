// 0:40 - 0:42 - La rafale : les 7 autres jeux, un par croche, en pleine page.
// Fonds clairs uniquement (écarts de luminance modérés : pas de stroboscope).
import { C, E, el, T, op, prog, clamp, lerp, pulse, splitWords } from '../engine.js';
import { DotGrid } from '../components.js';
import { CUTS } from '../timeline.js';
import { RAFALE, game } from '../data.js';
import { chrome } from '../vignette.js';
import { W, H, CX, CY, VERT, pick } from '../format.js';
import { tileRect } from './grille.js';

const [start, end] = CUTS.rafale; // 40 -> 42
const DT = 0.25;
const BGS = [C.yellow, C.butter, C.cream, C.amber, C.gold, C.yellow, C.butter];
const INKS = [C.ink, C.purple, C.ink, C.ink, C.ink, C.purple, C.ink];

let cards;

export default {
  id: 'rafale',
  start,
  end,
  z: 30, // au-dessus de la grille pendant le raccord
  build(root) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = '900 1000px BS';
    cards = RAFALE.map((id, k) => {
      const g = game(id);
      const card = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${W}px`, height: `${H}px` } });
      const grid = new DotGrid(card, { bg: BGS[k], dot: C.ink, alpha: 0.1 });
      const name = g.name.toUpperCase();
      // 9:16 : titre coupé en deux lignes équilibrées.
      const words = name.split(' ');
      let lines = [name];
      if (VERT && words.length > 1) {
        let best = null;
        for (let i = 1; i < words.length; i++) {
          const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
          const m = Math.max(c.measureText(a).width, c.measureText(b).width);
          if (!best || m < best.m) best = { m, l: [a, b] };
        }
        lines = best.l;
      }
      const widest = Math.max(...lines.map((l) => c.measureText(l).width));
      const size = Math.min(pick(430, 330), (pick(1720, 960) / widest) * 1000);
      const blockH = lines.length * 0.86 * size;
      const ttl = el('div', { class: 'abs display', style: { left: '0px', top: `${CY - blockH / 2 - 20}px`, width: `${W}px`, textAlign: 'center', fontSize: `${size}px`, lineHeight: '0.86', color: INKS[k], whiteSpace: 'nowrap', textShadow: `${size / 32}px ${size / 32}px 0 ${INKS[k] === C.ink ? C.cream : C.ink}` } });
      ttl.innerHTML = lines.join('<br>');
      const tag = el('div', { class: 'abs body', style: { left: `${pick(0, 90)}px`, top: `${CY + blockH / 2 + 30}px`, width: `${pick(1920, 900)}px`, textAlign: 'center', fontSize: '44px', fontWeight: 500, color: C.ink2 } });
      tag.textContent = g.tag;
      card.append(ttl, tag);
      const ch = chrome(card, { n: 9 + k, color: C.ink });
      root.appendChild(card);
      return { card, grid, ttl, tag, ch };
    });
  },
  update(lt, t) {
    const k = clamp(Math.floor(lt / DT), 0, cards.length - 1);
    cards.forEach((c, i) => {
      const on = i === k;
      c.card.style.display = on ? 'block' : 'none';
      if (!on) return;
      const d = lt - i * DT;
      c.grid.draw(t, { pump: 0.6 * pulse(d, 0, 0.01, 0.12) });
      // Chaque titre arrive un peu trop grand et se pose (zoom lent).
      T(c.ttl, { s: lerp(1.14, 1, E.outCubic(prog(d, 0, 0.22))), r: lerp(-2.5, 0, E.outCubic(prog(d, 0, 0.2))) });
      T(c.tag, { y: 30 * (1 - E.outCubic(prog(d, 0.02, 0.16))), o: prog(d, 0.02, 0.1) });
      c.ch.update(d, DT);
      // Dernier : se réduit pour devenir une tuile de la grille.
      if (i === cards.length - 1) {
        const sh = E.inOutCubic(prog(lt, 1.76, 2.0));
        const tr = tileRect(2);
        c.card.style.transform = sh > 0 ? `translate(${(sh * (tr.cx - CX)).toFixed(1)}px,${(sh * (tr.cy - CY)).toFixed(1)}px) scale(${lerp(1, tr.w / W, sh).toFixed(4)})` : 'none';
        c.card.style.boxShadow = sh > 0 ? `0 0 0 ${(24 * sh / Math.max(0.2, lerp(1, 0.18, sh))).toFixed(1)}px ${C.ink}` : 'none';
      }
    });
  },
  sfx: () => RAFALE.map((_, i) => ({ t: 40 + i * DT, id: 'hit', g: 0.7, p: (i % 2 ? 0.3 : -0.3), note: 60 + [0, 3, 5, 7, 10, 12, 15][i] })),
};
