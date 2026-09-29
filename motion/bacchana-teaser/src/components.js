import { C, E, el, frag, T, op, clamp, lerp, prog, rgba, mulberry32, spring, splitChars, splitWords, tw } from './engine.js';

import { W, H } from './format.js';
export { W, H };

// ------------------------------------------------------------------ trame
// La trame de points du site (.bg-grain), agrandie pour la vidéo, avec des
// ondes de choc : les points gonflent au passage d'un anneau.
export class DotGrid {
  constructor(parent, o = {}) {
    this.w = o.w || W;
    this.h = o.h || H;
    this.cv = el('canvas', { width: this.w, height: this.h, class: 'abs', style: { left: '0px', top: '0px' } });
    parent.appendChild(this.cv);
    this.ctx = this.cv.getContext('2d');
    this.bg = o.bg || C.purple;
    this.dot = o.dot || C.cream;
    this.alpha = o.alpha ?? 0.09;
    this.sp = o.spacing || 30;
    this.r = o.r || 2.3;
    this.dots = o.dots ?? false;
  }
  draw(t, o = {}) {
    const c = this.ctx, sp = this.sp;
    const bg = o.bg || this.bg, dot = o.dot || this.dot, alpha = o.alpha ?? this.alpha;
    const ripples = o.ripples || [];
    const ox = ((o.dx || 0) % sp + sp) % sp, oy = ((o.dy || 0) % sp + sp) % sp;
    c.globalAlpha = 1;
    c.fillStyle = bg;
    c.fillRect(0, 0, this.w, this.h);
    // Aplats francs : la trame de points est retirée (rendu trop « généré »).
    if (!this.dots || alpha <= 0.001) return;
    const base = this.r * (1 + (o.pump || 0));
    const live = ripples.filter((rp) => t >= rp.t0 && t - rp.t0 < 2.2);
    const hot = [];
    c.fillStyle = rgba(dot, alpha);
    c.beginPath();
    for (let y = oy - sp; y < this.h + sp; y += sp) {
      for (let x = ox - sp; x < this.w + sp; x += sp) {
        let b = 0;
        for (const rp of live) {
          const age = t - rp.t0;
          const d = Math.hypot(x - rp.x, y - rp.y) - (rp.speed || 1500) * age;
          const wdt = rp.width || 70;
          b += (rp.amp ?? 1.8) * Math.exp(-(d * d) / (2 * wdt * wdt)) * Math.exp(-age * (rp.decay ?? 1.6));
        }
        const rr = base * (1 + b);
        if (b > 0.18) hot.push(x, y, rr);
        else {
          c.moveTo(x + rr, y);
          c.arc(x, y, rr, 0, Math.PI * 2);
        }
      }
    }
    c.fill();
    if (hot.length) {
      c.fillStyle = rgba(o.hotDot || dot, Math.min(1, alpha * 4));
      c.beginPath();
      for (let i = 0; i < hot.length; i += 3) {
        c.moveTo(hot[i] + hot[i + 2], hot[i + 1]);
        c.arc(hot[i], hot[i + 1], hot[i + 2], 0, Math.PI * 2);
      }
      c.fill();
    }
  }
}

// ------------------------------------------------------------------ logo
// Reconstruction fidèle du favicon Bacchana (viewBox 512), découpé en groupes
// animables : verre gauche, verre droit, éclat. Les bulles vivent dans un
// clipPath aligné sur le corps de chaque verre.
let uid = 0;
const STAR_D = 'M256 74 L272 130 L328 146 L272 162 L256 218 L240 162 L184 146 L240 130 Z';
export const starPath = STAR_D;

