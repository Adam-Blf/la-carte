// 0:48 - 0:56 - Signature. Le logo renaît du point d'implosion, BACCHANA
// jaillit, l'adresse, dernier tchin, mentions responsables.
import { C, E, el, T, op, prog, clamp, lerp, pulse, spring, springV, wobble, splitChars, splitWords, rgba } from '../engine.js';
import { DotGrid, makeLogo, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';

const [start, end] = CUTS.fin; // 48 -> 56
const K = 0.84, CY = 262;
const TCHIN = 4.0; // 52.0

let grid, logoWrap, logo, letters, tagWords, url, urlFace, tags, tagChars, legal, fade, fx, spark;

export default {
  id: 'fin',
  start,
  end,
  build(root) {
    grid = new DotGrid(root, { bg: C.purple, dot: C.cream, alpha: 0.09 });
    logo = makeLogo(512);
    logoWrap = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '512px', height: '512px', transformOrigin: '256px 236px' } });
    logoWrap.appendChild(logo.svg);
    root.appendChild(logoWrap);
    const mask = el('div', { class: 'abs', style: { left: '0px', top: '360px', width: '1920px', height: '300px', overflow: 'hidden' } });
    const word = el('div', { class: 'abs display', style: { left: '0px', top: '76px', width: '1920px', textAlign: 'center', fontSize: '232px', lineHeight: '0.86', color: C.yellow } });
    letters = splitChars(word, 'BACCHANA');
    mask.appendChild(word);
    const tag = el('div', { class: 'abs body', style: { left: '0px', top: '664px', width: '1920px', textAlign: 'center', fontSize: '44px', fontWeight: 500, color: C.lilac } });
    tagWords = splitWords(tag, 'Les meilleurs jeux de soirée, servis au comptoir.');
    url = el('div', { class: 'abs', style: { left: '560px', top: '758px', width: '800px', height: '104px' } });
    const sh = el('div', { class: 'abs', style: { left: '14px', top: '14px', width: '800px', height: '104px', borderRadius: '999px', background: C.night } });
    urlFace = el('div', { class: 'abs mono center', style: { left: '0px', top: '0px', width: '800px', height: '104px', boxSizing: 'border-box', borderRadius: '999px', background: C.yellow, border: `8px solid ${C.ink}`, fontSize: '44px', fontWeight: 700, color: C.ink, letterSpacing: '0.06em', textTransform: 'none' } });
    urlFace.textContent = 'bacchana.beloucif.com';
    url.append(sh, urlFace);
    tags = el('div', { class: 'abs mono', style: { left: '0px', top: '900px', width: '1920px', textAlign: 'center', fontSize: '24px', fontWeight: 700, color: C.cream } });
    tagChars = splitChars(tags, '15 JEUX - ZÉRO PUB - HORS LIGNE');
    legal = el('div', { class: 'abs body', style: { left: '160px', top: '986px', width: '1600px', textAlign: 'center', fontSize: '21px', color: rgba(C.lilac, 0.85), lineHeight: '1.4' } });
    legal.textContent = "Jeu réservé aux majeurs, jouable avec ou sans alcool. L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";
    root.append(mask, tag, url, tags, legal);
    fx = fxCanvas(root);
    spark = new Burst({ seed: 55, t0: TCHIN, x: 960, y: CY + (146 - 236) * K, count: 18, speed: [500, 1300], size: [24, 46], shapes: ['star', 'circle'], colors: [C.yellow, C.cream], gravity: 900, drag: 2.4, life: [0.6, 1.0] });
    fade = el('div', { class: 'abs', style: { left: '0px', top: '0px', width: '1920px', height: '1080px', background: C.night, opacity: '0' } });
    root.appendChild(fade);
  },
  update(lt, t) {
    grid.draw(t, { ripples: [{ x: 960, y: 540, t0: 0, speed: 1600, amp: 2.2, width: 60 }, { x: 960, y: CY - 70, t0: TCHIN, speed: 1500, amp: 1.8, width: 55 }], pump: 0.2 * [0.5, 1, 1.5, 2].reduce((a, b) => a + pulse(lt, b, 0.01, 0.16), 0) });
    // Logo : naît du centre (point d'implosion), remonte à sa place.
    const born = spring(lt, 2.2, 0.42);
    const lift = E.inOutCubic(prog(lt, 0.15, 0.7));
    const cy = lerp(540, CY, lift);
    const k = K * born * (1 + 0.012 * E.inOutSine(prog(lt, 1, 8)));
    T(logoWrap, { x: 960 - 256, y: cy - 236, s: Math.max(0.0001, k) });
    const sw = 1 - spring(lt - 0.05, 2.4, 0.4);
    const bump = lt > TCHIN - 0.12 && lt < TCHIN ? E.inQuad(prog(lt, TCHIN - 0.12, TCHIN)) : 0;
    const back = lt < TCHIN - 0.12 ? E.outCubic(prog(lt, TCHIN - 0.4, TCHIN - 0.12)) : 1 - bump;
    const dx = sw * 160 + (lt > TCHIN - 0.5 ? 26 * back : 0) - (lt >= TCHIN ? 18 * wobble(lt - TCHIN, 3, 5) : 0);
    logo.set({
      t: lt,
      fizz: 0.7,
      L: { dx: -dx, r: -30 * sw },
      R: { dx, r: 30 * sw },
      star: { s: spring(lt - 0.25, 2.8, 0.35) * (1 + 0.25 * pulse(lt, TCHIN, 0.01, 0.3)), r: -90 * (1 - spring(lt - 0.25, 2, 0.45)) + 90 * E.outBack(prog(lt, TCHIN, TCHIN + 0.5), 1.4) },
      rays: lt >= TCHIN ? prog(lt, TCHIN, TCHIN + 0.35) : 0,
      raysX: 256, raysY: 146, raysR0: 86, raysR1: 140, raysLen: 36,
    });
    // BACCHANA : jaillit du masque, squash & stretch.
    letters.forEach((ch, i) => {
      const d = lt - 0.5 - i * 0.06;
      if (d <= 0) return T(ch, { y: 300 });
      const y = 300 * (1 - spring(d, 2.6, 0.36));
      const st = clamp(springV(d, 2.6, 0.36) * 0.055, -0.22, 0.34);
      T(ch, { y, sy: 1 + st, sx: 1 / Math.sqrt(1 + st) });
    });
    tagWords.forEach((w, i) => {
      const p = E.outCubic(prog(lt, 1.25 + i * 0.045, 1.6 + i * 0.045));
      T(w, { y: (1 - p) * 50, o: p });
    });
    const u = lt - 2.0;
    T(url, { s: u < 0 ? 0 : spring(u, 2.6, 0.38), r: u < 0 ? 0 : -3 * (1 - spring(u, 1.8, 0.5)) });
    url.style.transformOrigin = '50% 50%';
    T(urlFace, { x: 0, y: 0 });
    tagChars.forEach((c, i) => op(c, lt > 2.75 + i * 0.02 ? 0.8 : 0));
    op(legal, prog(lt, 3.5, 4.0));
    fx.clearRect(0, 0, 1920, 1080);
    spark.draw(fx, lt);
    op(fade, E.inCubic(prog(lt, 7.35, 8.0)));
  },
  sfx: () => [
    { t: 48.0, id: 'pop', g: 0.6, note: 67 },
    { t: 48.25, id: 'sparkle', g: 0.5 },
    ...Array.from({ length: 8 }, (_, i) => ({ t: 48.5 + i * 0.06, id: 'tock', g: 0.22, p: (i - 3.5) * 0.12, note: 72 + [0, 2, 4, 7, 9, 12, 14, 16][i] })),
    { t: 49.25, id: 'shimmer', g: 0.2, dur: 0.8 },
    { t: 50.0, id: 'pop', g: 0.5, note: 79 },
    { t: 52.0, id: 'clink', g: 0.85 },
    { t: 52.0, id: 'fizz', g: 0.3, dur: 1.2 },
  ],
};
