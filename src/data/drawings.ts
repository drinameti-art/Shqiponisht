/**
 * Line drawings that draw themselves line by line (docs/BRAND.md §5), in a
 * 100 × 100 box: ink lines, the key part in Shqiponisht red, an optional fill
 * that appears once its line is drawn (colours, coins). Keys are the written
 * form the app shows (kanji, or kana when a word has none).
 */
export type DrawingPath = { d: string; accent?: boolean; fill?: string };
export type Drawing = { paths: DrawingPath[] };

const ink = (...d: string[]): DrawingPath[] => d.map((x) => ({ d: x }));
const red = (...d: string[]): DrawingPath[] => d.map((x) => ({ d: x, accent: true }));
const draw = (...parts: DrawingPath[][]): Drawing => ({ paths: parts.flat() });

/** 花 hana — a flower on a stem with two leaves. */
export const FLOWER = draw(
  ink(
    'M50 92 C50 78 49 66 50 50',
    'M50 76 C40 70 32 72 28 64 C38 62 46 66 50 74',
    'M50 68 C60 62 68 64 72 56 C62 54 54 58 50 66',
  ),
  red(
    'M50 40 C40 40 34 30 40 22 C46 16 50 26 50 30',
    'M50 30 C50 22 56 14 63 20 C68 26 62 38 50 40',
    'M50 40 C42 46 32 44 32 36 C34 30 44 32 50 40',
    'M50 40 C58 46 68 44 68 36 C66 30 56 32 50 40',
  ),
  ink('M47 37 C47 34 53 34 53 37 C53 40 47 40 47 37 Z'),
);

const CLOUD = 'M24 54 C14 54 12 40 22 37 C22 26 36 22 42 30 C46 18 64 18 68 30 C80 28 88 40 80 48 C80 54 74 56 68 54 Z';

/** 雨 ame — a rain cloud with falling drops. */
export const RAIN_CLOUD = draw(
  ink(CLOUD),
  red('M30 64 L26 74', 'M46 64 L42 74', 'M62 64 L58 74', 'M38 78 L34 88', 'M54 78 L50 88', 'M70 78 L66 88'),
);

