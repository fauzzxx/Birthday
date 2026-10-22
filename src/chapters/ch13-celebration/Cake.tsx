import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { celebration } from '../../content/story';
import { settings } from '../../content/settings';
import { on } from '../../lib/events';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReducedMotion, useReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';

/**
 * The birthday cake — an original SVG illustration: two ivory tiers with gold
 * piping and a whisper of gold drip, dusty-rose sugar flowers, a slender gold
 * stand, and `settings.finale.candles` candles.
 *
 * As it scrolls into view the candles light one by one (a spark, the flame
 * grows, its glow blooms, the warm light around the cake rises). "Make a wish
 * & blow" leans the flames away, puts them out one by one with thin curls of
 * smoke, holds a hush, then shows "Wish made." with a few rising lights.
 *
 * State lives in React (`data-state` drives the CSS end states); each
 * transition is a GSAP timeline built in a layout effect and reverted when the
 * next state arrives, so the CSS always has the last word. Reduced motion:
 * candles start lit and every change is instant. Flames flicker (CSS) only
 * while lit and on screen.
 */

type CakeState = 'out' | 'lighting' | 'lit' | 'blowing' | 'wished';

const CX = 210;
const TIER_TOP = { top: 152, bottom: 252, rx: 92, ry: 11 };
const TIER_BASE = { top: 254, bottom: 360, rx: 140, ry: 15 };
const f1 = (n: number) => Math.round(n * 10) / 10;

interface Tier {
  top: number;
  bottom: number;
  rx: number;
  ry: number;
}

/** Front face of a cylindrical tier (between the front arcs of its top and bottom ellipses). */
function tierBody(t: Tier) {
  const l = CX - t.rx;
  const r = CX + t.rx;
  return `M${l} ${t.top} L${l} ${t.bottom} A${t.rx} ${t.ry} 0 0 0 ${r} ${t.bottom} L${r} ${t.top} A${t.rx} ${t.ry} 0 0 1 ${l} ${t.top} Z`;
}

function rimY(x: number, cy: number, rx: number, ry: number) {
  const u = (x - CX) / rx;
  return cy + ry * Math.sqrt(Math.max(0, 1 - u * u));
}

/** Points along the front half of an ellipse (for piping beads and swags). */
function frontArc(cy: number, rx: number, ry: number, count: number, offset = 0.5) {
  return Array.from({ length: count }, (_, i) => {
    const a = (Math.PI * (i + offset)) / count;
    return { x: f1(CX - rx * Math.cos(a)), y: f1(cy + ry * Math.sin(a)) };
  });
}

/** A thin band of gold glaze along the top tier's rim, with a few soft drips. */
function dripPath() {
  const { top: cy, rx, ry } = TIER_TOP;
  const L = CX - rx;
  const R = CX + rx;
  const drips: [number, number, number][] = [
    [133, 9, 7],
    [151, 17, 8],
    [169, 8, 7],
    [188, 21, 8.5],
    [209, 12, 8],
    [229, 24, 8.5],
    [248, 10, 7.5],
    [266, 17, 8],
    [285, 8, 7],
  ];
  let d = `M${L} ${cy}`;
  for (let x = L + 4; x < R; x += 4) d += ` L${x} ${f1(rimY(x, cy, rx, ry) - 1.5)}`;
  d += ` L${R} ${cy} L${R} ${cy + 3}`;
  for (const [cx, len, w] of [...drips].reverse()) {
    const xr = cx + w / 2;
    const xl = cx - w / 2;
    const yb = rimY(cx, cy, rx, ry) + 4 + len;
    d += ` L${f1(xr)} ${f1(rimY(xr, cy, rx, ry) + 4)}`;
    d += ` L${f1(xr)} ${f1(yb - w / 2)} A${w / 2} ${w / 2} 0 0 1 ${f1(xl)} ${f1(yb - w / 2)}`;
    d += ` L${f1(xl)} ${f1(rimY(xl, cy, rx, ry) + 4)}`;
  }
  return `${d} L${L} ${cy + 3} Z`;
}

/** Scalloped swags of gold across the lower tier. */
function swagPaths(cy: number, dip: number) {
  const pts = frontArc(cy, TIER_BASE.rx - 2, TIER_BASE.ry, 7, 0).concat({ x: CX + TIER_BASE.rx - 2, y: cy });
  const d = pts
    .slice(0, -1)
    .map((p, i) => {
      const q = pts[i + 1];
      return `M${p.x} ${p.y} Q${f1((p.x + q.x) / 2)} ${f1((p.y + q.y) / 2 + dip)} ${q.x} ${q.y}`;
    })
    .join(' ');
  return { d, anchors: pts };
}

