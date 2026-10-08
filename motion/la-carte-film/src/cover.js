// Couverture de la carte (Cover.tsx) : cadre à double filet, étoiles d'angle,
// « La Carte » et ses ornements. Partagée par l'ouverture et la signature.
import { E, el, frag, T, op, prog, clamp, lerp, spring, splitChars } from './engine.js';
import { W, H, CX, pick } from './format.js';
import { L } from './brand.js';
import { box, star, ornament, reveal, filet } from './components.js';

export const F = pick(44, 40); // retrait du cadre
export const S = pick(184, 172); // corps du titre « La Carte »
export const Y = pick(
  { maison: 150, logo: 178, rdv: 478, fleuron: 548, tag: 598, btn: 748, table: 904 },
  { maison: 470, logo: 500, rdv: 800, fleuron: 872, tag: 930, btn: 1170, table: 1330 },
);

export function buildCover(root) {
  // Plan de perspective à plat, carte en preserve-3d, recto + verso.
  const shade = box(0, 0, W, H, { background: `linear-gradient(90deg, rgba(14,29,49,0.4), rgba(14,29,49,0) 55%)`, opacity: '0' });
  const wrap = box(0, 0, W, H, { perspective: '2200px', perspectiveOrigin: '50% 50%' });
  const card = box(0, 0, W, H, { transformStyle: 'preserve-3d', transformOrigin: '0px 50%' });
  const front = box(0, 0, W, H, { background: L.paper, backfaceVisibility: 'hidden' });
  const back = box(0, 0, W, H, { background: L.paperDeep, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' });
  back.appendChild(box(F, F, W - 2 * F, H - 2 * F, { border: `1.5px solid ${L.line}`, boxSizing: 'border-box' }));
  card.append(front, back);
  wrap.appendChild(card);
  root.append(shade, wrap);

  // Cadre : deux rectangles tracés au trait.
  const svg = frag(`<svg class="abs" style="left:0;top:0" width="${W}" height="${H}">
    <rect x="${F}" y="${F}" width="${W - 2 * F}" height="${H - 2 * F}" fill="none" stroke="${L.line}" stroke-width="1.5"/>
    <rect x="${F + 12}" y="${F + 12}" width="${W - 2 * F - 24}" height="${H - 2 * F - 24}" fill="none" stroke="${L.line}" stroke-width="1.5"/></svg>`);
  front.appendChild(svg);
  const rects = [...svg.querySelectorAll('rect')];
  const per = rects.map((r) => 2 * (Number(r.getAttribute('width')) + Number(r.getAttribute('height'))));
  const corners = [[F + 26, F + 26], [W - F - 26, F + 26], [F + 26, H - F - 26], [W - F - 26, H - F - 26]].map(([x, y]) => {
    const s = star(22);
    front.appendChild(s);
    return { s, x, y };
  });

  const maison = reveal(front, { x: 0, y: Y.maison, w: W, text: 'Maison A. - depuis toujours', cls: 'sc', size: pick(30, 32), color: L.inkSoft });

  // Logo : « La Carte », traits et points de part et d'autre, MAISON A.
  const word = el('div', { class: 'abs disp', style: { left: '0px', top: `${Y.logo}px`, width: `${W}px`, textAlign: 'center', fontSize: `${S}px`, letterSpacing: '0.02em', color: L.ink, whiteSpace: 'nowrap', lineHeight: '1.1' } });
  const chars = splitChars(word, 'La Carte');
  front.appendChild(word);
  const tw = S * 3.45; // largeur optique du mot (mesurée plus bas si possible)
  const ly = Y.logo + S * 0.66;
  const len = pick(150, 64), gap = pick(40, 26);
  const sides = [-1, 1].map((d) => {
    const ln = box(0, ly, len, 1.5, { background: L.brassBright, opacity: '0.7', transformOrigin: d < 0 ? '100% 50%' : '0% 50%' });
    const dot = box(0, ly - 3.5, 8, 8, { borderRadius: '50%', background: L.brassBright });
    front.append(ln, dot);
    return { ln, dot, d };
  });
  const sub = el('div', { class: 'abs up', style: { left: '0px', top: `${Y.logo + S * 1.13}px`, width: `${W}px`, textAlign: 'center', fontSize: `${S * 0.15}px`, letterSpacing: '0.5em', paddingLeft: '0.5em', boxSizing: 'border-box', color: L.brass, fontWeight: 500 } });
  const subChars = splitChars(sub, 'MAISON A.');
  front.appendChild(sub);
  const orn1 = ornament(front, CX, Y.logo + S * 1.5, 170);

  const rdv = reveal(front, { x: 0, y: Y.rdv, w: W, text: 'des rendez-vous', cls: 'sc', size: pick(40, 42), color: L.brass });
  // Fleuron entre deux doubles filets.
  const fl = el('div', { class: 'abs body', style: { left: `${CX - 30}px`, top: `${Y.fleuron - 26}px`, width: '60px', textAlign: 'center', fontSize: '40px', lineHeight: '1', color: L.brass, transformOrigin: '50% 60%' } }, '❦');
  front.appendChild(fl);
  const fa = filet(front, CX - 130, Y.fleuron - 4, 92, L.line, '100% 50%');
  const fb = filet(front, CX + 38, Y.fleuron - 4, 92, L.line, '0% 50%');

  let measured = false;
  const place = () => {
    if (measured) return;
    const r = word.getBoundingClientRect();
    const a = chars[0].getBoundingClientRect(), b = chars[chars.length - 1].getBoundingClientRect();
    const w = b.right - a.left;
    if (w > 10) measured = true;
    const half = (w > 10 ? w : tw) / 2;
    sides.forEach(({ ln, dot, d }) => {
      const inner = CX + d * (half + gap);
      ln.style.left = `${d < 0 ? inner - 12 - len : inner + 12}px`;
      dot.style.left = `${inner - 4}px`;
    });
  };

  // Mesure à la construction (scène affichée le temps de la mesure).
  const disp = root.style.display;
  root.style.display = 'block';
  place();
  root.style.display = disp;

  return {
    shade, wrap, card, front, back,
    // Ouverture / fermeture : angle en degrés (0 = fermée, -112 = ouverte).
    angle(a) {
      T(card, { ry: a });
      const k = Math.sin((clamp(-a / 112) * Math.PI) / 1);
      op(shade, 0.8 * Math.max(0, k));
    },
    frame(p) {
      rects.forEach((r, i) => {
        const q = E.inOutCubic(prog(p, i * 0.15, 0.85 + i * 0.15));
        r.style.strokeDasharray = `${per[i]}`;
        r.style.strokeDashoffset = `${per[i] * (1 - q)}`;
      });
    },
    corners(t) {
      corners.forEach(({ s, x, y }, i) => {
        const k = spring(t - i * 0.08, 1.8, 0.45);
        T(s, { x: x - 11, y: y - 11, s: Math.max(0.0001, k), r: (1 - k) * 135 });
      });
    },
    maison: (t, out) => maison.update(t, out),
    logo(t) {
      chars.forEach((c, i) => {
        const p = E.app(prog(t, 0.1 + i * 0.05, 1.0 + i * 0.05));
        T(c, { y: (1 - p) * 40, o: p });
      });
      sides.forEach(({ ln, dot }) => {
        T(ln, { sx: Math.max(0.0001, E.inOutCubic(prog(t, 0.5, 1.4))) });
        T(dot, { s: Math.max(0.0001, spring(t - 0.45, 2.2, 0.45)) });
      });
      subChars.forEach((c, i) => op(c, E.app(prog(t, 0.8 + i * 0.04, 1.4 + i * 0.04))));
      orn1.set(prog(t, 1.0, 1.9));
    },
    rdv: (t) => rdv.update(t),
    fleuron(t) {
      const k = spring(t, 1.6, 0.5);
      T(fl, { s: Math.max(0.0001, k), o: prog(t, 0, 0.2) });
      fa.set(E.outCubic(prog(t, 0.1, 0.9)));
      fb.set(E.outCubic(prog(t, 0.1, 0.9)));
    },
  };
}