const SUN = draw(
  red('M50 34 C59 34 66 41 66 50 C66 59 59 66 50 66 C41 66 34 59 34 50 C34 41 41 34 50 34 Z'),
  ink(
    'M50 14 L50 24',
    'M50 76 L50 86',
    'M14 50 L24 50',
    'M76 50 L86 50',
    'M25 25 L32 32',
    'M68 68 L75 75',
    'M75 25 L68 32',
    'M32 68 L25 75',
  ),
);
const MOON = draw(
  red('M60 16 C40 18 28 34 28 52 C28 72 44 86 64 84 C50 78 42 66 42 50 C42 34 50 22 60 16 Z'),
  ink('M74 30 L76 36 L82 38 L76 40 L74 46 L72 40 L66 38 L72 36 Z'),
);
const FIRE = draw(
  red(
    'M50 88 C30 88 22 72 28 58 C32 48 40 44 40 30 C50 36 56 46 54 56 C60 52 62 44 62 38 C74 50 78 64 72 76 C68 84 60 88 50 88 Z',
  ),
  ink('M50 88 C42 86 40 76 44 70 C46 66 50 64 50 58 C56 64 60 72 56 80 C54 86 52 88 50 88 Z'),
);
const WATER = draw(
  red('M50 14 C42 30 30 44 30 58 C30 72 40 82 50 82 C60 82 70 72 70 58 C70 44 58 30 50 14 Z'),
  ink('M42 60 C42 66 46 72 52 72'),
);
const TREE = draw(
  ink('M50 90 L50 56', 'M50 70 L40 62', 'M50 64 L60 56', 'M38 90 L62 90'),
  red('M50 12 C34 12 22 24 24 38 C14 44 18 60 32 58 C38 64 62 64 68 58 C82 60 86 44 76 38 C78 24 66 12 50 12 Z'),
);
const MOUNTAIN = draw(ink('M8 82 L38 30 L52 54 L62 40 L92 82 Z'), red('M30 44 L38 30 L46 44 L42 40 L38 44 L34 40 Z'));
const RIVER = draw(
  ink('M30 10 C40 30 20 46 32 62 C42 76 30 86 34 92', 'M62 10 C72 30 52 46 64 62 C74 76 62 86 66 92'),
  red('M44 26 C48 34 40 40 44 48', 'M48 58 C52 66 44 72 48 80'),
);
const SNOW = draw(
  red('M50 14 L50 86', 'M19 32 L81 68', 'M81 32 L19 68'),
  ink(
    'M42 20 L50 28 L58 20',
    'M42 80 L50 72 L58 80',
    'M20 44 L30 39 L26 28',
    'M80 56 L70 61 L74 72',
    'M80 44 L70 39 L74 28',
    'M20 56 L30 61 L26 72',
  ),
);
const WIND = draw(
  ink('M12 40 L62 40 C74 40 78 28 70 22 C64 18 56 22 58 30', 'M12 56 L74 56 C86 56 90 68 82 74 C76 78 68 74 70 66'),
  red('M12 72 L44 72 C52 72 54 82 48 86'),
);
const CLOUDY = draw(ink(CLOUD), red('M30 72 L74 72', 'M38 82 L66 82'));
const SKY = draw(
  red('M70 18 C76 18 80 22 80 28 C80 34 76 38 70 38 C64 38 60 34 60 28 C60 22 64 18 70 18 Z'),
  ink('M20 64 C12 64 12 52 20 50 C20 42 32 40 36 46 C40 36 56 38 58 48 C66 46 72 56 64 64 Z'),
  ink('M10 86 L90 86'),
);
const LEAF = draw(
  red('M22 78 C20 46 40 22 80 20 C80 56 58 80 22 78 Z'),
  ink('M22 78 C38 62 52 48 70 30', 'M40 62 L40 50', 'M52 50 L60 50'),
);

