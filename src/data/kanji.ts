import { romajiToAlbanian } from '@/lib/albanian';

export type Reading = { kana: string; romaji: string; sq: string };

export type KanjiExample = { jp: string; kana: string; romaji: string; sq: string; meaning: string };

export type Kanji = {
  char: string;
  /** Meaning in Albanian. Unique across all kanji so quiz answers never collide. */
  meaning: string;
  /** On'yomi (Chinese-derived) reading, in katakana. */
  on: Reading;
  /** Kun'yomi (native Japanese) reading, in hiragana. */
  kun: Reading;
  strokes: number;
  examples: KanjiExample[];
  group: KanjiGroupId;
};

export type KanjiGroupId = 'numrat' | 'java' | 'trupi' | 'natyra' | 'shkolla';

export const KANJI_GROUPS: { id: KanjiGroupId; title: string }[] = [
  { id: 'numrat', title: 'Numrat' },
  { id: 'java', title: 'Ditët e javës' },
  { id: 'trupi', title: 'Njeriu dhe trupi' },
  { id: 'natyra', title: 'Madhësia, drejtimi, natyra' },
  { id: 'shkolla', title: 'Shkolla dhe jeta' },
];

function r(kana: string, romaji: string): Reading {
  return { kana, romaji, sq: romajiToAlbanian(romaji) };
}

function ex(jp: string, kana: string, romaji: string, meaning: string): KanjiExample {
  return { jp, kana, romaji, sq: romajiToAlbanian(romaji), meaning };
}

type Row = [char: string, meaning: string, on: Reading, kun: Reading, strokes: number, examples: KanjiExample[]];