interface Candle {
  x: number;
  base: number;
  s: number;
}

/** Candles on the top tier: one gentle arc (two rows if there are many). */
function layoutCandles(requested: number): Candle[] {
  const n = Math.max(1, Math.min(12, Math.round(requested)));
  const front = n > 7 ? Math.ceil(n / 2) : n;
  const back = n - front;
  const out: Candle[] = [];
  const row = (k: number, spread: number, depth: number, s: number) => {
    for (let i = 0; i < k; i++) {
      const u = k === 1 ? 0 : (i / (k - 1)) * 2 - 1;
      const x = CX + u * spread;
      const e = Math.sqrt(Math.max(0, 1 - ((x - CX) / TIER_TOP.rx) ** 2));
      out.push({ x: f1(x), base: f1(TIER_TOP.top + depth * e), s });
    }
  };
  if (back) row(back, Math.min(52, 13 * (back - 1)), -5, 0.9);
  row(front, Math.min(68, 14 * (front - 1)), 6, 1);
  return out;
}

/** Deterministic pseudo-random numbers (stable between renders). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s % 10000) / 10000;
  };
}

interface FlowerProps {
  x: number;
  y: number;
  r: number;
  rot: number;
  ids: { rose: string; gold: string };
}

/** A dusty-rose sugar flower with two small gold leaves. */
function SugarFlower({ x, y, r, rot, ids }: FlowerProps) {
  const leaf = (angle: number) => {
    const len = r * 1.45;
    const a = (angle * Math.PI) / 180;
    const tip = [Math.cos(a) * len, Math.sin(a) * len];
    const nx = -Math.sin(a) * r * 0.36;
    const ny = Math.cos(a) * r * 0.36;
    return `M0 0 Q${f1(tip[0] / 2 + nx)} ${f1(tip[1] / 2 + ny)} ${f1(tip[0])} ${f1(tip[1])} Q${f1(tip[0] / 2 - nx)} ${f1(tip[1] / 2 - ny)} 0 0Z`;
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={leaf(152)} fill={`url(#${ids.gold})`} opacity="0.9" />
      <path d={leaf(28)} fill={`url(#${ids.gold})`} opacity="0.9" />
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={`o${i}`}
          cx={0}
          cy={-r * 0.48}
          rx={r * 0.5}
          ry={r * 0.58}
          transform={`rotate(${i * 72})`}
          fill={`url(#${ids.rose})`}
          stroke="rgba(142, 76, 85, 0.35)"
          strokeWidth="0.6"
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={`i${i}`}
          cx={0}
          cy={-r * 0.26}
          rx={r * 0.34}
          ry={r * 0.38}
          transform={`rotate(${36 + i * 72})`}
          fill="#e6b9b5"
          stroke="rgba(142, 76, 85, 0.3)"
          strokeWidth="0.5"
        />
      ))}
      <circle r={r * 0.22} fill="#b97c82" />
      <circle r={r * 0.09} cx={-r * 0.05} cy={-r * 0.06} fill="#f3dcd8" opacity="0.8" />
    </g>
  );
}

const FLAME_OUTER = 'M0 0 C-5.6 -2.5 -6.8 -12 0 -26 C6.8 -12 5.6 -2.5 0 0Z';
const FLAME_INNER = 'M0 -1.5 C-2.6 -3 -3.2 -9 0 -16 C3.2 -9 2.6 -3 0 -1.5Z';

/* ── Timelines ───────────────────────────────────────────── */