export function makeLogo(size = 512) {
  const id = `lg${++uid}`;
  const glass = (side) => {
    const L = side === 'L';
    const x = L ? 146 : 268, rot = L ? -14 : 14, cx = L ? 190 : 322, fill = L ? C.orange : C.yellow;
    const bubbles = L
      ? [[180, 310, 9], [214, 342, 7], [196, 372, 5], [168, 350, 6]]
      : [[306, 312, 9], [338, 344, 7], [322, 372, 5], [296, 352, 6]];
    return `
      <g class="${side}"><g transform="rotate(${rot} ${cx} 300)"><g class="sq">
        <rect x="${x + 14}" y="236" width="108" height="164" rx="16" fill="#111111"/>
        <rect x="${x}" y="222" width="108" height="164" rx="16" fill="${fill}"/>
        <g clip-path="url(#${id}${side})">${bubbles
          .map(([bx, by, r]) => `<circle class="b" cx="${bx}" cy="${by}" r="${r}" fill="${C.cream}" data-x="${bx}" data-y="${by}" data-r="${r}"/>`)
          .join('')}</g>
        <rect x="${x}" y="222" width="108" height="164" rx="16" fill="none" stroke="#111111" stroke-width="12"/>
        <rect class="foam" x="${x}" y="222" width="108" height="42" rx="16" fill="${C.cream}" stroke="#111111" stroke-width="12"/>
      </g></g></g>`;
  };
  const svg = frag(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
      <defs>
        <clipPath id="${id}L"><rect x="146" y="228" width="108" height="158" rx="14"/></clipPath>
        <clipPath id="${id}R"><rect x="268" y="228" width="108" height="158" rx="14"/></clipPath>
      </defs>
      <g class="lines"></g>
      ${glass('L')}
      ${glass('R')}
      <g class="star"><path d="${STAR_D}" fill="${C.yellow}" stroke="#111111" stroke-width="12" stroke-linejoin="round"/></g>
    </svg>`);
  const gL = svg.querySelector('g.L'), gR = svg.querySelector('g.R');
  const sqL = gL.querySelector('.sq'), sqR = gR.querySelector('.sq');
  const star = svg.querySelector('g.star');
  const bL = [...gL.querySelectorAll('circle.b')], bR = [...gR.querySelectorAll('circle.b')];
  const lines = svg.querySelector('g.lines');
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('stroke', '#111111');
    ln.setAttribute('stroke-width', '12');
    ln.setAttribute('stroke-linecap', 'round');
    lines.appendChild(ln);
    rays.push(ln);
  }
  // Pivots : bas de chaque verre (là où ils se touchent), centre de l'éclat.
  const PIV_L = [205, 372], PIV_R = [307, 372];
  function setGlass(g, sq, piv, o) {
    const dx = o.dx || 0, dy = o.dy || 0, r = o.r || 0;
    g.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${r.toFixed(3)} ${piv[0]} ${piv[1]})`);
    const sx = o.sx ?? 1, sy = o.sy ?? 1;
    sq.setAttribute('transform', `translate(${piv[0]} 386) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-piv[0]} -386)`);
    g.style.opacity = o.o ?? 1;
  }
  function fizz(list, t, amount, seed) {
    list.forEach((c, i) => {
      const x0 = +c.dataset.x, y0 = +c.dataset.y, r0 = +c.dataset.r;
      if (amount <= 0) {
        c.setAttribute('cx', x0);
        c.setAttribute('cy', y0);
        c.setAttribute('r', r0);
        return;
      }
      const span = 130; // de 392 à 262 (sous la mousse)
      const speed = 38 + ((i * 17 + seed) % 5) * 7;
      const ph = ((y0 - 262) + speed * t * amount) % span;
      const y = 392 - ph;
      const x = x0 + Math.sin(t * 5 + i * 1.7 + seed) * 3.5 * amount;
      c.setAttribute('cx', x.toFixed(2));
      c.setAttribute('cy', y.toFixed(2));
      c.setAttribute('r', (r0 * (0.75 + 0.25 * (ph / span))).toFixed(2));
    });
  }
  return {
    svg,
    set(o = {}) {
      setGlass(gL, sqL, PIV_L, o.L || {});
      setGlass(gR, sqR, PIV_R, o.R || {});
      const s = o.star || {};
      const ss = s.s ?? 1;
      star.setAttribute(
        'transform',
        `translate(${256 + (s.dx || 0)} ${146 + (s.dy || 0)}) rotate(${(s.r || 0).toFixed(3)}) scale(${ss.toFixed(4)}) translate(-256 -146)`,
      );
      star.style.opacity = s.o ?? 1;
      fizz(bL, o.t || 0, o.fizz || 0, 1);
      fizz(bR, o.t || 0, o.fizz || 0, 3);
      // Traits d'impact autour du point de choc (p de 0 à 1).
      const p = o.rays ?? 0;
      rays.forEach((ln, i) => {
        if (p <= 0 || p >= 1) {
          ln.style.display = 'none';
          return;
        }
        ln.style.display = 'block';
        const a = (i / rays.length) * Math.PI * 2 + Math.PI / 8;
        const cx = o.raysX ?? 256, cy = o.raysY ?? 230;
        const k = E.outCubic(p);
        const R0 = o.raysR0 ?? 92, R1 = o.raysR1 ?? 160, len = o.raysLen ?? 44;
        const r1 = R0 + (R1 - R0) * k, r2 = r1 + len * (1 - k) + 4;
        ln.setAttribute('x1', (cx + Math.cos(a) * r1).toFixed(1));
        ln.setAttribute('y1', (cy + Math.sin(a) * r1).toFixed(1));
        ln.setAttribute('x2', (cx + Math.cos(a) * r2).toFixed(1));
        ln.setAttribute('y2', (cy + Math.sin(a) * r2).toFixed(1));
        ln.setAttribute('stroke-width', (12 * (1 - k * 0.5)).toFixed(2));
      });
    },
  };
}

