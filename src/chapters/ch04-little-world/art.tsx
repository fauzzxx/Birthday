/**
 * Original illustrations for Chapter 04 — the television's rabbit-ear antenna,
 * a plate with a bowl and a spoon, and the steam rising from it. Decorative
 * (aria-hidden); no food is depicted, only warmth.
 */

interface ArtProps {
  className?: string;
}

/** Two telescopic rods on a small dome, as on an old television set. */
export function Antenna({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 100 56" aria-hidden="true" focusable="false">
      <g stroke="#b8afa1" strokeWidth="1.5" strokeLinecap="round">
        <line x1="49" y1="47" x2="15" y2="4" />
        <line x1="51" y1="47" x2="87" y2="9" />
      </g>
      <g stroke="#e3dbcd" strokeWidth="0.5" strokeLinecap="round" opacity="0.7">
        <line x1="44" y1="40.5" x2="18" y2="7.6" />
        <line x1="56" y1="41.5" x2="84" y2="12" />
      </g>
      <circle cx="15" cy="4" r="2.3" fill="#d2c9bb" />
      <circle cx="87" cy="9" r="2.3" fill="#d2c9bb" />
      <path d="M37 56 Q37 43 50 43 Q63 43 63 56 Z" fill="#3a2a21" />
      <path d="M41 51 Q42.5 46 49 45.4" fill="none" stroke="#6b5243" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** A plate with a bowl on it and a spoon resting beside — "you fed me while I watched". */
export function Meal({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 120 76" aria-hidden="true" focusable="false">
      <ellipse cx="61" cy="67" rx="55" ry="8" fill="rgba(10, 4, 4, 0.35)" />
      <ellipse cx="60" cy="62" rx="55" ry="11" fill="#eadfcc" />
      <ellipse cx="60" cy="61" rx="39" ry="7" fill="#dccfb7" />
      <ellipse cx="60" cy="62" rx="55" ry="11" fill="none" stroke="#fbf6ee" strokeOpacity="0.55" strokeWidth="1" />
      {/* spoon */}
      <path d="M104 59 L118 51.5" stroke="#b9b2a6" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="99" cy="61.6" rx="6.4" ry="3.3" transform="rotate(-26 99 61.6)" fill="#cbc4b8" />
      {/* bowl */}
      <path d="M30 40 C31 58 44 66 60 66 C76 66 89 58 90 40 Z" fill="#f3e9da" />
      <path d="M30 40 C31 58 44 66 60 66 C68 66 75 64 80 60 C66 62 44 58 33 46 Z" fill="#e2d4bd" opacity="0.7" />
      <path d="M33 50 C45 57.5 75 57.5 87 50" fill="none" stroke="#8e4c55" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="60" cy="40" rx="30" ry="6.5" fill="#cdb995" />
      <ellipse cx="60" cy="40" rx="30" ry="6.5" fill="none" stroke="#f8f2e8" strokeWidth="1.3" />
    </svg>
  );
}

/** Three wisps of steam; their drift is a CSS animation in little-world.css. */
export function Steam({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 60 64" aria-hidden="true" focusable="false">
      <path className="ch04-steam__wisp" d="M18 62 C12 52 24 46 18 36 S14 20 20 10" />
      <path className="ch04-steam__wisp" d="M31 60 C25 49 37 41 31 30 S27 14 33 4" />
      <path className="ch04-steam__wisp" d="M44 62 C38 53 50 46 44 37 S40 22 46 13" />
    </svg>
  );
}