function lightUp(root: HTMLElement, done: () => void) {
  const flames = gsap.utils.toArray<SVGGElement>('.ch13-flame', root);
  const halos = gsap.utils.toArray<SVGGElement>('.ch13-halo', root);
  const sparks = gsap.utils.toArray<SVGCircleElement>('.ch13-spark', root);
  const glow = root.querySelector('.ch13-cake-glow');
  const n = flames.length;
  if (!n) {
    done();
    return;
  }
  gsap.set(flames, { opacity: 1, scale: 0, transformOrigin: '50% 100%' });
  if (halos.length) gsap.set(halos, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ delay: 0.25, onComplete: done });
  flames.forEach((flame, i) => {
    const t = i * 0.36;
    const spark = sparks[i];
    if (spark) {
      tl.fromTo(
        spark,
        { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1.6, duration: 0.16, ease: 'power2.out' },
        t,
      );
      tl.to(spark, { opacity: 0, scale: 0.5, duration: 0.42, ease: 'power1.in' }, t + 0.16);
    }
    tl.to(flame, { scale: 1, duration: 0.8, ease: 'back.out(2.2)' }, t + 0.08);
    if (halos[i]) tl.to(halos[i], { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, t + 0.1);
    if (glow) tl.to(glow, { opacity: 0.22 + 0.78 * ((i + 1) / n), duration: 0.9, ease: 'power2.out' }, t + 0.1);
  });
}

function blowOut(root: HTMLElement, done: () => void) {
  const flames = gsap.utils.toArray<SVGGElement>('.ch13-flame', root);
  const halos = gsap.utils.toArray<SVGGElement>('.ch13-halo', root);
  const smokes = gsap.utils.toArray<SVGPathElement>('.ch13-smoke', root);
  const glow = root.querySelector('.ch13-cake-glow');
  if (!flames.length) {
    done();
    return;
  }
  gsap.set(flames, { transformOrigin: '50% 100%' });
  if (halos.length) gsap.set(halos, { transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ onComplete: done });
  // A breath: every flame leans and stretches away from it.
  tl.to(flames, { rotation: 24, scaleY: 1.32, scaleX: 0.76, x: 1.5, duration: 0.55, ease: 'power2.out', stagger: 0.04 }, 0);
  if (halos.length) tl.to(halos, { opacity: 0.6, scale: 0.85, duration: 0.55, ease: 'power2.out', stagger: 0.04 }, 0);
  // Then they go out, one by one, each leaving a thin curl of smoke.
  flames.forEach((flame, i) => {
    const t = 0.5 + i * 0.17;
    tl.to(flame, { scaleY: 0, scaleX: 0.3, opacity: 0, duration: 0.32, ease: 'power2.in' }, t);
    if (halos[i]) tl.to(halos[i], { opacity: 0, scale: 0.4, duration: 0.45, ease: 'power2.in' }, t);
    const smoke = smokes[i];
    if (smoke) {
      tl.set(smoke, { opacity: 0.75, drawSVG: '0% 0%' }, t + 0.18);
      tl.to(smoke, { drawSVG: '0% 100%', duration: 1.1, ease: 'power1.out' }, t + 0.18);
      tl.to(smoke, { drawSVG: '100% 100%', duration: 1.3, ease: 'power1.inOut' }, t + 0.9);
      tl.to(smoke, { opacity: 0, y: -8, duration: 1.4, ease: 'power1.in' }, t + 0.8);
    }
  });
  if (glow) tl.to(glow, { opacity: 0.32, duration: 1.8, ease: 'power2.inOut' }, 0.45);
  // A hush before the wish is acknowledged.
  tl.to({}, { duration: 0.6 });
}

