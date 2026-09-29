import { E, el, frag, T, op, prog, clamp, lerp, spring, splitWords, splitChars } from './engine.js';
import { W, H, pick } from './format.js';
import { L } from './brand.js';

export { W, H };

// ------------------------------------------------------------------ couleurs
function hex(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
export function mix(a, b, p) {
  const A = hex(a), B = hex(b), q = clamp(p);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(',')})`;
}

export const box = (x, y, w, h, style = {}) =>
  el('div', { class: 'abs', style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...style } });

// Étoile à quatre branches (le ✦ des cartes), dessinée en SVG pour être nette.
const STAR = 'M0 -1 C0.1 -0.2 0.2 -0.1 1 0 C0.2 0.1 0.1 0.2 0 1 C-0.1 0.2 -0.2 0.1 -1 0 C-0.2 -0.1 -0.1 -0.2 0 -1Z';
export function star(size, color = L.brass) {
  const r = size / 2;
  return frag(`<svg class="abs" style="left:0;top:0;overflow:visible;transform-origin:${r}px ${r}px" width="${size}" height="${size}" viewBox="-1 -1 2 2"><path d="${STAR}" fill="${color}"/></svg>`);
}

// Double filet (deux traits fins), déroulé depuis le centre ou un bord.
export function filet(parent, x, y, w, color = L.line, origin = '50% 50%') {
  const d = box(x, y, w, 5, { borderTop: `1.5px solid ${color}`, borderBottom: `1.5px solid ${color}`, boxSizing: 'border-box', transformOrigin: origin });
  parent.appendChild(d);
  return { root: d, set: (p) => T(d, { sx: Math.max(0.0001, p) }) };
}

// Filet - ✦ - filet, centré en cx. p : 0 -> 1.
export function ornament(parent, cx, y, w = 240, color = L.brass) {
  const g = w / 2 - 22;
  const a = filet(parent, cx - w / 2, y, g, L.line, '100% 50%');
  const b = filet(parent, cx + 22, y, g, L.line, '0% 50%');
  const s = star(20, color);
  parent.appendChild(s);
  return {
    set(p) {
      a.set(E.outCubic(prog(p, 0.15, 1)));
      b.set(E.outCubic(prog(p, 0.15, 1)));
      const k = spring(p * 1.2, 1.6, 0.45);
      T(s, { x: cx - 10, y: y - 7.5, s: Math.max(0.0001, k), r: (1 - k) * 90 });
    },
  };
}

// Texte révélé mot par mot, comme les « reveal » framer-motion du site
// (montée de 24 px + fondu, courbe 0.2/0.8/0.2/1).
export function reveal(parent, o) {
  const d = el('div', {
    class: `abs ${o.cls || 'body'}`,
    style: {
      left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, textAlign: o.align || 'center', fontSize: `${o.size}px`,
      color: o.color || L.ink, lineHeight: o.lh ? String(o.lh) : '', whiteSpace: o.nowrap ? 'nowrap' : 'normal',
      ...(o.style || {}),
    },
  });
  const words = splitWords(d, o.text);
  words.forEach((w) => (w.parentElement.style.overflow = 'visible'));
  parent.appendChild(d);
  return {
    root: d,
    words,
    update(t, out = 0, stagger = 0.06, dur = 0.9, rise = 24) {
      const q = E.inOutCubic(clamp(out));
      words.forEach((w, i) => {
        const p = E.app(prog(t, i * stagger, i * stagger + dur));
        T(w, { y: (1 - p) * rise - q * rise * 0.8, o: p * (1 - q) });
      });
    },
  };
}

// Ligne de carte : pastille, nom, filet de conduite, prix, description.
export function menuRow(parent, o) {
  const row = box(o.x, o.y, o.w, o.h);
  const bg = box(0, 0, o.w, o.h, { background: L.paperDeep, transformOrigin: '0 50%' });
  const inner = box(o.pad, 0, o.w - 2 * o.pad, o.h);
  const dot = box(0, o.nameY + o.nameSize * 0.2, o.check, o.check, { borderRadius: '50%', border: `2px solid ${L.line}`, boxSizing: 'border-box' });
  const fill = box(0, o.nameY + o.nameSize * 0.2, o.check, o.check, { borderRadius: '50%', background: L.brass, transformOrigin: '50% 50%' });
  const c = o.check;
  const tick = frag(`<svg class="abs" style="left:0;top:${o.nameY + o.nameSize * 0.2}px;overflow:visible" width="${c}" height="${c}" viewBox="0 0 ${c} ${c}"><path d="M${c * 0.28} ${c * 0.52} L${c * 0.44} ${c * 0.68} L${c * 0.73} ${c * 0.34}" fill="none" stroke="${L.paper}" stroke-width="${c * 0.09}" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  const line = el('div', { class: 'abs', style: { left: `${c + o.gap}px`, top: `${o.nameY}px`, width: `${o.w - 2 * o.pad - c - o.gap}px`, display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' } });
  const name = el('span', { class: 'up', style: { fontSize: `${o.nameSize}px`, color: L.ink } }, o.name);
  const lead = el('span', { style: { flex: '1 1 auto', minWidth: '30px', margin: '0 0.5em', borderBottom: `1.5px solid ${L.line}`, transform: 'translateY(-0.3em)', transformOrigin: '0 50%' } });
  const price = el('span', { class: 'body it', style: { fontSize: `${o.priceSize}px`, color: L.inkSoft } }, o.price);
  line.append(name, lead, price);
  const desc = el('div', { class: 'abs body it', style: { left: `${c + o.gap}px`, top: `${o.nameY + o.nameSize * 1.25}px`, width: `${o.w - 2 * o.pad - c - o.gap}px`, fontSize: `${o.descSize}px`, color: L.inkSoft, lineHeight: '1.25' } }, o.desc);
  inner.append(dot, fill, tick, line, desc);
  row.append(bg, inner);
  parent.appendChild(row);
  const path = tick.querySelector('path');
  const len = c * 0.62;
  path.style.strokeDasharray = `${len}`;
  return {
    root: row, name, price, lead, line,
    // a : apparition (0 -> 1), s : sélection (0 -> 1), out : sortie
    set({ a = 1, s = 0, out = 0, y = 0 }) {
      const pa = E.app(clamp(a));
      const q = E.inOutCubic(clamp(out));
      T(row, { x: o.x, y: y + (1 - pa) * 18 - q * 30, o: pa * (1 - q) });
      row.style.left = '0px';
      row.style.top = `${o.y}px`;
      T(bg, { sx: Math.max(0.0001, E.outCubic(prog(s, 0, 0.6))), o: 1 });
      const f = spring(s * 0.8, 2.4, 0.5);
      T(fill, { s: Math.max(0.0001, f) });
      path.style.strokeDashoffset = `${len * (1 - E.outCubic(prog(s, 0.25, 0.7)))}`;
      const col = mix(L.ink, L.brass, E.outCubic(prog(s, 0.1, 0.5)));
      name.style.color = col;
      price.style.color = mix(L.inkSoft, L.brass, E.outCubic(prog(s, 0.1, 0.5)));
    },
  };
}

// Anneau de toucher : trait fin qui s'ouvre (pas de halo flou).
export function tapRing(parent, color = L.ink) {
  const r = box(0, 0, 120, 120, { borderRadius: '50%', border: `3px solid ${color}`, boxSizing: 'border-box', opacity: '0' });
  const d = box(0, 0, 44, 44, { borderRadius: '50%', background: color, opacity: '0' });
  parent.append(r, d);
  return {
    set(x, y, t) {
      if (t < -0.25 || t > 0.8) {
        op(r, 0);
        op(d, 0);
        return;
      }
      // Le doigt approche (disque qui se resserre), appuie, puis l'onde part.
      const press = t < 0 ? E.outCubic(prog(t, -0.25, 0)) : 1 - E.inCubic(prog(t, 0.05, 0.3));
      T(d, { x: x - 22, y: y - 22, s: lerp(1.6, 0.8, press), o: 0.16 * press });
      const k = E.outCubic(prog(t, 0, 0.65));
      T(r, { x: x - 60, y: y - 60, s: lerp(0.25, 1.15, k), o: t < 0 ? 0 : 0.5 * (1 - k) });
    },
  };
}

// Colonne de chiffres qui défile et se pose (rouleau de caisse enregistreuse).
export function reel(parent, o) {
  const m = box(o.x, o.y, o.w, o.h, { overflow: 'hidden' });
  const strip = el('div', { class: 'abs num', style: { left: '0px', top: '0px', width: `${o.w}px`, fontSize: `${o.size}px`, lineHeight: `${o.h}px`, textAlign: 'center', color: o.color } });
  for (let i = 0; i < 30; i++) strip.appendChild(el('div', { style: { height: `${o.h}px` } }, String((o.target + i) % 10)));
  m.appendChild(strip);
  parent.appendChild(m);
  return {
    root: m,
    set(p) {
      // p : 0 (loin) -> 1 (posé sur la cible) ; léger rebond final.
      const turns = 20 * (1 - E.outCubic(clamp(p)));
      T(strip, { y: -turns * o.h });
    },
  };
}
