# Pronunciation audio

`python3 scripts/audio/build.py` builds `assets/audio/*.mp3` and `src/data/audio.generated.ts` from `scripts/audio/sayables.json` (refresh it first with `npx tsx scripts/audio/list.ts`).

| Voice | Used for | Engine | Licence |
| --- | --- | --- | --- |
| Tofugu / WaniKani | words that have a native recording | human, male Tokyo accent | CC BY-SA 4.0 |
| A | other words and phrases | Style-Bert-VITS2, JVNV `M1` | CC BY-SA 4.0 |
| B | sentences | Style-Bert-VITS2, JVNV `M2` | CC BY-SA 4.0 |
| C | hiragana | Kokoro `jm_kumo` | Apache-2.0 |
| D | katakana | Kokoro `jf_alpha` | Apache-2.0 |

Each engine runs in its own Python 3.11 environment (they need different library versions). One-time setup with [uv](https://docs.astral.sh/uv/):

```bash
# Style-Bert-VITS2 (voices A, B)
uv venv -p 3.11 ~/tts/sbv2
uv pip install --python ~/tts/sbv2/bin/python torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python ~/tts/sbv2/bin/python style-bert-vits2 soundfile huggingface_hub "numpy<2"

# Kokoro (voices C, D)
uv venv -p 3.11 ~/tts/kokoro
uv pip install --python ~/tts/kokoro/bin/python torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python ~/tts/kokoro/bin/python "kokoro>=0.9" "misaki[ja]" soundfile
~/tts/kokoro/bin/python -m unidic download

export SBV2_PYTHON=~/tts/sbv2/bin/python KOKORO_PYTHON=~/tts/kokoro/bin/python
```

Models download from Hugging Face on first use (about 2 GB). Everything runs on the CPU. Clips already in `.audio-cache/` are reused, so after adding a few words only those are synthesised. Tofugu recordings need `TOFUGU_INDEX` pointing to a list of their file names (see `build.py`).

Words and phrases are synthesised from their written form when Open JTalk reads it the same way as the app's kana (kanji give the right pitch accent), otherwise from the kana. `scripts/audio/sources.json` records the source and voice of every clip.
