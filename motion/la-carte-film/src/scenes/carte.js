// 0:06 - 0:18 - La carte. Quatre services (I à IV), trois plats chacun, un
// choisi à chaque fois : la pastille se remplit de laiton, le prix (en
// moments) s'envole vers la barre de commande. Puis la page défile.
import { E, el, T, op, prog, clamp, lerp, spring } from '../engine.js';
import { W, H, CX, pick, VERT } from '../format.js';
import { L } from '../brand.js';
import { box, reveal, menuRow, tapRing, filet, star } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.carte;
const U0 = 6 - start; // u = temps absolu - 6 s
export const STEP = 3;
export const TAPS = [1.5, 4.5, 7.5, 10.5].map((u) => u + 6);
export const SCROLL = [17.6, 18.6];

export const COURSES = [
  {
    num: 'I', title: 'Mises en bouche', sub: 'Pour commencer en douceur', sel: 1,
    items: [
      ['Café de spécialité', "1 anecdote d'enfance", 'Flat white, coin de comptoir et grandes questions.'],
      ['Balade au bord de Seine', '2 fous rires', 'Quais, ponts, et le tour des bouquinistes au coucher du soleil.'],
      ['Librairie et chocolat chaud', '1 confidence', "Chacun choisit un livre pour l'autre. Interdiction de se justifier."],
    ],
  },
  {
    num: 'II', title: 'Plats', sub: 'Le cœur de la soirée, au moins un choix de la maison', sel: 1,
    items: [
      ['Bowling', '1 revanche obligatoire', 'Strike, spare ou gouttière, le perdant porte les chaussures avec fierté.'],
      ['Atelier poterie', '2 mains pleines de farine', 'On crée quelque chose à deux. Le résultat compte moins que les rires.'],
      ['Cinéma de quartier', '1 critique enflammée', 'Grand écran, sièges rouges, débat passionné obligatoire en sortant.'],
    ],
  },
  {
    num: 'III', title: 'Desserts', sub: 'La douceur de fin', sel: 0,
    items: [
      ['Crêperie', '1 bouchée partagée', 'Beurre sucre pour les puristes, caramel beurre salé pour les autres.'],
      ['Glace artisanale', '1 goût dans ton cornet', 'Deux boules, débat sur le meilleur parfum inclus.'],
      ['Churros', '1 duel de gourmandise', 'Chauds, sucrés, et étonnamment difficiles à partager.'],
    ],
  },
  {
    num: 'IV', title: 'Accords & suppléments', sub: 'Servis à discrétion', sel: 1,
    items: [
      ['Playlist partagée', 'offert', 'Construite à deux sur le trajet. Véto autorisé une seule fois.'],
      ['Golden hour', 'selon arrivage', 'Supplément lumière dorée, selon la météo du jour.'],
      ['Photomaton', '1 grimace', 'Quatre poses, zéro dignité, un souvenir.'],
    ],
  },
];

// Mise en page : colonne titre à gauche + liste à droite (16:9),
// empilées et centrées (9:16).
const LT = pick({ x: 150, w: 620, intro: 150, numY: 196, numH: 300, numSize: 280, title: 520, tSize: 104, align: 'left' },
  { x: 60, w: 960, intro: 236, numY: 280, numH: 236, numSize: 212, title: 520, tSize: 92, align: 'center' });
const LS = pick({ x: 830, y: 200, w: 960, gap: 206, h: 162 }, { x: 40, y: 830, w: 1000, gap: 206, h: 190 });
const ROW = { pad: 24, check: 34, gap: 20, nameY: 30, nameSize: pick(46, 44), priceSize: pick(34, 32), descSize: pick(31, 30) };

// Positions des prix (coordonnées écran), mesurées à la construction :
// la barre de commande s'en sert pour les faire voler.
export const FLY = [];

let page, intro, numerals, heads, rows, ring;

