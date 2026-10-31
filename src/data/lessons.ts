import { romajiToAlbanian } from '@/lib/albanian';

import { kanaInRows, type Kana, type Script } from './kana';
import { KANJI_GROUPS, kanjiInGroup, type Kanji, type KanjiGroupId } from './kanji';

export type Word = {
  /** Written form (kana, or kana + kanji where common). */
  jp: string;
  /** Hepburn romaji with macrons for long vowels. */
  romaji: string;
  /** Meaning in Albanian. */
  meaning: string;
  /** Albanian respelling of the pronunciation, derived from romaji. */
  sq: string;
  /** Usual kanji spelling, when the word is commonly written with kanji. */
  kanji?: string;
};

type LessonBase = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  /** Part of Shqiponisht Plus (subscription). */
  premium?: boolean;
};

export type KanaLesson = LessonBase & { kind: 'kana'; script: Script; kana: Kana[] };
export type VocabLesson = LessonBase & { kind: 'vocab'; words: Word[] };
export type KanjiLesson = LessonBase & { kind: 'kanji'; kanji: Kanji[] };
export type Lesson = KanaLesson | VocabLesson | KanjiLesson;

function words(list: [jp: string, romaji: string, meaning: string, kanji?: string][]): Word[] {
  return list.map(([jp, romaji, meaning, kanji]) => ({ jp, romaji, meaning, sq: romajiToAlbanian(romaji), kanji }));
}

function kanjiLesson(group: KanjiGroupId): KanjiLesson {
  const kanji = kanjiInGroup(group);
  const { title, premium } = KANJI_GROUPS.find((g) => g.id === group)!;
  return {
    premium,
    id: `kanji-${group}`,
    kind: 'kanji',
    kanji,
    title: `Kanji: ${title}`,
    subtitle: kanji.map((k) => k.char).join(' '),
    badge: kanji[0].char,
  };
}

function kanaLesson(id: string, script: Script, rows: string[], title: string, premium?: boolean): KanaLesson {
  const kana = kanaInRows(rows);
  const glyphs = kana.map((k) => k[script]);
  return {
    id,
    premium,
    kind: 'kana',
    script,
    kana,
    title,
    subtitle: glyphs.slice(0, 6).join(' ') + (glyphs.length > 6 ? ' …' : ''),
    badge: glyphs[0],
  };
}

const GREETINGS: VocabLesson = {
  id: 'pershendetjet',
  kind: 'vocab',
  title: 'Përshëndetjet',
  subtitle: 'こんにちは, ありがとう…',
  badge: '挨',
  words: words([
    ['おはようございます', 'ohayō gozaimasu', 'Mirëmëngjes'],
    ['こんにちは', 'konnichiwa', 'Përshëndetje'],
    ['こんばんは', 'konbanwa', 'Mirëmbrëma'],
    ['おやすみなさい', 'oyasuminasai', 'Natën e mirë'],
    ['さようなら', 'sayōnara', 'Mirupafshim'],
    ['ありがとう', 'arigatō', 'Faleminderit'],
    ['すみません', 'sumimasen', 'Më falni'],
    ['はい', 'hai', 'Po'],
    ['いいえ', 'iie', 'Jo'],
    ['はじめまして', 'hajimemashite', 'Gëzohem që u njohëm'],
  ]),
};

const NUMBERS: VocabLesson = {
  id: 'numrat',
  kind: 'vocab',
  title: 'Numrat 1–10',
  subtitle: 'いち, に, さん…',
  badge: '一',
  words: words([
    ['いち', 'ichi', '1 · një', '一'],
    ['に', 'ni', '2 · dy', '二'],
    ['さん', 'san', '3 · tre', '三'],
    ['よん', 'yon', '4 · katër', '四'],
    ['ご', 'go', '5 · pesë', '五'],
    ['ろく', 'roku', '6 · gjashtë', '六'],
    ['なな', 'nana', '7 · shtatë', '七'],
    ['はち', 'hachi', '8 · tetë', '八'],
    ['きゅう', 'kyū', '9 · nëntë', '九'],
    ['じゅう', 'jū', '10 · dhjetë', '十'],
  ]),
};

const FAMILY: VocabLesson = {
  id: 'familja',
  kind: 'vocab',
  title: 'Familja',
  subtitle: 'はは, ちち, ともだち…',
  badge: '家',
  words: words([
    ['かぞく', 'kazoku', 'familja', '家族'],
    ['はは', 'haha', 'nëna (ime)', '母'],
    ['ちち', 'chichi', 'babai (im)', '父'],
    ['あに', 'ani', 'vëllai i madh', '兄'],
    ['あね', 'ane', 'motra e madhe', '姉'],
    ['おとうと', 'otōto', 'vëllai i vogël', '弟'],
    ['いもうと', 'imōto', 'motra e vogël', '妹'],
    ['ともだち', 'tomodachi', 'shoku / shoqja', '友達'],
  ]),
};

