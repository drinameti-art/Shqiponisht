#!/usr/bin/env python3
"""Builds the app's bundled Japanese pronunciation audio.

For every item in scripts/audio/sayables.json (run `npx tsx scripts/audio/list.ts` first):

1. Human recording, if available (words only): the Tofugu/WaniKani vocabulary
   audio (CC BY-SA 4.0, https://github.com/tofugu/japanese-vocabulary-pronunciation-audio),
   male Tokyo-accent recordings only (median pitch < 170 Hz).
2. Otherwise a neural voice, by kind of item:
   - A: words and phrases  -> Style-Bert-VITS2, JVNV male voice M1 (CC BY-SA 4.0)
   - B: sentences          -> Style-Bert-VITS2, JVNV male voice M2 (CC BY-SA 4.0)
   - C: hiragana           -> Kokoro jm_kumo (Apache-2.0)
   - D: katakana           -> Kokoro jf_alpha (Apache-2.0)
   The two engines run in their own Python environments: set SBV2_PYTHON and
   KOKORO_PYTHON to their interpreters (see scripts/audio/README.md).

All clips are trimmed, loudness-normalised and encoded as mono MP3 into
assets/audio/, and src/data/audio.generated.ts maps each text to its clip.

Requires: ffmpeg, numpy, curl. Usage: python3 scripts/audio/build.py
"""
import hashlib
import json
import os
import re
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'audio'
CACHE = ROOT / '.audio-cache'
TOFUGU_RAW = 'https://raw.githubusercontent.com/tofugu/japanese-vocabulary-pronunciation-audio/master/lib/mp3/'
TOFUGU_INDEX = Path(os.environ.get('TOFUGU_INDEX', '/tmp/tofugu.txt'))  # one "written【reading】" per line
MALE_MAX_F0 = 170.0

SBV2_PYTHON = os.environ.get('SBV2_PYTHON', '/tmp/tts/sbv2/bin/python')
KOKORO_PYTHON = os.environ.get('KOKORO_PYTHON', '/tmp/tts/kokoro/bin/python')

# Voice for each kind of item (letters as on the comparison page).
VOICES = {
    'A': ('style-bert-vits2', 'M1'),  # words and phrases
    'B': ('style-bert-vits2', 'M2'),  # sentences
    'C': ('kokoro', 'jm_kumo'),       # hiragana
    'D': ('kokoro', 'jf_alpha'),      # katakana
}
SENTENCE_END = ('。', '？', '?', '！', 'です', 'ます', 'ません', 'ですか', 'ますか', 'ください')

def voice_for(item: dict) -> str:
    text = item['text']
    if item['kind'] == 'kana':
        return 'D' if any('ァ' <= c <= 'ヶ' for c in text) else 'C'
    # A sentence ends in 。/？, or ends like a clause (です, ます…) and has a particle joining two
    # parts (私は…, これを ください); set phrases such as おはようございます stay words (A).
    joined = re.compile(r'(?<=[^ぁ-ゖ\s])[はをがへに]|[はをがへに](?=[^ぁ-ゖ])').search(text, 1)
    is_sentence = text.endswith(('。', '？', '?', '！')) or (text.endswith(SENTENCE_END) and joined is not None)
    return 'B' if is_sentence else 'A'

def synthesise(engine: str, jobs: list[dict]) -> None:
    """Runs one engine over its jobs in a single process (models load once)."""
    if not jobs:
        return
    python = SBV2_PYTHON if engine == 'style-bert-vits2' else KOKORO_PYTHON
    script = ROOT / 'scripts/audio' / ('synth_sbv2.py' if engine == 'style-bert-vits2' else 'synth_kokoro.py')
    if not Path(python).exists():
        raise SystemExit(f'{engine}: interpreter {python} not found. See scripts/audio/README.md; nothing was changed.')
    job_file = CACHE / f'jobs-{engine}.json'
    job_file.write_text(json.dumps(jobs, ensure_ascii=False), 'utf-8')
    subprocess.run([python, str(script), str(job_file)], check=True, stdout=subprocess.DEVNULL)