export default {
  id: 'carte',
  start,
  end,
  z: 1,
  build(root) {
    root.appendChild(box(0, 0, W, H, { background: L.paper }));
    page = box(0, 0, W, H);
    root.appendChild(page);
    intro = reveal(page, { x: LT.x, y: LT.intro, w: LT.w, text: 'Composez votre menu', cls: 'sc', size: pick(26, 30), color: L.inkSoft, align: LT.align });
    const mask = box(LT.x - 20, LT.numY, LT.w + 40, LT.numH, { overflow: 'hidden' });
    page.appendChild(mask);
    numerals = COURSES.map((c) => {
      const n = el('div', { class: 'abs up', style: { left: '20px', top: '0px', width: `${LT.w}px`, height: `${LT.numH}px`, lineHeight: `${LT.numH}px`, fontSize: `${LT.numSize}px`, fontWeight: 300, color: L.brass, textAlign: LT.align, letterSpacing: '0.02em' } }, c.num);
      mask.appendChild(n);
      return n;
    });
    // Mesures (la scène est affichée le temps de construire).
    const disp = root.style.display;
    root.style.display = 'block';
    const stage = root.closest('#stage').getBoundingClientRect();
    heads = COURSES.map((c) => {
      const title = reveal(page, { x: LT.x, y: LT.title, w: LT.w, text: c.title, cls: 'disp', size: LT.tSize, lh: 1.02, align: LT.align, color: L.ink });
      const th = title.root.getBoundingClientRect().height;
      const sub = reveal(page, { x: LT.x, y: LT.title + th + 22, w: pick(LT.w - 40, LT.w), text: c.sub, cls: 'body it', size: pick(34, 34), color: L.inkSoft, align: LT.align, lh: 1.25 });
      const sh = sub.root.getBoundingClientRect().height;
      const oy = LT.title + th + 22 + sh + 34;
      const ox = VERT ? CX - 120 : LT.x;
      const fa = filet(page, ox, oy, 96, L.line, '0% 50%');
      const s = star(20);
      page.appendChild(s);
      const fb = filet(page, ox + 144, oy, 96, L.line, '0% 50%');
      return { title, sub, fa, fb, s, ox, oy };
    });
    rows = COURSES.map((c, k) =>
      c.items.map(([name, price, desc], i) => {
        const r = menuRow(page, { x: LS.x, y: LS.y + i * LS.gap, w: LS.w, h: LS.h, name, price, desc, ...ROW });
        if (i === c.sel) {
          const b = r.price.getBoundingClientRect();
          FLY[k] = { x: b.left - stage.left + b.width / 2, y: b.top - stage.top + b.height / 2, text: price, size: ROW.priceSize };
          r.tap = { x: LS.x + ROW.pad + ROW.check / 2 + 4, y: LS.y + i * LS.gap + ROW.nameY + ROW.nameSize * 0.2 + ROW.check / 2 + 4 };
        }
        return r;
      }),
    );
    root.style.display = disp;
    ring = tapRing(page);
  },
  update(lt) {
    const u = lt - U0;
    intro.update(u + 0.9, prog(u, 11.6, 12.2));
    COURSES.forEach((c, k) => {
      const c0 = k * STEP;
      const inT = k === 0 ? -1.4 : c0 - 0.35, last = k === COURSES.length - 1;
      const outP = last ? 0 : prog(u, c0 + 2.55, c0 + 3.05);
      // Chiffre romain : entre par le bas, sort par le haut.
      const a = E.inOutCubic(prog(u, inT - 0.1, inT + 0.55));
      const b = last ? 0 : E.inOutCubic(prog(u, c0 + 2.6, c0 + 3.2));
      T(numerals[k], { y: (1 - a) * LT.numH - b * LT.numH });
      const h = heads[k];
      h.title.update(u - inT, outP, 0.07, 0.9, 30);
      h.sub.update(u - inT - 0.25, outP, 0.03, 0.8);
      const op_ = E.outCubic(prog(u, inT + 0.3, inT + 1.1)) * (1 - E.inOutCubic(outP));
      h.fa.set(op_);
      h.fb.set(op_);
      const k2 = spring(u - inT - 0.45, 1.8, 0.45) * (1 - E.inOutCubic(outP));
      T(h.s, { x: h.ox + 110, y: h.oy - 7.5, s: Math.max(0.0001, k2), r: (1 - k2) * 90 });
      rows[k].forEach((r, i) => {
        const on = u > inT - 0.2 && u < c0 + 3.2;
        r.root.style.visibility = on || last ? 'visible' : 'hidden';
        const tap = TAPS[k] - 6;
        r.set({ a: prog(u, inT + 0.1 + i * 0.09, inT + 0.8 + i * 0.09), s: i === c.sel ? prog(u, tap, tap + 0.9) : 0, out: last ? 0 : prog(u, c0 + 2.5 + i * 0.05, c0 + 3.0 + i * 0.05) });
      });
    });
    // Toucher : un seul anneau, replacé sur la ligne choisie du service courant.
    const k = clamp(Math.floor((u + 0.5) / STEP), 0, 3);
    const tr = rows[k][COURSES[k].sel].tap;
    ring.set(tr.x, tr.y, u - (TAPS[k] - 6));
    // Défilement vers le carnet de réservations.
    const sc = E.inOutCubic(prog(lt + start, SCROLL[0], SCROLL[1]));
    T(page, { y: -sc * H });
  },
  sfx: () => [
    ...COURSES.map((_, k) => ({ t: 6 + k * STEP - 0.35, id: 'roll', g: 0.25 })),
    ...TAPS.flatMap((t, k) => [
      { t: t - 0.2, id: 'approach', g: 0.15 },
      { t, id: 'tap', g: 0.55, p: VERT ? 0 : 0.3 },
      { t: t + 0.05, id: 'select', g: 0.45, note: [74, 76, 79, 81][k] },
    ]),
    { t: SCROLL[0], id: 'swish', g: 0.35, dur: 1.0 },
  ],
};
