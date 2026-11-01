/**
 * Approximate length of an SVG path made of M/L/H/V/C/Q/Z commands (absolute
 * or relative), used to animate drawings line by line with strokeDashoffset.
 * Curves are measured by sampling, which is accurate to well under 1%.
 */
export function pathLength(d: string): number {
  const tokens = d.match(/[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let len = 0;
  const num = () => Number(tokens[i++]);
  const seg = (nx: number, ny: number) => {
    len += Math.hypot(nx - x, ny - y);
    x = nx;
    y = ny;
  };
  const sample = (f: (t: number) => [number, number]) => {
    let [px, py] = [x, y];
    for (let k = 1; k <= 24; k++) {
      const [qx, qy] = f(k / 24);
      len += Math.hypot(qx - px, qy - py);
      [px, py] = [qx, qy];
    }
    [x, y] = [px, py];
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case 'M': {
        x = num() + ox;
        y = num() + oy;
        sx = x;
        sy = y;
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L':
        seg(num() + ox, num() + oy);
        break;
      case 'H':
        seg(num() + ox, y);
        break;
      case 'V':
        seg(x, num() + oy);
        break;
      case 'C': {
        const [x0, y0] = [x, y];
        const p = [num() + ox, num() + oy, num() + ox, num() + oy, num() + ox, num() + oy];
        sample((t) => {
          const u = 1 - t;
          return [
            u * u * u * x0 + 3 * u * u * t * p[0] + 3 * u * t * t * p[2] + t * t * t * p[4],
            u * u * u * y0 + 3 * u * u * t * p[1] + 3 * u * t * t * p[3] + t * t * t * p[5],
          ];
        });
        break;
      }
      case 'Q': {
        const [x0, y0] = [x, y];
        const p = [num() + ox, num() + oy, num() + ox, num() + oy];
        sample((t) => {
          const u = 1 - t;
          return [u * u * x0 + 2 * u * t * p[0] + t * t * p[2], u * u * y0 + 2 * u * t * p[1] + t * t * p[3]];
        });
        break;
      }
      case 'Z':
        seg(sx, sy);
        break;
      default:
        i++;
    }
  }
  return len;
}
