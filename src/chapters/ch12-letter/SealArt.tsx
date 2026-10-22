import { useMemo, type CSSProperties } from 'react';

/**
 * The wax seal on Ma's envelope: a pool of burgundy wax with a pressed ring,
 * a beaded rim and an original botanical emblem (a stem, three pairs of
 * leaves and a five-petal blossom) in gold. No initials, no text.
 * Rendered twice by the envelope, each copy clipped to one half, so the seal
 * can crack and fall apart when the letter is opened.
 */

type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;

/** A smooth, slightly irregular closed outline (Catmull-Rom → cubic Bézier). */
function waxOutline(cx: number, cy: number, r: number, count: number): string {
  const pts: Pt[] = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const rr = r + 2.1 * Math.sin(3 * a + 1.1) + 1.4 * Math.sin(7 * a + 2.3) + 0.9 * Math.sin(11 * a + 0.4);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < count; i++) {
    const p0 = pts[(i - 1 + count) % count];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % count];
    const p3 = pts[(i + 2) % count];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

/** An almond leaf / petal from `base`, pointing at `angle` (radians). */
function almond(base: Pt, angle: number, length: number, width: number): string {
  const tip: Pt = [base[0] + Math.cos(angle) * length, base[1] + Math.sin(angle) * length];
  const mid: Pt = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
  const nx = -Math.sin(angle) * width;
  const ny = Math.cos(angle) * width;
  return `M${f(base[0])} ${f(base[1])} Q${f(mid[0] + nx)} ${f(mid[1] + ny)} ${f(tip[0])} ${f(tip[1])} Q${f(mid[0] - nx)} ${f(mid[1] - ny)} ${f(base[0])} ${f(base[1])} Z`;
}

function emblem(): { stem: string; shapes: string[] } {
  const stem = 'M50 75 C 48.6 64, 51.4 52, 50 37';
  const shapes: string[] = [];
  const pairs: [number, number][] = [
    [66, 11],
    [56.5, 9.6],
    [47.5, 8],
  ];
  for (const [y, len] of pairs) {
    shapes.push(almond([50, y], -Math.PI / 2 - 0.95, len, len * 0.34));
    shapes.push(almond([50, y], -Math.PI / 2 + 0.95, len, len * 0.34));
  }
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    shapes.push(almond([50, 30.5], a, 7.4, 3));
  }
  return { stem, shapes };
}

interface SealArtProps {
  /** Unique prefix for gradient ids (each copy defines its own). */
  idPrefix: string;
  className?: string;
  style?: CSSProperties;
}

export function SealArt({ idPrefix, className, style }: SealArtProps) {
  const wax = useMemo(() => waxOutline(50, 50, 45.5, 22), []);
  const art = useMemo(emblem, []);
  const beads = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        return [f(50 + Math.cos(a) * 28.6), f(50 + Math.sin(a) * 28.6)] as const;
      }),
    [],
  );
  const wx = `${idPrefix}-wax`;
  const gd = `${idPrefix}-gold`;
  const gl = `${idPrefix}-gloss`;

  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={wx} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="#9b3e59" />
          <stop offset="0.4" stopColor="#70253b" />
          <stop offset="0.82" stopColor="#4b1528" />
          <stop offset="1" stopColor="#35101d" />
        </radialGradient>
        <linearGradient id={gd} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f7e8c3" />
          <stop offset="0.45" stopColor="#d6b273" />
          <stop offset="1" stopColor="#8c6a35" />
        </linearGradient>
        <radialGradient id={gl} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The pool of wax */}
      <path d={wax} fill={`url(#${wx})`} />
      <path d={wax} fill="none" stroke="rgba(22, 4, 10, 0.38)" strokeWidth="1.1" />

      {/* Where the stamp pressed in */}
      <circle cx="50" cy="50" r="33.5" fill="rgba(38, 7, 17, 0.26)" />
      <circle cx="50" cy="50" r="33.5" fill="none" stroke="rgba(22, 4, 10, 0.5)" strokeWidth="1.5" />
      <circle cx="50" cy="50.9" r="33.6" fill="none" stroke="rgba(255, 205, 214, 0.15)" strokeWidth="0.8" />

      {/* Beaded rim */}
      <g fill={`url(#${gd})`} opacity="0.78">
        {beads.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.85" />
        ))}
      </g>

      {/* Botanical emblem: impressed shadow, then gold */}
      <g transform="translate(0.55 0.8)" opacity="0.55">
        <path d={art.stem} fill="none" stroke="#24050e" strokeWidth="1.9" strokeLinecap="round" />
        {art.shapes.map((d, i) => (
          <path key={i} d={d} fill="#24050e" />
        ))}
      </g>
      <g>
        <path d={art.stem} fill="none" stroke={`url(#${gd})`} strokeWidth="1.6" strokeLinecap="round" />
        {art.shapes.map((d, i) => (
          <path key={i} d={d} fill={`url(#${gd})`} stroke="rgba(90, 58, 22, 0.45)" strokeWidth="0.3" />
        ))}
        <circle cx="50" cy="30.5" r="1.7" fill="#7a5a2c" />
      </g>

      {/* A soft gloss on the wax */}
      <ellipse cx="35" cy="28" rx="14" ry="7" fill={`url(#${gl})`} transform="rotate(-32 35 28)" />
    </svg>
  );
}
