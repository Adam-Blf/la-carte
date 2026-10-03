// 0:26 - 0:38 - L'addition. La nuit se fait depuis le bouton, une petite
// imprimante thermique sort le ticket ligne à ligne (par à-coups, comme un
// vrai massicot), le total défile et se pose sur 0,00 €, puis le tampon
// « Réservation confirmée » tombe. Le ticket est détaché.
import { E, el, frag, T, op, prog, clamp, lerp, spring, wobble, mulberry32 } from '../engine.js';
import { W, H, CX, pick, VERT } from '../format.js';
import { L } from '../brand.js';
import { box, reveal } from '../components.js';
import { BTN } from './commande.js';
import { NAME } from './carnet.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.addition;
const REVEAL = [25.15, 26.0];
const RW = pick(640, 820), FS = pick(27, 33);
const SLIT = pick(972, 1560);
const STEPS_A = { t0: 26.8, n: 14, dt: 0.34, move: 0.2 };
const ROLL = [31.7, 33.0];
const STEPS_B = { t0: 33.15, n: 4, dt: 0.19, move: 0.13 };
export const STAMP = 34.0;
const TEAR = 35.0;

let night, clipBox, receipt, reels, stamp, M, titles, printer;

const line = (html, cls = '') => `<div class="${cls}">${html}</div>`;
const row = (l, r, cls = '') => `<div class="rrow ${cls}"><span>${l}</span><span class="lead"></span><span class="rr">${r}</span></div>`;
const dash = '<div class="dash"></div>';

