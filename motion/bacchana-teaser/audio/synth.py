"""Bande-son du film Bacchana, synthétisée de zéro (aucun sample).

House filtrée « French touch » à 120 BPM + design sonore calé sur les repères
exportés par la timeline (out/cues.json). Sortie : out/soundtrack.wav
(48 kHz, stéréo, 24 bits).

    python3 audio/synth.py
"""

import json
import os
import sys
import wave

import numpy as np
from numba import njit
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
rng = np.random.default_rng(7)

cues = json.load(open(os.path.join(OUT, "cues.json")))
BPM = cues["bpm"]
BEAT = 60.0 / BPM
BAR = 4 * BEAT
DUR = cues["duration"]
N = int((DUR + 0.0) * SR)


def bar_t(n):
    return (n - 1) * BAR


def part_of(bar):
    for m in cues["music"]:
        if m["bars"][0] <= bar <= m["bars"][1]:
            return m["part"]
    return None


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


@njit(cache=True)
def svf(x, cut, q):
    """Filtre à variables d'état (Chamberlin), coupure variable par échantillon."""
    y = np.zeros_like(x)
    lp = 0.0
    bp = 0.0
    for i in range(x.shape[0]):
        f = 2.0 * np.sin(np.pi * min(cut[i], 16000.0) / 48000.0)
        for _ in range(2):  # sur-échantillonnage x2 pour la stabilité
            hp = x[i] - lp - q * bp
            bp += f * 0.5 * hp
            lp += f * 0.5 * bp
        y[i] = lp
    return y


def saw(freq, d, detune=0.0, phase=0.0):
    t = tt(d)
    ph = (phase + t * freq * (1 + detune)) % 1.0
    s = 2 * ph - 1
    # adoucissement anti-repliement (polyBLEP léger via filtre)
    return s


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


def expdec(d, tau, attack=0.002):
    t = tt(d)
    e = np.exp(-t / tau)
    na = max(1, int(attack * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 3, 2))

    def add(self, sig, t, g=1.0, p=0.0):
        # Micro-fondus : aucun son ne commence ni ne s'arrête sur une marche
        # (sinon clic large bande).
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

    def add2(self, st, t, g=1.0):
        i = int(round(t * SR))
        n = min(len(st), self.x.shape[0] - i)
        self.x[i : i + n] += st[:n] * g


def reverb_ir(d=2.2, tau=0.55, damp=5000):
    L = filt(noise(d), "low", damp) * np.exp(-tt(d) / tau)
    R = filt(noise(d), "low", damp) * np.exp(-tt(d) / tau)
    ir = np.stack([L, R], 1)
    ir[: int(0.012 * SR)] = 0  # pré-délai
    return ir / np.sqrt((ir**2).sum() / 2)


IR = reverb_ir()


def reverb(bus_x, wet=0.25):
    out = np.zeros_like(bus_x)
    for c in range(2):
        out[:, c] = fftconvolve(bus_x[:, c], IR[:, c])[: bus_x.shape[0]]
    return out * wet


# ------------------------------------------------------------------ batterie
def kick():
    d = 0.5
    t = tt(d)
    f = 48 + 120 * np.exp(-t * 32) + 30 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 5.2)
    click = filt(noise(0.006), "high", 1800) * 0.5
    body[: len(click)] += click * np.linspace(1, 0, len(click))
    return np.tanh(body * 1.6) * 0.9


def clap():
    d = 0.35
    out = np.zeros(int(d * SR))
    for k, off in enumerate([0, 0.011, 0.022, 0.031]):
        seg = filt(noise(d), "band", (900, 2600)) * expdec(d, 0.012 if k < 3 else 0.12)
        i = int(off * SR)
        out[i:] += seg[: len(out) - i] * (0.8 if k < 3 else 1.0)
    return out * 0.5


def hat(open_=False):
    d = 0.3 if open_ else 0.06
    x = filt(noise(d), "high", 7500, 4)
    return x * expdec(d, 0.09 if open_ else 0.014) * 0.4


