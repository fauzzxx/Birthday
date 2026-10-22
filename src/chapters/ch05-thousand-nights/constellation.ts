/**
 * Geometry for Chapter 05's sky. Everything is drawn in one 1600 × 900
 * coordinate space (the desktop stage is exactly 16:9), so SVG lines and the
 * HTML star buttons, positioned in percentages, always line up.
 */

export const VIEW_W = 1600;
export const VIEW_H = 900;

export type Pt = readonly [number, number];

/** Where the light leaves the laptop screen. */
export const ORIGIN: Pt = [195, 714];

/** Centre of the laptop screen (used to centre the small mobile laptop). */
export const SCREEN_CENTER: Pt = [195, 745];

export interface StarSpot {
  at: Pt;
  /** Label placement: below-right of the star, or to its left. */
  label: 'br' | 'l';
  /** A few stars breathe gently. */
  twinkle?: boolean;
}

/**
 * Hand-placed positions for six memories: a rising arc that leaves the laptop
 * at the bottom-left, sweeps right, then climbs towards the top-right corner,
 * leaving the upper-left of the sky free for the memory card.
 */
const SPOTS: StarSpot[] = [
  { at: [400, 690], label: 'br' },
  { at: [650, 652], label: 'br', twinkle: true },
  { at: [890, 548], label: 'br' },
  { at: [1118, 444], label: 'br', twinkle: true },
  { at: [1276, 300], label: 'br' },
  { at: [1446, 128], label: 'l' },
];

/** Positions for `count` stars — the tuned layout for six, a computed arc otherwise. */
export function starSpots(count: number): StarSpot[] {
  if (count === SPOTS.length) return SPOTS;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = 400 + 1046 * t;
    const y = 690 - 562 * Math.pow(t, 1.7);
    return { at: [Math.round(x), Math.round(y)] as Pt, label: t > 0.9 ? 'l' : 'br', twinkle: i % 3 === 1 };
  });
}

export const pct = (p: Pt) => ({ x: `${(p[0] / VIEW_W) * 100}%`, y: `${(p[1] / VIEW_H) * 100}%` });

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function cubicLength(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps = 48): number {
  let length = 0;
  let prev = p0;
  for (let i = 1; i <= steps; i++) {
    const p = cubicPoint(p0, p1, p2, p3, i / steps);
    length += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return length;
}

/**
 * The golden line: a soft wisp of light curling up out of the screen to the
 * first star, then straight constellation segments from star to star.
 * `fractions[i]` is how far along the whole line star i sits (0–1), so the
 * scroll-drawn line can light each star exactly as it arrives.
 */
export function constellationPath(stars: Pt[]): { d: string; fractions: number[] } {
  if (stars.length === 0) return { d: '', fractions: [] };
  const [first, ...rest] = stars;
  const c1: Pt = [ORIGIN[0] + 6, ORIGIN[1] - 86];
  const c2: Pt = [first[0] - 130, first[1] - 76];
  const lengths = [cubicLength(ORIGIN, c1, c2, first)];
  let d = `M${ORIGIN[0]} ${ORIGIN[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${first[0]} ${first[1]}`;
  let prev = first;
  for (const p of rest) {
    d += ` L${p[0]} ${p[1]}`;
    lengths.push(Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const total = lengths.reduce((a, b) => a + b, 0);
  let acc = 0;
  const fractions = lengths.map((l) => {
    acc += l;
    return acc / total;
  });
  return { d, fractions };
}

/** Deterministic pseudo-random numbers, so the sky is the same on every visit. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface Dot {
  x: number;
  y: number;
  r: number;
  o: number;
}

/** A tile of faint stars for an SVG <pattern>. */
export function starTile(seed: number, size: number, count: number, maxR: number): Dot[] {
  const r = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(r() * size * 10) / 10,
    y: Math.round(r() * size * 10) / 10,
    r: Math.round((0.35 + r() * (maxR - 0.35)) * 100) / 100,
    o: Math.round((0.18 + r() * 0.5) * 100) / 100,
  }));
}