function riseLights(root: HTMLElement) {
  const motes = gsap.utils.toArray<SVGCircleElement>('.ch13-burst', root);
  const glow = root.querySelector('.ch13-cake-glow');
  const rand = seeded(29);
  motes.forEach((mote, i) => {
    const life = 2.4 + rand() * 1.2;
    const tl = gsap.timeline({ delay: i * 0.07 + rand() * 0.3 });
    tl.fromTo(
      mote,
      { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power1.out' },
      0,
    );
    tl.to(mote, { opacity: 0, duration: life - 0.35, ease: 'power1.in' }, 0.35);
    tl.fromTo(
      mote,
      { x: 0, y: 0 },
      { y: -(110 + rand() * 120), x: (rand() - 0.5) * 70, duration: life, ease: 'power1.out' },
      0,
    );
  });
  if (glow) gsap.to(glow, { opacity: 0.55, duration: 0.9, ease: 'power2.out', yoyo: true, repeat: 1 });
}

/* ── Component ───────────────────────────────────────────── */

export function CakeScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CakeState>(() => (prefersReducedMotion() ? 'lit' : 'out'));
  const stateRef = useRef(state);
  const [onScreen, setOnScreen] = useState(false);
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const candles = useMemo(() => layoutCandles(settings.finale.candles), []);
  const drip = useMemo(dripPath, []);
  const swags = useMemo(() => swagPaths(274, 15), []);
  const swagsLow = useMemo(() => swagPaths(279, 13), []);
  const beadsBase = useMemo(() => frontArc(TIER_BASE.bottom, TIER_BASE.rx, TIER_BASE.ry, 30), []);
  const beadsTop = useMemo(() => frontArc(TIER_TOP.bottom, TIER_TOP.rx, TIER_TOP.ry, 22), []);
  const motes = useMemo(() => {
    const rand = seeded(11);
    return Array.from({ length: 16 }, (_, i) => {
      const c = candles[i % candles.length];
      return { x: f1(c.x + (rand() - 0.5) * 18), y: f1(c.base - 52 * c.s - 24 - rand() * 10), r: f1(1.4 + rand() * 1.8) };
    });
  }, [candles]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Flicker only while on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reduced motion switched on while the candles were out: show them lit, as the static scene does.
  useEffect(() => {
    if (reduce && stateRef.current === 'out') setState('lit');
  }, [reduce]);

  // "Begin our story again" — the candles wait to be lit once more.
  useEffect(() => on('story:replay', () => setState(prefersReducedMotion() ? 'lit' : 'out')), []);

  // Light the candles when the cake comes into view.
  useScene(rootRef, ({ reduce: r }) => {
    if (r || !rootRef.current) return;
    const light = () => {
      if (stateRef.current === 'out') setState('lighting');
    };
    ScrollTrigger.create({ trigger: rootRef.current, start: 'top 68%', onEnter: light, onEnterBack: light });
  });

  // Each transition is a timeline; reverting it hands over to the CSS of the next state.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || (state !== 'lighting' && state !== 'blowing' && state !== 'wished')) return;
    if (prefersReducedMotion()) {
      if (state === 'lighting') setState('lit');
      else if (state === 'blowing') setState('wished');
      return;
    }
    const ctx = gsap.context(() => {
      if (state === 'lighting') lightUp(root, () => setState('lit'));
      else if (state === 'blowing') blowOut(root, () => setState('wished'));
      else riseLights(root);
    }, root);
    return () => ctx.revert();
  }, [state]);

  const busy = state === 'lighting' || state === 'blowing';
  const label =
    state === 'out' ? celebration.lightLabel : state === 'wished' ? celebration.relightLabel : celebration.wishLabel;

  const onAction = () => {
    if (busy) return;
    const instant = prefersReducedMotion();
    if (state === 'out' || state === 'wished') setState(instant ? 'lit' : 'lighting');
    else if (state === 'lit') setState(instant ? 'wished' : 'blowing');
  };

  const ids = {
    body: `${uid}-body`,
    top: `${uid}-top`,
    gold: `${uid}-gold`,
    goldRim: `${uid}-goldrim`,
    bead: `${uid}-bead`,
    rose: `${uid}-rose`,
    candle: `${uid}-candle`,
    halo: `${uid}-halo`,
    flame: `${uid}-flame`,
    mote: `${uid}-mote`,
  };

  return (
    <div ref={rootRef} className="ch13-cake" data-state={state} data-onscreen={onScreen}>
      <figure className="ch13-cake-figure">
        <div className="ch13-cake-glow" aria-hidden="true" />
        <svg className="ch13-cake-svg" viewBox="0 0 420 470" role="img" aria-label={celebration.cakeLabel}>
          <defs>
            <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#e3d4bc" />
              <stop offset="0.2" stopColor="#f7efe2" />
              <stop offset="0.45" stopColor="#fffaf1" />
              <stop offset="0.78" stopColor="#f1e6d3" />
              <stop offset="1" stopColor="#d8c6a9" />
            </linearGradient>
            <radialGradient id={ids.top} cx="45%" cy="40%" r="70%">
              <stop offset="0" stopColor="#fffbf4" />
              <stop offset="1" stopColor="#efe4d0" />
            </radialGradient>
            <linearGradient id={ids.gold} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3e6c8" />
              <stop offset="0.38" stopColor="#d8b878" />
              <stop offset="0.72" stopColor="#b08a4e" />
              <stop offset="1" stopColor="#e3cb98" />
            </linearGradient>
            <linearGradient id={ids.goldRim} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#9c7a43" />
              <stop offset="0.3" stopColor="#e8d2a4" />
              <stop offset="0.55" stopColor="#c9a46a" />
              <stop offset="1" stopColor="#8f6d39" />
            </linearGradient>
            <radialGradient id={ids.bead} cx="35%" cy="30%" r="70%">
              <stop offset="0" stopColor="#fbf0d6" />
              <stop offset="0.5" stopColor="#d4b071" />
              <stop offset="1" stopColor="#8f6d39" />
            </radialGradient>
            <radialGradient id={ids.rose} cx="50%" cy="80%" r="80%">
              <stop offset="0" stopColor="#f2d9d5" />
              <stop offset="0.55" stopColor="#dca5a5" />
              <stop offset="1" stopColor="#c48a8e" />
            </radialGradient>
            <linearGradient id={ids.candle} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#efe4d2" />
              <stop offset="0.35" stopColor="#fffaf2" />
              <stop offset="1" stopColor="#dccbb0" />
            </linearGradient>
            <radialGradient id={ids.halo}>
              <stop offset="0" stopColor="rgb(255, 228, 175)" stopOpacity="0.75" />
              <stop offset="0.35" stopColor="rgb(255, 200, 130)" stopOpacity="0.28" />
              <stop offset="1" stopColor="rgb(255, 190, 120)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.flame} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#ff9a48" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#ffc46c" />
              <stop offset="0.85" stopColor="#ffe3a3" />
              <stop offset="1" stopColor="#fff1cf" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id={ids.mote}>
              <stop offset="0" stopColor="#fff6e2" />
              <stop offset="0.45" stopColor="#f1d9a6" stopOpacity="0.8" />
              <stop offset="1" stopColor="#e8c88a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* The stand: a slender gold baluster, foot and plate. */}
          <g className="ch13-stand">
            <ellipse cx={CX} cy="446" rx="58" ry="8" fill={`url(#${ids.goldRim})`} />
            <path d="M152 446 A58 8 0 0 0 268 446 L268 449 A58 8 0 0 1 152 449 Z" fill="#8f6d39" opacity="0.8" />
            <path
              d="M199 380 C199 395 204 402 203 412 C202 424 192 432 184 442 L236 442 C228 432 218 424 217 412 C216 402 221 395 221 380 Z"
              fill={`url(#${ids.goldRim})`}
            />
            <ellipse cx={CX} cy="410" rx="10" ry="4" fill={`url(#${ids.gold})`} />
            <path d="M40 364 A170 16 0 0 0 380 364 L380 371 A170 16 0 0 1 40 371 Z" fill={`url(#${ids.goldRim})`} />
            <ellipse cx={CX} cy="364" rx="170" ry="16" fill={`url(#${ids.gold})`} />
            <ellipse cx={CX} cy="363" rx="160" ry="13" fill="none" stroke="rgba(255, 246, 226, 0.45)" strokeWidth="0.8" />
          </g>

          {/* Lower tier */}
          <path d={tierBody(TIER_BASE)} fill={`url(#${ids.body})`} />
          <ellipse cx={CX} cy={TIER_BASE.top} rx={TIER_BASE.rx} ry={TIER_BASE.ry} fill={`url(#${ids.top})`} />
          <path
            d={`M${CX - TIER_BASE.rx} ${TIER_BASE.top} A${TIER_BASE.rx} ${TIER_BASE.ry} 0 0 0 ${CX + TIER_BASE.rx} ${TIER_BASE.top}`}
            fill="none"
            stroke={`url(#${ids.goldRim})`}
            strokeWidth="1.4"
          />
          <path d={swags.d} fill="none" stroke={`url(#${ids.goldRim})`} strokeWidth="1.6" strokeLinecap="round" />
          <path d={swagsLow.d} fill="none" stroke={`url(#${ids.goldRim})`} strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />
          {swags.anchors.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={`url(#${ids.bead})`} />
          ))}
          {beadsBase.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4.2" fill={`url(#${ids.bead})`} />
          ))}

          {/* Upper tier */}
          <path d={tierBody(TIER_TOP)} fill={`url(#${ids.body})`} />
          <ellipse cx={CX} cy={TIER_TOP.top} rx={TIER_TOP.rx} ry={TIER_TOP.ry} fill={`url(#${ids.top})`} />
          <path d={drip} fill={`url(#${ids.gold})`} opacity="0.92" />
          <path
            d={`M${CX - TIER_TOP.rx} 210 A${TIER_TOP.rx} ${TIER_TOP.ry} 0 0 0 ${CX + TIER_TOP.rx} 210`}
            fill="none"
            stroke={`url(#${ids.goldRim})`}
            strokeWidth="1.2"
            opacity="0.75"
          />
          {beadsTop.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.4" fill={`url(#${ids.bead})`} />
          ))}

          {/* Sugar flowers */}
          <SugarFlower x={126} y={246} r={10} rot={-20} ids={{ rose: ids.rose, gold: ids.gold }} />
          <SugarFlower x={167} y={259} r={8} rot={40} ids={{ rose: ids.rose, gold: ids.gold }} />
          <SugarFlower x={147} y={251} r={14} rot={10} ids={{ rose: ids.rose, gold: ids.gold }} />
          <SugarFlower x={336} y={307} r={10} rot={25} ids={{ rose: ids.rose, gold: ids.gold }} />
          <SugarFlower x={301} y={314} r={9} rot={60} ids={{ rose: ids.rose, gold: ids.gold }} />
          <SugarFlower x={318} y={291} r={15} rot={-15} ids={{ rose: ids.rose, gold: ids.gold }} />

          {/* Candles */}
          {candles.map((c, i) => {
            const top = c.base - 52 * c.s;
            const w = 8 * c.s;
            const fx = c.x + 0.2;
            const fy = top - 5.5 * c.s;
            const flicker: CSSProperties = {
              ['--fd' as string]: `${(1.5 + ((i * 37) % 9) / 10).toFixed(2)}s`,
              ['--fdelay' as string]: `${(-((i * 53) % 17) / 10).toFixed(2)}s`,
            };
            return (
              <g key={i} className="ch13-candle">
                <ellipse cx={c.x} cy={c.base} rx={w * 0.75} ry={1.7} fill="rgba(120, 90, 60, 0.25)" />
                <rect x={c.x - w / 2} y={top} width={w} height={52 * c.s} rx={2 * c.s} fill={`url(#${ids.candle})`} />
                {[0, 1, 2, 3, 4].map((k) => {
                  const y0 = top + 7 * c.s + k * 9.5 * c.s;
                  return (
                    <path
                      key={k}
                      d={`M${f1(c.x - w / 2 + 0.6)} ${f1(y0 + 4 * c.s)} L${f1(c.x + w / 2 - 0.6)} ${f1(y0)}`}
                      stroke={`url(#${ids.goldRim})`}
                      strokeWidth="0.9"
                      opacity="0.85"
                    />
                  );
                })}
                <path
                  d={`M${c.x} ${f1(top)} q0.6 -3 0.2 -${f1(5.6 * c.s)}`}
                  fill="none"
                  stroke="#3b2622"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  className="ch13-smoke"
                  d={`M${f1(fx)} ${f1(fy - 2)} c-5 -8 5 -14 0 -22 s-6 -14 1 -24 s5 -12 -1 -20`}
                  fill="none"
                  stroke="rgba(236, 224, 212, 0.6)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <g transform={`translate(${f1(fx)} ${f1(fy)}) scale(${c.s})`}>
                  <g className="ch13-halo">
                    <circle className="ch13-halo-core" cy={-12} r={26} fill={`url(#${ids.halo})`} style={flicker} />
                  </g>
                  <g className="ch13-flame">
                    <g className="ch13-flame-core" style={flicker}>
                      <path d={FLAME_OUTER} fill={`url(#${ids.flame})`} />
                      <path d={FLAME_INNER} fill="#fff6df" opacity="0.95" />
                    </g>
                  </g>
                  <circle className="ch13-spark" cy={-2} r={2.4} fill="#fff6e2" />
                </g>
              </g>
            );
          })}

          {/* A few lights that rise when the wish is made */}
          <g aria-hidden="true">
            {motes.map((m, i) => (
              <circle key={i} className="ch13-burst" cx={m.x} cy={m.y} r={m.r} fill={`url(#${ids.mote})`} />
            ))}
          </g>
        </svg>
      </figure>

      <div className="ch13-cake-status" aria-live="polite">
        {state === 'lit' && <span className="visually-hidden">{celebration.candlesLitStatus}</span>}
        {state === 'wished' && <p className="ch13-wish">{celebration.wishMade}</p>}
      </div>

      <div className="ch13-cake-actions">
        <button
          type="button"
          className={`btn ${state === 'lit' ? 'btn--solid' : ''} ch13-cake-btn`}
          aria-disabled={busy || undefined}
          onClick={onAction}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