const DATA: Record<KanjiGroupId, Row[]> = {
  numrat: [
    ['一', 'një', r('イチ', 'ichi'), r('ひと', 'hito'), 1, [ex('一つ', 'ひとつ', 'hitotsu', 'një (copë)'), ex('一月', 'いちがつ', 'ichigatsu', 'janar')]],
    ['二', 'dy', r('ニ', 'ni'), r('ふた', 'futa'), 2, [ex('二つ', 'ふたつ', 'futatsu', 'dy (copë)'), ex('二月', 'にがつ', 'nigatsu', 'shkurt')]],
    ['三', 'tre', r('サン', 'san'), r('み', 'mi'), 3, [ex('三つ', 'みっつ', 'mittsu', 'tre (copë)'), ex('三月', 'さんがつ', 'sangatsu', 'mars')]],
    ['四', 'katër', r('シ', 'shi'), r('よん', 'yon'), 5, [ex('四つ', 'よっつ', 'yottsu', 'katër (copë)'), ex('四月', 'しがつ', 'shigatsu', 'prill')]],
    ['五', 'pesë', r('ゴ', 'go'), r('いつ', 'itsu'), 4, [ex('五つ', 'いつつ', 'itsutsu', 'pesë (copë)'), ex('五月', 'ごがつ', 'gogatsu', 'maj')]],
    ['六', 'gjashtë', r('ロク', 'roku'), r('む', 'mu'), 4, [ex('六つ', 'むっつ', 'muttsu', 'gjashtë (copë)'), ex('六月', 'ろくがつ', 'rokugatsu', 'qershor')]],
    ['七', 'shtatë', r('シチ', 'shichi'), r('なな', 'nana'), 2, [ex('七つ', 'ななつ', 'nanatsu', 'shtatë (copë)'), ex('七月', 'しちがつ', 'shichigatsu', 'korrik')]],
    ['八', 'tetë', r('ハチ', 'hachi'), r('や', 'ya'), 2, [ex('八つ', 'やっつ', 'yattsu', 'tetë (copë)'), ex('八月', 'はちがつ', 'hachigatsu', 'gusht')]],
    ['九', 'nëntë', r('キュウ', 'kyū'), r('ここの', 'kokono'), 2, [ex('九つ', 'ここのつ', 'kokonotsu', 'nëntë (copë)'), ex('九月', 'くがつ', 'kugatsu', 'shtator')]],
    ['十', 'dhjetë', r('ジュウ', 'jū'), r('とお', 'tō'), 2, [ex('十', 'とお', 'tō', 'dhjetë (copë)'), ex('十月', 'じゅうがつ', 'jūgatsu', 'tetor')]],
  ],
  java: [
    ['日', 'diell; ditë', r('ニチ', 'nichi'), r('ひ', 'hi'), 4, [ex('日曜日', 'にちようび', 'nichiyōbi', 'e diel'), ex('日本', 'にほん', 'nihon', 'Japonia')]],
    ['月', 'hënë; muaj', r('ゲツ', 'getsu'), r('つき', 'tsuki'), 4, [ex('月曜日', 'げつようび', 'getsuyōbi', 'e hënë'), ex('月', 'つき', 'tsuki', 'hëna')]],
    ['火', 'zjarr', r('カ', 'ka'), r('ひ', 'hi'), 4, [ex('火曜日', 'かようび', 'kayōbi', 'e martë'), ex('火', 'ひ', 'hi', 'zjarr')]],
    ['水', 'ujë', r('スイ', 'sui'), r('みず', 'mizu'), 4, [ex('水曜日', 'すいようび', 'suiyōbi', 'e mërkurë'), ex('水', 'みず', 'mizu', 'ujë')]],
    ['木', 'pemë; dru', r('モク', 'moku'), r('き', 'ki'), 4, [ex('木曜日', 'もくようび', 'mokuyōbi', 'e enjte'), ex('木', 'き', 'ki', 'pemë')]],
    ['金', 'ar; para', r('キン', 'kin'), r('かね', 'kane'), 8, [ex('金曜日', 'きんようび', "kin'yōbi", 'e premte'), ex('お金', 'おかね', 'okane', 'para')]],
    ['土', 'tokë; dhé', r('ド', 'do'), r('つち', 'tsuchi'), 3, [ex('土曜日', 'どようび', 'doyōbi', 'e shtunë'), ex('土', 'つち', 'tsuchi', 'dhé')]],
  ],
  trupi: [
    ['人', 'njeri', r('ジン', 'jin'), r('ひと', 'hito'), 2, [ex('日本人', 'にほんじん', 'nihonjin', 'japonez/e'), ex('人', 'ひと', 'hito', 'njeri')]],
    ['口', 'gojë', r('コウ', 'kō'), r('くち', 'kuchi'), 3, [ex('口', 'くち', 'kuchi', 'gojë'), ex('入口', 'いりぐち', 'iriguchi', 'hyrje')]],
    ['目', 'sy', r('モク', 'moku'), r('め', 'me'), 5, [ex('目', 'め', 'me', 'sy'), ex('一つ目', 'ひとつめ', 'hitotsume', 'i pari')]],
    ['手', 'dorë', r('シュ', 'shu'), r('て', 'te'), 4, [ex('手', 'て', 'te', 'dorë'), ex('上手', 'じょうず', 'jōzu', 'i zoti, i aftë')]],
    ['耳', 'vesh', r('ジ', 'ji'), r('みみ', 'mimi'), 6, [ex('耳', 'みみ', 'mimi', 'vesh')]],
    ['足', 'këmbë', r('ソク', 'soku'), r('あし', 'ashi'), 7, [ex('足', 'あし', 'ashi', 'këmbë')]],
  ],
  natyra: [
    ['大', 'i madh', r('ダイ', 'dai'), r('おお', 'ō'), 3, [ex('大きい', 'おおきい', 'ōkii', 'i madh'), ex('大学', 'だいがく', 'daigaku', 'universitet')]],
    ['小', 'i vogël', r('ショウ', 'shō'), r('ちい', 'chii'), 3, [ex('小さい', 'ちいさい', 'chiisai', 'i vogël'), ex('小学校', 'しょうがっこう', 'shōgakkō', 'shkollë fillore')]],
    ['上', 'sipër', r('ジョウ', 'jō'), r('うえ', 'ue'), 3, [ex('上', 'うえ', 'ue', 'sipër'), ex('上手', 'じょうず', 'jōzu', 'i zoti, i aftë')]],
    ['下', 'poshtë', r('カ', 'ka'), r('した', 'shita'), 3, [ex('下', 'した', 'shita', 'poshtë'), ex('地下鉄', 'ちかてつ', 'chikatetsu', 'metro')]],
    ['中', 'brenda; mes', r('チュウ', 'chū'), r('なか', 'naka'), 4, [ex('中', 'なか', 'naka', 'brenda'), ex('中国', 'ちゅうごく', 'chūgoku', 'Kina')]],
    ['山', 'mal', r('サン', 'san'), r('やま', 'yama'), 3, [ex('山', 'やま', 'yama', 'mal'), ex('富士山', 'ふじさん', 'fujisan', 'mali Fuji')]],
    ['川', 'lumë', r('セン', 'sen'), r('かわ', 'kawa'), 3, [ex('川', 'かわ', 'kawa', 'lumë')]],
  ],
  shkolla: [
    ['学', 'mësim; dije', r('ガク', 'gaku'), r('まな', 'mana'), 8, [ex('学生', 'がくせい', 'gakusei', 'student'), ex('学校', 'がっこう', 'gakkō', 'shkollë')]],
    ['生', 'jetë; lindje', r('セイ', 'sei'), r('い', 'i'), 5, [ex('先生', 'せんせい', 'sensei', 'mësues'), ex('学生', 'がくせい', 'gakusei', 'student')]],
    ['先', 'përpara; i mëparshëm', r('セン', 'sen'), r('さき', 'saki'), 6, [ex('先生', 'せんせい', 'sensei', 'mësues'), ex('先月', 'せんげつ', 'sengetsu', 'muajin e kaluar')]],
    ['年', 'vit', r('ネン', 'nen'), r('とし', 'toshi'), 6, [ex('今年', 'ことし', 'kotoshi', 'këtë vit'), ex('一年', 'いちねん', 'ichinen', 'një vit')]],
    ['名', 'emër', r('メイ', 'mei'), r('な', 'na'), 6, [ex('名前', 'なまえ', 'namae', 'emër')]],
    ['本', 'libër; origjinë', r('ホン', 'hon'), r('もと', 'moto'), 5, [ex('本', 'ほん', 'hon', 'libër'), ex('日本', 'にほん', 'nihon', 'Japonia')]],
  ],
};

export const KANJI: Kanji[] = KANJI_GROUPS.flatMap(({ id }) =>
  DATA[id].map(([char, meaning, on, kun, strokes, examples]) => ({ char, meaning, on, kun, strokes, examples, group: id })),
);

export function kanjiInGroup(group: KanjiGroupId): Kanji[] {
  return KANJI.filter((k) => k.group === group);
}

export function kanjiByChar(char: string): Kanji {
  const k = KANJI.find((x) => x.char === char);
  if (!k) throw new Error(`Unknown kanji: ${char}`);
  return k;
}
