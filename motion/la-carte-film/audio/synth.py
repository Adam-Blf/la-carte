"""Bande-son du film La Carte, synthétisée de zéro (aucun sample, aucune
musique existante).

Petit swing « de bistrot » à 120 BPM en ré majeur : guitare en pompe et
contrebasse en cordes pincées (Karplus-Strong), vibraphone pour la mélodie,
nappe d'accordéon discrète, balais. Design sonore calé sur les repères de la
timeline (out/cues.json). Sortie : out/soundtrack.wav (48 kHz, stéréo, 24 bits).

    python3 audio/synth.py
"""

import json
import os
import wave

import numpy as np
from numba import njit
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
rng = np.random.default_rng(11)

cues = json.load(open(os.path.join(OUT, "cues.json")))
BPM = cues["bpm"]
BEAT = 60.0 / BPM
BAR = 4 * BEAT
DUR = cues["duration"]
N = int(DUR * SR)
SWING = 2 / 3  # croche swinguée : la deuxième tombe aux 2/3 du temps


def bar_t(n):
    return (n - 1) * BAR


def pos(b, beat):
    """Temps absolu d'une position (mesure, temps) ; les .5 sont swingués."""
    k = int(np.floor(beat + 1e-9))
    frac = beat - k
    if abs(frac - 0.5) < 1e-6:
        frac = SWING
    return bar_t(b) + (k + frac) * BEAT