def median_f0(path: Path) -> float:
    pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', str(path), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True).stdout
    x = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
    hop, win, vals = 160, 640, []
    for i in range(0, len(x) - win, hop):
        fr = x[i:i + win] * np.hanning(win)
        if np.sqrt(np.mean(fr ** 2)) < 0.02:
            continue
        ac = np.correlate(fr, fr, 'full')[win - 1:]
        lo, hi = 16000 // 400, 16000 // 60
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.35 * ac[0]:
            vals.append(16000 / lag)
    return float(np.median(vals)) if vals else 0.0

def finish(src: Path, dst: Path) -> None:
    """Trim silence, normalise loudness, encode mono MP3."""
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-i', str(src),
        '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
               'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
               'loudnorm=I=-18:TP=-2:LRA=11,apad=pad_dur=0.08',
        '-ac', '1', '-ar', '24000', '-b:a', '48k', str(dst),
    ], check=True)

def main() -> None:
    items = json.loads((ROOT / 'scripts/audio/sayables.json').read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(exist_ok=True)

    tofugu: dict[tuple[str, str], str] = {}
    if TOFUGU_INDEX.exists():
        for line in TOFUGU_INDEX.read_text('utf-8').splitlines():
            if '【' in line:
                written, rest = line.split('【', 1)
                tofugu.setdefault((written, rest.split('】', 1)[0]), line)

    plan: list[tuple[dict, str, Path, str]] = []  # item, clip id, mp3, source
    jobs: dict[str, list[dict]] = {'style-bert-vits2': [], 'kokoro': []}
    for it in items:
        text, reading = it['text'], it['reading']
        cid = hashlib.sha1(text.encode()).hexdigest()[:12]
        dst = OUT / f'{cid}.mp3'
        name = tofugu.get((text, reading)) or tofugu.get((reading, reading))
        if it['kind'] != 'kana' and name:
            raw = CACHE / f'tofugu-{cid}.mp3'
            if not raw.exists():
                subprocess.run(['curl', '-sS', '-f', '-o', str(raw), TOFUGU_RAW + urllib.parse.quote(name + '.mp3')])
            if raw.exists() and 0 < median_f0(raw) < MALE_MAX_F0:
                plan.append((it, cid, raw, 'tofugu'))
                continue
        letter = voice_for(it)
        engine, voice = VOICES[letter]
        wav = CACHE / f'{engine}-{voice}-{cid}.wav'
        if not wav.exists():
            jobs[engine].append({'wav': str(wav), 'text': text, 'reading': reading, 'voice': voice})
        plan.append((it, cid, wav, f'{engine} {voice} ({letter})'))

    for engine, engine_jobs in jobs.items():
        print(f'{engine}: {len(engine_jobs)} new clips')
        synthesise(engine, engine_jobs)

    manifest, sources = {}, []
    keep = set()
    for it, cid, raw, source in plan:
        dst = OUT / f'{cid}.mp3'
        finish(raw, dst)
        keep.add(dst.name)
        manifest[it['text']] = dst.name
        sources.append({'text': it['text'], 'reading': it['reading'], 'file': dst.name, 'source': source})
    for old in OUT.glob('*.mp3'):
        if old.name not in keep:
            old.unlink()

    lines = [
        '// Generated by scripts/audio/build.py. Do not edit by hand.',
        '// Human recordings: Tofugu/WaniKani (CC BY-SA 4.0). Synthesised: Style-Bert-VITS2 JVNV (CC BY-SA 4.0), Kokoro (Apache-2.0).',
        'export const AUDIO: Record<string, number> = {',
    ]
    for text, file in manifest.items():
        lines.append(f"  {json.dumps(text, ensure_ascii=False)}: require('../../assets/audio/{file}'),")
    lines.append('};')
    (ROOT / 'src/data/audio.generated.ts').write_text('\n'.join(lines) + '\n', 'utf-8')
    (ROOT / 'scripts/audio/sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=1) + '\n', 'utf-8')
    counts: dict[str, int] = {}
    for s in sources:
        key = s['source'].split(' (')[0]
        counts[key] = counts.get(key, 0) + 1
    print(f'\n{len(manifest)}/{len(items)} clips', counts)

if __name__ == '__main__':
    main()
