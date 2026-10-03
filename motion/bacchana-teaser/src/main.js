import { buildFilm, renderAt, collectCues, DURATION } from './film.js';
import { W, H } from './format.js';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');

async function fontsReady() {
  const faces = ['900 100px BS', '700 100px BS', '400 40px Chivo', '500 40px Chivo', '700 40px Chivo', '400 30px Mono', '700 30px Mono'];
  await Promise.all(faces.map((f) => document.fonts.load(f, 'ABCÉÈÀÇéèàç0123456789!?«»…')));
  await document.fonts.ready;
}

await fontsReady();
buildFilm(document.getElementById('stage'));
window.renderAt = renderAt;
window.__duration = DURATION;
window.__cues = collectCues;

if (RENDER) {
  document.body.classList.add('render');
  renderAt(Number(params.get('t') || 0));
  window.__ready = true;
} else {
  // Lecteur de prévisualisation : adapte la scène à la fenêtre, lit la
  // bande-son si elle a été générée (out/soundtrack.m4a).
  const vp = document.getElementById('viewport');
  const fit = () => {
    const s = Math.min(innerWidth / W, (innerHeight - 44) / H);
    vp.style.transform = `scale(${s})`;
    vp.style.width = `${W * s}px`;
    vp.style.height = `${H * s}px`;
    vp.style.transform = `scale(${s})`;
    vp.firstElementChild.style.transform = '';
  };
  vp.style.transformOrigin = '0 0';
  addEventListener('resize', fit);
  fit();
  const audio = new Audio('out/soundtrack.m4a');
  const scrub = document.getElementById('scrub');
  const tc = document.getElementById('tc');
  const btn = document.getElementById('play');
  let playing = false, t0 = 0, base = Number(params.get('t') || 0);
  const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`;
  const draw = (t) => {
    renderAt(t);
    scrub.value = t;
    tc.textContent = fmt(t);
  };
  const loop = (now) => {
    if (!playing) return;
    let t = base + (now - t0) / 1000;
    if (!audio.paused && audio.readyState >= 2) t = audio.currentTime;
    if (t >= DURATION) {
      playing = false;
      btn.textContent = 'Lecture';
      base = 0;
      audio.pause();
      return draw(DURATION - 1e-3);
    }
    draw(t);
    requestAnimationFrame(loop);
  };
  btn.onclick = () => {
    playing = !playing;
    btn.textContent = playing ? 'Pause' : 'Lecture';
    if (playing) {
      t0 = performance.now();
      audio.currentTime = base;
      audio.play().catch(() => {});
      requestAnimationFrame(loop);
    } else {
      base = Number(scrub.value);
      audio.pause();
    }
  };
  scrub.oninput = () => {
    base = Number(scrub.value);
    t0 = performance.now();
    audio.currentTime = base;
    draw(base);
  };
  draw(base);
}
