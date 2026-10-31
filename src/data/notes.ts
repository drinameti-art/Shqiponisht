import { romajiToAlbanian } from '@/lib/albanian';

export type NoteExample = { jp: string; kana: string; romaji: string; sq: string; meaning: string };

/** A short explanation shown before a lesson starts, in Albanian. */
export type Note = { title: string; points: string[]; examples: NoteExample[] };

function ex(jp: string, kana: string, romaji: string, meaning: string): NoteExample {
  return { jp, kana, romaji, sq: romajiToAlbanian(romaji), meaning };
}

/** Grammar and reading notes, keyed by lesson id. */
export const NOTES: Record<string, Note> = {
  'hira-a': {
    title: 'Si funksionon shkrimi japonez',
    points: [
      'Japonishtja përdor tre shkrime: hiragana (për fjalët japoneze), katakana (për fjalët e huaja) dhe kanji (shenja me kuptim).',
      'Çdo shkronjë hiragana është një rrokje: か = „ka“, し = „shi“. Zanoret janë vetëm pesë: a, i, u, e, o.',
      'Zanoret japoneze shqiptohen si në shqip, ndaj e ke më të lehtë se shumëkush tjetër.',
    ],
    examples: [ex('愛', 'あい', 'ai', 'dashuri'), ex('上', 'うえ', 'ue', 'sipër')],
  },
  pershendetjet: {
    title: 'Mirësjellja në japonisht',
    points: [
      'Japonishtja ka forma të thjeshta dhe forma të sjellshme. ありがとう është e thjeshtë; ありがとうございます është më e sjellshme.',
      'は në fund të こんにちは dhe こんばんは lexohet „ua“, jo „ha“, sepse këtu është pjesëz gramatikore.',
      'Japonezët përshëndesin shpesh duke përkulur lehtë kokën.',
    ],
    examples: [
      ex('ありがとうございます', 'ありがとうございます', 'arigatō gozaimasu', 'Faleminderit shumë (sjellshëm)'),
    ],
  },
  numrat: {
    title: 'Si ndërtohen numrat',
    points: [
      'Numrat ndërtohen si një lojë: 十 = 10, 十一 = 10 + 1 = 11, 二十 = 2 × 10 = 20.',
      '4 dhe 7 kanë dy lexime: よん/し dhe なな/しち. Më shpesh përdoren よん dhe なな, sepse し tingëllon si fjala „vdekje“.',
    ],
    examples: [ex('十二', 'じゅうに', 'jūni', '12'), ex('三十五', 'さんじゅうご', 'sanjūgo', '35')],
  },
  'hira-yoon': {
    title: 'Kombinimet me ゃ ゅ ょ',
    points: [
      'Kur një shkronjë që mbaron me „i“ (き, し, ち…) ndiqet nga një ゃ, ゅ ose ょ e vogël, të dyja lexohen si NJË rrokje.',
      'き + や e madhe = „kija“ (dy rrokje), por き + ゃ e vogël = きゃ „kja“ (një rrokje).',
      'Shumë prej tyre i ke gati në shqip: しゃ = „sha“, ちゃ = „ça“, にゃ = „nja“, じゃ = „xha“.',
    ],
    examples: [ex('今日', 'きょう', 'kyō', 'sot'), ex('お茶', 'おちゃ', 'ocha', 'çaj jeshil')],
  },
  'kata-1': {
    title: 'Katakana: për fjalët e huaja',
    points: [
      'Katakana ka të njëjtat tinguj si hiragana, por përdoret për fjalë të huaja, emra vendesh dhe emra njerëzish të huaj.',
      'Edhe emri yt shkruhet në katakana: Arta = アルタ, Kosova = コソボ.',
    ],
    examples: [ex('アルバニア', 'あるばにあ', 'arubania', 'Shqipëria'), ex('コソボ', 'こそぼ', 'kosobo', 'Kosova')],
  },
  'te-gjata': {
    title: 'Tingujt e dyfishtë dhe të gjatë',
    points: [
      'Një っ e vogël do të thotë: ndalo një çast dhe dyfisho bashkëtingëlloren që vjen pas. きって = „kit-te“.',
      'Në katakana, vija ー e zgjat zanoren: ケーキ = „keeki“, コーヒー = „koohii“.',
      'Kujdes, kuptimi ndryshon: おばさん (tezja, halla) dhe おばあさん (gjyshja).',
    ],
    examples: [
      ex('おばさん', 'おばさん', 'obasan', 'tezja, halla'),
      ex('おばあさん', 'おばあさん', 'obāsan', 'gjyshja'),
    ],
  },
  'kanji-numrat': {
    title: 'Çfarë janë kanji?',
    points: [
      'Kanji janë shenja me kuptim që vijnë nga kinezishtja. Çdo kanji ka një kuptim dhe zakonisht dy lexime.',
      'Leximi on (nga kinezishtja) përdoret kur kanji bashkohet me kanji të tjerë: 三月 = さんがつ.',
      'Leximi kun (japonez) përdoret kur kanji qëndron vetëm ose me hiragana: 三つ = みっつ.',
    ],
    examples: [ex('三月', 'さんがつ', 'sangatsu', 'mars'), ex('三つ', 'みっつ', 'mittsu', 'tre (copë)')],
  },
  foljet: {
    title: 'Foljet me ます',
    points: [
      'Foljet në formën e sjellshme mbarojnë me ます: たべます = ha.',
      'E njëjta formë vlen edhe për të ardhmen: あした いきます = „Nesër shkoj“.',
      'Për ta mohuar, ます bëhet ません: たべません = nuk ha.',
      'Folja vjen gjithmonë në fund të fjalisë.',
    ],
    examples: [
      ex('食べません', 'たべません', 'tabemasen', 'nuk ha'),
      ex('行きません', 'いきません', 'ikimasen', 'nuk shkoj'),
    ],
  },
  koha: {
    title: 'Ora dhe koha',
    points: [
      'Ora = numri + じ: 三時 (sanxhi) = ora tre. Gjysma = はん: 三時半 = tre e gjysmë.',
      'Fjalët e kohës (きょう, あした, まいにち) zakonisht vihen në fillim të fjalisë.',
    ],
    examples: [ex('今三時です', 'いまさんじです', 'ima sanji desu', 'Tani është ora tre.')],
  },
  fjalite: {
    title: 'Fjalia japoneze: X は Y です',
    points: [
      'は (lexohet „ua“) shënon temën, atë për të cilën flasim. です në fund e bën fjalinë të sjellshme, si „është“.',
      'か në fund e kthen fjalinë në pyetje. Nuk duhet pikëpyetje.',
      'の lidh dy fjalë si „i/e“ në shqip: わたしの なまえ = emri im.',
      'を (lexohet „o“) shënon objektin: コーヒーを のみます = pi kafe. へ (lexohet „e“) tregon drejtimin.',
      'Rendi: kush → çfarë → folja në fund.',
    ],
    examples: [
      ex('これは本ですか', 'これはほんですか', 'kore wa hon desu ka', 'A është ky libër?'),
      ex('私の本', 'わたしのほん', 'watashi no hon', 'libri im'),
    ],
  },
  blerjet: {
    title: 'Si të kërkosh diçka',
    points: [
      '〜を ください = „më jepni…, ju lutem“. Vendose pas asaj që do: みずを ください.',
      'Çmimi: numri + えん. 百円 = 100 jen.',
    ],
    examples: [ex('袋を下さい', 'ふくろをください', 'fukuro o kudasai', 'Një qese, ju lutem.')],
  },
  mbiemrat: {
    title: 'Mbiemrat me い',
    points: [
      'Shumica e mbiemrave mbarojnë me い: おおきい, あたらしい, たのしい.',
      'Ndryshe nga shqipja, mbiemri vjen PARA emrit: おおきい いえ = shtëpi e madhe.',
    ],
    examples: [
      ex('大きい家', 'おおきいいえ', 'ōkii ie', 'shtëpi e madhe'),
      ex('赤い車', 'あかいくるま', 'akai kuruma', 'makinë e kuqe'),
    ],
  },
  restoranti: {
    title: 'Në tryezë',
    points: [
      'いただきます thuhet para ngrënies dhe ごちそうさまでした pas saj: falënderim për ushqimin dhe për atë që e përgatiti.',
      'Në Japoni nuk lihet bakshish. Mjafton një „ごちそうさまでした“ i sinqertë.',
    ],
    examples: [],
  },
};