const EYE = draw(
  ink('M10 50 C26 26 74 26 90 50 C74 74 26 74 10 50 Z'),
  red('M50 38 C57 38 62 43 62 50 C62 57 57 62 50 62 C43 62 38 57 38 50 C38 43 43 38 50 38 Z'),
  ink('M50 46 C52 46 54 48 54 50 C54 52 52 54 50 54 C48 54 46 52 46 50 C46 48 48 46 50 46 Z'),
);
const MOUTH = draw(
  red('M16 50 C30 38 42 42 50 46 C58 42 70 38 84 50 C70 70 30 70 16 50 Z'),
  ink('M16 50 C34 56 66 56 84 50'),
);
const HAND = draw(
  ink(
    'M36 90 L36 62 C30 56 24 48 22 40 C26 36 32 40 36 48 L36 22 C36 16 44 16 44 22 L44 44',
    'M44 18 C44 12 52 12 52 18 L52 44',
    'M52 22 C52 16 60 16 60 22 L60 46',
    'M60 30 C60 24 68 24 68 30 L68 60 C68 74 62 82 60 90',
  ),
  red('M36 90 L60 90'),
);
const EAR = draw(
  ink(
    'M60 86 C48 86 46 74 42 66 C34 56 30 46 30 36 C30 20 42 12 54 12 C68 12 76 24 74 38 C72 50 64 54 64 62 C64 72 70 86 60 86',
  ),
  red('M42 38 C42 30 48 26 54 28 C60 30 62 38 56 44 C52 48 52 54 56 58'),
);
const FOOT = draw(
  ink('M36 14 L36 60 C30 74 30 86 42 88 L78 88 C86 88 86 78 78 76 L58 72 L56 14'),
  red('M36 14 L56 14'),
);
const HEAD = draw(
  ink(
    'M50 12 C70 12 80 28 78 46 C76 66 64 80 50 80 C36 80 24 66 22 46 C20 28 30 12 50 12 Z',
    'M40 86 L40 80',
    'M60 86 L60 80',
  ),
  red('M38 44 L42 44', 'M58 44 L62 44', 'M42 62 C46 66 54 66 58 62'),
);
const TOOTH = draw(
  ink(
    'M30 18 C40 12 46 22 50 22 C54 22 60 12 70 18 C80 24 76 44 72 54 C68 66 68 86 60 86 C54 86 56 64 50 64 C44 64 46 86 40 86 C32 86 32 66 28 54 C24 44 20 24 30 18 Z',
  ),
  red('M40 30 C44 28 48 30 50 32'),
);
const PERSON = draw(
  red('M50 12 C56 12 60 16 60 22 C60 28 56 32 50 32 C44 32 40 28 40 22 C40 16 44 12 50 12 Z'),
  ink('M50 32 L50 62', 'M30 44 L70 44', 'M50 62 L36 88', 'M50 62 L64 88'),
);
const MAN = draw(
  red('M50 10 C56 10 60 14 60 20 C60 26 56 30 50 30 C44 30 40 26 40 20 C40 14 44 10 50 10 Z'),
  ink('M36 36 L64 36 L64 62 L58 62 L58 88 L42 88 L42 62 L36 62 Z'),
);
const WOMAN = draw(
  red('M50 10 C56 10 60 14 60 20 C60 26 56 30 50 30 C44 30 40 26 40 20 C40 14 44 10 50 10 Z'),
  ink('M42 36 L58 36 L70 72 L30 72 Z', 'M44 72 L44 88', 'M56 72 L56 88'),
);
const CHILD = draw(
  red('M50 26 C56 26 60 30 60 36 C60 42 56 46 50 46 C44 46 40 42 40 36 C40 30 44 26 50 26 Z'),
  ink('M50 46 L50 68', 'M36 56 L64 56', 'M50 68 L40 86', 'M50 68 L60 86'),
);