# ------------------------------------------------------------------ outils
def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def sos(kind, f, order=2):
    if kind == "band":
        lo, hi = f
        return butter(order, [max(20, lo), min(SR / 2 - 100, hi)], btype="band", fs=SR, output="sos")
    return butter(order, min(f, SR / 2 - 100), btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return sosfilt(sos(kind, f, order), x)


def expdec(d, tau, attack=0.002):
    t = tt(d)
    e = np.exp(-t / tau)
    na = max(1, int(attack * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def env_adsr(d, a=0.005, dec=0.1, s=0.7, r=0.1):
    n = int(d * SR)
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(dec * SR), int(r * SR)
    na = max(1, min(na, n))
    e[:na] = np.linspace(0, 1, na)
    if nd > 0 and na + nd < n:
        e[na : na + nd] = np.linspace(1, s, nd)
    if nr > 0 and nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def S(*xs):
    """Somme de signaux de longueurs différentes (complétés par du silence)."""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[: len(x)] += x
    return out


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 4, 2))

    def add(self, sig, t, g=1.0, p=0.0):
        # Micro-fondus : aucun son ne commence ni ne s'arrête sur une marche.
        sig = np.array(sig, dtype=np.float64)
        nf = min(len(sig) // 2, int(0.006 * SR))
        if nf > 1:
            sig[-nf:] *= np.linspace(1, 0, nf)
            ni = min(nf, int(0.001 * SR))
            sig[:ni] *= np.linspace(0, 1, ni)
        i = int(round(t * SR))
        if i < 0:
            sig = sig[-i:]
            i = 0
        n = min(len(sig), self.x.shape[0] - i)
        if n <= 0:
            return
        a = (p + 1) * np.pi / 4
        self.x[i : i + n, 0] += sig[:n] * g * np.cos(a)
        self.x[i : i + n, 1] += sig[:n] * g * np.sin(a)


def reverb_ir(d=1.6, tau=0.32, damp=4500):
    L = filt(noise(d), "low", damp) * np.exp(-tt(d) / tau)
    R = filt(noise(d), "low", damp) * np.exp(-tt(d) / tau)
    ir = np.stack([L, R], 1)
    ir[: int(0.015 * SR)] = 0  # pré-délai
    return ir / np.sqrt((ir**2).sum() / 2)


IR = reverb_ir()


def reverb(x, wet=0.25):
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = fftconvolve(x[:, c], IR[:, c])[: x.shape[0]]
    return out * wet


# ------------------------------------------------------------------ instruments
@njit(cache=True)
def _ks(n, period, damp, bright, seed):
    """Corde pincée (Karplus-Strong) avec filtre de boucle réglable."""
    np.random.seed(seed)
    p = int(period)
    frac = period - p
    buf = np.random.uniform(-1.0, 1.0, p + 2)
    # excitation adoucie (médiator plus ou moins brillant)
    for _ in range(int(3 * (1 - bright)) + 1):
        for i in range(1, p + 2):
            buf[i] = 0.5 * (buf[i] + buf[i - 1])
    out = np.zeros(n)
    L = p + 2
    idx = 0
    last = 0.0
    for i in range(n):
        a = buf[idx % L]
        b = buf[(idx + 1) % L]
        v = a + frac * (b - a)
        out[i] = v
        nv = damp * (0.5 * v + 0.5 * last)
        last = v
        buf[(idx + p) % L] = nv
        idx += 1
    return out


_seed = [100]


def string(m, d, damp=0.996, bright=0.6):
    _seed[0] += 1
    x = _ks(int(d * SR), SR / mtof(m), damp, bright, _seed[0])
    return x - np.mean(x)


VOIC = {  # accords de guitare (voicings serrés, médium)
    "D6": [50, 57, 59, 66], "Dmaj7": [50, 57, 61, 66], "D69": [50, 54, 59, 64, 69], "Bm7": [47, 54, 57, 62],
    "B7": [47, 51, 57, 63], "Em7": [52, 55, 62, 67], "A7": [45, 52, 55, 61], "Gmaj7": [43, 50, 54, 59],
    "Gm6": [43, 50, 52, 58], "F#m7": [42, 49, 52, 57], "A7sus": [45, 52, 55, 62],
}
ROOTS = {k: v[0] for k, v in VOIC.items()}

# Grille : un ou deux accords par mesure (mesures 1 à 25).
GRID = {
    1: ["Dmaj7"], 2: ["Bm7"], 3: ["Em7", "A7"],
    4: ["D6"], 5: ["B7"], 6: ["Em7"], 7: ["A7"], 8: ["D6", "B7"], 9: ["Em7", "A7"],
    10: ["Gmaj7"], 11: ["Gm6"], 12: ["F#m7", "B7"], 13: ["Em7", "A7"],
    14: ["D6"], 15: ["A7sus"], 16: ["D6"], 17: ["Em7", "A7"],
    18: ["D69"], 19: ["B7"], 20: ["Em7"], 21: ["A7"],
    22: ["D69"], 23: ["B7"], 24: ["Em7", "A7"], 25: ["D69"],
}


def chord_at(b, beat):
    ch = GRID.get(b, ["D6"])
    return ch[0] if len(ch) == 1 or beat < 2 else ch[1]


def strum(name, d, accent=1.0, down=True, spread=0.011, bright=0.7, damp=0.994):
    notes = VOIC[name]
    order = notes if down else notes[::-1]
    out = np.zeros(int((d + spread * len(notes) + 0.05) * SR))
    for i, m in enumerate(order):
        s = string(m, d, damp, bright) * (0.8 + 0.2 * (i == 0))
        k = int(i * spread * SR)
        out[k : k + len(s)] += s
    # caisse de la guitare : un peu de corps, moins de brillance
    out = filt(out, "low", 3800) + 1.6 * filt(out, "band", (110, 420))
    return out * accent


def vibes(m, d=1.6):
    f = mtof(m)
    t = tt(d)
    trem = 1 + 0.18 * np.sin(2 * np.pi * 5.2 * t)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1) + 0.16 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.1)
    x += 0.1 * np.sin(2 * np.pi * f * 10.0 * t) * np.exp(-t / 0.03)
    return x * trem * expdec(d, 10, 0.001)


def accordion(notes, d):
    t = tt(d)
    out = np.zeros(len(t))
    for m in notes:
        f = mtof(m)
        for det in (-0.004, 0.004):  # deux anches légèrement désaccordées (musette)
            ph = (t * f * (1 + det)) % 1.0
            out += (2 * ph - 1) * 0.5
    out = filt(filt(out, "low", 2400, 2), "high", 250)
    return out * env_adsr(d, 0.12, 0.2, 0.8, 0.35) / len(notes)


