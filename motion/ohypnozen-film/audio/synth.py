"""Bande-son du film Ohypnozen, synthétisée de zéro (aucun sample).

Ambiance lente à 60 BPM en ré majeur : nappes, drone, piano feutré, bols
chantants, cordes pincées (Karplus-Strong) et souffles, calés sur les repères
de la timeline (out/cues.json). Sortie : out/soundtrack.wav (48 kHz, 24 bits).
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
BEAT = 60.0 / cues["bpm"]
BAR = 4 * BEAT
DUR = cues["duration"]
N = int(DUR * SR)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def filt(x, kind, f, order=2):
    if kind == "band":
        s = butter(order, [max(20, f[0]), min(SR / 2 - 100, f[1])], btype="band", fs=SR, output="sos")
    else:
        s = butter(order, min(f, SR / 2 - 100), btype=kind, fs=SR, output="sos")
    return sosfilt(s, x)


@njit(cache=True)
def svf(x, cut, q):
    y = np.zeros_like(x)
    lp = 0.0
    bp = 0.0
    for i in range(x.shape[0]):
        f = 2.0 * np.sin(np.pi * min(cut[i], 16000.0) / 48000.0)
        for _ in range(2):
            hp = x[i] - lp - q * bp
            bp += f * 0.5 * hp
            lp += f * 0.5 * bp
        y[i] = lp
    return y


@njit(cache=True)
def karplus(n, period, damp, seed):
    np.random.seed(seed)
    buf = np.random.uniform(-1.0, 1.0, period)
    # attaque adoucie : excitation filtrée
    for i in range(1, period):
        buf[i] = 0.5 * (buf[i] + buf[i - 1])
    out = np.zeros(n)
    idx = 0
    for i in range(n):
        v = buf[idx]
        nxt = buf[(idx + 1) % period]
        buf[idx] = damp * 0.5 * (v + nxt)
        out[i] = v
        idx = (idx + 1) % period
    return out


def env(d, a, r):
    n = int(d * SR)
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[: min(na, n)] = np.linspace(0, 1, min(na, n)) ** 2
    e[-min(nr, n):] *= np.linspace(1, 0, min(nr, n)) ** 1.5
    return e


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 6, 2))

    def add(self, sig, t, g=1.0, p=0.0):
        sig = np.array(sig, dtype=np.float64)
        nf = min(len(sig) // 2, int(0.01 * SR))
        if nf > 1:
            sig[-nf:] *= np.linspace(1, 0, nf)
            sig[: min(nf, 48)] *= np.linspace(0, 1, min(nf, 48))
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), self.x.shape[0] - i)
        a = (p + 1) * np.pi / 4
        self.x[i : i + n, 0] += sig[:n] * g * np.cos(a)
        self.x[i : i + n, 1] += sig[:n] * g * np.sin(a)


def ir(d=4.5, tau=1.3):
    L = filt(noise(d), "low", 4500) * np.exp(-tt(d) / tau)
    R = filt(noise(d), "low", 4500) * np.exp(-tt(d) / tau)
    x = np.stack([L, R], 1)
    x[: int(0.02 * SR)] = 0
    return x / np.sqrt((x**2).sum() / 2)


IR = ir()
music, sfx, send = Bus(), Bus(), Bus()

# ------------------------------------------------------------------ harmonie
CH = {
    "D": ([54, 57, 61, 64], 50),
    "Bm": ([57, 62, 64, 66], 47),
    "G": ([59, 62, 66, 69], 43),
    "A": ([62, 64, 66, 71], 45),
}
PROG = ["D", "D", "Bm", "G", "D", "Bm", "G", "A", "D", "G", "G", "D"]


def pad_note(m, d):
    t = tt(d)
    f = mtof(m)
    x = np.zeros(len(t))
    for det in (-0.004, 0.0, 0.0045):
        ph = rng.random()
        x += 2 * np.abs(2 * ((t * f * (1 + det) + ph) % 1) - 1) - 1  # triangle
    return x / 3


# Nappes : une par mesure, attaque et relâche longues, filtre qui s'ouvre avec le jour.
pad = np.zeros(N + SR * 6)
for b, name in enumerate(PROG):
    t0 = b * BAR
    d = BAR + 1.6
    notes, _ = CH[name]
    x = sum(pad_note(m, d) for m in notes) * env(d, 1.4, 1.6) * 0.22
    i = int(t0 * SR)
    pad[i : i + len(x)] += x
cut = np.interp(np.arange(len(pad)) / SR, [0, 6, 14, 40, 46, 50], [500, 700, 2200, 2400, 1100, 600])
pad = svf(pad, cut.astype(np.float64), 0.7)
music.add(pad, 0, 0.8, -0.15)
music.add(np.roll(pad, int(0.013 * SR)), 0, 0.8, 0.15)
send.add(pad, 0, 0.35)

# Drone grave (ré) sur tout le film, qui respire avec l'image (4 s).
t = tt(DUR + 2)
drone = (np.sin(2 * np.pi * mtof(38) * t) * 0.6 + np.sin(2 * np.pi * mtof(50) * t) * 0.25) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 4 - np.pi / 2))
drone *= np.clip(t / 3, 0, 1) * np.clip((DUR + 0.5 - t) / 3, 0, 1)
music.add(drone, 0, 0.18)

# Basses tenues.
for b, name in enumerate(PROG):
    _, root = CH[name]
    d = BAR + 0.5
    x = np.sin(2 * np.pi * mtof(root) * tt(d)) * env(d, 0.6, 1.0)
    music.add(x, b * BAR, 0.16)


# Piano feutré : partiels amortis, attaque douce, filtré.
def piano(m, d=3.0, vel=1.0):
    f = mtof(m)
    t = tt(d)
    x = np.zeros(len(t))
    for k, (a, dec) in enumerate([(1, 1.6), (0.45, 0.9), (0.22, 0.6), (0.1, 0.4)]):
        x += a * np.sin(2 * np.pi * f * (k + 1) * (1 + 0.0007 * k * k) * t) * np.exp(-t / dec)
    x *= np.minimum(1, t / 0.008)
    return filt(x, "low", 2400 + 1400 * vel) * vel * 0.35


# Arpège au piano à partir de la mesure 5 (noires, notes de l'accord).
for b in range(4, 11):
    notes, _ = CH[PROG[b]]
    seq = [notes[0] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12]
    for q in range(4):
        sfx.add(piano(seq[q], 2.6, 0.55 if q else 0.7), b * BAR + q * BEAT + 0.02, 0.5, -0.3 + 0.2 * q)


def bowl(m, d=7.0):
    f = mtof(m)
    t = tt(d)
    x = np.zeros(len(t))
    for r, a, dec in ((1, 1, 4.5), (2.76, 0.5, 2.8), (5.4, 0.25, 1.6), (8.9, 0.12, 0.9)):
        x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dec) * (1 + 0.3 * np.sin(2 * np.pi * (1.2 + r * 0.3) * t))
        x += a * 0.6 * np.sin(2 * np.pi * f * r * 1.003 * t) * np.exp(-t / dec)
    x *= np.minimum(1, t / 0.01)
    return x * 0.22


def chime(m, d=3.0):
    f = mtof(m)
    t = tt(d)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 4)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.9) * 0.3


def pluck(m, d=3.0, damp=0.996, seed=1):
    period = int(SR / mtof(m))
    x = karplus(int(d * SR), period, damp, seed)
    return filt(x, "low", 3500) * 0.4


def breath(d, up=True):
    x = noise(d)
    c = np.geomspace(250, 1400, len(x)) if up else np.geomspace(1400, 250, len(x))
    y = svf(x, c, 0.6)
    tn = tt(d) / d
    return y * np.sin(np.pi * tn) ** 1.6 * 0.5


def make(c):
    i, dur, note = c["id"], c.get("dur", 1.0), c.get("note", 62)
    if i == "bowl":
        return bowl(note)
    if i == "chime":
        return chime(note)
    if i == "piano":
        return piano(note, 3.2, 0.9)
    if i == "breathIn":
        return breath(dur, True)
    if i == "breathOut":
        return breath(dur, False)
    if i in ("swell", "airUp"):
        x = noise(dur)
        y = svf(x, np.geomspace(300, 2500 if i == "airUp" else 1600, len(x)), 0.5)
        return y * (tt(dur) / dur) ** 2 * np.sin(np.pi * np.minimum(1, tt(dur) / dur * 0.98)) * 0.6
    if i == "string":
        return pluck(50, 3.0, 0.997, 3)
    if i == "untie":
        out = np.zeros(int((dur + 3) * SR))
        for k, m in enumerate([74, 71, 69, 66, 64, 62, 57]):
            p = pluck(m, 3.0, 0.996, 10 + k) * (0.9 - k * 0.06)
            j = int(k * dur / 7 * SR)
            out[j : j + len(p)] += p
        return out
    if i == "harp":
        out = np.zeros(int((dur + 3) * SR))
        for k, m in enumerate([50, 54, 57, 62, 66, 69, 74, 78]):
            p = pluck(m, 3.0, 0.997, 30 + k) * 0.7
            j = int(k * dur / 8 * SR)
            out[j : j + len(p)] += p
        return out
    if i == "stone":
        t = tt(0.6)
        return (np.sin(2 * np.pi * mtof(note) * t) * np.exp(-t / 0.18) + filt(noise(0.6), "low", 500) * np.exp(-t / 0.05) * 0.4) * 0.6
    return np.zeros(10)


for c in cues["sfx"]:
    s = make(c)
    sfx.add(s, c["t"], c.get("g", 0.5), c.get("p", 0.0))
    send.add(s, c["t"], c.get("g", 0.5) * 0.5, c.get("p", 0.0))

# accord final au piano, arpégé lentement
for k, m in enumerate([50, 57, 62, 66, 69, 73]):
    sfx.add(piano(m, 5.0, 0.6), 44.0 + k * 0.18, 0.45, -0.2 + 0.08 * k)

mix = music.x + sfx.x
wet = np.zeros_like(send.x)
for ch in range(2):
    wet[:, ch] = fftconvolve(send.x[:, ch], IR[:, ch])[: send.x.shape[0]]
mix += wet * 0.45
mix = np.stack([filt(mix[:, c], "high", 30, 4) for c in range(2)], 1)[:N]
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
mix = mix / np.max(np.abs(mix)) * 1.2
mix = np.tanh(mix) / np.tanh(1.2) * 10 ** (-1.5 / 20)
print(f"crête {20*np.log10(np.max(np.abs(mix))):.1f} dBFS, RMS {20*np.log10(np.sqrt(np.mean(mix**2))):.1f} dBFS")
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