const DOG = draw(
  ink(
    'M30 40 C30 26 40 20 50 20 C60 20 70 26 70 40 C70 56 62 70 50 70 C38 70 30 56 30 40 Z',
    'M30 32 C20 30 14 44 20 56 C24 52 28 46 30 42',
    'M70 32 C80 30 86 44 80 56 C76 52 72 46 70 42',
  ),
  red('M46 54 C46 50 54 50 54 54 C54 58 50 60 50 60 C50 60 46 58 46 54 Z'),
  ink('M42 40 L42 42', 'M58 40 L58 42', 'M50 60 L50 64 C46 68 42 66 42 64', 'M50 64 C54 68 58 66 58 64'),
);
const CAT = draw(
  ink(
    'M24 36 L26 14 L40 26 C46 24 54 24 60 26 L74 14 L76 36 C80 46 78 62 70 70 C62 78 38 78 30 70 C22 62 20 46 24 36 Z',
  ),
  red('M47 52 L53 52 L50 56 Z'),
  ink(
    'M40 44 L40 46',
    'M60 44 L60 46',
    'M50 56 C48 60 44 60 42 58',
    'M50 56 C52 60 56 60 58 58',
    'M14 50 L34 52',
    'M14 58 L34 56',
    'M86 50 L66 52',
    'M86 58 L66 56',
  ),
);
const BIRD = draw(
  ink(
    'M20 58 C24 40 40 32 56 36 C62 26 74 26 78 36 L88 40 L78 44 C76 62 60 72 42 70 C32 70 24 66 20 58 Z',
    'M44 70 L42 84',
    'M54 70 L56 84',
  ),
  red('M30 54 C42 44 54 46 62 54 C50 62 38 62 30 54 Z'),
  ink('M70 34 L70 36'),
);
const FISH = draw(
  ink('M14 50 C26 30 56 26 74 42 L90 30 L86 50 L90 70 L74 58 C56 74 26 70 14 50 Z', 'M30 50 L30 52'),
  red('M46 38 C52 44 52 56 46 62'),
);
const COW = draw(
  ink(
    'M30 30 C30 22 70 22 70 30 L72 60 C72 74 64 82 50 82 C36 82 28 74 28 60 Z',
    'M30 32 C22 30 14 34 12 40 C20 42 26 40 30 38',
    'M70 32 C78 30 86 34 88 40 C80 42 74 40 70 38',
    'M42 44 L42 46',
    'M58 44 L58 46',
  ),
  red('M34 26 C30 18 32 12 38 10', 'M66 26 C70 18 68 12 62 10', 'M38 62 C38 56 62 56 62 62 C62 72 38 72 38 62 Z'),
);
const HORSE = draw(
  ink('M30 88 L34 56 C24 48 22 34 30 26 L46 16 L50 8 L56 16 C70 22 78 38 74 52 L64 54 L58 46 L50 50 L52 88'),
  red('M46 16 C40 22 36 32 36 42 C36 50 40 56 44 60'),
  ink('M60 28 L60 30'),
);
const BEAR = draw(
  ink(
    'M26 30 C18 30 16 18 26 16 C32 14 36 20 36 24',
    'M74 30 C82 30 84 18 74 16 C68 14 64 20 64 24',
    'M50 20 C70 20 80 34 78 52 C76 70 64 82 50 82 C36 82 24 70 22 52 C20 34 30 20 50 20 Z',
    'M40 44 L40 46',
    'M60 44 L60 46',
  ),
  red('M40 62 C40 54 60 54 60 62 C60 70 40 70 40 62 Z', 'M47 58 L53 58 L50 61 Z'),
);
const MONKEY = draw(
  ink(
    'M50 16 C66 16 76 28 76 44 C76 64 64 80 50 80 C36 80 24 64 24 44 C24 28 34 16 50 16 Z',
    'M24 42 C14 40 12 54 22 56',
    'M76 42 C86 40 88 54 78 56',
  ),
  red('M34 40 C34 30 48 30 50 38 C52 30 66 30 66 40 C70 54 64 70 50 70 C36 70 30 54 34 40 Z'),
  ink('M42 44 L42 46', 'M58 44 L58 46', 'M44 60 C48 64 52 64 56 60'),
);

const CUP = 'M26 40 L74 40 L70 76 C69 82 64 86 58 86 L42 86 C36 86 31 82 30 76 Z';
const TEA = draw(ink(CUP), red('M30 52 L70 52'), ink('M42 30 C38 24 46 20 42 14', 'M56 30 C52 24 60 20 56 14'));
const COFFEE = draw(
  ink('M24 40 L66 40 L62 80 C61 84 58 86 54 86 L36 86 C32 86 29 84 28 80 Z', 'M66 48 C80 46 82 66 64 68'),
  red('M28 50 L62 50'),
  ink('M38 30 C34 24 42 20 38 14', 'M52 30 C48 24 56 20 52 14'),
);
const RICE = draw(
  ink('M14 50 L86 50 C84 72 68 84 50 84 C32 84 16 72 14 50 Z', 'M40 84 L60 84'),
  red('M20 50 C24 34 36 26 50 26 C64 26 76 34 80 50'),
  ink('M62 10 L44 40', 'M72 14 L52 42'),
);
const BREAD = draw(
  ink('M20 46 C14 30 30 20 50 20 C70 20 86 30 80 46 L80 80 L20 80 Z'),
  red('M36 34 L44 44', 'M50 32 L58 42', 'M64 34 L70 42'),
);
const MEAT = draw(
  red(
    'M56 18 C76 16 88 32 82 50 C78 62 64 66 54 60 L40 74 L34 74 C30 80 22 82 20 76 C14 74 18 66 24 66 L26 60 L40 46 C34 36 40 20 56 18 Z',
  ),
  ink('M54 34 C60 30 68 32 70 40'),
);
const APPLE = draw(
  red('M50 30 C40 22 20 24 20 46 C20 68 36 86 50 80 C64 86 80 68 80 46 C80 24 60 22 50 30 Z'),
  ink('M50 30 C50 22 52 16 56 12', 'M54 22 C60 14 70 14 72 18 C66 24 58 24 54 22 Z'),
);
const MILK = draw(
  ink('M32 34 L50 18 L68 34 L68 88 L32 88 Z', 'M32 34 L68 34', 'M44 18 L56 18'),
  red('M32 56 L68 56', 'M32 70 L68 70'),
);
const CAKE = draw(
  ink('M18 58 L82 58 L82 86 L18 86 Z', 'M26 58 L26 44 L74 44 L74 58'),
  red('M18 70 C28 76 38 64 50 70 C62 76 72 64 82 70', 'M50 44 L50 30'),
  ink('M50 30 C46 24 50 20 50 16 C54 22 54 26 50 30'),
);
const BEER = draw(
  ink('M26 30 L62 30 L62 86 L26 86 Z', 'M62 40 C78 40 78 70 62 70'),
  red('M24 30 C20 22 30 16 36 22 C40 14 52 16 52 22 C60 18 68 24 62 30'),
  ink('M36 42 L36 76', 'M48 42 L48 76'),
);