def snare():
    d = 0.25
    t = tt(d)
    tone = np.sin(2 * np.pi * (190 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 18)
    nz = filt(noise(d), "band", (1500, 7000)) * expdec(d, 0.07)
    return (tone * 0.6 + nz * 0.8) * 0.5


def crash(d=2.5):
    x = filt(noise(d), "high", 4200, 2)
    x = filt(x, "low", 12000)
    return x * expdec(d, 0.7, 0.002) * 0.35


K, CL, HC, HO, SN = kick(), clap(), hat(), hat(True), snare()

# ------------------------------------------------------------------ harmonie
CH = {
    "Gm9": ([58, 62, 65, 69], 43),
    "C9": ([58, 62, 64, 67], 36),
    "Eb": ([55, 58, 62, 65], 39),
    "F69": ([57, 60, 62, 67], 41),
    "D7s9": ([54, 60, 65, 69], 38),
    "Gmaj9": ([59, 62, 66, 69], 43),
}


def chord_for_bar(b):
    p = part_of(b)
    if p in ("intro", "build", "grooveA", "climax"):
        return "Gm9" if b % 2 == 1 else "C9"
    if p == "grooveB":
        return ["Eb", "F69", "Gm9", "D7s9"][(b - 13) % 4]
    if p == "rafale":
        return "Eb"
    if p == "break":
        return "F69"
    if p == "outro":
        return {25: "Eb", 26: "F69", 27: "Gmaj9", 28: "Gmaj9"}[b]
    return "Gm9"


def pad_note(m, d, voices=5, spread=0.012):
    out = np.zeros(int(d * SR))
    for v in range(voices):
        dt = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
        out += saw(mtof(m), d, dt, phase=rng.random())
    return out / voices


def sidechain(n_samples, t0, strength=0.6, tau=0.11):
    """Gain de pompe : creux à chaque temps (là où tombe la grosse caisse)."""
    t = t0 + np.arange(n_samples) / SR
    ph = np.mod(t, BEAT)
    return 1 - strength * np.exp(-ph / tau)


music = Bus()
drums = Bus()
sfx = Bus()
send = Bus()  # départ réverbe

# Coupure du filtre des accords au fil du film (Hz) : fermé à l'intro,
# ouverture progressive jusqu'au drop, respiration aux breaks.
def pad_cutoff(t):
    b = t / BAR + 1
    if b < 3:
        return 380 + 60 * np.sin(t * 2)
    if b < 5:
        x = (t - bar_t(3)) / (2 * BAR)
        return 380 + (2600 - 380) * x**2.2
    if 21 <= b < 22:
        return 3400
    if 22 <= b < 23:
        x = (t - bar_t(22)) / BAR
        return 900 + 3000 * x**2
    if b >= 27:
        x = (t - bar_t(27)) / (2 * BAR)
        return 3600 - 2800 * min(1, x) ** 0.7
    if b >= 25:
        return 3000
    return 3000


# --- accords tenus, filtrés, pompés
pad_raw = np.zeros(N + SR * 3)
for b in range(1, 29):
    t0 = bar_t(b)
    if t0 >= DUR:
        break
    notes, _ = CH[chord_for_bar(b)]
    d = BAR + 0.08
    x = sum(pad_note(m, d) for m in notes) * 0.22
    e = env_adsr(d, 0.02, 0.2, 0.85, 0.08)
    i = int(t0 * SR)
    pad_raw[i : i + len(x)] += x * e
cut = np.array([pad_cutoff(i / SR) for i in range(0, len(pad_raw), 64)])
cut = np.repeat(cut, 64)[: len(pad_raw)]
pad = svf(pad_raw, cut.astype(np.float64), 0.55)
pump = sidechain(len(pad), 0, 0.62)
# pas de pompe là où il n'y a pas de grosse caisse
for b in (1, 2, 22):
    i0, i1 = int(bar_t(b) * SR), int(bar_t(b + 1) * SR)
    pump[i0:i1] = 1 - (1 - pump[i0:i1]) * (0.25 if b < 3 else 0.0)
# silence avant le tchin et avant « lance la soirée »
for ts, te in ((7.78, 8.0), (43.75, 44.0)):
    pad[int(ts * SR) : int(te * SR)] *= np.linspace(1, 0.05, int(te * SR) - int(ts * SR))
pad *= pump
padL = pad * 0.9
padR = np.roll(pad, int(0.011 * SR)) * 0.9  # élargissement Haas
music.add2(np.stack([padL, padR], 1)[: N + SR * 3], 0, 0.72)
send.add2(np.stack([padL, padR], 1)[: N + SR * 3], 0, 0.12)

# --- basse en octaves (disco), filtrée à enveloppe
def bass_note(m, d, acc=1.0):
    f = mtof(m)
    t = tt(d)
    x = 0.6 * saw(f, d) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    c = 180 + 1500 * acc * np.exp(-t * 18)
    y = svf(x, c.astype(np.float64), 0.35)
    return y * env_adsr(d, 0.003, 0.08, 0.75, 0.03)


BASS_ON = ("grooveA", "grooveB", "climax", "rafale", "outro", "build")
for b in range(1, 29):
    p = part_of(b)
    t0 = bar_t(b)
    if t0 >= DUR or p not in BASS_ON:
        continue
    if p == "outro" and b >= 27:
        # note finale tenue
        root = CH[chord_for_bar(b)][1]
        if b == 27:
            music.add(bass_note(root, 3.5, 0.6) * expdec(3.5, 1.4), t0, 0.5)
        continue
    root = CH[chord_for_bar(b)][1]
    for s in range(16):
        ts = t0 + s * BEAT / 4
        if p == "build" and b == 3 and s < 8:
            continue
        if s % 2 == 0:
            m = root if (s // 2) % 2 == 0 else root + 12
            if s in (6, 14) and p in ("grooveB", "climax"):
                m = root + 7
            music.add(bass_note(m, BEAT / 2 * 0.92, 1.0 if s % 4 == 0 else 0.7), ts, 0.42)
        elif s in (7, 15) and p in ("grooveA", "grooveB", "climax"):
            music.add(bass_note(root + 12, BEAT / 4 * 0.8, 0.5), ts, 0.2)

# --- arpège (montage des jeux) avec écho pointé
def pluck(m, d=0.16, bright=1.0):
    f = mtof(m)
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + saw(f, d) * 0.5
    c = 600 + 5000 * bright * np.exp(-t * 30)
    return svf(x, c.astype(np.float64), 0.4) * expdec(d, 0.06)


arp = Bus()
for b in range(13, 21):
    notes, _ = CH[chord_for_bar(b)]
    seq = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[0] + 24]
    for s in range(16):
        arp.add(pluck(seq[s % 8], 0.16, 0.7 + 0.3 * (s % 4 == 0)), bar_t(b) + s * BEAT / 4, 0.16, 0.25 * np.sin(s))
delay = int(0.375 * SR)
a = arp.x.copy()
echo = np.zeros_like(a)
echo[delay:, 1] += a[:-delay, 0] * 0.45
echo[2 * delay :, 0] += a[: -2 * delay, 1] * 0.25
music.add2(a + filt(echo.T, "low", 3500).T, 0, 1.0)
send.add2(a, 0, 0.3)

# --- stabs (rafale + climax) : accords courts pompés
def stab(chord, d=0.18):
    notes, _ = CH[chord]
    x = sum(pad_note(m + 12, d, 3, 0.008) for m in notes) / len(notes)
    t = tt(d)
    return svf(x, (800 + 5200 * np.exp(-t * 16)).astype(np.float64), 0.45) * expdec(d, 0.07)


for b in (21, 23, 24):
    for s in range(8):
        if part_of(b) == "climax" and s % 2 == 0:
            continue
        music.add(stab(chord_for_bar(b)), bar_t(b) + s * BEAT / 2, 0.55, 0.3 * (1 if s % 2 else -1))

# ------------------------------------------------------------------ batterie
for b in range(1, 29):
    p = part_of(b)
    t0 = bar_t(b)
    if t0 >= DUR:
        break
    for q in range(4):
        tb = t0 + q * BEAT
        silent = (7.78 <= tb < 8.0) or (43.75 <= tb < 44.0)
        if silent:
            continue
        if p in ("intro",):
            drums.add(filt(K, "low", 260), tb, 0.55)
        elif p == "build":
            drums.add(filt(K, "low", 260 + 3000 * (tb - 4) / 4), tb, 0.7)
        elif p in ("grooveA", "grooveB", "climax", "rafale") or (p == "outro" and b <= 26):
            drums.add(K, tb, 0.82)
            if q in (1, 3):
                drums.add(CL, tb, 0.55, 0.05)
                send.add(CL, tb, 0.25)
    # charleys
    if p in ("grooveA", "grooveB", "climax", "rafale") or (p == "outro" and b <= 26):
        for s in range(16):
            ts = t0 + s * BEAT / 4
            if 43.75 <= ts < 44.0:
                continue
            if s % 4 == 2:
                drums.add(HO, ts, 0.32, 0.25)
            else:
                drums.add(HC, ts, [0.3, 0.14, 0, 0.2][s % 4], -0.25)
    if p == "grooveB":
        for s in (3, 7, 11, 15):  # shaker en contretemps
            drums.add(filt(noise(0.05), "band", (5000, 11000)) * expdec(0.05, 0.02), t0 + s * BEAT / 4, 0.12, 0.5)
    if p == "rafale":
        for s in range(8):
            drums.add(SN, t0 + s * BEAT / 2, 0.35)

# roulements de caisse claire avant les drops
def roll(t0, t1, g0=0.08, g1=0.5):
    t = t0
    n = 0
    while t < t1:
        x = (t - t0) / (t1 - t0)
        step = BEAT / 2 if x < 0.5 else BEAT / 4 if x < 0.75 else BEAT / 8
        drums.add(SN, t, g0 + (g1 - g0) * x, 0.1 * np.sin(n))
        t += step
        n += 1


roll(6.0, 7.75)
roll(42.0, 43.75, 0.1, 0.55)
roll(22.0, 24.0, 0.05, 0.3)

# coup final sur le dernier tchin (mesure 27)
drums.add(K, bar_t(27), 1.0)

# crashes et montées
for tcr in (8.0, 24.0, 44.0, 52.0):
    drums.add(crash(), tcr, 0.6)
    send.add(crash(), tcr, 0.2)


def riser(d, f0=300, f1=6000):
    x = noise(d)
    cut = np.geomspace(f0, f1, len(x))
    y = svf(x, cut, 0.3)
    t = tt(d)
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(110, 880, len(x))) / SR) * 0.25
    return (y * 0.7 + tone) * (t / d) ** 2


