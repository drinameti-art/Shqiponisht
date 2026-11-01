#!/usr/bin/env python3
"""Synthesizes the app's sound effects into assets/sounds/*.wav.

All sounds are generated here (piano-like tones in G major, a felt-tip noise), so there are no third-party
recordings or licenses involved. Run: python3 scripts/make-sounds.py
"""
import math
import struct
import wave
from pathlib import Path

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"


def tone(freq, dur, vol=0.5, decay=6.0, harmonics=((1, 1.0), (2, 0.25), (3, 0.08)), glide=0.0):
    """A bell-like note: fast attack, exponential decay, a few soft overtones."""
    n = int(RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / RATE
        f = freq * (1 + glide * t / dur)
        phase += 2 * math.pi * f / RATE
        attack = min(1.0, t / 0.006)
        env = attack * math.exp(-decay * t / dur)
        s = sum(a * math.sin(h * phase) for h, a in harmonics)
        out.append(vol * env * s / sum(a for _, a in harmonics))
    return out


def piano(freq, dur, vol=0.45):
    """A soft piano-like note: felt-hammer attack, partials that fade faster the higher they are."""
    n = int(RATE * dur)
    out = []
    partials = [(k, 1.0 / k ** 1.4, 2.5 + 1.8 * k) for k in range(1, 7)]
    norm = sum(a for _, a, _ in partials)
    for i in range(n):
        t = i / RATE
        attack = min(1.0, t / 0.012)
        s = 0.0
        for k, a, d in partials:
            fk = freq * k * (1 + 0.0004 * k * k)  # slight string inharmonicity
            s += a * math.exp(-d * t) * math.sin(2 * math.pi * fk * t)
        out.append(vol * attack * s / norm)
    return out


def felt_tip(dur=0.11, vol=0.22, seed=7):
    """A gentle felt-tip stroke on paper: soft band-limited noise that swells and fades."""
    import random
    rnd = random.Random(seed)
    n = int(RATE * dur)
    out, lp, hp_prev, hp = [], 0.0, 0.0, 0.0
    for i in range(n):
        x = rnd.uniform(-1, 1)
        lp += 0.18 * (x - lp)           # low-pass: takes the hiss off
        hp = 0.92 * (hp + lp - hp_prev)  # high-pass: removes the rumble
        hp_prev = lp
        t = i / n
        env = math.sin(math.pi * t) ** 1.5
        out.append(vol * env * hp * 3)
    return out


def silence(dur):
    return [0.0] * int(RATE * dur)


def mix(*parts):
    """Overlays (offset_seconds, samples) parts."""
    end = max(int(o * RATE) + len(p) for o, p in parts)
    buf = [0.0] * end
    for o, p in parts:
        start = int(o * RATE)
        for i, v in enumerate(p):
            buf[start + i] += v
    return buf


def write(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    scale = min(1.0, 0.9 / peak)
    fade = int(RATE * 0.01)
    data = bytearray()
    for i, s in enumerate(samples):
        if i > len(samples) - fade:
            s *= (len(samples) - i) / fade
        data += struct.pack("<h", int(max(-1, min(1, s * scale)) * 32767))
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(bytes(data))


# All musical sounds are soft piano notes in G major (docs/BRAND.md §6).
G4, B4, D5, G5 = 392.0, 493.88, 587.33, 783.99

# Correct answer: a light rising fourth, D5 -> G5.
write("correct", mix((0, piano(D5, 0.5, 0.42)), (0.1, piano(G5, 0.9, 0.48))))

# Wrong answer: a soft, low falling pair (A3 -> G3), noticeable but not harsh.
write("wrong", mix((0, piano(220.0, 0.45, 0.5)), (0.16, piano(196.0, 0.7, 0.5))))

# Lesson finished: a G-major arpeggio, G4 B4 D5 G5, with the top note held.
write("complete", mix(*[(i * 0.12, piano(f, 1.4 if i == 3 else 0.6, 0.42)) for i, f in enumerate([G4, B4, D5, G5])]))

# A correct stroke while writing: a gentle felt-tip on paper.
write("stroke", felt_tip())

# Lesson failed: a calm descending pair, B4 -> G4, encouraging rather than punishing.
write("retry", mix((0, piano(B4, 0.5, 0.4)), (0.16, piano(G4, 1.0, 0.4))))
print("Wrote", ", ".join(sorted(p.name for p in OUT.glob("*.wav"))))
