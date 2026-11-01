#!/usr/bin/env python3
"""Synthesises single kana with Kokoro (Apache-2.0): jm_kumo (C) for hiragana, jf_alpha (D) for katakana.

Run by scripts/audio/build.py inside its own environment (see scripts/audio/README.md):
    $KOKORO_PYTHON scripts/audio/synth_kokoro.py jobs.json
`jobs.json` is a list of {"wav", "reading", "voice"}.
"""
import json
import sys

import numpy as np
import soundfile as sf
from kokoro import KPipeline


def main() -> None:
    jobs = json.load(open(sys.argv[1], encoding='utf-8'))
    pipe = KPipeline(lang_code='j')
    for job in jobs:
        # Kokoro reads hiragana and katakana the same way; it gets the hiragana form.
        reading = ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in job['reading'])
        parts = [a for _, _, a in pipe(reading, voice=job['voice'], speed=0.9)]
        sf.write(job['wav'], np.concatenate(parts), 24000)
        print(json.dumps({'wav': job['wav']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