const FOOD: VocabLesson = {
  id: 'ushqimi',
  kind: 'vocab',
  title: 'Ushqimi dhe pijet',
  subtitle: 'みず, おちゃ, ごはん…',
  badge: '食',
  words: words([
    ['みず', 'mizu', 'ujë', '水'],
    ['おちゃ', 'ocha', 'çaj jeshil', 'お茶'],
    ['ごはん', 'gohan', 'oriz i zier; vakt', 'ご飯'],
    ['パン', 'pan', 'bukë'],
    ['さかな', 'sakana', 'peshk', '魚'],
    ['にく', 'niku', 'mish', '肉'],
    ['りんご', 'ringo', 'mollë'],
    ['コーヒー', 'kōhī', 'kafe'],
    ['ぎゅうにゅう', 'gyūnyū', 'qumësht', '牛乳'],
  ]),
};

const ANIMALS: VocabLesson = {
  id: 'kafshet',
  kind: 'vocab',
  title: 'Kafshët',
  subtitle: 'いぬ, ねこ, とり…',
  badge: '犬',
  words: words([
    ['いぬ', 'inu', 'qen', '犬'],
    ['ねこ', 'neko', 'mace', '猫'],
    ['とり', 'tori', 'zog', '鳥'],
    ['うま', 'uma', 'kalë', '馬'],
    ['うし', 'ushi', 'lopë', '牛'],
    ['くま', 'kuma', 'ari', '熊'],
    ['さる', 'saru', 'majmun', '猿'],
  ]),
};

const PLACES: VocabLesson = {
  id: 'vendet',
  kind: 'vocab',
  title: 'Vendet',
  subtitle: 'えき, がっこう, コソボ…',
  badge: '駅',
  words: words([
    ['えき', 'eki', 'stacion treni', '駅'],
    ['がっこう', 'gakkō', 'shkollë', '学校'],
    ['いえ', 'ie', 'shtëpi', '家'],
    ['みせ', 'mise', 'dyqan', '店'],
    ['びょういん', 'byōin', 'spital', '病院'],
    ['くうこう', 'kūkō', 'aeroport', '空港'],
    ['ホテル', 'hoteru', 'hotel'],
    ['コソボ', 'kosobo', 'Kosova'],
    ['アルバニア', 'arubania', 'Shqipëria'],
    ['にほん', 'nihon', 'Japonia', '日本'],
  ]),
};

const PHRASES: VocabLesson = {
  id: 'shprehjet',
  kind: 'vocab',
  title: 'Shprehje të dobishme',
  subtitle: 'いくらですか…',
  badge: '話',
  words: words([
    ['いくらですか', 'ikura desu ka', 'Sa kushton?'],
    ['わかりません', 'wakarimasen', 'Nuk e kuptoj'],
    ['おねがいします', 'onegai shimasu', 'Ju lutem'],
    ['だいじょうぶ', 'daijōbu', 'Në rregull'],
    ['おいしい', 'oishii', 'I shijshëm'],
    ['トイレはどこですか', 'toire wa doko desu ka', 'Ku është tualeti?'],
    ['わたしはコソボじんです', 'watashi wa kosobo-jin desu', 'Unë jam kosovar/e'],
    ['わたしはアルバニアじんです', 'watashi wa arubania-jin desu', 'Unë jam shqiptar/e'],
  ]),
};

const VERBS: VocabLesson = {
  id: 'foljet',
  kind: 'vocab',
  premium: true,
  title: 'Foljet e para',
  subtitle: 'たべます, のみます…',
  badge: '動',
  words: words([
    ['たべます', 'tabemasu', 'ha', '食べます'],
    ['のみます', 'nomimasu', 'pi', '飲みます'],
    ['いきます', 'ikimasu', 'shkoj', '行きます'],
    ['きます', 'kimasu', 'vij', '来ます'],
    ['みます', 'mimasu', 'shoh', '見ます'],
    ['よみます', 'yomimasu', 'lexoj', '読みます'],
    ['かきます', 'kakimasu', 'shkruaj', '書きます'],
    ['ききます', 'kikimasu', 'dëgjoj', '聞きます'],
    ['はなします', 'hanashimasu', 'flas', '話します'],
    ['かいます', 'kaimasu', 'blej', '買います'],
  ]),
};

