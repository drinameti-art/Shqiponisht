import { romajiToAlbanian } from '@/lib/albanian';

import { kanaInRows, type Kana, type Script } from './kana';

export type Word = {
  /** Written form (kana, or kana + kanji where common). */
  jp: string;
  /** Hepburn romaji with macrons for long vowels. */
  romaji: string;
  /** Meaning in Albanian. */
  meaning: string;
  /** Albanian respelling of the pronunciation, derived from romaji. */
  sq: string;
};

type LessonBase = { id: string; title: string; subtitle: string; badge: string };

export type KanaLesson = LessonBase & { kind: 'kana'; script: Script; kana: Kana[] };
export type VocabLesson = LessonBase & { kind: 'vocab'; words: Word[] };
export type Lesson = KanaLesson | VocabLesson;

function words(list: [jp: string, romaji: string, meaning: string][]): Word[] {
  return list.map(([jp, romaji, meaning]) => ({ jp, romaji, meaning, sq: romajiToAlbanian(romaji) }));
}

function kanaLesson(id: string, script: Script, rows: string[], title: string): KanaLesson {
  const kana = kanaInRows(rows);
  const glyphs = kana.map((k) => k[script]);
  return {
    id,
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
    ['こんにちは', 'konnichiwa', 'Mirëdita'],
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
    ['いち', 'ichi', '1 · një'],
    ['に', 'ni', '2 · dy'],
    ['さん', 'san', '3 · tre'],
    ['よん', 'yon', '4 · katër'],
    ['ご', 'go', '5 · pesë'],
    ['ろく', 'roku', '6 · gjashtë'],
    ['なな', 'nana', '7 · shtatë'],
    ['はち', 'hachi', '8 · tetë'],
    ['きゅう', 'kyū', '9 · nëntë'],
    ['じゅう', 'jū', '10 · dhjetë'],
  ]),
};

const FAMILY: VocabLesson = {
  id: 'familja',
  kind: 'vocab',
  title: 'Familja',
  subtitle: 'はは, ちち, ともだち…',
  badge: '家',
  words: words([
    ['かぞく', 'kazoku', 'familja'],
    ['はは', 'haha', 'nëna (ime)'],
    ['ちち', 'chichi', 'babai (im)'],
    ['あに', 'ani', 'vëllai i madh'],
    ['あね', 'ane', 'motra e madhe'],
    ['おとうと', 'otōto', 'vëllai i vogël'],
    ['いもうと', 'imōto', 'motra e vogël'],
    ['ともだち', 'tomodachi', 'shoku / shoqja'],
  ]),
};

const FOOD: VocabLesson = {
  id: 'ushqimi',
  kind: 'vocab',
  title: 'Ushqimi dhe pijet',
  subtitle: 'みず, おちゃ, ごはん…',
  badge: '食',
  words: words([
    ['みず', 'mizu', 'ujë'],
    ['おちゃ', 'ocha', 'çaj jeshil'],
    ['ごはん', 'gohan', 'oriz i zier; vakt'],
    ['パン', 'pan', 'bukë'],
    ['さかな', 'sakana', 'peshk'],
    ['にく', 'niku', 'mish'],
    ['りんご', 'ringo', 'mollë'],
    ['コーヒー', 'kōhī', 'kafe'],
    ['ぎゅうにゅう', 'gyūnyū', 'qumësht'],
  ]),
};

const ANIMALS: VocabLesson = {
  id: 'kafshet',
  kind: 'vocab',
  title: 'Kafshët',
  subtitle: 'いぬ, ねこ, とり…',
  badge: '犬',
  words: words([
    ['いぬ', 'inu', 'qen'],
    ['ねこ', 'neko', 'mace'],
    ['とり', 'tori', 'zog'],
    ['うま', 'uma', 'kalë'],
    ['うし', 'ushi', 'lopë'],
    ['くま', 'kuma', 'ari'],
    ['さる', 'saru', 'majmun'],
  ]),
};

const PLACES: VocabLesson = {
  id: 'vendet',
  kind: 'vocab',
  title: 'Vendet',
  subtitle: 'えき, がっこう, コソボ…',
  badge: '駅',
  words: words([
    ['えき', 'eki', 'stacion treni'],
    ['がっこう', 'gakkō', 'shkollë'],
    ['いえ', 'ie', 'shtëpi'],
    ['みせ', 'mise', 'dyqan'],
    ['びょういん', 'byōin', 'spital'],
    ['くうこう', 'kūkō', 'aeroport'],
    ['ホテル', 'hoteru', 'hotel'],
    ['コソボ', 'kosobo', 'Kosova'],
    ['アルバニア', 'arubania', 'Shqipëria'],
    ['にほん', 'nihon', 'Japonia'],
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

/** The learning path, in unlock order. */
export const LESSONS: Lesson[] = [
  kanaLesson('hira-a', 'hiragana', ['a'], 'Hiragana: zanoret'),
  kanaLesson('hira-ka', 'hiragana', ['ka'], 'Hiragana: K'),
  GREETINGS,
  kanaLesson('hira-sa', 'hiragana', ['sa'], 'Hiragana: S'),
  kanaLesson('hira-ta', 'hiragana', ['ta'], 'Hiragana: T'),
  NUMBERS,
  kanaLesson('hira-na', 'hiragana', ['na'], 'Hiragana: N'),
  kanaLesson('hira-ha', 'hiragana', ['ha'], 'Hiragana: H'),
  FAMILY,
  kanaLesson('hira-ma', 'hiragana', ['ma'], 'Hiragana: M'),
  kanaLesson('hira-yrw', 'hiragana', ['ya', 'ra', 'wa'], 'Hiragana: Y, R, W'),
  FOOD,
  kanaLesson('kata-1', 'katakana', ['a', 'ka'], 'Katakana: A, K'),
  kanaLesson('kata-2', 'katakana', ['sa', 'ta'], 'Katakana: S, T'),
  ANIMALS,
  kanaLesson('kata-3', 'katakana', ['na', 'ha', 'ma'], 'Katakana: N, H, M'),
  kanaLesson('kata-4', 'katakana', ['ya', 'ra', 'wa'], 'Katakana: Y, R, W'),
  PLACES,
  PHRASES,
];

export const VOCAB_LESSONS = LESSONS.filter((l): l is VocabLesson => l.kind === 'vocab');

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
