import { useId, useMemo, type CSSProperties } from 'react';
import { SCREEN_CENTER, seeded, starTile } from './constellation';

/* ==========================================================================
   Chapter 05 — the drawn pieces of the night: a field of faint stars, a
   crescent moon, the laptop whose screen she learned by, and the star glyph.
   All original, abstract and decorative (aria-hidden).
   ========================================================================== */

const cleanId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/**
 * The deep indigo sky behind the whole chapter. Two star tiles of different
 * sizes overlap so the pattern never visibly repeats, at any section height.
 * A handful of brighter stars breathe slowly (paused off-screen, still for
 * reduced motion — see thousand-nights.css).
 */
export function NightSky() {
  const uid = cleanId(useId());
  const tileA = useMemo(() => starTile(11, 420, 30, 1.25), []);
  const tileB = useMemo(() => starTile(29, 610, 22, 0.9), []);
  const twinklers = useMemo(() => {
    const r = seeded(53);
    return Array.from({ length: 12 }, (_, i) => ({
      left: `${4 + r() * 92}%`,
      top: `${8 + (i / 12) * 84 + r() * 5}%`,
      size: 2 + r() * 1.6,
      duration: 4.5 + r() * 4,
      delay: -r() * 8,
    }));
  }, []);

  return (
    <div className="ch05-sky" aria-hidden="true">
      <svg className="ch05-starfield" width="100%" height="100%" focusable="false">
        <defs>
          <pattern id={`${uid}-a`} width="420" height="420" patternUnits="userSpaceOnUse">
            {tileA.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#e4e8f8" opacity={d.o} />
            ))}
          </pattern>
          <pattern id={`${uid}-b`} x="137" y="59" width="610" height="610" patternUnits="userSpaceOnUse">
            {tileB.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#f3e6c8" opacity={d.o * 0.8} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-a)`} />
        <rect width="100%" height="100%" fill={`url(#${uid}-b)`} />
      </svg>
      {twinklers.map((t, i) => (
        <span
          key={i}
          className="ch05-twinkle"
          style={
            {
              left: t.left,
              top: t.top,
              '--s': `${t.size.toFixed(2)}px`,
              '--d': `${t.duration.toFixed(2)}s`,
              '--delay': `${t.delay.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** An understated crescent moon. */
export function Moon({ className = '' }: { className?: string }) {
  const uid = cleanId(useId());
  return (
    <svg className={`ch05-moon ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0.28" stopColor="#f3e6c8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#f3e6c8" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-cut`}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="41" cy="25" r="16" fill="#000" />
        </mask>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#${uid}-halo)`} />
      <circle cx="31" cy="33" r="16.5" fill="#efe4c9" opacity="0.92" mask={`url(#${uid}-cut)`} />
    </svg>
  );
}

/**
 * An open laptop, seen from the front, its screen glowing in the dark —
 * a lesson playing (a small play mark and a progress bar). Drawn in the
 * stage's 1600 × 900 space; no people, only the light.
 */
export function LaptopShape() {
  const uid = cleanId(useId());
  return (
    <g className="ch05-laptop">
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#cfe0f2" stopOpacity="0.34" />
          <stop offset="0.38" stopColor="#8fb7d9" stopOpacity="0.12" />
          <stop offset="1" stopColor="#8fb7d9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-screen`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#f2f7fc" />
          <stop offset="0.55" stopColor="#c4d9ee" />
          <stop offset="1" stopColor="#8fb0d2" />
        </radialGradient>
      </defs>
      <ellipse className="ch05-laptop__glow" cx="195" cy="742" rx="310" ry="235" fill={`url(#${uid}-glow)`} />
      <ellipse className="ch05-laptop__glow" cx="195" cy="830" rx="200" ry="20" fill={`url(#${uid}-glow)`} />
      {/* lid */}
      <rect x="116" y="688" width="158" height="116" rx="7" fill="#15182e" stroke="rgba(201,164,106,0.4)" strokeWidth="1.5" />
      {/* screen */}
      <rect className="ch05-laptop__screen" x="124" y="696" width="142" height="100" rx="3" fill={`url(#${uid}-screen)`} />
      <path d="M187 733 L207 745 L187 757 Z" fill="rgba(14,15,29,0.5)" />
      <line x1="138" y1="783" x2="252" y2="783" stroke="rgba(14,15,29,0.22)" strokeWidth="3" strokeLinecap="round" />
      <line x1="138" y1="783" x2="198" y2="783" stroke="rgba(14,15,29,0.5)" strokeWidth="3" strokeLinecap="round" />
      {/* base */}
      <path
        d="M98 806 H292 L318 826 Q319 830 314 830 H76 Q71 830 72 826 Z"
        fill="#12142a"
        stroke="rgba(201,164,106,0.4)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="176" y1="809" x2="214" y2="809" stroke="rgba(201,164,106,0.32)" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

/** The laptop on its own (phones), framed so the screen sits at the centre. */
export function LaptopIcon({ className = '' }: { className?: string }) {
  const w = 260;
  const x = SCREEN_CENTER[0] - w / 2;
  return (
    <svg className={className} viewBox={`${x} 650 ${w} 200`} aria-hidden="true" focusable="false">
      <LaptopShape />
    </svg>
  );
}

/** A four-pointed star of light. */
export function StarGlyph({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.5c.7 6.2 3.4 9 10.5 10.5-7.1 1.5-9.8 4.3-10.5 10.5-.7-6.2-3.4-9-10.5-10.5C8.6 10.5 11.3 7.7 12 1.5z" />
      <circle cx="12" cy="12" r="1.6" fill="#fffaf0" />
    </svg>
  );
}