// L'éclat seul (loader, confettis, ponctuations).
export function makeStar(size = 120, fill = C.yellow, stroke = '#111111', sw = 12) {
  const svg = frag(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="178 68 156 156" width="${size}" height="${size}">
    <path d="${STAR_D}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/></svg>`);
  return svg;
}

// ------------------------------------------------------------------ confettis
// Particules à solution analytique (pas d'intégration pas à pas) : la
// position à l'instant t se calcule directement, donc n'importe quelle image
// est reproductible.
export class Burst {
  constructor(o) {
    const rnd = mulberry32(o.seed || 7);
    const R = (a, b) => lerp(a, b, rnd());
    this.t0 = o.t0;
    this.g = o.gravity ?? 1400;
    this.k = o.drag ?? 2.2;
    this.parts = [];
    const colors = o.colors || [C.yellow, C.orange, C.cream, C.amber, C.purpleSoft, C.butter];
    const shapes = o.shapes || ['star', 'circle', 'card', 'ring', 'tri'];
    for (let i = 0; i < (o.count || 80); i++) {
      const ang = R(...(o.angle || [0, Math.PI * 2]));
      const sp = R(...(o.speed || [600, 1800]));
      this.parts.push({
        x: o.x + R(-(o.spread || 0), o.spread || 0),
        y: o.y + R(-(o.spread || 0), o.spread || 0),
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp + (o.lift || 0),
        size: R(...(o.size || [14, 34])),
        rot: R(0, 360),
        spin: R(-720, 720),
        color: colors[Math.floor(rnd() * colors.length)],
        shape: shapes[Math.floor(rnd() * shapes.length)],
        life: R(...(o.life || [1.4, 2.4])),
        wob: R(0, 6.28),
      });
    }
    this.stroke = o.stroke ?? '#111111';
  }
  draw(c, t) {
    const age = t - this.t0;
    if (age < 0) return;
    const k = this.k, g = this.g;
    const e = Math.exp(-k * age);
    for (const p of this.parts) {
      if (age > p.life) continue;
      const x = p.x + (p.vx * (1 - e)) / k + Math.sin(age * 4 + p.wob) * 8 * age;
      const y = p.y + (g / k) * age + ((p.vy - g / k) * (1 - e)) / k;
      const fade = clamp((p.life - age) / 0.35);
      const s = p.size * (0.4 + 0.6 * clamp(age / 0.08)) * (0.35 + 0.65 * fade);
      c.save();
      c.translate(x, y);
      c.rotate(((p.rot + p.spin * age) * Math.PI) / 180);
      c.fillStyle = p.color;
      c.strokeStyle = this.stroke;
      c.lineWidth = Math.max(2, s * 0.14);
      c.lineJoin = 'round';
      c.beginPath();
      drawShape(c, p.shape, s);
      if (p.shape === 'ring') {
        c.lineWidth = s * 0.3;
        c.strokeStyle = p.color;
        c.stroke();
      } else {
        c.fill();
        c.stroke();
      }
      c.restore();
    }
  }
}
export function drawShape(c, shape, s) {
  if (shape === 'circle') c.arc(0, 0, s * 0.42, 0, Math.PI * 2);
  else if (shape === 'ring') c.arc(0, 0, s * 0.36, 0, Math.PI * 2);
  else if (shape === 'card') roundRect(c, -s * 0.33, -s * 0.48, s * 0.66, s * 0.96, s * 0.12);
  else if (shape === 'tri') {
    c.moveTo(0, -s * 0.5);
    c.lineTo(s * 0.45, s * 0.35);
    c.lineTo(-s * 0.45, s * 0.35);
    c.closePath();
  } else {
    // éclat 4 branches
    const a = s * 0.55, b = s * 0.13;
    c.moveTo(0, -a);
    c.lineTo(b, -b);
    c.lineTo(a, 0);
    c.lineTo(b, b);
    c.lineTo(0, a);
    c.lineTo(-b, b);
    c.lineTo(-a, 0);
    c.lineTo(-b, -b);
    c.closePath();
  }
}
export function roundRect(c, x, y, w, h, r) {
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// Canvas plein cadre pour particules.
export function fxCanvas(parent) {
  const cv = el('canvas', { width: W, height: H, class: 'abs', style: { left: '0px', top: '0px', pointerEvents: 'none' } });
  parent.appendChild(cv);
  return cv.getContext('2d');
}

// ------------------------------------------------------------------ texte
// Bloc titre des vignettes : étiquette mono, titre en capitales, accroche.
// Les lignes montent derrière un masque, décalées en cascade.
export function titleBlock(parent, o) {
  const size = o.size || 190;
  const root = el('div', { class: 'abs', style: { left: `${o.x}px`, top: `${o.y}px`, width: `${o.width || 900}px`, textAlign: o.align || 'left' } });
  let label = null;
  if (o.label) {
    label = el('div', { class: 'mono', style: { fontSize: `${o.labelSize || 26}px`, color: o.labelColor || o.color, marginBottom: `${o.labelGap ?? 22}px`, fontWeight: 700 } });
    root.appendChild(label);
  }
  const labelChars = label ? splitChars(label, o.label) : [];
  const lines = [];
  for (const txt of o.lines) {
    const mask = el('div', { style: { overflow: 'hidden', paddingTop: `${size * 0.16}px`, marginTop: `${-size * 0.16}px`, paddingBottom: `${size * 0.04}px` } });
    const inner = el('div', { class: 'display', style: { fontSize: `${size}px`, color: o.color, whiteSpace: 'nowrap' } });
    inner.textContent = txt;
    mask.appendChild(inner);
    root.appendChild(mask);
    lines.push(inner);
  }
  let tag = null, tagWords = [];
  if (o.tag) {
    tag = el('div', { class: 'body', style: { fontSize: `${o.tagSize || 46}px`, fontWeight: o.tagWeight || 500, color: o.tagColor || o.color, marginTop: `${o.tagGap ?? 26}px`, lineHeight: 1.25, maxWidth: `${o.tagWidth || 820}px`, display: o.align === 'center' ? 'inline-block' : 'block' } });
    tagWords = splitWords(tag, o.tag);
    root.appendChild(tag);
  }
  parent.appendChild(root);
  const d = o.delay || 0;
  return {
    root,
    lines,
    update(lt, exit = 0) {
      const t = lt - d;
      const lx = E.inCubic(prog(exit, 0, 0.5));
      labelChars.forEach((ch, i) => op(ch, (t > i * 0.018 ? 1 : 0) * (1 - lx)));
      lines.forEach((ln, i) => {
        const p = E.snap(prog(t, 0.06 + i * 0.07, 0.46 + i * 0.07));
        const x = E.inCubic(prog(exit, i * 0.08, 0.7 + i * 0.08));
        // Course de 1,35 em : les accents (0,17 em au-dessus des capitales)
        // restent sous le masque avant l'entrée.
        T(ln, { y: (1 - p) * size * 1.35 - x * size * 1.4, skx: (1 - p) * -6 });
      });
      tagWords.forEach((w, i) => {
        const p = E.outCubic(prog(t, 0.28 + i * 0.03, 0.62 + i * 0.03));
        T(w, { y: (1 - p) * 60, o: p * (1 - prog(exit, 0.2, 0.6)) });
      });
    },
  };
}

// ------------------------------------------------------------------ objets
// Bouton néo-brutaliste : aplat, filet, ombre pleine décalée qui s'écrase
// quand on appuie.
export function brutalButton(parent, o) {
  const root = el('div', { class: 'abs', style: { left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, height: `${o.h}px` } });
  const sh = el('div', { class: 'abs', style: { left: `${o.off}px`, top: `${o.off}px`, width: `${o.w}px`, height: `${o.h}px`, background: o.shadow || C.ink, borderRadius: `${o.radius || 0}px` } });
  const face = el('div', {
    class: 'abs center display',
    style: {
      left: '0px', top: '0px', width: `${o.w}px`, height: `${o.h}px`, boxSizing: 'border-box',
      background: o.bg || C.yellow, border: `${o.border || 8}px solid ${o.ink || C.ink}`, borderRadius: `${o.radius || 0}px`,
      color: o.ink || C.ink, fontSize: `${o.size || 120}px`, lineHeight: 1, paddingTop: `${(o.size || 120) * 0.08}px`, whiteSpace: 'nowrap',
    },
  });
  face.textContent = o.text || '';
  root.append(sh, face);
  parent.appendChild(root);
  return {
    root, face, sh,
    press(p) {
      T(face, { x: o.off * p, y: o.off * p });
    },
  };
}

// Indicateur de doigt (cercle crème) avec onde au tap.
export function touchDot(parent) {
  const root = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '0px', height: '0px' } });
  const ring = el('div', { class: 'abs', style: { left: '-60px', top: '-60px', width: '120px', height: '120px', borderRadius: '50%', border: `6px solid ${C.cream}`, boxSizing: 'border-box' } });
  const dot = el('div', { class: 'abs', style: { left: '-44px', top: '-44px', width: '88px', height: '88px', borderRadius: '50%', background: rgba(C.cream, 0.92), border: `6px solid ${C.ink}`, boxSizing: 'border-box' } });
  root.append(ring, dot);
  parent.appendChild(root);
  return {
    root,
    set(x, y, { o = 1, press = 0, ripple = -1, s = 1 } = {}) {
      T(root, { x, y, o });
      T(dot, { s: s * (1 - 0.22 * press) });
      if (ripple >= 0 && ripple < 1) {
        T(ring, { s: 0.7 + 1.9 * E.outCubic(ripple), o: 1 - ripple });
      } else T(ring, { s: 1, o: 0 });
    },
  };
}