const HOUSE = draw(
  ink('M20 46 L20 86 L80 86 L80 46', 'M12 50 L50 18 L88 50'),
  red('M42 86 L42 62 L58 62 L58 86'),
  ink('M28 56 L36 56 L36 64 L28 64 Z', 'M64 56 L72 56 L72 64 L64 64 Z'),
);
const SCHOOL = draw(
  ink(
    'M14 86 L14 40 L86 40 L86 86 Z',
    'M14 40 L50 22 L86 40',
    'M24 52 L32 52 L32 60 L24 60 Z',
    'M68 52 L76 52 L76 60 L68 60 Z',
  ),
  red('M50 22 L50 8 L62 12 L50 16', 'M44 86 L44 66 L56 66 L56 86'),
);
const SHOP = draw(
  ink('M18 40 L18 86 L82 86 L82 40', 'M28 86 L28 58 L48 58 L48 86', 'M58 58 L74 58 L74 72 L58 72 Z'),
  red(
    'M12 24 L88 24 L88 40 C84 46 76 46 72 40 C68 46 60 46 56 40 C52 46 44 46 40 40 C36 46 28 46 24 40 C20 46 12 46 12 40 Z',
  ),
);
const HOSPITAL = draw(
  ink('M16 86 L16 30 L84 30 L84 86 Z', 'M42 86 L42 70 L58 70 L58 86'),
  red('M44 38 L56 38 L56 46 L64 46 L64 58 L56 58 L56 66 L44 66 L44 58 L36 58 L36 46 L44 46 Z'),
);
const PLANE = draw(
  ink(
    'M14 54 L38 50 L58 20 L66 20 L56 48 L80 46 L88 36 L94 36 L90 52 L94 66 L88 66 L80 56 L56 56 L66 82 L58 82 L38 56 L14 54 Z',
  ),
  red('M8 86 L48 86'),
);
const TRAIN = draw(
  ink(
    'M24 18 L76 18 C82 18 86 22 86 28 L86 70 L14 70 L14 28 C14 22 18 18 24 18 Z',
    'M14 50 L86 50',
    'M32 70 L24 86',
    'M68 70 L76 86',
  ),
  red('M22 26 L48 26 L48 44 L22 44 Z', 'M52 26 L78 26 L78 44 L52 44 Z'),
  ink('M28 60 L30 60', 'M70 60 L72 60'),
);
const CAR = draw(
  ink(
    'M10 66 L10 52 L22 48 L32 32 L66 32 L78 48 L90 52 L90 66 Z',
    'M36 38 L48 38 L48 48 L28 48 Z',
    'M54 38 L64 38 L72 48 L54 48 Z',
  ),
  red('M26 66 C26 58 38 58 38 66 C38 74 26 74 26 66 Z', 'M62 66 C62 58 74 58 74 66 C74 74 62 74 62 66 Z'),
);
const BOOK = draw(
  ink(
    'M50 26 C40 18 24 18 12 22 L12 80 C24 76 40 76 50 84 C60 76 76 76 88 80 L88 22 C76 18 60 18 50 26 Z',
    'M50 26 L50 84',
  ),
  red('M20 34 L42 36', 'M20 46 L42 48', 'M58 36 L80 34', 'M58 48 L80 46'),
);
const NOTEBOOK = draw(
  ink('M24 12 L80 12 L80 88 L24 88 Z', 'M36 30 L70 30', 'M36 44 L70 44', 'M36 58 L70 58', 'M36 72 L60 72'),
  red('M18 22 L30 22', 'M18 38 L30 38', 'M18 54 L30 54', 'M18 70 L30 70'),
);
const STAMP = draw(
  ink(
    'M22 14 L78 14 L78 86 L22 86 Z',
    'M22 24 L18 28 L22 32 M22 44 L18 48 L22 52 M22 64 L18 68 L22 72 M78 24 L82 28 L78 32 M78 44 L82 48 L78 52 M78 64 L82 68 L78 72',
  ),
  red('M50 32 C58 32 62 38 62 46 C62 54 56 60 50 60 C44 60 38 54 38 46 C38 38 42 32 50 32 Z'),
  ink('M34 70 L66 70'),
);
const BAG = draw(
  ink('M22 36 L78 36 L84 88 L16 88 Z'),
  red('M36 36 C36 18 64 18 64 36'),
  ink('M36 46 L36 50', 'M64 46 L64 50'),
);
const COIN = draw(
  [{ d: 'M50 16 C69 16 84 31 84 50 C84 69 69 84 50 84 C31 84 16 69 16 50 C16 31 31 16 50 16 Z', fill: '#E2A72E' }],
  red('M38 30 L50 48 L62 30', 'M50 48 L50 72', 'M40 54 L60 54', 'M40 63 L60 63'),
);
const CARD = draw(ink('M12 28 L88 28 L88 76 L12 76 Z', 'M20 64 L44 64'), red('M12 40 L88 40', 'M12 46 L88 46'));
const PILL = draw(
  red('M30 72 L58 44 C64 38 74 38 78 44 C84 50 82 58 76 64 L48 92 Z'),
  ink('M30 72 C24 78 24 86 30 90 C36 96 44 94 48 92', 'M44 58 L62 76'),
);
const MENU = draw(
  ink('M26 12 L76 12 L76 88 L26 88 Z', 'M36 40 L66 40', 'M36 52 L66 52', 'M36 64 L56 64'),
  red('M40 26 L62 26'),
);
const TOILET = draw(
  red('M30 18 L46 18 L46 56 L30 56 Z'),
  ink('M24 56 L76 56 C76 70 66 76 56 78 L60 90 L36 90 L40 78 C30 76 24 70 24 56 Z'),
);
const RECEIPT = draw(
  ink(
    'M26 10 L74 10 L74 90 L68 84 L62 90 L56 84 L50 90 L44 84 L38 90 L32 84 L26 90 Z',
    'M36 26 L64 26',
    'M36 38 L64 38',
    'M36 50 L56 50',
  ),
  red('M36 68 L64 68'),
);
const MONEY = draw(
  ink(
    'M10 30 L90 30 L90 70 L10 70 Z',
    'M18 30 C18 38 10 38 10 38',
    'M82 30 C82 38 90 38 90 38',
    'M18 70 C18 62 10 62 10 62',
    'M82 70 C82 62 90 62 90 62',
  ),
  red('M50 38 C57 38 62 43 62 50 C62 57 57 62 50 62 C43 62 38 57 38 50 C38 43 43 38 50 38 Z'),
);

