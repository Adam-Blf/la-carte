// Habillage commun des vignettes de jeux : « JEU NUMÉRO N » en haut (comme
// l'écran d'enchaînement de l'app) et la barre de progression des 15 jeux.
import { C, E, el, T, op, prog, clamp, lerp, rgba, splitChars } from './engine.js';
import { W, H, pick } from './format.js';

// Gabarit des vignettes : étiquette + titre à gauche (16:9), en haut (9:16).
export const VL = pick({ lx: 126, ly: 290, tx: 120, ty: 338, tw: 840, ts: 176 }, { lx: 92, ly: 356, tx: 86, ty: 404, tw: 920, ts: 150 });

export function chrome(root, { n, color = C.cream, total = 15 }) {
  const top = el('div', { class: 'abs mono', style: { left: '0px', top: `${pick(44, 250)}px`, width: `${W}px`, textAlign: 'center', fontSize: '24px', fontWeight: 700, color, opacity: 0.85 } });
  top.textContent = `JEU NUMÉRO ${n}`;
  const sw = pick(44, 40);
  const bar = el('div', { class: 'abs', style: { left: `${W / 2 - (total * sw + (total - 1) * 8) / 2}px`, top: `${pick(1018, 1500)}px`, display: 'flex', gap: '8px' } });
  const segs = [];
  for (let i = 0; i < total; i++) {
    const s = el('div', { style: { width: `${sw}px`, height: '9px', position: 'relative', background: rgba(color === C.cream ? C.cream : C.ink, 0.18) } });
    const f = el('div', { class: 'abs', style: { left: '0px', top: '0px', height: '9px', width: `${sw}px`, background: color, transformOrigin: '0 50%' } });
    s.appendChild(f);
    bar.appendChild(s);
    segs.push(f);
  }
  root.append(top, bar);
  return {
    top,
    bar,
    update(lt, dur = 2) {
      segs.forEach((f, i) => {
        const v = i < n - 1 ? 1 : i === n - 1 ? E.outCubic(prog(lt, 0.05, dur - 0.1)) : 0;
        T(f, { sx: v });
      });
      op(top, 0.85 * clamp(lt / 0.1 + 1));
    },
  };
}

// Label « ON ENCHAÎNE AVEC » tapé lettre à lettre.
export function typedLabel(parent, { x, y, text, color, size = 28 }) {
  const d = el('div', { class: 'abs mono', style: { left: `${x}px`, top: `${y}px`, fontSize: `${size}px`, fontWeight: 700, color, whiteSpace: 'nowrap' } });
  const chars = splitChars(d, text);
  parent.appendChild(d);
  return {
    root: d,
    update(t, rate = 0.022) {
      chars.forEach((c, i) => op(c, t > i * rate ? 1 : 0));
    },
  };
}

// Retournement plein cadre (sortie / entrée), comme une carte qu'on tourne.
export function flipOut(node, p) {
  if (p <= 0) {
    node.style.transform = 'none';
    node.style.borderRadius = '0px';
    node.style.boxShadow = 'none';
    return;
  }
  const a = 90 * E.inCubic(p);
  const s = lerp(1, 0.8, E.outCubic(Math.min(1, p * 1.4)));
  node.style.transform = `perspective(2600px) rotateY(${a.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  node.style.borderRadius = `${(44 * clamp(p * 3)).toFixed(1)}px`;
  node.style.boxShadow = `0 0 0 ${(12 * clamp(p * 3)).toFixed(1)}px ${C.ink}`;
}
export function flipIn(node, p) {
  if (p >= 1) {
    node.style.transform = 'none';
    node.style.borderRadius = '0px';
    node.style.boxShadow = 'none';
    return;
  }
  const a = -90 * (1 - E.outCubic(p));
  const s = lerp(0.8, 1, E.inOutCubic(p));
  node.style.transform = `perspective(2600px) rotateY(${a.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  node.style.borderRadius = `${(44 * clamp((1 - p) * 3)).toFixed(1)}px`;
  node.style.boxShadow = `0 0 0 ${(12 * clamp((1 - p) * 3)).toFixed(1)}px ${C.ink}`;
}