// Tampon encreur (COUPABLE, PÉNALITÉ...).
export function stamp(parent, o) {
  const root = el('div', {
    class: 'abs display center',
    style: {
      left: `${o.x}px`, top: `${o.y}px`, transform: 'translate(-50%,-50%)', padding: `${o.pad || 14}px ${o.padX || 34}px ${(o.pad || 14) - 4}px`,
      border: `${o.border || 10}px solid ${o.color || C.red}`, color: o.color || C.red, fontSize: `${o.size || 130}px`, lineHeight: 1,
      borderRadius: '10px', background: o.bg || 'transparent', whiteSpace: 'nowrap', boxShadow: o.double ? `inset 0 0 0 6px ${o.bg || C.cream}, inset 0 0 0 10px ${o.color || C.red}` : 'none',
    },
  });
  root.textContent = o.text;
  parent.appendChild(root);
  return {
    root,
    set(p, rot = -10) {
      // p : 0 caché, 1 posé. Arrive de plus haut et plus grand, rebond sec.
      if (p <= 0) {
        root.style.opacity = 0;
        return;
      }
      const s = lerp(1.9, 1, E.outQuint(clamp(p * 1.6))) + 0.06 * Math.sin(clamp(p) * Math.PI) * (p > 0.6 ? 0 : 1);
      root.style.opacity = clamp(p * 5);
      root.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${s.toFixed(4)})`;
    },
  };
}

// Pastille (prénom, tag) : pilule en aplat avec filet et ombre pleine.
export function pill(parent, o) {
  const root = el('div', { class: 'abs', style: { left: `${o.x}px`, top: `${o.y}px`, width: '0px', height: '0px' } });
  const inner = el('div', {
    class: `${o.mono ? 'mono' : 'display'}`,
    style: {
      position: 'absolute', left: '0px', top: '0px', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap',
      padding: o.pad || '10px 42px 2px', background: o.bg || C.yellow, color: o.ink || C.ink, fontSize: `${o.size || 96}px`,
      border: `${o.border || 7}px solid ${o.stroke || C.ink}`, borderRadius: `${o.radius ?? 999}px`,
      boxShadow: o.off ? `${o.off}px ${o.off}px 0 ${o.shadow || C.ink}` : 'none', lineHeight: 1,
    },
  });
  inner.textContent = o.text;
  root.appendChild(inner);
  parent.appendChild(root);
  return { root, inner };
}

// Bulle de dialogue en SVG (rectangle arrondi + queue), texte centré.
export function bubble(parent, o) {
  const w = o.w, h = o.h, r = o.r || 34, tail = o.tail || 'bl';
  const tx = tail.includes('l') ? w * 0.22 : w * 0.78;
  const dir = tail.includes('l') ? -1 : 1;
  const d = `M${r} 0 H${w - r} Q${w} 0 ${w} ${r} V${h - r} Q${w} ${h} ${w - r} ${h}
    H${tx + 34} L${tx + dir * 40 + (dir < 0 ? 0 : 0)} ${h + 62} L${tx - 18} ${h} H${r} Q0 ${h} 0 ${h - r} V${r} Q0 0 ${r} 0 Z`;
  const root = el('div', { class: 'abs', style: { left: `${o.x}px`, top: `${o.y}px`, width: `${w}px`, height: `${h}px`, transformOrigin: tail.includes('l') ? '22% 110%' : '78% 110%' } });
  const svg = frag(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 70}" viewBox="0 0 ${w} ${h + 70}" style="position:absolute;left:0;top:0;overflow:visible">
    <path d="${d}" transform="translate(${o.off || 12} ${o.off || 12})" fill="${C.ink}"/>
    <path d="${d}" fill="${o.bg || C.cream}" stroke="${C.ink}" stroke-width="${o.stroke || 7}" stroke-linejoin="round"/></svg>`);
  const txt = el('div', { class: 'abs center display', style: { left: '0px', top: '0px', width: `${w}px`, height: `${h}px`, color: o.ink || C.ink, fontSize: `${o.size || 110}px`, lineHeight: 1, paddingTop: `${(o.size || 110) * 0.08}px`, boxSizing: 'border-box', whiteSpace: 'nowrap' } });
  txt.textContent = o.text;
  root.append(svg, txt);
  if (o.name) {
    const nm = el('div', { class: 'abs mono', style: { left: tail.includes('l') ? '0px' : 'auto', right: tail.includes('l') ? 'auto' : '0px', top: `${h + 72}px`, fontSize: '24px', fontWeight: 700, color: o.nameColor || C.ink } });
    nm.textContent = o.name;
    root.appendChild(nm);
  }
  parent.appendChild(root);
  return root;
}