music.add(riser(3.75), 4.0, 0.35)
music.add(riser(1.75, 400, 8000), 42.0, 0.4)
music.add(riser(1.5, 200, 3000), 22.5, 0.18)

# ------------------------------------------------------------------ design sonore
def sweep_noise(d, f0, f1, q=0.5, shape="bell"):
    x = noise(d)
    cut = np.geomspace(f0, f1, len(x))
    y = svf(x, cut, q)
    t = tt(d) / d
    if shape == "bell":
        e = np.sin(np.pi * t) ** 1.5
    elif shape == "up":
        e = t**2
    else:
        e = (1 - t) ** 2
    return y * e


def sine_sweep(d, f0, f1, tau=None):
    f = np.geomspace(f0, f1, int(d * SR))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * (expdec(d, tau) if tau else 1)


def fm_bell(m, d=1.4, ratio=3.5, idx=4.0):
    f = mtof(m)
    t = tt(d)
    mod = np.sin(2 * np.pi * f * ratio * t) * idx * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + mod) * expdec(d, 0.5)


def clink():
    d = 1.8
    t = tt(d)
    out = np.zeros(len(t))
    for f, tau, a in ((2350, 0.9, 1), (3720, 0.6, 0.7), (5130, 0.4, 0.5), (6880, 0.28, 0.35), (8410, 0.2, 0.25)):
        out += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    second = np.zeros(len(t))
    for f, tau, a in ((2480, 0.8, 0.8), (3950, 0.5, 0.5), (5460, 0.35, 0.4)):
        second += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    i = int(0.018 * SR)
    out[i:] += second[:-i]
    click = filt(noise(0.004), "high", 4000)
    out[: len(click)] += click * 2
    return out * 0.18


