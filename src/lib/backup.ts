import { INITIAL_PROGRESS, type Progress } from './progress';

const PREFIX = 'SHQ1-';
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function utf8Encode(text: string): number[] {
  const bytes: number[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return bytes;
}

function utf8Decode(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++];
    let c: number;
    if (b < 0x80) c = b;
    else if (b < 0xe0) c = ((b & 31) << 6) | (bytes[i++] & 63);
    else if (b < 0xf0) c = ((b & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
    else c = ((b & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
    out += String.fromCodePoint(c);
  }
  return out;
}

function toBase64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b = 0, c = 0] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    const n = (a << 16) | (b << 8) | c;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[n & 63] : '=';
  }
  return out;
}

function fromBase64(text: string): number[] | null {
  const clean = text.replace(/=+$/, '');
  if (/[^A-Za-z0-9+/]/.test(clean)) return null;
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of clean) {
    buffer = (buffer << 6) | B64.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

/**
 * Turns learning progress into a text code the learner can keep and paste on
 * another phone. The subscription isn't included: the store restores it.
 */
export function encodeBackup(progress: Progress): string {
  const { plus: _plus, demoPlus: _demo, ...data } = progress;
  return PREFIX + toBase64(utf8Encode(JSON.stringify(data)));
}

/**
 * Reads a backup code. Returns null for anything that isn't a valid code, so
 * a mistyped paste can never overwrite progress. Spaces and line breaks
 * (e.g. from messaging apps) are ignored.
 */
export function decodeBackup(code: string, keep: Pick<Progress, 'plus' | 'demoPlus'>): Progress | null {
  const compact = code.replace(/\s+/g, '');
  if (!compact.startsWith(PREFIX)) return null;
  const bytes = fromBase64(compact.slice(PREFIX.length));
  if (!bytes) return null;
  try {
    const data = JSON.parse(utf8Decode(bytes)) as Partial<Progress>;
    if (data?.version !== 1 || typeof data.lessons !== 'object') return null;
    return {
      ...INITIAL_PROGRESS,
      ...data,
      reminder: { ...INITIAL_PROGRESS.reminder, ...data.reminder },
      onboarded: true,
      ...keep,
    };
  } catch {
    return null;
  }
}
