// 0:16 - 0:24 - L'app. Le téléphone se dessine, la tablée se remplit, les
// prénoms claquent en stickers, on pousse la porte, le menu défile, puis la
// caméra plonge dans la carte Borderland (raccord avec la vignette suivante).
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, springV, wobble, rgba } from '../engine.js';
import { DotGrid, titleBlock, touchDot, pill } from '../components.js';
import { CUTS } from '../timeline.js';
import { GAMES, PLAYERS } from '../data.js';
import { PHONE, SCREEN, S, APPW, APPH, BCARD, bcardZoom } from '../phone.js';

const [start, end] = CUTS.app; // 16 -> 24
const PRE = 0.75; // le cadre se dessine dès 15.25
const L = (x) => x - start;

// Chronologie (secondes absolues -> locales)
const NAME_T = [L(16.5), L(17.0), L(17.5), L(18.0)];
const ADD_T = [L(17.36), L(17.86)]; // « Une chaise de plus »
const PUSH = L(20.0); // « Pousser la porte »
const NAV0 = L(20.06), NAV1 = L(20.42);
const SCR_D0 = L(20.62), SCR_D1 = L(21.55), SCR_U0 = L(21.7), SCR_U1 = L(22.25);
const TAP_JOUER = L(22.45);
const ZOOM0 = L(22.55), ZOOM1 = L(23.94);

const ink = C.ink, lineC = '#9A8BA6';
let grid, world, phone, shadow, body, outlineL, outlineR, screen, iris, appC, vTab, vHub, hubC;
let rows, pillCount, card, help, dashed, pushBtn, tabTitle, tabSub, stickers, steps, touch, jouer, bcard;

// ------------------------------------------------------------ écran « la tablée »
function buildTablee() {
  vTab = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${APPW}px`, height: `${APPH}px` } });
  tabTitle = el('div', { class: 'abs display', style: { left: '0px', top: '96px', width: `${APPW}px`, textAlign: 'center', fontSize: '74px', color: C.purple } });
  tabTitle.textContent = 'BACCHANA';
  tabSub = el('div', { class: 'abs body', style: { left: '0px', top: '176px', width: `${APPW}px`, textAlign: 'center', fontSize: '14.5px', color: ink } });
  tabSub.textContent = 'Les meilleurs jeux de soirée, servis au comptoir.';
  card = el('div', { class: 'abs', style: { left: '22px', top: '222px', width: '386px', height: '330px', boxSizing: 'border-box', background: C.surface, border: `2.5px solid ${ink}`, borderRadius: '9px' } });
  pillCount = el('div', { class: 'abs body', style: { left: '46px', top: '246px', height: '34px', padding: '0 18px', boxSizing: 'border-box', lineHeight: '31px', background: '#EFE7F4', border: '1.5px solid #BBA8CC', borderRadius: '999px', fontSize: '15px', fontWeight: 700, color: C.purple, whiteSpace: 'nowrap' } });
  const lt = el('div', { class: 'abs display', style: { left: '46px', top: '306px', fontSize: '23px', color: C.ink2 } });
  lt.textContent = 'LA TABLÉE';
  rows = [];
  for (let i = 0; i < 4; i++) {
    const r = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${APPW}px`, height: '48px' } });
    const num = el('div', { class: 'abs body center', style: { left: '46px', top: '4px', width: '36px', height: '36px', boxSizing: 'border-box', borderRadius: '50%', background: C.cream2, border: `1.5px solid ${lineC}`, fontSize: '15px', fontWeight: 700, color: ink } });
    num.textContent = String(i + 1);
    const inp = el('div', { class: 'abs body', style: { left: '92px', top: '0px', width: '228px', height: '44px', boxSizing: 'border-box', background: C.cream2, border: `1.5px solid ${lineC}`, padding: '0 14px', lineHeight: '41px', fontSize: '17px', color: '#8A7A99', whiteSpace: 'nowrap', overflow: 'hidden' } });
    const txt = el('span', {});
    const caret = el('span', { style: { display: 'inline-block', width: '2px', height: '20px', background: C.purple, verticalAlign: '-4px', marginLeft: '1px' } });
    inp.append(txt, caret);
    const av = el('div', { class: 'abs', style: { left: '330px', top: '0px', width: '44px', height: '44px', boxSizing: 'border-box', borderRadius: '50%', background: C.surface, border: `1.5px solid ${lineC}` } });
    const avIn = el('div', { class: 'abs display center', style: { left: '0px', top: '0px', width: '41px', height: '41px', fontSize: '20px', color: ink, paddingTop: '2px', boxSizing: 'border-box' } });
    av.appendChild(avIn);
    r.append(num, inp, av);
    rows.push({ r, inp, txt, caret, av, avIn });
  }
  help = el('div', { class: 'abs body', style: { left: '46px', top: '0px', width: '330px', fontSize: '12px', lineHeight: '1.35', color: C.inkMuted } });
  help.textContent = 'Genre et statut sont facultatifs. Rien ne quitte ton téléphone.';
  dashed = el('div', { class: 'abs body center', style: { left: '46px', top: '0px', width: '338px', height: '44px', boxSizing: 'border-box', border: `1.5px dashed ${ink}`, fontSize: '16px', fontWeight: 500, color: C.ink2 } });
  dashed.textContent = 'Une chaise de plus';
  pushBtn = el('div', { class: 'abs body center', style: { left: '22px', top: '812px', width: '386px', height: '58px', background: C.purple, color: C.cream, fontSize: '19px', fontWeight: 700 } });
  pushBtn.textContent = 'Pousser la porte';
  const foot = el('div', { class: 'abs body', style: { left: '0px', top: '884px', width: `${APPW}px`, textAlign: 'center', fontSize: '12px', color: C.inkMuted } });
  foot.textContent = 'Ces noms seront utilisés pour tous les jeux';
  vTab.append(tabTitle, tabSub, card, pillCount, lt, ...rows.map((r) => r.r), help, dashed, pushBtn, foot);
  return vTab;
}