def woodblock(m, d=0.12):
    f = mtof(m)
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 45)


def marimba(m, d=0.6):
    f = mtof(m)
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 25)) * 0.6


def thump(f0=120, f1=45, d=0.3, tau=0.1):
    return sine_sweep(d, f0, f1, tau)


def fizz(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(60 * d)):
        i = rng.integers(0, len(out) - 2000)
        b = sine_sweep(0.02, 1200 + rng.random() * 2500, 2500 + rng.random() * 3500, 0.006)
        out[i : i + len(b)] += b * rng.random() * 0.5
    out += filt(noise(d), "high", 6000) * 0.05
    return out * np.linspace(1, 0, len(out)) ** 0.7


def sparkles(d, n=16, lo=84, hi=100):
    out = np.zeros(int(d * SR) + SR)
    for _ in range(n):
        i = rng.integers(0, int(d * SR))
        m = rng.integers(lo, hi)
        s = np.sin(2 * np.pi * mtof(m) * tt(0.3)) * expdec(0.3, 0.07)
        out[i : i + len(s)] += s * 0.3
    return out


def buzzer():
    d = 0.5
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * 110 * t)) + np.sign(np.sin(2 * np.pi * 116.5 * t))
    return filt(x, "low", 1800) * env_adsr(d, 0.005, 0.05, 0.8, 0.08) * 0.35


