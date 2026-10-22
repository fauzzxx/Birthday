import { useMemo, useRef, type CSSProperties } from 'react';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/scene';

/**
 * Delicate, original botanical line drawings — generated from a few parameters
 * so every sprig is slightly different but they all belong to one family.
 * Color comes from `currentColor`. With `draw`, the lines draw themselves in
 * when scrolled into view (static for reduced motion).
 */
export type BotanicalVariant = 'sprig' | 'branch' | 'jasmine' | 'corner' | 'vine';

interface BotanicalProps {
  variant?: BotanicalVariant;
  /** Different seeds give different (but stable) leaf arrangements. */
  seed?: number;
  draw?: boolean;
  /** Mirror horizontally. */
  flip?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

type Pt = [number, number];

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function cubicTangent(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): number {
  const u = 1 - t;
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return Math.atan2(dy, dx);
}

/** A single almond leaf from `base`, pointing at `angle`, with a centre vein. */
function leaf(base: Pt, angle: number, length: number, width: number): string[] {
  const tip: Pt = [base[0] + Math.cos(angle) * length, base[1] + Math.sin(angle) * length];
  const mid: Pt = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
  const nx = -Math.sin(angle) * width;
  const ny = Math.cos(angle) * width;
  const outline = `M${f(base[0])} ${f(base[1])} Q${f(mid[0] + nx)} ${f(mid[1] + ny)} ${f(tip[0])} ${f(tip[1])} Q${f(mid[0] - nx)} ${f(mid[1] - ny)} ${f(base[0])} ${f(base[1])}`;
  const vein = `M${f(base[0])} ${f(base[1])} L${f(mid[0] + (tip[0] - mid[0]) * 0.55)} ${f(mid[1] + (tip[1] - mid[1]) * 0.55)}`;
  return [outline, vein];
}

/** Five-petal blossom (jasmine-like) centred at c. */
function blossom(c: Pt, r: number, rotation: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < 5; i++) {
    const a = rotation + (i * Math.PI * 2) / 5;
    paths.push(leaf(c, a, r, r * 0.42)[0]);
  }
  paths.push(`M${f(c[0] - 0.8)} ${f(c[1])} a0.8 0.8 0 1 0 1.6 0 a0.8 0.8 0 1 0 -1.6 0`);
  return paths;
}

function buildSprig(seed: number, curve: number, leaves: number, flowers: boolean) {
  const r = rng(seed);
  const p0: Pt = [50, 196];
  const p1: Pt = [50 + curve * 22, 150];
  const p2: Pt = [50 - curve * 26, 80];
  const p3: Pt = [50 + curve * 10, 10];
  const stem = `M${f(p0[0])} ${f(p0[1])} C${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`;
  const paths: string[] = [stem];
  for (let i = 0; i < leaves; i++) {
    const t = 0.16 + (i / leaves) * 0.78 + (r() - 0.5) * 0.04;
    const at = cubic(p0, p1, p2, p3, t);
    const tangent = cubicTangent(p0, p1, p2, p3, t);
    const side = i % 2 === 0 ? 1 : -1;
    const spread = (0.62 + r() * 0.25) * side;
    const len = (30 - t * 16) * (0.85 + r() * 0.3);
    paths.push(...leaf(at, tangent + spread, len, len * 0.32));
  }
  if (flowers) {
    paths.push(...blossom(p3, 9, r() * Math.PI));
  } else {
    paths.push(...leaf(p3, cubicTangent(p0, p1, p2, p3, 1), 14, 4.5));
  }
  return paths;
}

function buildBranch(seed: number) {
  const r = rng(seed);
  // A long, gently arching horizontal branch with small buds and leaves.
  const p0: Pt = [6, 150];
  const p1: Pt = [60, 120];
  const p2: Pt = [130, 40];
  const p3: Pt = [194, 46];
  const paths: string[] = [
    `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`,
  ];
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1;
    const at = cubic(p0, p1, p2, p3, t);
    const tangent = cubicTangent(p0, p1, p2, p3, t);
    const side = i % 2 === 0 ? -1 : 1;
    const len = 20 + r() * 10 - t * 6;
    paths.push(...leaf(at, tangent + side * (0.7 + r() * 0.3), len, len * 0.3));
    if (i % 3 === 1) {
      const bud: Pt = [at[0] + Math.cos(tangent - side) * 10, at[1] + Math.sin(tangent - side) * 10];
      paths.push(`M${f(at[0])} ${f(at[1])} L${f(bud[0])} ${f(bud[1])}`);
      paths.push(...blossom(bud, 5.5, r() * 6));
    }
  }
  return paths;
}