// ------------------------------------------------------------ écran « hub »
function btn(x, y, w, h, html, o = {}) {
  return el('div', { class: 'abs body center', html, style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, boxSizing: 'border-box', background: o.bg || C.surface, border: `${o.bw || 2}px solid ${ink}`, fontSize: `${o.size || 15}px`, fontWeight: o.weight || 500, color: o.color || C.ink2, whiteSpace: 'nowrap' } });
}
function buildHub() {
  vHub = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${APPW}px`, height: `${APPH}px`, overflow: 'hidden' } });
  hubC = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${APPW}px`, height: '1900px' } });
  const title = el('div', { class: 'abs display', style: { left: '0px', top: '18px', width: `${APPW}px`, textAlign: 'center', fontSize: '46px', color: C.purple } });
  title.textContent = 'BACCHANA';
  const sub = el('div', { class: 'abs body', style: { left: '0px', top: '64px', width: `${APPW}px`, textAlign: 'center', fontSize: '11.2px', color: ink, whiteSpace: 'nowrap' } });
  sub.textContent = 'Au menu ce soir : 15 jeux, servis sans modération de mauvaise foi.';
  hubC.append(
    title,
    sub,
    btn(99, 88, 232, 43, `4 joueurs<span style="margin:0 12px;color:${C.inkMuted}">-</span><b style="color:${C.purple}">Modifier</b>`),
    btn(72, 140, 148, 43, 'Mes règles'),
    btn(229, 140, 128, 43, 'Les jeux'),
    btn(92, 192, 145, 43, 'Les scores'),
    btn(246, 192, 41, 43, `<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="${ink}" stroke-width="2"/><path d="M9 5v4l3 2" stroke="${ink}" stroke-width="2" fill="none"/></svg>`),
    btn(296, 192, 41, 43, `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" fill="${C.yellow}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/></svg>`),
  );
  const lance = el('div', { class: 'abs display center', style: { left: '16px', top: '248px', width: '398px', height: '67px', boxSizing: 'border-box', background: C.yellow, border: `3px solid ${ink}`, fontSize: '38px', color: ink, paddingTop: '4px' } });
  lance.textContent = 'LANCE LA SOIRÉE';
  bcard = el('div', { class: 'abs', style: { left: `${BCARD.x}px`, top: `${BCARD.y}px`, width: `${BCARD.w}px`, height: `${BCARD.h}px`, boxSizing: 'border-box', background: C.purple, border: `2.5px solid ${ink}`, borderRadius: '9px' } });
  const bt = el('div', { class: 'abs display', style: { left: '24px', top: '83px', fontSize: '40px', color: C.cream, lineHeight: '0.86' } });
  bt.textContent = 'BORDERLAND';
  const bs = el('div', { class: 'abs body', style: { left: '24px', top: '128px', fontSize: '13.5px', fontWeight: 700, color: C.cream } });
  bs.textContent = '52 cartes - 4 règles - 0 pitié.';
  jouer = el('div', { class: 'abs body center', style: { left: '24px', top: '164px', width: '104px', height: '38px', borderRadius: '999px', background: C.cream, color: C.purple, fontSize: '13.5px', fontWeight: 700, letterSpacing: '0.06em' } });
  jouer.textContent = 'JOUER';
  bcard.append(bt, bs, jouer);
  const rules = el('div', { class: 'abs body', style: { left: '50px', top: '578px', fontSize: '14px', color: C.ink2 } });
  rules.textContent = 'Règles du Borderland';
  hubC.append(lance, bcard, rules);
  const cols = [C.butter, C.gold, C.yellow, C.amber, C.gold, C.butter, C.amber, C.yellow, C.butter, C.gold, C.yellow, C.amber, C.butter, C.gold];
  GAMES.slice(1).forEach((g, i) => {
    const x = i % 2 === 0 ? 17 : 222, y = 626 + Math.floor(i / 2) * 172;
    const tile = el('div', { class: 'abs', style: { left: `${x}px`, top: `${y}px`, width: '191px', height: '158px', boxSizing: 'border-box', background: cols[i], border: `2px solid ${ink}`, borderRadius: '9px' } });
    const tt = el('div', { class: 'abs display', style: { left: '15px', right: '10px', bottom: '72px', fontSize: '22px', color: ink, lineHeight: '0.92' } });
    tt.textContent = g.name.toUpperCase();
    const tg = el('div', { class: 'abs body', style: { left: '15px', right: '12px', top: '94px', fontSize: '11.5px', fontWeight: 500, color: C.ink2, lineHeight: '1.3' } });
    tg.textContent = g.tag;
    const rb = el('div', { class: 'abs body center', style: { right: '8px', bottom: '8px', width: '82px', height: '32px', boxSizing: 'border-box', borderRadius: '999px', background: C.cream, border: `1.5px solid ${ink}`, fontSize: '11px', fontWeight: 700, color: ink, letterSpacing: '0.04em' } });
    rb.textContent = 'RÈGLES';
    tile.append(tt, tg, rb);
    hubC.appendChild(tile);
  });
  const foot = el('div', { class: 'abs body', style: { left: '0px', top: '888px', width: `${APPW}px`, textAlign: 'center', fontSize: '11.5px', color: C.inkMuted, background: rgba(C.cream, 0.94), padding: '6px 0 10px' } });
  foot.innerHTML = 'Jouez responsable : Bacchana veille sur sa tablée. <u>Infos légales</u>';
  vHub.append(hubC, foot);
  return vHub;
}

