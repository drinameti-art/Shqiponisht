import { romajiToAlbanian } from '@/lib/albanian';

export type Script = 'hiragana' | 'katakana';

export type Kana = {
  hiragana: string;
  katakana: string;
  romaji: string;
  /** Albanian respelling, derived from romaji. */
  sq: string;
  /** Row id, e.g. "a", "ka", "sa" — used to group kana into lessons. */
  row: string;
};

/** Pronunciation tips (in Albanian) for kana whose sound needs a note. */
export const KANA_TIPS: Record<string, string> = {
  u: 'Thuhet pa i rrumbullakosur buzët, më lehtë se „u“ në shqip.',
  shi: 'Lexohet njësoj si „shi“ në shqip.',
  chi: 'Në romaji shkruhet „chi“, por në shqip lexohet „çi“ — si te „çaj“.',
  tsu: 'Në romaji „tsu“; në shqip „cu“ — si te „cung“.',
  fu: 'Tingull mes „f“ dhe „h“: nxirr ajër lehtë, pa i prekur dhëmbët me buzë.',
  su: '„u“ shpesh nuk dëgjohet: です (desu) tingëllon „des“.',
  ra: '„r“ japoneze është e butë, si „r“ e vetme shqipe te „ara“.',
  ri: '„r“ e butë me një goditje, si te „ari“ — jo „rr“.',
  ya: 'Romaji „y“ = shqip „j“: ya → ja.',
  yu: 'Romaji „y“ = shqip „j“: yu → ju.',
  yo: 'Romaji „y“ = shqip „j“: yo → jo.',
  wa: 'Shqipja nuk ka „w“: lexohet „ua“, shpejt, si një rrokje.',
  wo: 'Përdoret vetëm si pjesëz gramatikore dhe lexohet „o“.',
  n: 'E vetmja bashkëtingëllore pa zanore. Para b/p/m tingëllon si „m“.',
  ji: 'Romaji „ji“ = shqip „xhi“, si te „xhiro“.',
  ga: '゛ (dy vija) e bën tingullin të zëshëm: か ka → が ga.',
  pa: '゜ (rrethi i vogël) e kthen h-në në p: は ha → ぱ pa.',
};

type Row = [row: string, entries: [hira: string, kata: string, romaji: string][]];

const ROWS: Row[] = [
  ['a', [['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o']]],
  ['ka', [['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko']]],
  ['sa', [['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so']]],
  ['ta', [['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to']]],
  ['na', [['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no']]],
  ['ha', [['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho']]],
  ['ma', [['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo']]],
  ['ya', [['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo']]],
  ['ra', [['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro']]],
  ['wa', [['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo'], ['ん', 'ン', 'n']]],
  // Voiced (゛ dakuten) and half-voiced (゜ handakuten) rows. ぢ and づ are left
  // out: they sound exactly like じ and ず and appear in very few words.
  ['ga', [['が', 'ガ', 'ga'], ['ぎ', 'ギ', 'gi'], ['ぐ', 'グ', 'gu'], ['げ', 'ゲ', 'ge'], ['ご', 'ゴ', 'go']]],
  ['za', [['ざ', 'ザ', 'za'], ['じ', 'ジ', 'ji'], ['ず', 'ズ', 'zu'], ['ぜ', 'ゼ', 'ze'], ['ぞ', 'ゾ', 'zo']]],
  ['da', [['だ', 'ダ', 'da'], ['で', 'デ', 'de'], ['ど', 'ド', 'do']]],
  ['ba', [['ば', 'バ', 'ba'], ['び', 'ビ', 'bi'], ['ぶ', 'ブ', 'bu'], ['べ', 'ベ', 'be'], ['ぼ', 'ボ', 'bo']]],
  ['pa', [['ぱ', 'パ', 'pa'], ['ぴ', 'ピ', 'pi'], ['ぷ', 'プ', 'pu'], ['ぺ', 'ペ', 'pe'], ['ぽ', 'ポ', 'po']]],
];

/** Rows that add ゛ or ゜ to a basic row. */
export const VOICED_ROWS = ['ga', 'za', 'da', 'ba', 'pa'];

export const KANA: Kana[] = ROWS.flatMap(([row, entries]) =>
  entries.map(([hiragana, katakana, romaji]) => ({
    hiragana,
    katakana,
    romaji,
    sq: romajiToAlbanian(romaji),
    row,
  })),
);

/**
 * Grid layout of the gojūon chart, five columns per row (a i u e o).
 * `null` marks an empty cell so the ya/wa rows line up with their vowels.
 */
export const KANA_GRID: (string | null)[][] = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', null, 'yu', null, 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', null, null, null, 'wo'],
  ['n', null, null, null, null],
];

/** Chart of the ゛/゜ rows, laid out like KANA_GRID. */
export const VOICED_GRID: (string | null)[][] = [
  ['ga', 'gi', 'gu', 'ge', 'go'],
  ['za', 'ji', 'zu', 'ze', 'zo'],
  ['da', null, null, 'de', 'do'],
  ['ba', 'bi', 'bu', 'be', 'bo'],
  ['pa', 'pi', 'pu', 'pe', 'po'],
];

const BY_ROMAJI = new Map(KANA.map((k) => [k.romaji, k]));

export function kanaByRomaji(romaji: string): Kana {
  const k = BY_ROMAJI.get(romaji);
  if (!k) throw new Error(`Unknown kana: ${romaji}`);
  return k;
}

export function kanaInRows(rows: string[]): Kana[] {
  return KANA.filter((k) => rows.includes(k.row));
}
