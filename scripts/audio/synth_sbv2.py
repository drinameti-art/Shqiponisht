#!/usr/bin/env python3
"""Synthesises words, phrases and sentences with Style-Bert-VITS2 (JVNV male voices).

Run by scripts/audio/build.py inside its own environment (see scripts/audio/README.md):
    $SBV2_PYTHON scripts/audio/synth_sbv2.py jobs.json
`jobs.json` is a list of {"wav", "text", "reading", "voice"} where voice is "M1" or "M2".

Models: litagin/style_bert_vits2_jvnv (JVNV corpus, CC BY-SA 4.0). Each clip is
synthesised from the written form when Open JTalk reads it the way the app's kana
says (kanji give it the right pitch accent); otherwise from the kana.
"""
import json
import sys

import soundfile as sf
import torch
import torch.nn.functional as Fn
from huggingface_hub import hf_hub_download, list_repo_files
from pyopenjtalk import g2p
from style_bert_vits2.constants import Languages
from style_bert_vits2.nlp import bert_models
from style_bert_vits2.tts_model import TTSModel

REPO = 'litagin/style_bert_vits2_jvnv'
BERT = 'ku-nlp/deberta-v2-large-japanese-char-wwm'

# The JP-Extra checkpoints leave some activations in float16; CPU convolutions need one dtype.
_conv1d = Fn.conv1d


def _conv1d_same_dtype(input, weight, bias=None, *a, **k):
    return _conv1d(input.to(weight.dtype), weight, bias, *a, **k)


Fn.conv1d = _conv1d_same_dtype
torch.nn.modules.conv.F.conv1d = _conv1d_same_dtype


def kana_key(s: str) -> str:
    """Compares readings loosely: hiragana, no spaces/punctuation/long marks, particles as pronounced."""
    s = ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)
    s = s.replace('は', 'わ').replace('を', 'お').replace('へ', 'え')
    return ''.join(c for c in s if 'ぁ' <= c <= 'ゖ' and c not in 'ーう')


def load(voice: str) -> TTSModel:
    d = f'jvnv-{voice}-jp'
    weights = next(f for f in list_repo_files(REPO) if f.startswith(d + '/') and f.endswith('.safetensors'))
    return TTSModel(
        model_path=hf_hub_download(REPO, weights),
        config_path=hf_hub_download(REPO, f'{d}/config.json'),
        style_vec_path=hf_hub_download(REPO, f'{d}/style_vectors.npy'),
        device='cpu',
    )


def main() -> None:
    jobs = json.load(open(sys.argv[1], encoding='utf-8'))
    bert_models.load_model(Languages.JP, BERT)
    bert_models.load_tokenizer(Languages.JP, BERT)
    models: dict[str, TTSModel] = {}
    for job in jobs:
        model = models.get(job['voice']) or models.setdefault(job['voice'], load(job['voice']))
        text, reading = job['text'], job['reading']
        same = kana_key(g2p(text, kana=True)) == kana_key(reading)
        src = text if same else reading
        sr, audio = model.infer(text=src, style='Neutral', style_weight=1.0, length=1.05)
        sf.write(job['wav'], audio, sr)
        print(json.dumps({'wav': job['wav'], 'from': 'text' if same else 'kana'}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