const ARROW_R = draw(ink('M14 50 L80 50'), red('M60 30 L82 50 L60 70'));
const ARROW_L = draw(ink('M86 50 L20 50'), red('M40 30 L18 50 L40 70'));
const ARROW_U = draw(ink('M50 86 L50 20'), red('M30 40 L50 18 L70 40'));
const ARROW_D = draw(ink('M50 14 L50 80'), red('M30 60 L50 82 L70 60'));
const STRAIGHT = draw(ink('M30 88 L30 14', 'M70 88 L70 14'), red('M50 84 L50 20', 'M40 30 L50 18 L60 30'));
const EXIT = draw(ink('M14 12 L54 12 L54 88 L14 88 Z'), red('M36 50 L88 50', 'M74 36 L90 50 L74 64'));
const ENTRANCE = draw(ink('M46 12 L86 12 L86 88 L46 88 Z'), red('M8 50 L64 50', 'M50 36 L66 50 L50 64'));
const NEAR = draw(
  ink('M30 40 C36 40 40 44 40 50 C40 56 36 60 30 60 C24 60 20 56 20 50 C20 44 24 40 30 40 Z'),
  red('M52 40 C58 40 62 44 62 50 C62 56 58 60 52 60 C46 60 42 56 42 50 C42 44 46 40 52 40 Z'),
  ink('M86 50 L70 50', 'M76 44 L70 50 L76 56'),
);
const FAR = draw(ink('M10 80 L90 80', 'M14 80 L46 36 L54 36 L86 80'), red('M48 22 L52 22 L52 28 L48 28 Z'));
const BIG = draw(red('M50 12 C71 12 88 29 88 50 C88 71 71 88 50 88 C29 88 12 71 12 50 C12 29 29 12 50 12 Z'));
const SMALL = draw(
  ink('M50 12 C71 12 88 29 88 50 C88 71 71 88 50 88 C29 88 12 71 12 50 C12 29 29 12 50 12 Z'),
  red('M50 42 C55 42 58 45 58 50 C58 55 55 58 50 58 C45 58 42 55 42 50 C42 45 45 42 50 42 Z'),
);
const HOT = draw(
  ink('M44 14 C44 8 56 8 56 14 L56 60 C64 64 66 76 58 82 C52 88 40 86 38 76 C36 68 40 62 44 60 Z'),
  red('M50 30 L50 72'),
  ink('M66 22 L74 22', 'M66 32 L74 32', 'M66 42 L74 42'),
);
const COLD = SNOW;
const OLD = draw(
  ink(
    'M28 12 L72 12',
    'M28 88 L72 88',
    'M32 12 C32 36 46 42 46 50 C46 58 32 64 32 88',
    'M68 12 C68 36 54 42 54 50 C54 58 68 64 68 88',
  ),
  red('M38 30 L62 30 C58 40 52 44 50 46 C48 44 42 40 38 30 Z', 'M50 56 L50 70', 'M38 86 C42 76 58 76 62 86'),
);
const NEW = draw(red('M50 10 L58 38 L88 40 L64 58 L72 88 L50 70 L28 88 L36 58 L12 40 L42 38 Z'));

