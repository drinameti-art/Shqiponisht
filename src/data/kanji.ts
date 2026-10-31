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

export type KanjiGroupId =
  | 'numrat'
  | 'java'
  | 'trupi'
  | 'natyra'
  | 'shkolla'
  | 'foljet'
  | 'koha'
  | 'bota'
  | 'para'
  | 'njerezit'
  | 'udhetimi'
  | 'stinet';

/** `premium` groups belong to Shqiponisht Plus. */
export const KANJI_GROUPS: { id: KanjiGroupId; title: string; premium?: true }[] = [
  { id: 'numrat', title: 'Numrat' },
  { id: 'java', title: 'Ditët e javës' },
  { id: 'trupi', title: 'Njeriu dhe trupi' },
  { id: 'natyra', title: 'Madhësia, drejtimi, natyra' },
  { id: 'shkolla', title: 'Shkolla dhe jeta' },
  { id: 'foljet', title: 'Foljet', premium: true },
  { id: 'koha', title: 'Koha', premium: true },
  { id: 'bota', title: 'Bota rreth nesh', premium: true },
  { id: 'para', title: 'Paratë dhe cilësitë', premium: true },
  { id: 'njerezit', title: 'Njerëzit dhe gjuhët', premium: true },
  { id: 'udhetimi', title: 'Ngjyrat dhe udhëtimi', premium: true },
  { id: 'stinet', title: 'Stinët, moti dhe trupi', premium: true },
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
    ['生', 'jetë', r('セイ', 'sei'), r('い', 'i'), 5, [ex('先生', 'せんせい', 'sensei', 'mësues'), ex('学生', 'がくせい', 'gakusei', 'student')]],
    ['先', 'i mëparshëm', r('セン', 'sen'), r('さき', 'saki'), 6, [ex('先生', 'せんせい', 'sensei', 'mësues'), ex('先月', 'せんげつ', 'sengetsu', 'muajin e kaluar')]],
    ['年', 'vit', r('ネン', 'nen'), r('とし', 'toshi'), 6, [ex('今年', 'ことし', 'kotoshi', 'këtë vit'), ex('一年', 'いちねん', 'ichinen', 'një vit')]],
    ['名', 'emër', r('メイ', 'mei'), r('な', 'na'), 6, [ex('名前', 'なまえ', 'namae', 'emër')]],
    ['本', 'libër; origjinë', r('ホン', 'hon'), r('もと', 'moto'), 5, [ex('本', 'ほん', 'hon', 'libër'), ex('日本', 'にほん', 'nihon', 'Japonia')]],
  ],
  foljet: [
    ['食', 'ha; ushqim', r('ショク', 'shoku'), r('た', 'ta'), 9, [ex('食べます', 'たべます', 'tabemasu', 'ha'), ex('食堂', 'しょくどう', 'shokudō', 'mensë')]],
    ['飲', 'pi', r('イン', 'in'), r('の', 'no'), 12, [ex('飲みます', 'のみます', 'nomimasu', 'pi'), ex('飲み物', 'のみもの', 'nomimono', 'pije')]],
    ['行', 'shkoj', r('コウ', 'kō'), r('い', 'i'), 6, [ex('行きます', 'いきます', 'ikimasu', 'shkoj'), ex('銀行', 'ぎんこう', 'ginkō', 'bankë')]],
    ['来', 'vij', r('ライ', 'rai'), r('く', 'ku'), 7, [ex('来ます', 'きます', 'kimasu', 'vij'), ex('来年', 'らいねん', 'rainen', 'vitin e ardhshëm')]],
    ['見', 'shoh', r('ケン', 'ken'), r('み', 'mi'), 7, [ex('見ます', 'みます', 'mimasu', 'shoh'), ex('花見', 'はなみ', 'hanami', 'soditja e luleve të qershisë')]],
    ['読', 'lexoj', r('ドク', 'doku'), r('よ', 'yo'), 14, [ex('読みます', 'よみます', 'yomimasu', 'lexoj'), ex('読書', 'どくしょ', 'dokusho', 'leximi')]],
    ['書', 'shkruaj', r('ショ', 'sho'), r('か', 'ka'), 10, [ex('書きます', 'かきます', 'kakimasu', 'shkruaj'), ex('辞書', 'じしょ', 'jisho', 'fjalor')]],
    ['聞', 'dëgjoj; pyes', r('ブン', 'bun'), r('き', 'ki'), 14, [ex('聞きます', 'ききます', 'kikimasu', 'dëgjoj'), ex('新聞', 'しんぶん', 'shinbun', 'gazetë')]],
    ['話', 'flas; bisedë', r('ワ', 'wa'), r('はな', 'hana'), 13, [ex('話します', 'はなします', 'hanashimasu', 'flas'), ex('電話', 'でんわ', 'denwa', 'telefon')]],
    ['買', 'blej', r('バイ', 'bai'), r('か', 'ka'), 12, [ex('買います', 'かいます', 'kaimasu', 'blej')]],
  ],
  koha: [
    ['時', 'kohë; orë', r('ジ', 'ji'), r('とき', 'toki'), 10, [ex('何時', 'なんじ', 'nanji', 'sa është ora?'), ex('時間', 'じかん', 'jikan', 'kohë; orë (kohëzgjatje)')]],
    ['分', 'minutë; ndaj', r('フン', 'fun'), r('わ', 'wa'), 4, [ex('五分', 'ごふん', 'gofun', 'pesë minuta'), ex('分かります', 'わかります', 'wakarimasu', 'kuptoj')]],
    ['半', 'gjysmë', r('ハン', 'han'), r('なか', 'naka'), 5, [ex('三時半', 'さんじはん', 'sanjihan', 'tre e gjysmë'), ex('半分', 'はんぶん', 'hanbun', 'gjysma')]],
    ['今', 'tani', r('コン', 'kon'), r('いま', 'ima'), 4, [ex('今', 'いま', 'ima', 'tani'), ex('今日', 'きょう', 'kyō', 'sot')]],
    ['何', 'çfarë', r('カ', 'ka'), r('なに', 'nani'), 7, [ex('何', 'なに', 'nani', 'çfarë'), ex('何時', 'なんじ', 'nanji', 'sa është ora?')]],
    ['毎', 'çdo', r('マイ', 'mai'), r('ごと', 'goto'), 6, [ex('毎日', 'まいにち', 'mainichi', 'çdo ditë'), ex('毎朝', 'まいあさ', 'maiasa', 'çdo mëngjes')]],
    ['午', 'mesditë', r('ゴ', 'go'), r('うま', 'uma'), 4, [ex('午前', 'ごぜん', 'gozen', 'paradite'), ex('午後', 'ごご', 'gogo', 'pasdite')]],
    ['後', 'pas; më vonë', r('ゴ', 'go'), r('あと', 'ato'), 9, [ex('午後', 'ごご', 'gogo', 'pasdite'), ex('後で', 'あとで', 'atode', 'më vonë')]],
    ['前', 'para; përpara', r('ゼン', 'zen'), r('まえ', 'mae'), 9, [ex('名前', 'なまえ', 'namae', 'emër'), ex('午前', 'ごぜん', 'gozen', 'paradite')]],
    ['間', 'ndërmjet; hapësirë', r('カン', 'kan'), r('あいだ', 'aida'), 12, [ex('時間', 'じかん', 'jikan', 'kohë; orë (kohëzgjatje)'), ex('間', 'あいだ', 'aida', 'ndërmjet')]],
  ],
  bota: [
    ['雨', 'shi', r('ウ', 'u'), r('あめ', 'ame'), 8, [ex('雨', 'あめ', 'ame', 'shi'), ex('大雨', 'おおあめ', 'ōame', 'rrebesh')]],
    ['空', 'qiell', r('クウ', 'kū'), r('そら', 'sora'), 8, [ex('空', 'そら', 'sora', 'qiell'), ex('空港', 'くうこう', 'kūkō', 'aeroport')]],
    ['花', 'lule', r('カ', 'ka'), r('はな', 'hana'), 7, [ex('花', 'はな', 'hana', 'lule'), ex('花火', 'はなび', 'hanabi', 'fishekzjarre')]],
    ['東', 'lindje', r('トウ', 'tō'), r('ひがし', 'higashi'), 8, [ex('東', 'ひがし', 'higashi', 'lindje'), ex('東京', 'とうきょう', 'tōkyō', 'Tokio')]],
    ['西', 'perëndim', r('セイ', 'sei'), r('にし', 'nishi'), 6, [ex('西', 'にし', 'nishi', 'perëndim'), ex('関西', 'かんさい', 'kansai', 'rajoni Kansai')]],
    ['南', 'jug', r('ナン', 'nan'), r('みなみ', 'minami'), 9, [ex('南', 'みなみ', 'minami', 'jug'), ex('南口', 'みなみぐち', 'minamiguchi', 'dalja jugore')]],
    ['北', 'veri', r('ホク', 'hoku'), r('きた', 'kita'), 5, [ex('北', 'きた', 'kita', 'veri'), ex('北口', 'きたぐち', 'kitaguchi', 'dalja veriore')]],
  ],
  para: [
    ['円', 'jen; rreth', r('エン', 'en'), r('まる', 'maru'), 4, [ex('百円', 'ひゃくえん', 'hyakuen', '100 jen'), ex('円', 'えん', 'en', 'jen')]],
    ['百', 'njëqind', r('ヒャク', 'hyaku'), r('もも', 'momo'), 6, [ex('百', 'ひゃく', 'hyaku', 'njëqind'), ex('三百', 'さんびゃく', 'sanbyaku', 'treqind')]],
    ['千', 'një mijë', r('セン', 'sen'), r('ち', 'chi'), 3, [ex('千', 'せん', 'sen', 'një mijë'), ex('三千', 'さんぜん', 'sanzen', 'tre mijë')]],
    ['万', 'dhjetë mijë', r('マン', 'man'), r('よろず', 'yorozu'), 3, [ex('一万', 'いちまん', 'ichiman', 'dhjetë mijë'), ex('万円', 'まんえん', "man'en", '10 000 jen')]],
    ['高', 'i lartë; i shtrenjtë', r('コウ', 'kō'), r('たか', 'taka'), 10, [ex('高い', 'たかい', 'takai', 'i shtrenjtë; i lartë'), ex('高校', 'こうこう', 'kōkō', 'shkollë e mesme')]],
    ['安', 'i lirë; i qetë', r('アン', 'an'), r('やす', 'yasu'), 6, [ex('安い', 'やすい', 'yasui', 'i lirë'), ex('安心', 'あんしん', 'anshin', 'qetësi, siguri')]],
    ['新', 'i ri (gjë e re)', r('シン', 'shin'), r('あたら', 'atara'), 13, [ex('新しい', 'あたらしい', 'atarashii', 'i ri'), ex('新聞', 'しんぶん', 'shinbun', 'gazetë')]],
    ['古', 'i vjetër (gjë e vjetër)', r('コ', 'ko'), r('ふる', 'furu'), 5, [ex('古い', 'ふるい', 'furui', 'i vjetër'), ex('中古', 'ちゅうこ', 'chūko', 'i përdorur')]],
  ],
  njerezit: [
    ['男', 'burrë', r('ダン', 'dan'), r('おとこ', 'otoko'), 7, [ex('男', 'おとこ', 'otoko', 'burrë'), ex('男の子', 'おとこのこ', 'otokonoko', 'djalë')]],
    ['女', 'grua', r('ジョ', 'jo'), r('おんな', 'onna'), 3, [ex('女', 'おんな', 'onna', 'grua'), ex('女の子', 'おんなのこ', 'onnanoko', 'vajzë')]],
    ['子', 'fëmijë', r('シ', 'shi'), r('こ', 'ko'), 3, [ex('子ども', 'こども', 'kodomo', 'fëmijë'), ex('女の子', 'おんなのこ', 'onnanoko', 'vajzë')]],
    ['父', 'baba', r('フ', 'fu'), r('ちち', 'chichi'), 4, [ex('父', 'ちち', 'chichi', 'babai (im)'), ex('お父さん', 'おとうさん', 'otōsan', 'babai (i dikujt)')]],
    ['母', 'nënë', r('ボ', 'bo'), r('はは', 'haha'), 5, [ex('母', 'はは', 'haha', 'nëna (ime)'), ex('お母さん', 'おかあさん', 'okāsan', 'nëna (e dikujt)')]],
    ['友', 'mik', r('ユウ', 'yū'), r('とも', 'tomo'), 4, [ex('友だち', 'ともだち', 'tomodachi', 'shok, shoqe'), ex('友人', 'ゆうじん', 'yūjin', 'mik (zyrtare)')]],
    ['語', 'gjuhë; fjalë', r('ゴ', 'go'), r('かた', 'kata'), 14, [ex('日本語', 'にほんご', 'nihongo', 'japonishtja'), ex('英語', 'えいご', 'eigo', 'anglishtja')]],
    ['国', 'vend; shtet', r('コク', 'koku'), r('くに', 'kuni'), 8, [ex('国', 'くに', 'kuni', 'vend, shtet'), ex('外国', 'がいこく', 'gaikoku', 'vend i huaj')]],
  ],
  udhetimi: [
    ['赤', 'e kuqe', r('セキ', 'seki'), r('あか', 'aka'), 7, [ex('赤い', 'あかい', 'akai', 'i kuq'), ex('赤ちゃん', 'あかちゃん', 'akachan', 'foshnjë')]],
    ['青', 'blu, e kaltër', r('セイ', 'sei'), r('あお', 'ao'), 8, [ex('青い', 'あおい', 'aoi', 'blu, i kaltër'), ex('青空', 'あおぞら', 'aozora', 'qiell i kaltër')]],
    ['白', 'e bardhë', r('ハク', 'haku'), r('しろ', 'shiro'), 5, [ex('白い', 'しろい', 'shiroi', 'i bardhë'), ex('白鳥', 'はくちょう', 'hakuchō', 'mjellmë')]],
    ['黒', 'e zezë', r('コク', 'koku'), r('くろ', 'kuro'), 11, [ex('黒い', 'くろい', 'kuroi', 'i zi'), ex('黒板', 'こくばん', 'kokuban', 'dërrasë e zezë')]],
    ['右', 'djathtas', r('ウ', 'u'), r('みぎ', 'migi'), 5, [ex('右', 'みぎ', 'migi', 'djathtas'), ex('右手', 'みぎて', 'migite', 'dora e djathtë')]],
    ['左', 'majtas', r('サ', 'sa'), r('ひだり', 'hidari'), 5, [ex('左', 'ひだり', 'hidari', 'majtas'), ex('左手', 'ひだりて', 'hidarite', 'dora e majtë')]],
    ['出', 'dal', r('シュツ', 'shutsu'), r('で', 'de'), 5, [ex('出口', 'でぐち', 'deguchi', 'dalje'), ex('出ます', 'でます', 'demasu', 'dal')]],
    ['入', 'hyj', r('ニュウ', 'nyū'), r('い', 'i'), 2, [ex('入口', 'いりぐち', 'iriguchi', 'hyrje'), ex('入ります', 'はいります', 'hairimasu', 'hyj')]],
    ['車', 'makinë', r('シャ', 'sha'), r('くるま', 'kuruma'), 7, [ex('車', 'くるま', 'kuruma', 'makinë'), ex('電車', 'でんしゃ', 'densha', 'tren')]],
    ['道', 'rrugë', r('ドウ', 'dō'), r('みち', 'michi'), 12, [ex('道', 'みち', 'michi', 'rrugë'), ex('北海道', 'ほっかいどう', 'hokkaidō', 'Hokkaido')]],
  ],
  stinet: [
    ['春', 'pranverë', r('シュン', 'shun'), r('はる', 'haru'), 9, [ex('春', 'はる', 'haru', 'pranverë'), ex('春休み', 'はるやすみ', 'haruyasumi', 'pushimet e pranverës')]],
    ['夏', 'verë', r('カ', 'ka'), r('なつ', 'natsu'), 10, [ex('夏', 'なつ', 'natsu', 'verë'), ex('夏休み', 'なつやすみ', 'natsuyasumi', 'pushimet verore')]],
    ['秋', 'vjeshtë', r('シュウ', 'shū'), r('あき', 'aki'), 9, [ex('秋', 'あき', 'aki', 'vjeshtë'), ex('秋田', 'あきた', 'akita', 'Akita (qytet)')]],
    ['冬', 'dimër', r('トウ', 'tō'), r('ふゆ', 'fuyu'), 5, [ex('冬', 'ふゆ', 'fuyu', 'dimër'), ex('冬休み', 'ふゆやすみ', 'fuyuyasumi', 'pushimet dimërore')]],
    ['雪', 'borë', r('セツ', 'setsu'), r('ゆき', 'yuki'), 11, [ex('雪', 'ゆき', 'yuki', 'borë'), ex('大雪', 'おおゆき', 'ōyuki', 'stuhi bore')]],
    ['風', 'erë', r('フウ', 'fū'), r('かぜ', 'kaze'), 9, [ex('風', 'かぜ', 'kaze', 'erë'), ex('台風', 'たいふう', 'taifū', 'tajfun')]],
    ['休', 'pushoj', r('キュウ', 'kyū'), r('やす', 'yasu'), 6, [ex('休み', 'やすみ', 'yasumi', 'pushim'), ex('休みます', 'やすみます', 'yasumimasu', 'pushoj')]],
    ['体', 'trup', r('タイ', 'tai'), r('からだ', 'karada'), 7, [ex('体', 'からだ', 'karada', 'trup'), ex('体育', 'たいいく', 'taiiku', 'edukim fizik')]],
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