def ratchet():
    d = 0.03
    x = filt(noise(d), "high", 2500) * expdec(d, 0.004)
    ping = np.sin(2 * np.pi * 2600 * tt(d)) * expdec(d, 0.006) * 0.4
    return x + ping


def brassy(chord="Gm9", d=0.45):
    notes, _ = CH[chord]
    x = sum(pad_note(m, d, 3, 0.006) for m in notes) / 4
    t = tt(d)
    return svf(x, (500 + 4000 * np.exp(-t * 8)).astype(np.float64), 0.5) * env_adsr(d, 0.01, 0.1, 0.6, 0.1)


def S(*xs):
    """Somme de signaux de longueurs différentes (complétés par du silence)."""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[: len(x)] += x
    return out


def make_sfx(c):
    i, dur, note = c["id"], c.get("dur", 0.4), c.get("note", 72)
    if i == "blip":
        return np.sin(2 * np.pi * mtof(note) * tt(0.09)) * expdec(0.09, 0.03) * 0.5
    if i == "type":
        return filt(noise(0.015), "high", 2200) * expdec(0.015, 0.003) + np.sin(2 * np.pi * 1700 * tt(0.015)) * expdec(0.015, 0.003) * 0.2
    if i == "pop":
        return sine_sweep(0.12, mtof(note) * 2.2, mtof(note), 0.04) * 0.7
    if i == "neon":
        t = tt(0.4)
        gate = np.repeat([1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1], len(t) // 12 + 1)[: len(t)]
        return filt(saw(100, 0.4) + 0.5 * np.sin(2 * np.pi * 50 * t), "band", (80, 2500)) * gate * 0.25
    if i in ("whooshUp", "zoom"):
        return sweep_noise(dur, 300, 5500, 0.5, "up") * 0.6
    if i in ("whooshDown", "suck", "swishDown"):
        return sweep_noise(dur, 6000, 250, 0.4, "down" if i != "suck" else "up") * 0.8
    if i in ("whoosh", "swish", "swipe", "flipBig", "iris", "draw", "blinds", "spin", "scroll"):
        f = {"whoosh": (500, 3500), "swish": (1200, 5000), "swipe": (800, 4000), "flipBig": (300, 2500), "iris": (400, 5000), "draw": (2000, 7000), "blinds": (800, 6000), "spin": (600, 1400), "scroll": (1500, 3000)}[i]
        d = dur if i != "swish" else 0.22
        return sweep_noise(d, f[0], f[1], 0.45) * (0.4 if i in ("draw", "scroll", "spin") else 0.8)
    if i == "whip":
        return sweep_noise(dur, 5000, 400, 0.3) * 0.9
    if i == "thud":
        return thump(110, 40, 0.4, 0.12)
    if i == "creak":
        t = tt(0.45)
        f = 180 + 60 * np.sin(2 * np.pi * 3 * t) + 40 * t
        return filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), "band", (400, 1600)) * np.sin(np.pi * t / 0.45) * 0.15
    if i == "knock":
        return S(woodblock(57, 0.12) * 0.6, filt(noise(0.02), "band", (500, 2000)) * expdec(0.02, 0.005))
    if i == "spell":
        return marimba(note)
    if i == "reverse":
        x = filt(noise(dur), "high", 3000) * (tt(dur) / dur) ** 3
        return x * 0.5
    if i == "clink":
        return clink()
    if i == "impact":
        return S(thump(90, 28, 1.2, 0.35) * 1.1, filt(noise(0.5), "low", 1200) * expdec(0.5, 0.08) * 0.6)
    if i == "fizz":
        return fizz(dur)
    if i == "tock":
        return woodblock(note, 0.1)
    if i in ("shimmer", "sparkle", "confetti"):
        return sparkles(dur if i != "sparkle" else 0.4, 24 if i == "confetti" else 10)
    if i in ("slam", "slamBig", "hit"):
        big = i == "slamBig"
        x = S(thump(160, 45, 0.35 if not big else 0.6, 0.08 if not big else 0.18), filt(noise(0.12), "band", (800, 5000)) * expdec(0.12, 0.02) * 0.6)
        if i == "hit":
            x = S(x * 0.6, stab("Eb", 0.22) * 1.2)
        return x
    if i == "pour":
        t = tt(dur)
        gl = np.sin(2 * np.pi * (180 + 120 * t / dur) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)) ** 3
        return S(gl * 0.5, fizz(dur) * 0.6) * np.sin(np.pi * tt(dur) / dur)[: len(S(gl, fizz(dur)))]
    if i == "slot":
        return S(filt(noise(0.03), "high", 3000) * expdec(0.03, 0.006), thump(300, 120, 0.08, 0.02) * 0.5)
    if i == "slap":
        return S(filt(noise(0.08), "band", (700, 3500)) * expdec(0.08, 0.015), thump(140, 60, 0.15, 0.04) * 0.6)
    if i == "tap":
        return sine_sweep(0.03, 1000, 450, 0.008) * 0.8
    if i == "cardSlide":
        return sweep_noise(0.13, 2000, 6000, 0.6) * 0.5
    if i == "cardFlip":
        return filt(noise(0.03), "band", (1500, 6000)) * expdec(0.03, 0.006) + np.sin(2 * np.pi * 1100 * tt(0.03)) * expdec(0.03, 0.005) * 0.3
    if i == "tick":
        return ratchet()
    if i == "ding":
        return fm_bell(note, 1.6) * 0.5
    if i == "clock":
        return woodblock(note, 0.08)
    if i == "buzzer":
        return buzzer()
    if i == "correct":
        return np.concatenate([fm_bell(84, 0.12, 2, 1.5), fm_bell(91, 0.6, 2, 1.5)]) * 0.35
    if i == "coin":
        a = np.sin(2 * np.pi * mtof(note) * tt(0.06))
        b = np.sin(2 * np.pi * mtof(note + 5) * tt(0.3)) * expdec(0.3, 0.1)
        return np.concatenate([a, b]) * 0.28
    if i == "boing":
        t = tt(0.35)
        f = mtof(note) * (1 + 0.25 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 9))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(0.35, 0.12) * 0.5
    if i == "stamp":
        return S(thump(130, 50, 0.3, 0.07), filt(noise(0.06), "band", (400, 3000)) * expdec(0.06, 0.012) * 0.8)
    if i == "gavel":
        return S(thump(180, 70, 0.5, 0.09) * 1.1, filt(noise(0.1), "band", (600, 2200)) * expdec(0.1, 0.02), woodblock(55, 0.2) * 0.5)
    if i == "bid":
        return S(pluck(note, 0.25, 1.0) * 0.8, pluck(note + 7, 0.25, 1.0) * 0.5)
    if i == "shout":
        return S(brassy("Gm9", 0.5) * 1.3, thump(120, 40, 0.4, 0.1) * 0.7)
    if i == "lock":
        return np.concatenate([ratchet(), np.zeros(int(0.03 * SR)), ratchet()]) * 1.2
    if i == "spotlight":
        return S(thump(80, 40, 0.5, 0.15) * 0.8, sweep_noise(0.6, 3000, 800, 0.5, "down") * 0.3)
    return np.zeros(10)