const swatch = (hex: string): Drawing =>
  draw(
    [{ d: 'M50 12 C64 26 80 40 80 58 C80 76 66 88 50 88 C34 88 20 76 20 58 C20 40 36 26 50 12 Z', fill: hex }],
    ink('M38 62 C38 70 44 76 50 76'),
  );

const PALETTE = draw(
  ink(
    'M50 12 C74 12 90 28 90 48 C90 60 80 64 70 62 C60 60 56 66 60 74 C64 84 56 88 50 88 C28 88 10 70 10 48 C10 28 28 12 50 12 Z',
  ),
  [
    { d: 'M30 34 C33 34 35 36 35 39 C35 42 33 44 30 44 C27 44 25 42 25 39 C25 36 27 34 30 34 Z', fill: '#E42020' },
    { d: 'M48 24 C51 24 53 26 53 29 C53 32 51 34 48 34 C45 34 43 32 43 29 C43 26 45 24 48 24 Z', fill: '#2D6CDF' },
    { d: 'M68 32 C71 32 73 34 73 37 C73 40 71 42 68 42 C65 42 63 40 63 37 C63 34 65 32 68 32 Z', fill: '#E2B12E' },
    { d: 'M28 58 C31 58 33 60 33 63 C33 66 31 68 28 68 C25 68 23 66 23 63 C23 60 25 58 28 58 Z', fill: '#2F8F5B' },
  ],
);

