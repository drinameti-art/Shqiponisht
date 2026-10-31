#!/usr/bin/env python3
"""Synthesizes the app's sound effects into assets/sounds/*.wav.

All sounds are generated from sine waves here, so there are no third-party
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


# Correct answer: a bright rising two-note chime (E6 → A6).
write("correct", mix((0, tone(1318.5, 0.16, 0.45, 5)), (0.09, tone(1760.0, 0.38, 0.5, 5))))

# Wrong answer: a soft, low falling "bum-bum" — noticeable but not harsh.
soft = ((1, 1.0), (2, 0.15))
write("wrong", mix((0, tone(233.1, 0.16, 0.6, 4, soft, glide=-0.06)), (0.15, tone(196.0, 0.3, 0.6, 4, soft, glide=-0.08))))

# Lesson finished: an ascending C-major arpeggio with a held top note.
notes = [523.25, 659.25, 783.99, 1046.5]
write("complete", mix(*[(i * 0.11, tone(f, 0.6 if i == 3 else 0.3, 0.42, 4)) for i, f in enumerate(notes)]))

# A correct stroke while writing: a short, quiet wooden tick.
write("stroke", tone(880.0, 0.07, 0.35, 9, ((1, 1.0), (3, 0.3))))

# Lesson failed: a gentle descending pair, encouraging rather than punishing.
write("retry", mix((0, tone(659.25, 0.22, 0.4, 5)), (0.14, tone(523.25, 0.4, 0.4, 5))))
print("Wrote", ", ".join(sorted(p.name for p in OUT.glob("*.wav"))))
