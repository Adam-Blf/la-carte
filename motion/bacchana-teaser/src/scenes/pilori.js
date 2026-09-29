// 0:34 - 0:36 - Le pilori. Pancarte d'accusé devant la toise, le marteau
// prend son élan et tombe pile sur le temps : COUPABLE.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, titleBlock, stamp, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';
import { VL, chrome, typedLabel } from '../vignette.js';
import { W, H, pick } from '../format.js';

const [start, end] = CUTS.pilori; // 34 -> 36
const HIT = 1.0; // 35.0
// Pancarte, socle et marteau : à droite en 16:9, sous le titre en 9:16.
const P = pick({ plac: [1040, 300], toise: [1000, 120], block: [1380, 892], piv: [1850, 790], stamp: [1320, 530] }, { plac: [260, 880], toise: [140, 760], block: [450, 1340], piv: [1000, 1238], stamp: [540, 1110] });
const PIV = P.piv; // pivot du marteau (bout du manche)
const BY = P.block[1];

let grid, title, label, ch, plac, gavel, block, coupable, fx, dust, toise;

export default {
  id: 'pilori',
  start,
  end,
  pre: 0.24,
  build(root) {
    grid = new DotGrid(root, { bg: C.amber, dot: C.ink, alpha: 0.11 });
    // Toise de photo d'identité judiciaire.
    toise = el('div', { class: 'abs', style: { left: `${P.toise[0]}px`, top: `${P.toise[1]}px`, width: '800px', height: '760px' } });
    for (let i = 0; i < 8; i++) {
      const y = i * 100;
      const ln = el('div', { class: 'abs', style: { left: '0px', top: `${y}px`, width: '800px', height: '5px', background: rgba(C.ink, 0.28) } });
      const nb = el('div', { class: 'abs mono', style: { left: '0px', top: `${y + 10}px`, fontSize: '22px', fontWeight: 700, color: rgba(C.ink, 0.45) } });
      nb.textContent = String(200 - i * 10);
      toise.append(ln, nb);
    }
    root.appendChild(toise);
    label = typedLabel(root, { x: VL.lx, y: VL.ly + pick(40, 0), text: 'ON ENCHAÎNE AVEC', color: C.ink2, size: 28 });
    title = titleBlock(root, { x: VL.tx, y: VL.ty + pick(40, 0), width: VL.tw, lines: ['LE PILORI'], size: pick(200, 170), color: C.ink, tag: 'Un accusé, une tablée, un verdict.', tagColor: C.ink2, tagSize: 44, tagGap: 30 });

    plac = el('div', { class: 'abs', style: { left: `${P.plac[0]}px`, top: `${P.plac[1]}px`, width: '560px', height: '360px', boxSizing: 'border-box', background: C.cream, border: `9px solid ${C.ink}`, borderRadius: '18px', boxShadow: `16px 16px 0 ${C.ink}`, transformOrigin: '50% 0%' } });
    plac.innerHTML = `<div class="abs mono" style="left:0;right:0;top:30px;text-align:center;font-size:30px;font-weight:700;color:${C.purple}">ACCUSÉ N° 2</div>
      <div class="abs display" style="left:0;right:0;top:92px;text-align:center;font-size:230px;line-height:.86;color:${C.ink}">HUGO</div>`;
    const cord = frag(`<svg class="abs" style="left:${P.plac[0]}px;top:${P.plac[1] - 150}px" width="560" height="160" viewBox="0 0 560 160"><path d="M120 158 L280 12 L440 158" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/><circle cx="280" cy="12" r="14" fill="${C.purple}" stroke="${C.ink}" stroke-width="6"/></svg>`);
    root.append(cord, plac);
    coupable = stamp(root, { x: P.stamp[0], y: P.stamp[1], text: 'COUPABLE', color: C.red, size: 130, border: 11 });

    block = el('div', { class: 'abs', style: { left: `${P.block[0]}px`, top: `${BY}px`, width: '300px', height: '70px', boxSizing: 'border-box', background: C.purple, border: `8px solid ${C.ink}`, borderRadius: '12px', boxShadow: `10px 10px 0 ${C.ink}` } });
    root.appendChild(block);
    // Marteau : dessiné à l'horizontale, pivot à droite, tête à gauche.
    gavel = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <g class="gv">
        <rect x="${PIV[0] - 400}" y="${PIV[1] - 16}" width="420" height="32" rx="16" fill="${C.cream}" stroke="${C.ink}" stroke-width="8"/>
        <g transform="translate(${PIV[0] - 400} ${PIV[1]})">
          <rect x="-66" y="-102" width="132" height="204" rx="22" fill="${C.ink}" transform="translate(12 12)"/>
          <rect x="-66" y="-102" width="132" height="204" rx="22" fill="${C.purple}" stroke="${C.ink}" stroke-width="9"/>
          <rect x="-66" y="-58" width="132" height="26" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>
          <rect x="-66" y="32" width="132" height="26" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>
        </g>
      </g></svg>`);
    root.appendChild(gavel);
    fx = fxCanvas(root);
    dust = new Burst({ seed: 31, t0: HIT, x: PIV[0] - 400, y: BY, count: 24, angle: [Math.PI * 1.02, Math.PI * 1.98], speed: [400, 1300], size: [22, 50], shapes: ['circle', 'star'], colors: [C.cream, C.butter, C.ink], gravity: 1800, drag: 2.4, life: [0.45, 0.8] });
    ch = chrome(root, { n: 6, color: C.ink });
  },
  update(lt, t) {
    this.root.style.transform = lt < 0 ? `translateX(${(W * (1 - E.outQuart(prog(lt, -0.24, 0.02)))).toFixed(1)}px)` : 'none';
    grid.draw(t, { ripples: [{ x: PIV[0] - 400, y: BY, t0: HIT, speed: 1800, amp: 2.4, width: 60 }] });
    ch.update(lt);
    label.update(lt - 0.02);
    title.update(lt - 0.02);
    T(toise, { o: prog(lt, 0, 0.25) });
    // Pancarte : se balance au bout de sa ficelle, sursaute au choc.
    const sway = 3 * Math.sin(lt * 5) * Math.exp(-lt * 1.5) + 4 * wobble(lt - HIT, 3.4, 4);
    T(plac, { r: sway, y: (1 - E.outBack(prog(lt, 0.05, 0.4), 1.4)) * -700 });
    // Marteau : levé, prise d'élan, frappe (vers le bas = rotation négative ici).
    let a;
    if (lt < 0.25) a = lerp(70, 55, E.outCubic(prog(lt, -0.1, 0.25)));
    else if (lt < 0.72) a = lerp(55, 78, E.inOutCubic(prog(lt, 0.25, 0.72)));
    else if (lt < HIT) a = lerp(78, 0, E.inQuint(prog(lt, 0.72, HIT)));
    else a = 9 * Math.abs(Math.sin(2 * Math.PI * 1.8 * (lt - HIT))) * Math.exp(-7 * (lt - HIT));
    gavel.querySelector('.gv').setAttribute('transform', `translate(0 ${-0}) rotate(${a.toFixed(3)} ${PIV[0]} ${PIV[1]}) translate(0 ${BY - 102 - PIV[1]})`);
    T(block, { sy: 1 - 0.18 * pulse(lt, HIT, 0.005, 0.08), sx: 1 + 0.06 * pulse(lt, HIT, 0.005, 0.08) });
    coupable.set(prog(lt, HIT, HIT + 0.18), -8);
    fx.clearRect(0, 0, W, H);
    dust.draw(fx, lt);
  },
  sfx: () => [
    { t: 33.76, id: 'whip', g: 0.3, dur: 0.24 },
    { t: 34.05, id: 'swish', g: 0.35 },
    { t: 34.72, id: 'swishDown', g: 0.6, dur: 0.28 },
    { t: 35.0, id: 'gavel', g: 1.0 },
    { t: 35.02, id: 'stamp', g: 0.7 },
    { t: 35.75, id: 'blinds', g: 0.5, dur: 0.25 },
  ],
  fx: { shakes: [{ t: 35.0, amp: 26, decay: 0.2 }], flashes: [{ t: 35.0, dur: 0.08, a: 0.18, color: C.cream }] },
};