def bass(m, d=0.5, acc=1.0):
    x = string(m, d + 0.1, 0.992, 0.2)
    x = filt(x, "low", 900)
    body = np.sin(2 * np.pi * mtof(m) * tt(d + 0.1)) * expdec(d + 0.1, 0.35)
    return S(x * 1.2, body * 0.6)[: int((d + 0.1) * SR)] * env_adsr(d + 0.1, 0.004, 0.1, 0.8, 0.08) * acc


def brush_tap(acc=1.0):
    return filt(noise(0.09), "band", (1500, 7000)) * expdec(0.09, 0.02) * acc


def brush_swish(d):
    t = tt(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return filt(noise(d), "band", (2500, 9000)) * e * 0.35


# ------------------------------------------------------------------ partition
def part(b):
    for m in cues["music"]:
        if m["bars"][0] <= b <= m["bars"][1]:
            return m["part"]
    return None


music = Bus()
send = Bus()

for b in range(1, 26):
    p = part(b)
    for beat in range(4):
        t = pos(b, beat)
        ch = chord_at(b, beat)
        if p == "intro":
            # guitare seule, arpèges en croches swinguées, puis la levée
            notes = VOIC[ch]
            for h in (0, 0.5):
                k = int(beat * 2 + h * 2)
                m = notes[k % len(notes)] + 12 + (12 if k % 4 == 3 else 0)
                s = string(m, 1.2, 0.997, 0.55) * expdec(1.2, 0.6)
                music.add(s, pos(b, beat + h), 0.42, -0.25 + 0.1 * (k % 3))
                send.add(s, pos(b, beat + h), 0.12)
            continue
        if p in ("carte", "carnet", "invite", "fin") or (p == "addition" and b >= 18):
            if b == 25:
                continue  # accord final égrené plus bas
            last = False
            # la pompe : 1 et 3 plus longs, 2 et 4 courts et accentués
            accent = beat in (1, 3)
            d = 0.09 if accent else 0.2
            g = strum(ch, 1.6 if last else d, 1.0 if accent else 0.7, down=True, bright=0.75 if accent else 0.55)
            if not last:
                g = g * env_adsr((len(g) + 0.5) / SR, 0.002, 0.05, 0.6, 0.04)[: len(g)]
            music.add(g, t, 0.36, 0.3)
            send.add(g, t, 0.05)
            # contrebasse : deux temps (1, 3), marche en noires dans le carnet
            walk = p == "carnet"
            if walk or beat in (0, 2):
                r = ROOTS[ch]
                m = [r, r + 7, r + 4, r + 5][beat] if walk else (r if beat == 0 else r + 7)
                while m > 45:
                    m -= 12
                music.add(bass(m, 0.45 if walk else 0.9), t, 0.34, -0.05)
            # balais : frottement continu, tape sur 2 et 4
            music.add(brush_swish(BEAT * 0.95), t, 0.05, -0.3)
            if accent:
                music.add(brush_tap(), t, 0.16, -0.2)
        elif p == "addition":
            # suspense pendant l'impression : basse en pédale de la, balais seuls
            if beat in (0, 2):
                music.add(bass(45 if b != 16 else 50, 0.7, 0.8), t, 0.3, -0.05)
            music.add(brush_swish(BEAT * 0.95), t, 0.04, -0.3)
            if beat in (1, 3) and b >= 16:
                music.add(brush_tap(0.7), t, 0.14, -0.2)

# Nappe d'accordéon (carte, carnet, fin), très discrète.
for b in list(range(4, 14)) + list(range(22, 26)):
    ch = GRID[b]
    for i, name in enumerate(ch):
        d = BAR / len(ch)
        notes = [m + 12 for m in VOIC[name][1:]]
        a = accordion(notes, d + 0.1 if b < 25 else 3.4)
        music.add(a, bar_t(b) + i * d, 0.07, 0.35)
        send.add(a, bar_t(b) + i * d, 0.03)

# Mélodie de vibraphone (originale) : (mesure, temps, note, durée en temps).
MEL = [
    (3, 2.5, 69, 0.5), (3, 3, 71, 0.5), (3, 3.5, 73, 0.5),
    (4, 0, 78, 1), (4, 1, 81, 0.5), (4, 1.5, 83, 0.5), (4, 2, 81, 2),
    (5, 0, 75, 1), (5, 1, 78, 1), (5, 2, 81, 1.5), (5, 3.5, 79, 0.5),
    (6, 0, 79, 1), (6, 1, 76, 0.5), (6, 1.5, 78, 0.5), (6, 2, 79, 1), (6, 3, 83, 1),
    (7, 0, 81, 1.5), (7, 1.5, 79, 0.5), (7, 2, 76, 1), (7, 3, 73, 1),
    (8, 0, 74, 1), (8, 1, 78, 1), (8, 2, 75, 1), (8, 3, 78, 0.5), (8, 3.5, 81, 0.5),
    (9, 0, 79, 1.5), (9, 1.5, 78, 0.5), (9, 2, 76, 1), (9, 3, 73, 0.5), (9, 3.5, 76, 0.5),
    (10, 0, 83, 2), (10, 2, 81, 1), (10, 3, 78, 1),
    (11, 0, 79, 1), (11, 1, 82, 1), (11, 2, 76, 2),
    (12, 0, 81, 1), (12, 1, 78, 1), (12, 2, 75, 1), (12, 3, 78, 1),
    (13, 0, 76, 1), (13, 1, 79, 1), (13, 2, 85, 1), (13, 3, 81, 1),
    (18, 0, 86, 1), (18, 1, 83, 0.5), (18, 1.5, 81, 0.5), (18, 2, 78, 2),
    (19, 0, 78, 1), (19, 1, 75, 1), (19, 2, 71, 2),
    (20, 0, 76, 1), (20, 1, 79, 1), (20, 2, 83, 2),
    (21, 0, 81, 1), (21, 1, 85, 1), (21, 2, 88, 1), (21, 3, 79, 1),
    (22, 0, 78, 1), (22, 1, 81, 0.5), (22, 1.5, 83, 0.5), (22, 2, 86, 2),
    (23, 0, 87, 1.5), (23, 1.5, 85, 0.5), (23, 2, 83, 2),
    (24, 0, 79, 1), (24, 1, 83, 1), (24, 2, 81, 1), (24, 3, 85, 1),
    (25, 0, 86, 4),
]
for b, beat, m, d in MEL:
    s = vibes(m, max(1.2, d * BEAT + 0.9) if b < 25 else 4.0)
    g = 0.14 * (0.9 if beat % 1 else 1.0)
    music.add(s, pos(b, beat), g, 0.1)
    send.add(s, pos(b, beat), 0.09)

# Tutti sur le tampon (mesure 18) et accord final égrené.
hit = strum("D69", 1.8, 1.2, spread=0.006, bright=0.9, damp=0.997)
music.add(hit, bar_t(18), 0.18, 0.2)
send.add(hit, bar_t(18), 0.08)
music.add(bass(38, 1.6), bar_t(18), 0.36)
fin = strum("D69", 3.8, 1.0, spread=0.06, bright=0.7, damp=0.9985)
music.add(fin, bar_t(25), 0.2, 0.25)
send.add(fin, bar_t(25), 0.1)
music.add(bass(38, 3.0), bar_t(25), 0.34)

# ------------------------------------------------------------------ bruitages
sfx = Bus()


def sine_sweep(d, f0, f1, tau=None):
    f = np.geomspace(f0, f1, int(d * SR))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * (expdec(d, tau) if tau else 1)


def bell(m, d=1.2, partials=((1, 1, 1.0), (2.76, 0.5, 0.35), (5.4, 0.3, 0.15))):
    f = mtof(m)
    t = tt(d)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (tau * d)) for r, a, tau in partials)