for c in cues["sfx"]:
    s = make_sfx(c)
    g = c.get("g", 0.5)
    p = float(np.clip(c.get("p", 0.0), -1, 1))
    sfx.add(s, c["t"], g, p)
    if c["id"] in ("clink", "ding", "gavel", "stamp", "shout", "spell", "correct", "coin", "bid", "sparkle", "shimmer", "confetti", "impact", "slamBig"):
        send.add(s, c["t"], g * 0.35, p)

# accord final (sol majeur neuvième) : la soirée finit bien
fin = brassy("Gmaj9", 2.5) * expdec(2.5, 0.9)
music.add(fin, bar_t(27), 0.8, -0.1)
send.add(fin, bar_t(27), 0.4)

# ------------------------------------------------------------------ mix
drums_x = drums.x
# grosse caisse et basse : la basse est déjà dans music, légère compression par tanh
mix = music.x * 1.0 + drums_x * 0.9 + sfx.x * 0.8
mix += reverb(send.x, 0.35)
mix = np.stack([filt(mix[:, c], "high", 34, 4) for c in range(2)], 1)
# fin : fondu sur la dernière demi-seconde
L = int(DUR * SR)
mix = mix[:L]
fade = int(0.6 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
# limiteur doux
peak = np.max(np.abs(mix))
mix = mix / peak * 1.6
mix = np.tanh(mix) / np.tanh(1.6)
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