/** Kanji (and words) that come with a drawing of what they mean. */
export const DRAWINGS: Record<string, Drawing> = {
  // nature and weather
  日: SUN,
  晴れ: SUN,
  夏: SUN,
  月: MOON,
  夜: MOON,
  火: FIRE,
  水: WATER,
  木: TREE,
  山: MOUNTAIN,
  川: RIVER,
  雨: RAIN_CLOUD,
  花: FLOWER,
  春: FLOWER,
  空: SKY,
  天気: SKY,
  雪: SNOW,
  冬: SNOW,
  寒い: COLD,
  風: WIND,
  曇り: CLOUDY,
  秋: LEAF,
  // body and people
  目: EYE,
  口: MOUTH,
  手: HAND,
  耳: EAR,
  足: FOOT,
  頭: HEAD,
  歯: TOOTH,
  人: PERSON,
  男: MAN,
  女: WOMAN,
  子: CHILD,
  // animals
  犬: DOG,
  猫: CAT,
  鳥: BIRD,
  魚: FISH,
  牛: COW,
  馬: HORSE,
  熊: BEAR,
  猿: MONKEY,
  // food and drink
  お茶: TEA,
  茶色: swatch('#7B4A2A'),
  コーヒー: COFFEE,
  ご飯: RICE,
  パン: BREAD,
  肉: MEAT,
  りんご: APPLE,
  牛乳: MILK,
  ケーキ: CAKE,
  ビール: BEER,
  // places, transport and things
  家: HOUSE,
  学校: SCHOOL,
  店: SHOP,
  スーパー: SHOP,
  病院: HOSPITAL,
  空港: PLANE,
  駅: TRAIN,
  電車: TRAIN,
  車: CAR,
  本: BOOK,
  ノート: NOTEBOOK,
  雑誌: BOOK,
  切手: STAMP,
  袋: BAG,
  円: COIN,
  お金: MONEY,
  金: COIN,
  現金: MONEY,
  カード: CARD,
  レシート: RECEIPT,
  薬: PILL,
  メニュー: MENU,
  トイレはどこですか: TOILET,
  // directions, sizes, qualities
  右: ARROW_R,
  左: ARROW_L,
  上: ARROW_U,
  下: ARROW_D,
  まっすぐ: STRAIGHT,
  出口: EXIT,
  入口: ENTRANCE,
  近く: NEAR,
  遠い: FAR,
  大: BIG,
  大きい: BIG,
  小: SMALL,
  小さい: SMALL,
  暑い: HOT,
  新しい: NEW,
  新: NEW,
  古い: OLD,
  古: OLD,
  // colours
  色: PALETTE,
  赤: swatch('#E42020'),
  青: swatch('#2D6CDF'),
  白: swatch('#FFFFFF'),
  黒: swatch('#141414'),
  黄色: swatch('#E2B12E'),
  緑: swatch('#2F8F5B'),
  ピンク: swatch('#F29CB4'),
};

/** The drawing for a word or kanji as the app writes it (kanji spelling first, then kana), if any. */
export function drawingFor(...forms: (string | undefined)[]): Drawing | undefined {
  for (const f of forms) if (f && DRAWINGS[f]) return DRAWINGS[f];
  return undefined;
}