def marimba(m, d=0.5):
    f = mtof(m)
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.25 * np.sin(2 * np.pi * f * 3.9 * t) * np.exp(-t * 30)


def click(f0=1700, f1=700, d=0.016):
    return S(sine_sweep(d, f0, f1, d / 3), filt(noise(0.006), "high", 3000) * expdec(0.006, 0.0015) * 0.4)


def paper(d, f0=1200, f1=5000, flutter=24):
    t = tt(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.2
    fl = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * flutter * t + 3 * np.sin(2 * np.pi * 3 * t)))
    return filt(noise(d), "band", (f0, f1)) * e * fl


def feed(d):
    # tête thermique + moteur pas à pas : grésillement pulsé, un peu nasal
    t = tt(d)
    steps = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 180 * t))
    buzz = filt(np.sign(np.sin(2 * np.pi * 360 * t)) * 0.4 + noise(d) * 0.6, "band", (900, 4200)) * (0.55 + 0.45 * steps)
    whine = np.sin(2 * np.pi * (1650 + 120 * t / d) * t) * 0.12
    return (buzz + whine) * env_adsr(d, 0.008, 0.02, 0.9, 0.02)


def make_sfx(c):
    i, dur, note = c["id"], c.get("dur", 0.4), c.get("note", 76)
    if i == "pencil":
        t = tt(dur)
        grain = np.abs(noise(dur)) ** 3
        grain = filt(grain, "band", (2500, 8000)) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t) ** 2)
        return grain * np.sin(np.pi * t / dur) * 0.06
    if i == "twinkle":
        return bell(note, 0.8) * 0.3
    if i == "approach":
        return filt(noise(0.2), "band", (300, 1200)) * np.sin(np.pi * tt(0.2) / 0.2) * 0.2
    if i == "tap":
        return click()
    if i in ("page", "swish"):
        return paper(dur, 700 if i == "page" else 1500, 5500, 22 if i == "page" else 9)
    if i == "roll":
        return paper(0.35, 2000, 7000, 12) * 0.6
    if i == "select":
        return S(vibes(note, 1.0) * 0.7, click(2400, 1200, 0.01) * 0.5)
    if i == "fly":
        return paper(dur, 3000, 9000, 6) * 0.5
    if i == "land":
        return marimba(note, 0.4) * 0.5
    if i == "barUp":
        return paper(0.4, 400, 2000, 5) * 0.8
    if i == "cell":
        return S(marimba(note, 0.5), click(2000, 900, 0.012) * 0.5)
    if i == "ready":
        return np.concatenate([bell(81, 0.12) * 0.5, bell(86, 0.9) * 0.5])
    if i == "key":
        return S(click(3000, 1500, 0.01) * 0.6, sine_sweep(0.05, 260, 160, 0.015) * 0.6)
    if i == "night":
        return S(paper(dur, 200, 1500, 4) * 0.7, sine_sweep(dur, 70, 45, 0.4) * 0.5)
    if i == "motor":
        return feed(0.35) * np.linspace(0.3, 1, int(0.35 * SR)) * 0.6
    if i == "feed":
        return feed(dur)
    if i == "reel":
        return S(filt(noise(0.012), "high", 3500) * expdec(0.012, 0.003), sine_sweep(0.02, 2200, 1500, 0.005) * 0.4)
    if i == "ding":
        # sonnette de caisse enregistreuse
        return S(bell(96, 1.8, ((1, 1, 0.8), (2.41, 0.6, 0.5), (3.9, 0.4, 0.3), (5.3, 0.2, 0.2))) * 0.6, click(5000, 3000, 0.01) * 0.5)
    if i == "stamp":
        return S(sine_sweep(0.35, 150, 48, 0.09) * 1.1, filt(noise(0.07), "band", (300, 2500)) * expdec(0.07, 0.015) * 0.7)
    if i == "rip":
        out = np.zeros(int(0.22 * SR))
        for k in range(26):
            j = int(rng.uniform(0, 0.2) * SR)
            b = filt(noise(0.008), "band", (1500, 7000)) * expdec(0.008, 0.002) * rng.uniform(0.3, 1)
            out[j : j + len(b)] += b
        return out * 0.8
    if i == "copied":
        return np.concatenate([bell(88, 0.1) * 0.4, bell(93, 0.8) * 0.4])
    if i == "close":
        return S(sine_sweep(0.3, 120, 50, 0.08), paper(0.12, 300, 3000, 1) * 1.2)
    return np.zeros(10)