// Carte de jeu du hub (aplat, filet, coins 8 px à l'échelle).
export function gameTile(parent, o) {
  const k = o.k || 1;
  const root = el('div', {
    class: 'abs',
    style: {
      left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, height: `${o.h}px`, boxSizing: 'border-box',
      background: o.bg, border: `${3 * k}px solid ${C.ink}`, borderRadius: `${10 * k}px`, overflow: 'hidden',
    },
  });
  const tl = el('div', { class: 'display abs', style: { left: `${18 * k}px`, bottom: `${o.tagless ? 18 * k : 58 * k}px`, right: `${12 * k}px`, fontSize: `${(o.size || 30) * k}px`, color: o.ink || C.ink, lineHeight: 0.9 } });
  tl.textContent = o.title;
  root.appendChild(tl);
  if (!o.tagless && o.tag) {
    const tg = el('div', { class: 'body abs', style: { left: `${18 * k}px`, bottom: `${22 * k}px`, right: `${16 * k}px`, fontSize: `${13 * k}px`, color: o.ink || C.ink2, fontWeight: 500, lineHeight: 1.25, opacity: 0.86 } });
    tg.textContent = o.tag;
    root.appendChild(tg);
  }
  parent.appendChild(root);
  return root;
}

// ------------------------------------------------------------------ transitions
// Volet diagonal : révèle un calque par un bord incliné, avec filet d'encre.
export function diagClip(node, p, { angle = 14, from = 'right' } = {}) {
  // p : 0 rien, 1 tout. On fait glisser une ligne inclinée à travers le cadre.
  const slope = Math.tan((angle * Math.PI) / 180) * H;
  const span = W + slope;
  const x = from === 'right' ? W + slope / 2 - span * p : -slope / 2 + span * p;
  if (from === 'right') node.style.clipPath = `polygon(${x + slope / 2}px 0, ${W + 40}px 0, ${W + 40}px ${H}px, ${x - slope / 2}px ${H}px)`;
  else node.style.clipPath = `polygon(-40px 0, ${x + slope / 2}px 0, ${x - slope / 2}px ${H}px, -40px ${H}px)`;
  return { x, slope };
}
export function circleClip(node, r, x, y) {
  node.style.clipPath = `circle(${Math.max(0, r).toFixed(1)}px at ${x}px ${y}px)`;
}
export function clearClip(node) {
  node.style.clipPath = 'none';
}

export { spring, tw };