// Mise en page de la carte de la tablée selon le nombre de lignes (animé).
function layoutTablee(nRows) {
  const top0 = 222 + 122;
  rows.forEach((r, i) => {
    const appear = clamp(nRows - i);
    r.r.style.top = `${top0 + i * 56}px`;
    op(r.r, appear);
    T(r.r, { y: (1 - E.outCubic(appear)) * -12, o: appear });
  });
  const bottom = top0 + nRows * 56;
  help.style.top = `${bottom + 2}px`;
  dashed.style.top = `${bottom + 44}px`;
  card.style.height = `${bottom + 44 + 44 + 22 - 222}px`;
  return { dashedY: bottom + 44 + 22 };
}

// Coordonnées écran d'un point en px d'app.
const appToStage = (x, y) => [SCREEN.x + x * S, SCREEN.y + y * S];

export default {
  id: 'app',
  start,
  end,
  pre: PRE,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    world = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
    root.appendChild(world);

    // Colonne de gauche : deux étapes.
    steps = [
      titleBlock(world, { x: 120, y: 300, width: 600, label: 'ÉTAPE 1', labelColor: C.yellow, lines: ['LA TABLÉE'], size: 150, color: C.cream, tag: 'Ajoute les joueurs. Rien ne quitte ton téléphone.', tagColor: C.lilac, tagSize: 38, tagWidth: 520 }),
      titleBlock(world, { x: 120, y: 300, width: 600, label: 'ÉTAPE 2', labelColor: C.yellow, lines: ['LE MENU'], size: 150, color: C.cream, tag: '15 jeux, servis sans modération de mauvaise foi.', tagColor: C.lilac, tagSize: 38, tagWidth: 520 }),
    ];

    // Le téléphone.
    phone = el('div', { class: 'abs', style: { left: `${PHONE.x}px`, top: `${PHONE.y}px`, width: `${PHONE.w}px`, height: `${PHONE.h}px`, transformOrigin: '50% 50%' } });
    shadow = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${PHONE.w}px`, height: `${PHONE.h}px`, borderRadius: `${PHONE.r}px`, background: C.night } });
    body = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${PHONE.w}px`, height: `${PHONE.h}px`, borderRadius: `${PHONE.r}px`, background: C.ink, boxShadow: `inset 0 0 0 5px ${C.night}` } });
    const btnL = el('div', { class: 'abs', style: { left: '-9px', top: '210px', width: '9px', height: '90px', borderRadius: '4px 0 0 4px', background: C.ink } });
    const btnR = el('div', { class: 'abs', style: { left: `${PHONE.w}px`, top: '260px', width: '9px', height: '130px', borderRadius: '0 4px 4px 0', background: C.ink } });
    screen = el('div', { class: 'abs', style: { left: `${PHONE.bezel}px`, top: `${PHONE.bezel}px`, width: `${SCREEN.w}px`, height: `${SCREEN.h}px`, borderRadius: `${SCREEN.r}px`, overflow: 'hidden', background: C.cream } });
    appC = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: `${APPW}px`, height: `${APPH}px`, transformOrigin: '0 0', transform: `scale(${S})`, background: `radial-gradient(${rgba(C.ink, 0.07)} 1px, transparent 1px) 0 0 / 8px 8px, ${C.cream}` } });
    appC.append(buildTablee(), buildHub());
    const island = el('div', { class: 'abs', style: { left: `${APPW / 2 - 58}px`, top: '12px', width: '116px', height: '32px', borderRadius: '999px', background: C.night } });
    const time = el('div', { class: 'abs body', style: { left: '38px', top: '16px', fontSize: '15px', fontWeight: 700, color: ink } });
    time.textContent = '21:30';
    const batt = frag(`<svg class="abs" style="left:${APPW - 70}px;top:18px" width="32" height="15" viewBox="0 0 32 15"><rect x="1" y="1" width="26" height="13" rx="3.5" fill="none" stroke="${ink}" stroke-width="2"/><rect x="4" y="4" width="17" height="7" rx="1.5" fill="${ink}"/><rect x="28.5" y="5" width="2.5" height="5" rx="1" fill="${ink}"/></svg>`);
    appC.append(island, time, batt);
    screen.appendChild(appC);
    iris = screen;
    // Tracé du cadre (deux moitiés depuis le haut).
    const r = PHONE.r, w = PHONE.w, h = PHONE.h;
    const half = (dir) => `M${w / 2} 0 ${dir > 0 ? `H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${w / 2}` : `H${r} A${r} ${r} 0 0 0 0 ${r} V${h - r} A${r} ${r} 0 0 0 ${r} ${h} H${w / 2}`}`;
    const svg = frag(`<svg class="abs" style="left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <path class="oR" d="${half(1)}" fill="none" stroke="${C.cream}" stroke-width="10" stroke-linecap="round"/>
      <path class="oL" d="${half(-1)}" fill="none" stroke="${C.cream}" stroke-width="10" stroke-linecap="round"/></svg>`);
    outlineR = svg.querySelector('.oR');
    outlineL = svg.querySelector('.oL');
    phone.append(shadow, btnL, btnR, body, screen, svg);
    world.appendChild(phone);

    // Stickers des prénoms autour du téléphone.
    const spots = [
      { x: 1440, y: 250, r: -7, bg: C.yellow },
      { x: 1640, y: 440, r: 6, bg: C.orange },
      { x: 1430, y: 640, r: -4, bg: C.cream },
      { x: 1650, y: 840, r: 8, bg: C.butter },
    ];
    stickers = PLAYERS.map((p, i) => {
      const s = pill(world, { x: spots[i].x, y: spots[i].y, text: p.toUpperCase(), bg: spots[i].bg, size: 112, border: 8, off: 12, pad: '14px 46px 4px' });
      s.spot = spots[i];
      return s;
    });
    touch = touchDot(world);
  },
  update(lt, t) {
    // ---------------- fond (masqué pendant le tracé : la typo est dessous)
    const zoomP = E.inOutQuart(prog(lt, ZOOM0, ZOOM1));
    const { Z: Zf, cx: PX, cy: PY } = bcardZoom();
    const Z = Math.exp(Math.log(Zf) * zoomP);
    const cx = lerp(PX, 960, zoomP), cy = lerp(PY, 540, zoomP);
    const tx = cx - Z * PX, ty = cy - Z * PY;
    if (lt < 0) grid.cv.style.display = 'none';
    else {
      grid.cv.style.display = 'block';
      grid.sp = 30 * Z;
      grid.r = 2.3 * Z;
      grid.draw(t, { dx: tx, dy: ty, pump: 0.2 * [L(18), L(20), L(22)].reduce((a, b) => a + pulse(lt, b, 0.01, 0.2), 0) });
    }
    world.style.transform = zoomP > 0 ? `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${Z.toFixed(5)})` : 'none';

    // ---------------- le cadre du téléphone
    const draw = E.inOutCubic(prog(lt, -0.72, -0.2));
    const lenHalf = (PHONE.w - 2 * PHONE.r) + (PHONE.h - 2 * PHONE.r) + Math.PI * PHONE.r;
    for (const o of [outlineL, outlineR]) {
      o.style.strokeDasharray = `${lenHalf}`;
      o.style.strokeDashoffset = `${(1 - draw) * lenHalf}`;
      o.style.opacity = 1 - prog(lt, -0.1, 0.1);
    }
    const fill = E.outCubic(prog(lt, -0.22, 0.05));
    op(body, fill);
    const shOff = PHONE.off * E.outBack(prog(lt, -0.1, 0.25), 2);
    T(shadow, { x: shOff, y: shOff, o: fill });
    const pop = lt < -0.22 ? 1 : 1 + 0.035 * wobble(lt + 0.22, 3, 5);
    T(phone, { s: pop });
    const irisR = 1100 * E.inOutCubic(prog(lt, -0.18, 0.2));
    screen.style.clipPath = irisR < 1090 ? `circle(${irisR.toFixed(1)}px at 50% 50%)` : 'none';

    // ---------------- vue tablée
    const titleIn = E.outBack(prog(lt, 0.0, 0.35), 1.6);
    T(tabTitle, { y: (1 - titleIn) * -40, o: prog(lt, 0, 0.12) });
    T(tabSub, { o: prog(lt, 0.12, 0.3) });
    const cardIn = E.outCubic(prog(lt, 0.1, 0.45));
    [card, pillCount, help, dashed].forEach((n) => T(n, { y: (1 - cardIn) * 40, o: cardIn }));
    T(pushBtn, { y: (1 - E.outCubic(prog(lt, 0.25, 0.55))) * 60, o: prog(lt, 0.25, 0.4), s: 1 - 0.04 * pulse(lt, PUSH, 0.03, 0.12) });
    let nRows = 2;
    ADD_T.forEach((a) => (nRows += E.outCubic(prog(lt, a, a + 0.18))));
    const { dashedY } = layoutTablee(nRows);
    let count = 0;
    rows.forEach((r, i) => {
      const t0 = NAME_T[i];
      const name = PLAYERS[i];
      const nChars = clamp(Math.floor((lt - t0) / 0.045) + 1, 0, name.length);
      if (lt < t0) {
        r.txt.textContent = `Joueur ${i + 1}`;
        r.inp.style.color = '#8A7A99';
      } else {
        r.txt.textContent = name.slice(0, nChars);
        r.inp.style.color = ink;
      }
      if (nChars === name.length) count++;
      const active = lt >= t0 - 0.12 && lt < t0 + 0.42;
      r.caret.style.opacity = active && Math.floor(lt / 0.25) % 2 === 0 ? 1 : 0;
      r.inp.style.borderColor = active ? C.purple : lineC;
      r.inp.style.boxShadow = active ? `0 0 0 2px ${C.purple}` : 'none';
      const done = lt >= t0 + 0.2;
      r.avIn.textContent = done ? name[0] : '';
      r.av.style.background = done ? [C.yellow, C.orange, C.butter, C.amber][i] : C.surface;
      r.av.style.borderColor = done ? ink : lineC;
      T(r.avIn, { s: done ? spring(lt - t0 - 0.2, 3.5, 0.4) : 0 });
    });
    pillCount.textContent = `${count} à la tablée`;
    T(pillCount, { y: (1 - cardIn) * 40, o: cardIn, s: 1 + 0.08 * NAME_T.reduce((a, b) => a + pulse(lt, b + 0.2, 0.02, 0.15), 0) });

    // ---------------- navigation tablée -> hub
    const nav = E.inOutCubic(prog(lt, NAV0, NAV1));
    T(vTab, { x: -APPW * 0.35 * nav, o: 1 - nav });
    T(vHub, { x: APPW * (1 - nav) });
    let scroll = 0;
    if (lt > SCR_D0) scroll = 720 * E.outQuart(prog(lt, SCR_D0, SCR_D1));
    if (lt > SCR_U0) scroll = lerp(720, 0, E.inOutCubic(prog(lt, SCR_U0, SCR_U1)));
    T(hubC, { y: -scroll });
    T(jouer, { s: 1 - 0.12 * pulse(lt, TAP_JOUER, 0.03, 0.14) });

    // ---------------- colonne de gauche
    steps[0].update(lt - 0.15, E.inCubic(prog(lt, PUSH - 0.05, PUSH + 0.25)));
    steps[1].update(lt - PUSH - 0.2, E.inCubic(prog(lt, ZOOM0 - 0.3, ZOOM0 + 0.05)));
    op(steps[0].root, lt < PUSH + 0.3 ? 1 : 0);
    op(steps[1].root, lt > PUSH ? 1 : 0);

    // ---------------- stickers
    stickers.forEach((s, i) => {
      const t0 = NAME_T[i] + 0.16;
      const [ix, iy] = appToStage(210, 344 + i * 56 + 22);
      if (lt < t0) return op(s.root, 0);
      const p = E.outCubic(prog(lt, t0, t0 + 0.26));
      const arc = Math.sin(p * Math.PI) * -120;
      const x = lerp(ix, s.spot.x, p), y = lerp(iy, s.spot.y, p) + arc;
      const land = t0 + 0.26;
      const sc = lt < land ? lerp(0.25, 1.25, p) : 1 + 0.25 * Math.exp(-7 * (lt - land)) * Math.cos(2 * Math.PI * 3 * (lt - land));
      const rot = lt < land ? lerp(-30, s.spot.r, p) : s.spot.r + 6 * wobble(lt - land, 3.2, 5);
      const bob = Math.sin((lt + i) * 2.6) * 6 * prog(lt, land, land + 0.5);
      const out = E.inBack(prog(lt, ZOOM0 - 0.3 + i * 0.03, ZOOM0 + 0.1 + i * 0.03), 1.6);
      T(s.root, { x: x - s.spot.x + out * 700, y: y - s.spot.y + bob - out * 200, s: sc * (1 - 0.3 * out), r: rot + out * 40, o: 1 });
    });

    // ---------------- le doigt
    const [dx1, dy1] = appToStage(215, dashedY);
    const [px, py] = appToStage(215, 841);
    const [jx, jy] = appToStage(BCARD.x + 76, BCARD.y + 183);
    const [hx, hy] = appToStage(330, 620);
    const keys = [
      { t: ADD_T[0] - 0.45, x: dx1 + 260, y: dy1 + 200, o: 0 },
      { t: ADD_T[0] - 0.06, x: dx1, y: dy1, o: 1, tap: ADD_T[0] - 0.06 },
      { t: ADD_T[1] - 0.06, x: dx1, y: dy1, o: 1, tap: ADD_T[1] - 0.06 },
      { t: PUSH - 0.08, x: px, y: py, o: 1, tap: PUSH - 0.08 },
      { t: SCR_D0 - 0.05, x: hx, y: hy + 160, o: 1 },
      { t: SCR_D0 + 0.25, x: hx, y: hy - 260, o: 1 },
      { t: TAP_JOUER - 0.06, x: jx, y: jy, o: 1, tap: TAP_JOUER - 0.06 },
      { t: ZOOM0 + 0.15, x: jx + 120, y: jy + 160, o: 0 },
    ];
    let k = 0;
    while (k < keys.length - 1 && lt > keys[k + 1].t) k++;
    const a = keys[k], b = keys[Math.min(k + 1, keys.length - 1)];
    const q = a === b ? 1 : E.inOutCubic(prog(lt, a.t + 0.02, b.t));
    const taps = keys.filter((kk) => kk.tap !== undefined).map((kk) => kk.tap);
    const press = taps.reduce((m, tp) => Math.max(m, pulse(lt, tp, 0.04, 0.1)), 0);
    const rip = taps.map((tp) => (lt - tp) / 0.4).find((v) => v >= 0 && v < 1) ?? -1;
    const tvis = lt < a.t ? a.o : lerp(a.o, b.o, q);
    touch.set(lerp(a.x, b.x, q), lerp(a.y, b.y, q), { o: lt < keys[0].t ? 0 : tvis, press, ripple: rip });
  },
  sfx: () => {
    const out = [
      { t: 15.3, id: 'draw', g: 0.4, dur: 0.5 },
      { t: 15.8, id: 'pop', g: 0.55, note: 72 },
      { t: 16.0, id: 'whooshUp', g: 0.35, dur: 0.3 },
    ];
    NAME_T.forEach((tl, i) => {
      for (let c = 0; c < PLAYERS[i].length; c++) out.push({ t: start + tl + c * 0.045, id: 'type', g: 0.3, p: -0.1 });
      out.push({ t: start + tl + 0.16, id: 'swish', g: 0.35, p: 0.5 });
      out.push({ t: start + tl + 0.42, id: 'slap', g: 0.6, p: 0.55 });
    });
    ADD_T.forEach((a) => out.push({ t: start + a - 0.06, id: 'tap', g: 0.5 }));
    out.push({ t: start + PUSH - 0.08, id: 'tap', g: 0.6 });
    out.push({ t: start + NAV0, id: 'swipe', g: 0.45, dur: 0.35 });
    out.push({ t: start + SCR_D0, id: 'scroll', g: 0.35, dur: 0.9 });
    out.push({ t: start + SCR_U0, id: 'scroll', g: 0.3, dur: 0.5 });
    out.push({ t: start + TAP_JOUER - 0.06, id: 'tap', g: 0.6 });
    out.push({ t: start + ZOOM0, id: 'zoom', g: 0.8, dur: 1.4 });
    return out;
  },
};