REVERB_IDS = {"twinkle", "select", "land", "cell", "ready", "ding", "copied", "stamp", "close"}
for c in cues["sfx"]:
    s = make_sfx(c)
    g = c.get("g", 0.5)
    p = float(np.clip(c.get("p", 0.0), -1, 1))
    sfx.add(s, c["t"], g, p)
    if c["id"] in REVERB_IDS:
        send.add(s, c["t"], g * 0.3, p)

# ------------------------------------------------------------------ mix
mix = music.x * 1.0 + sfx.x * 0.9
mix += reverb(send.x, 0.4)
mix = np.stack([filt(mix[:, c], "high", 32, 4) for c in range(2)], 1)
L = int(DUR * SR)
mix = mix[:L]
fade = int(1.0 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
peak = np.max(np.abs(mix))
mix = mix / peak * 1.4
mix = np.tanh(mix) / np.tanh(1.4)
mix *= 10 ** (-1.0 / 20)
rms = np.sqrt(np.mean(mix**2))
print(f"crête {20*np.log10(np.max(np.abs(mix))):.1f} dBFS, RMS {20*np.log10(rms):.1f} dBFS, {len(mix)/SR:.2f} s")

pcm = (np.clip(mix, -1, 1) * (2**23 - 1)).astype(np.int32)
b = np.zeros((len(pcm), 2, 3), np.uint8)
for k in range(3):
    b[:, :, k] = (pcm >> (8 * k)) & 0xFF
with wave.open(os.path.join(OUT, "soundtrack.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(SR)
    w.writeframes(b.tobytes())
print("out/soundtrack.wav")

if os.environ.get("STEMS"):
    for name, bus in (("music", music), ("sfx", sfx), ("send", send)):
        y = bus.x[:L].mean(1)
        print(name, "crête", round(float(np.abs(y).max()), 3), "RMS/mesure", " ".join(f"{20*np.log10(np.sqrt(np.mean(y[i*96000:(i+1)*96000]**2))+1e-9):.0f}" for i in range(25)))
    pk = sorted(((float(np.abs(make_sfx(c)).max() * c.get("g", 0.5)), c["id"], c["t"]) for c in cues["sfx"]), reverse=True)[:8]
    print(pk)

if os.environ.get("STEMS"):
    def bands(y):
        F = np.abs(np.fft.rfft(y)) ** 2
        f = np.fft.rfftfreq(len(y), 1 / SR)
        return " ".join(f"{a}-{b}:{100*F[(f>=a)&(f<b)].sum()/F.sum():.0f}" for a, b in [(20, 60), (60, 150), (150, 400), (400, 1000), (1000, 3000), (3000, 8000), (8000, 20000)])
    print("music", bands(music.x[:L].mean(1)))
    print("sfx", bands(sfx.x[:L].mean(1)))
    g = np.zeros(SR * 2)
    for i in range(8):
        s = strum("D6", 0.2, 1.0)
        g[i * 12000 : i * 12000 + len(s)] += s[: len(g) - i * 12000]
    print("strum", bands(g), "crête", np.abs(g).max())
    v = vibes(78, 1.5)
    print("vibes", bands(v), "crête", np.abs(v).max())
    bb = bass(45, 0.9)
    print("bass", bands(bb), "crête", np.abs(bb).max())
