#!/bin/bash
# Rebuilds assets/fonts/NotoSansJP-Bold.ttf with only the kana and kanji the app uses.
# Needs: pip install fonttools. Run after adding content with new kanji.
set -euo pipefail
cd "$(dirname "$0")/../.."
SRC=node_modules/@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf
npx tsx scripts/fonts/chars.ts > /tmp/shq-jp-chars.txt
pyftsubset "$SRC" --text-file=/tmp/shq-jp-chars.txt --unicodes="U+0020-007E" \
  --layout-features='*' --output-file=assets/fonts/NotoSansJP-Bold.ttf
echo "assets/fonts/NotoSansJP-Bold.ttf: $(wc -c < assets/fonts/NotoSansJP-Bold.ttf) bytes, $(wc -m < /tmp/shq-jp-chars.txt) characters"