const TIME: VocabLesson = {
  id: 'koha',
  kind: 'vocab',
  premium: true,
  title: 'Koha',
  subtitle: 'いま, きょう, あした…',
  badge: '時',
  words: words([
    ['いま', 'ima', 'tani', '今'],
    ['きょう', 'kyō', 'sot', '今日'],
    ['あした', 'ashita', 'nesër', '明日'],
    ['きのう', 'kinō', 'dje', '昨日'],
    ['あさ', 'asa', 'mëngjes', '朝'],
    ['よる', 'yoru', 'natë', '夜'],
    ['まいにち', 'mainichi', 'çdo ditë', '毎日'],
    ['なんじですか', 'nanji desu ka', 'Sa është ora?', '何時ですか'],
    ['ごぜん', 'gozen', 'paradite', '午前'],
    ['ごご', 'gogo', 'pasdite', '午後'],
  ]),
};

const SENTENCES: VocabLesson = {
  id: 'fjalite',
  kind: 'vocab',
  premium: true,
  title: 'Fjalitë e para',
  subtitle: 'これは ほんです…',
  badge: '文',
  words: words([
    ['これは ほんです。', 'kore wa hon desu.', 'Ky është një libër.', 'これは本です。'],
    ['わたしは がくせいです。', 'watashi wa gakusei desu.', 'Unë jam student/e.', '私は学生です。'],
    ['なまえは なんですか。', 'namae wa nan desu ka.', 'Si e ke emrin?', '名前は何ですか。'],
    [
      'わたしの なまえは アルタです。',
      'watashi no namae wa aruta desu.',
      'Emri im është Arta.',
      '私の名前はアルタです。',
    ],
    [
      'にほんごが すこし わかります。',
      'nihongo ga sukoshi wakarimasu.',
      'Kuptoj pak japonisht.',
      '日本語が少し分かります。',
    ],
    ['コーヒーを のみます。', 'kōhī o nomimasu.', 'Pi kafe.', 'コーヒーを飲みます。'],
    ['あした とうきょうへ いきます。', 'ashita tōkyō e ikimasu.', 'Nesër shkoj në Tokio.', '明日東京へ行きます。'],
    ['これは いくらですか。', 'kore wa ikura desu ka.', 'Sa kushton kjo?'],
  ]),
};

/** The learning path, in unlock order. Lessons marked `premium` need Shqiponisht Plus. */
export const LESSONS: Lesson[] = [
  kanaLesson('hira-a', 'hiragana', ['a'], 'Hiragana: zanoret'),
  kanaLesson('hira-ka', 'hiragana', ['ka'], 'Hiragana: K'),
  GREETINGS,
  kanaLesson('hira-sa', 'hiragana', ['sa'], 'Hiragana: S'),
  kanaLesson('hira-ta', 'hiragana', ['ta'], 'Hiragana: T'),
  NUMBERS,
  kanjiLesson('numrat'),
  kanaLesson('hira-na', 'hiragana', ['na'], 'Hiragana: N'),
  kanaLesson('hira-ha', 'hiragana', ['ha'], 'Hiragana: H'),
  FAMILY,
  kanaLesson('hira-ma', 'hiragana', ['ma'], 'Hiragana: M'),
  kanaLesson('hira-yrw', 'hiragana', ['ya', 'ra', 'wa'], 'Hiragana: Y, R, W'),
  FOOD,
  kanjiLesson('java'),
  kanaLesson('kata-1', 'katakana', ['a', 'ka'], 'Katakana: A, K'),
  kanaLesson('kata-2', 'katakana', ['sa', 'ta'], 'Katakana: S, T'),
  ANIMALS,
  kanjiLesson('trupi'),
  kanaLesson('kata-3', 'katakana', ['na', 'ha', 'ma'], 'Katakana: N, H, M'),
  kanaLesson('kata-4', 'katakana', ['ya', 'ra', 'wa'], 'Katakana: Y, R, W'),
  PLACES,
  kanjiLesson('natyra'),
  PHRASES,
  kanjiLesson('shkolla'),
  // Niveli 2 — Shqiponisht Plus
  kanaLesson('hira-voiced', 'hiragana', ['ga', 'za', 'da', 'ba', 'pa'], 'Hiragana: が, ざ, ば, ぱ…', true),
  VERBS,
  kanjiLesson('foljet'),
  kanaLesson('kata-voiced', 'katakana', ['ga', 'za', 'da', 'ba', 'pa'], 'Katakana: ガ, ザ, バ, パ…', true),
  TIME,
  kanjiLesson('koha'),
  SENTENCES,
  kanjiLesson('bota'),
];

export const KANJI_LESSONS = LESSONS.filter((l): l is KanjiLesson => l.kind === 'kanji');

export const VOCAB_LESSONS = LESSONS.filter((l): l is VocabLesson => l.kind === 'vocab');

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
