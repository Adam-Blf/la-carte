// 0:34 - 0:36 - Le pilori. Pancarte d'accusé devant la toise, le marteau
// prend son élan et tombe pile sur le temps : COUPABLE.
import { C, E, el, frag, T, op, prog, clamp, lerp, pulse, spring, wobble, rgba } from '../engine.js';
import { DotGrid, titleBlock, stamp, Burst, fxCanvas } from '../components.js';
import { CUTS } from '../timeline.js';
import { chrome, typedLabel } from '../vignette.js';

const [start, end] = CUTS.pilori; // 34 -> 36
const HIT = 1.0; // 35.0
const PIV = [1850, 790]; // pivot du marteau (bout du manche)

let grid, title, label, ch, plac, gavel, block, coupable, fx, dust, toise;

export default {
  id: 'pilori',
  start,
  end,
  pre: 0.24,
  build(root) {
    grid = new DotGrid(root, { bg: C.amber, dot: C.ink, alpha: 0.11 });
    // Toise de photo d'identité judiciaire.
    toise = el('div', { class: 'abs', style: { left: '1000px', top: '120px', width: '800px', height: '760px' } });
    for (let i = 0; i < 8; i++) {
      const y = i * 100;
      const ln = el('div', { class: 'abs', style: { left: '0px', top: `${y}px`, width: '800px', height: '5px', background: rgba(C.ink, 0.28) } });
      const nb = el('div', { class: 'abs mono', style: { left: '0px', top: `${y + 10}px`, fontSize: '22px', fontWeight: 700, color: rgba(C.ink, 0.45) } });
      nb.textContent = String(200 - i * 10);
      toise.append(ln, nb);
    }
    root.appendChild(toise);
    label = typedLabel(root, { x: 126, y: 330, text: 'ON ENCHAÎNE AVEC', color: C.ink2, size: 28 });
    title = titleBlock(root, { x: 120, y: 378, width: 820, lines: ['LE PILORI'], size: 200, color: C.ink, tag: 'Un accusé, une tablée, un verdict.', tagColor: C.ink2, tagSize: 44, tagGap: 30 });

    plac = el('div', { class: 'abs', style: { left: '1040px', top: '300px', width: '560px', height: '360px', boxSizing: 'border-box', background: C.cream, border: `9px solid ${C.ink}`, borderRadius: '18px', boxShadow: `16px 16px 0 ${C.ink}`, transformOrigin: '50% 0%' } });
    plac.innerHTML = `<div class="abs mono" style="left:0;right:0;top:30px;text-align:center;font-size:30px;font-weight:700;color:${C.purple}">ACCUSÉ N° 2</div>
      <div class="abs display" style="left:0;right:0;top:92px;text-align:center;font-size:230px;line-height:.86;color:${C.ink}">HUGO</div>`;
    const cord = frag(`<svg class="abs" style="left:1040px;top:150px" width="560" height="160" viewBox="0 0 560 160"><path d="M120 158 L280 12 L440 158" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/><circle cx="280" cy="12" r="14" fill="${C.purple}" stroke="${C.ink}" stroke-width="6"/></svg>`);
    root.append(cord, plac);
    coupable = stamp(root, { x: 1320, y: 530, text: 'COUPABLE', color: C.red, size: 130, border: 11 });

    block = el('div', { class: 'abs', style: { left: '1380px', top: '892px', width: '300px', height: '70px', boxSizing: 'border-box', background: C.purple, border: `8px solid ${C.ink}`, borderRadius: '12px', boxShadow: `10px 10px 0 ${C.ink}` } });
    root.appendChild(block);
    // Marteau : dessiné à l'horizontale, pivot à droite, tête à gauche.
    gavel = frag(`<svg class="abs" style="left:0;top:0;overflow:visible" width="1920" height="1080" viewBox="0 0 1920 1080">
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
    dust = new Burst({ seed: 31, t0: HIT, x: 1450, y: 892, count: 24, angle: [Math.PI * 1.02, Math.PI * 1.98], speed: [400, 1300], size: [22, 50], shapes: ['circle', 'star'], colors: [C.cream, C.butter, C.ink], gravity: 1800, drag: 2.4, life: [0.45, 0.8] });
    ch = chrome(root, { n: 6, color: C.ink });
  },
  update(lt, t) {
    this.root.style.transform = lt < 0 ? `translateX(${(1920 * (1 - E.outQuart(prog(lt, -0.24, 0.02)))).toFixed(1)}px)` : 'none';
    grid.draw(t, { ripples: [{ x: 1450, y: 892, t0: HIT, speed: 1800, amp: 2.4, width: 60 }] });
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
    gavel.querySelector('.gv').setAttribute('transform', `translate(0 ${-0}) rotate(${a.toFixed(3)} ${PIV[0]} ${PIV[1]}) translate(0 ${892 - 102 - PIV[1]})`);
    T(block, { sy: 1 - 0.18 * pulse(lt, HIT, 0.005, 0.08), sx: 1 + 0.06 * pulse(lt, HIT, 0.005, 0.08) });
    coupable.set(prog(lt, HIT, HIT + 0.18), -8);
    fx.clearRect(0, 0, 1920, 1080);
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
