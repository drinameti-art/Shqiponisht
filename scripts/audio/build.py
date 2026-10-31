#!/usr/bin/env python3
"""Builds the app's bundled Japanese pronunciation audio.

For every item in scripts/audio/sayables.json (run `npx tsx scripts/audio/list.ts` first):

1. Human recording, if available: the Tofugu/WaniKani vocabulary audio
   (CC BY-SA 4.0, https://github.com/tofugu/japanese-vocabulary-pronunciation-audio).
   That set mixes a male Tokyo-accent voice actor with a female Kansai-accent
   speaker; only the male recordings are kept (median pitch < 170 Hz), so the
   app has one consistent, standard-accent male voice.
2. Otherwise, VOICEVOX with the voice 玄野武宏 (credit: "VOICEVOX:玄野武宏",
   commercial use allowed with that credit). The engine must be running on
   http://127.0.0.1:50021. Each clip is first synthesised from the written form
   (kanji give the engine the right pitch accent); if the engine's reading
   differs from the app's kana, it is synthesised again from the kana.

All clips are trimmed, loudness-normalised and encoded as mono MP3 into
assets/audio/, and src/data/audio.generated.ts maps each text to its clip.

Requires: ffmpeg, numpy, curl. Usage: python3 scripts/audio/build.py
"""
import hashlib
import json
import os
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'audio'
CACHE = ROOT / '.audio-cache'
ENGINE = 'http://127.0.0.1:50021'
SPEAKER = 11  # 玄野武宏 (ノーマル)
TOFUGU_RAW = 'https://raw.githubusercontent.com/tofugu/japanese-vocabulary-pronunciation-audio/master/lib/mp3/'
TOFUGU_INDEX = Path(os.environ.get('TOFUGU_INDEX', '/tmp/tofugu.txt'))  # one "written【reading】" per line
MALE_MAX_F0 = 170.0

NO_PROXY = urllib.request.build_opener(urllib.request.ProxyHandler({}))

def hira(s: str) -> str:
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)

def engine(path: str, data: bytes | None = None, params: dict | None = None) -> bytes:
    url = ENGINE + path + ('?' + urllib.parse.urlencode(params) if params else '')
    req = urllib.request.Request(url, data=data if data is not None else b'', method='POST',
                                 headers={'Content-Type': 'application/json'})
    with NO_PROXY.open(req, timeout=120) as r:
        return r.read()

def engine_reading(query: dict) -> str:
    return ''.join(m['text'] for ap in query['accent_phrases'] for m in ap['moras'])

def voicevox(text: str, reading: str, wav: Path) -> str:
    """
    Synthesises `text`, falling back to the kana when the engine would read the
    written form differently (e.g. 何ですか as "nani desu ka"). Both are compared
    in the engine's own phonetic spelling, so long vowels and the particles
    は/を/へ (read wa/o/e) don't count as differences.
    """
    query = json.loads(engine('/audio_query', params={'text': text, 'speaker': SPEAKER}))
    source = 'voicevox'
    if text != reading:
        by_kana = json.loads(engine('/audio_query', params={'text': reading, 'speaker': SPEAKER}))
        if engine_reading(query) != engine_reading(by_kana):
            query, source = by_kana, 'voicevox (from kana)'
    if reading == 'ん':
        # A lone ん is a short nasal hum the engine barely voices: lengthen and boost it.
        query = json.loads(engine('/audio_query', params={'text': 'ンー', 'speaker': SPEAKER}))
        for ap in query['accent_phrases']:
            for m in ap['moras']:
                m['vowel_length'] = 0.3
        query['volumeScale'] = 2.0
        source = 'voicevox'
    query['speedScale'] = 0.95
    query['prePhonemeLength'] = 0.05
    query['postPhonemeLength'] = 0.1
    wav.write_bytes(engine('/synthesis', data=json.dumps(query).encode(), params={'speaker': SPEAKER}))
    return source

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
    # Fail fast instead of writing a manifest that silently drops every synthesised clip.
    try:
        NO_PROXY.open(ENGINE + '/version', timeout=10).read()
    except Exception as e:  # noqa: BLE001
        raise SystemExit(f'VOICEVOX engine is not reachable at {ENGINE} ({e}). Start it first; nothing was changed.')
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(exist_ok=True)

    tofugu: dict[tuple[str, str], str] = {}
    if TOFUGU_INDEX.exists():
        for line in TOFUGU_INDEX.read_text('utf-8').splitlines():
            if '【' in line:
                written, rest = line.split('【', 1)
                tofugu.setdefault((written, rest.split('】', 1)[0]), line)

    manifest, sources = {}, []
    for it in items:
        text, reading = it['text'], it['reading']
        cid = hashlib.sha1(text.encode()).hexdigest()[:12]
        dst = OUT / f'{cid}.mp3'
        source = None
        name = tofugu.get((text, reading)) or tofugu.get((reading, reading))
        if it['kind'] != 'kana' and name:
            raw = CACHE / f'tofugu-{cid}.mp3'
            if not raw.exists():
                subprocess.run(['curl', '-sS', '-f', '-o', str(raw), TOFUGU_RAW + urllib.parse.quote(name + '.mp3')])
            if raw.exists() and 0 < median_f0(raw) < MALE_MAX_F0:
                finish(raw, dst)
                source = 'tofugu'
        if source is None:
            wav = CACHE / f'vv-{cid}.wav'
            try:
                source = voicevox(text, reading, wav)
                finish(wav, dst)
            except Exception as e:  # noqa: BLE001
                # Keep an existing clip rather than dropping it from the manifest.
                if dst.exists():
                    print(f'  ! kept previous clip for {text}: {e}')
                    source = 'kept'
                else:
                    print(f'  ! no audio for {text}: {e}')
                    continue
        manifest[text] = dst.name
        sources.append({'text': text, 'reading': reading, 'file': dst.name, 'source': source})
        print(f'{source:22} {text}')

    lines = [
        '// Generated by scripts/audio/build.py. Do not edit by hand.',
        '// Human recordings: Tofugu/WaniKani (CC BY-SA 4.0). Synthesised: VOICEVOX:玄野武宏.',
        'export const AUDIO: Record<string, number> = {',
    ]
    for text, file in manifest.items():
        lines.append(f"  {json.dumps(text, ensure_ascii=False)}: require('../../assets/audio/{file}'),")
    lines.append('};')
    (ROOT / 'src/data/audio.generated.ts').write_text('\n'.join(lines) + '\n', 'utf-8')
    (ROOT / 'scripts/audio/sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=1) + '\n', 'utf-8')
    counts: dict[str, int] = {}
    for s in sources:
        counts[s['source']] = counts.get(s['source'], 0) + 1
    print(f'\n{len(manifest)}/{len(items)} clips', counts)

if __name__ == '__main__':
    main()