function buildJasmine(seed: number) {
  const r = rng(seed);
  const paths: string[] = [`M100 190 C 98 150, 104 110, 100 70`];
  const heads: Pt[] = [
    [100, 62],
    [78, 82],
    [122, 88],
    [86, 50],
    [116, 54],
  ];
  heads.forEach((h, i) => {
    paths.push(`M100 ${110 - i * 6} Q ${f((100 + h[0]) / 2 + (r() - 0.5) * 8)} ${f(h[1] + 22)} ${f(h[0])} ${f(h[1] + 8)}`);
    paths.push(...blossom(h, 10 + r() * 3, r() * Math.PI));
  });
  for (let i = 0; i < 4; i++) {
    const y = 175 - i * 22;
    paths.push(...leaf([100, y], -Math.PI / 2 + (i % 2 ? 0.9 : -0.9), 26 - i * 2, 8));
  }
  return paths;
}

function buildCorner(seed: number) {
  const r = rng(seed);
  const paths: string[] = [`M4 196 C 20 120, 70 60, 196 6`, `M4 196 C 40 170, 90 160, 150 170`];
  const a: [Pt, Pt, Pt, Pt] = [
    [4, 196],
    [20, 120],
    [70, 60],
    [196, 6],
  ];
  for (let i = 0; i < 8; i++) {
    const t = 0.12 + i * 0.105;
    const at = cubic(...a, t);
    const tangent = cubicTangent(...a, t);
    const side = i % 2 ? 1 : -1;
    const len = 22 - t * 8 + r() * 6;
    paths.push(...leaf(at, tangent + side * 0.75, len, len * 0.3));
  }
  paths.push(...blossom([150, 170], 7, 0.4));
  return paths;
}

function buildVine(seed: number) {
  const r = rng(seed);
  const paths: string[] = [`M100 4 C 60 50, 140 100, 100 150 S 80 190, 100 196`];
  const a: [Pt, Pt, Pt, Pt] = [
    [100, 4],
    [60, 50],
    [140, 100],
    [100, 150],
  ];
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.13;
    const at = cubic(...a, t);
    const tangent = cubicTangent(...a, t);
    const side = i % 2 ? 1 : -1;
    paths.push(...leaf(at, tangent + side * (0.8 + r() * 0.2), 18 + r() * 6, 5.5));
  }
  return paths;
}

const VIEWBOX: Record<BotanicalVariant, string> = {
  sprig: '0 0 100 200',
  branch: '0 0 200 200',
  jasmine: '40 30 120 170',
  corner: '0 0 200 200',
  vine: '50 0 100 200',
};

export function Botanical({
  variant = 'sprig',
  seed = 3,
  draw = false,
  flip = false,
  strokeWidth = 1.1,
  className = '',
  style,
  title,
}: BotanicalProps) {
  const ref = useRef<SVGSVGElement>(null);
  const paths = useMemo(() => {
    switch (variant) {
      case 'branch':
        return buildBranch(seed);
      case 'jasmine':
        return buildJasmine(seed);
      case 'corner':
        return buildCorner(seed);
      case 'vine':
        return buildVine(seed);
      default:
        return buildSprig(seed, seed % 2 ? 0.6 : -0.5, 7, seed % 3 === 0);
    }
  }, [variant, seed]);

  useScene(
    ref,
    ({ reduce }) => {
      if (!draw || reduce || !ref.current) return;
      gsap.from(ref.current.querySelectorAll('path'), {
        drawSVG: 0,
        duration: 2.2,
        ease: 'power2.inOut',
        stagger: { each: 0.035, from: 'start' },
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });
    },
    [draw],
  );

  return (
    <svg
      ref={ref}
      className={`botanical botanical--${variant} ${className}`}
      viewBox={VIEWBOX[variant]}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {title && <title>{title}</title>}
      {paths.map((d, i) => (
        <path key={i} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