export default {
  id: 'addition',
  start,
  end,
  z: 12,
  build(root) {
    night = box(0, 0, W, H, { background: L.night });
    root.appendChild(night);
    // Titres de part et d'autre (16:9) ou au-dessus (9:16).
    titles = VERT
      ? [reveal(night, { x: 40, y: 236, w: W - 80, text: "L'addition, s'il vous plaît.", cls: 'disp', size: 76, color: L.cream })]
      : [
          reveal(night, { x: 100, y: 300, w: 500, text: "L'addition,", cls: 'disp', size: 112, color: L.cream, align: 'left' }),
          reveal(night, { x: W - 620, y: 540, w: 520, text: "s'il vous plaît.", cls: 'disp', size: 112, color: L.cream, align: 'right' }),
        ];
    clipBox = box(0, 0, W, SLIT, { overflow: 'hidden' });
    night.appendChild(clipBox);
    const style = `<style>
      .rc { font-family: 'EB Garamond', Georgia, serif; font-size: ${FS}px; line-height: 1.45; color: ${L.receiptInk}; font-variant-numeric: lining-nums; }
      .rc .c { text-align: center; } .rc .b { font-weight: 600; } .rc .dim { opacity: .62; } .rc .up { text-transform: uppercase; letter-spacing: .06em; }
      .rc .r { text-align: right; } .rc .mt { margin-top: .4em; }
      .rc .dash { height: 0; margin: .7em 0; border-top: 2px dashed rgba(26,26,24,.4); }
      .rc .rrow { display: flex; align-items: baseline; white-space: nowrap; }
      .rc .lead { flex: 1 1 auto; min-width: 20px; margin: 0 .45em; border-bottom: 1.5px solid rgba(26,26,24,.3); transform: translateY(-.3em); }
      .rc .big { font-size: 1.28em; font-weight: 600; }
      .rc .reel { display: inline-block; position: relative; overflow: hidden; vertical-align: bottom; height: 1.45em; width: .56em; }
      .rc .reel > div { position: absolute; left: 0; top: 0; width: 100%; text-align: center; }
      .rc .reel > div > div { height: 1.45em; }
    </style>`;
    const courses = [
      ['Mises en bouche', 'Balade au bord de Seine', '2 fous rires'],
      ['Plats', 'Atelier poterie', '2 mains pleines de farine'],
      ['Desserts', 'Crêperie', '1 bouchée partagée'],
      ['Accords & suppléments', 'Golden hour', 'selon arrivage'],
    ];
    const reelHtml = (i) => `<span class="reel" data-r="${i}"><div>${Array.from({ length: 30 }, (_, k) => `<div>${k % 10}</div>`).join('')}</div></span>`;
    const html = [
      line('MAISON A.', 'c b big', ''),
      line('la carte des rendez-vous', 'c'),
      line('quelque part entre deux fous rires', 'c dim'),
      line('ticket nº 0002 - table 02', 'c dim mt'),
      dash,
      ...courses.map(([c, n, p]) => line(c, 'b up') + line(`1× ${n}`) + line(p, 'r dim')),
      dash,
      line('Addition', 'b up'),
      row('fous rires', '2'),
      row('mains pleines de farine', '2'),
      row('bouchée partagée', '1'),
      row('attentions de la maison', '1 offerte'),
      `<div class="mt">${row('SOUS-TOTAL', '5 moments dus')}</div>`,
      row('TVA (100 % intentions)', 'incluse'),
      row('POURBOIRE', 'en sourires'),
      `<div class="mt big" data-m="total">${row('TOTAL EN EUROS', `${reelHtml(0)},${reelHtml(1)}${reelHtml(2)} €`)}</div>`,
      line("réglé d'avance par la maison", 'c b up', '') + '<div data-m="endA"></div>',
      dash,
      line('Disponibilités retenues', 'b up'),
      ...['Mercredi soirée', 'Vendredi soirée', 'Samedi après-midi', 'Samedi soirée', 'Dimanche midi'].map((s) => line(`- ${s}`)),
      dash,
      line(`table dressée au nom de <span class="b up">${NAME}</span>`, 'c'),
      dash,
      '<div data-m="bar" style="position:relative"></div>',
      line('0002 - MAISON - A', 'c dim', '').replace('class="c dim"', 'class="c dim" style="letter-spacing:.4em"'),
      line('MERCI DE VOTRE VISITE', 'c b', '').replace('class="c b"', 'class="c b" style="margin-top:1.6em"'),
      line('à très vite - A.', 'c'),
      line('cuisine inspectée par un petit chef très exigeant', 'c dim mt'),
    ].join('');
    receipt = frag(`<div class="abs rc" style="left:${CX - RW / 2}px;top:0;width:${RW}px;box-sizing:border-box;padding:${FS * 1.6}px ${FS * 1.6}px ${FS * 2.4}px;background:${L.receipt}">${style}${html}</div>`);
    clipBox.appendChild(receipt);
    // Code-barres : barres de largeurs pseudo-aléatoires (graine fixe).
    const bar = receipt.querySelector('[data-m="bar"]');
    const rnd = mulberry32(2);
    const bw = RW - FS * 3.2 - 40;
    let x = 0, rects = '';
    while (x < bw - 8) {
      const w = [2, 2, 3, 4, 6][Math.floor(rnd() * 5)];
      rects += `<rect x="${x}" y="0" width="${w}" height="${FS * 2.6}" fill="${L.receiptInk}"/>`;
      x += w + [2, 3, 3, 5][Math.floor(rnd() * 4)];
    }
    bar.appendChild(frag(`<svg style="display:block;margin:0 auto" width="${x}" height="${FS * 2.6}">${rects}</svg>`));
    // Tampon laiton, double filet, incliné.
    stamp = el('div', { class: 'abs', style: { left: '50%', top: `${-FS * 3.6}px`, zIndex: '2', border: `${Math.round(FS * 0.34)}px double ${L.brass}`, padding: `${FS * 0.45}px ${FS * 1.0}px`, textAlign: 'center', fontFamily: "'EB Garamond', serif", fontWeight: 600, letterSpacing: '0.2em', fontSize: `${FS * 1.45}px`, lineHeight: '1.2', color: L.brass, whiteSpace: 'nowrap', transformOrigin: '50% 50%', opacity: '0', mixBlendMode: 'multiply', background: 'rgba(212,164,55,0.05)' } });
    stamp.innerHTML = 'RÉSERVATION<br>CONFIRMÉE';
    bar.appendChild(stamp);
    // Bord déchiré en bas du ticket.
    const n = Math.round(RW / 24), tw = RW / n;
    let d = `M0 0 H${RW} V2`;
    for (let i = n; i > 0; i--) d += ` L${(i - 0.5) * tw} 14 L${(i - 1) * tw} 2`;
    const tooth = frag(`<svg style="position:absolute;left:0;bottom:-14px;display:block" width="${RW}" height="14"><path d="${d} Z" fill="${L.receipt}"/></svg>`);
    receipt.appendChild(tooth);
    reels = [...receipt.querySelectorAll('.reel > div')];
    // Mesures.
    const disp = root.style.display;
    root.style.display = 'block';
    const off = (q) => receipt.querySelector(q).offsetTop;
    M = { L: receipt.offsetHeight + 14, total: off('[data-m="total"]'), endA: off('[data-m="endA"]'), bar: off('[data-m="bar"]') };
    M.lh = FS * 1.45;
    root.style.display = disp;
    // Imprimante : socle sombre, fente soulignée d'un filet laiton.
    printer = box(CX - RW / 2 - 60, SLIT - 14, RW + 120, H - SLIT + 40, { background: '#050b15', borderRadius: '18px 18px 0 0', borderTop: `2px solid ${L.brass}` });
    printer.appendChild(box(44, 12, RW + 32, 6, { background: '#000', borderRadius: '3px' }));
    night.appendChild(printer);
  },
  update(lt) {
    const t = lt + start;
    // Révélation circulaire depuis le bouton « L'addition ».
    const r = E.inOutCubic(prog(t, REVEAL[0], REVEAL[1])) * Math.hypot(W, H) * 1.05;
    night.style.clipPath = t < REVEAL[1] ? `circle(${r.toFixed(1)}px at ${BTN.x}px ${BTN.y}px)` : 'none';
    titles.forEach((tt, i) => tt.update(t - 26.1 - i * 0.35, prog(t, 37.0, 37.6), 0.08, 1.0, 34));
    T(printer, { y: (1 - E.outCubic(prog(t, 25.7, 26.5))) * 260 });
    // Avance papier par à-coups.
    const FA = M.endA + M.lh * 0.9;
    const stepF = (S, a, b) => {
      let f = 0;
      for (let i = 0; i < S.n; i++) {
        const t0 = S.t0 + i * S.dt;
        f += E.inOutSine(prog(t, t0, t0 + S.move)) / S.n;
      }
      return lerp(a, b, f);
    };
    let F = t < STEPS_B.t0 ? stepF(STEPS_A, 0, FA) : stepF(STEPS_B, FA, M.L);
    // Vibration du moteur pendant l'avance.
    const moving = [STEPS_A, STEPS_B].some((S) => {
      const k = (t - S.t0) / S.dt;
      return k >= 0 && k < S.n && (t - S.t0 - Math.floor(k) * S.dt) < S.move;
    });
    const jit = moving ? Math.sin(t * 480) * 0.7 : 0;
    // Détachement : le ticket saute, s'incline un peu.
    const tear = spring(t - TEAR, 2.2, 0.45);
    T(receipt, { x: jit, y: SLIT - F - tear * 44, r: -1.4 * tear });
    receipt.style.transformOrigin = '50% 100%';
    // Total : rouleaux qui se posent tour à tour sur 0,00.
    reels.forEach((rl, i) => {
      const b = ROLL[1] - (2 - i) * 0.18;
      const p = E.outCubic(prog(t, ROLL[0], b));
      const turns = t < ROLL[0] ? 7 + i * 3 : (1 - p) * (26 - i * 3);
      rl.style.transform = `translateY(${(-turns * 1.45).toFixed(3)}em)`;
    });
    // Tampon : tombe de haut (x2,4), rebondit, pose l'encre.
    const s = t - STAMP;
    const k = s < 0 ? 0 : spring(s, 3.0, 0.5);
    stamp.style.transform = `translateX(-50%) rotate(-12deg) scale(${lerp(2.4, 1, k).toFixed(4)})`;
    op(stamp, s < -0.12 ? 0 : 0.92 * E.outCubic(prog(s, -0.12, 0.02)));
  },
  fx: { shakes: [{ t: STAMP, amp: 9, decay: 0.12, freq: 24 }] },
  sfx: () => [
    { t: REVEAL[0], id: 'night', g: 0.4, dur: 1.0 },
    { t: 25.7, id: 'motor', g: 0.25 },
    ...Array.from({ length: STEPS_A.n }, (_, i) => ({ t: STEPS_A.t0 + i * STEPS_A.dt, id: 'feed', g: 0.5, dur: STEPS_A.move })),
    // Un cliquetis à chaque chiffre franchi par le dernier rouleau.
    ...Array.from({ length: 20 }, (_, i) => ({ t: ROLL[0] + (ROLL[1] - ROLL[0]) * (1 - Math.cbrt((20 - i) / 20)), id: 'reel', g: 0.2 + 0.01 * i })),
    { t: ROLL[1], id: 'ding', g: 0.7 },
    ...Array.from({ length: STEPS_B.n }, (_, i) => ({ t: STEPS_B.t0 + i * STEPS_B.dt, id: 'feed', g: 0.5, dur: STEPS_B.move })),
    { t: STAMP, id: 'stamp', g: 0.95 },
    { t: TEAR - 0.12, id: 'rip', g: 0.55 },
  ],
};
