/**
 * Original line art for Chapter 03 — a school pencil, a paper clip and a
 * hand-drawn checkbox. All decorative (aria-hidden); colours are set here or
 * through classes in first-teacher.css.
 */

interface ArtProps {
  className?: string;
}

/**
 * A sharpened ochre pencil, drawn lying horizontally with its graphite tip at
 * the left-middle of the box (0, 10) so it can be rotated around the tip.
 */
export function Pencil({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 200 20" aria-hidden="true" focusable="false">
      {/* graphite */}
      <path d="M0.4 10 L9.4 7.3 L9.4 12.7 Z" fill="#3b3a40" />
      {/* sharpened wood */}
      <path d="M9.4 7.3 L31 2 L31 18 L9.4 12.7 Z" fill="#ead3ad" />
      <path d="M9.4 12.7 L31 18 L31 15 Z" fill="#d9bd92" />
      {/* painted body with the scalloped edge a sharpener leaves */}
      <path d="M31 2 Q27.4 4.6 31 7.3 Q27.4 10 31 12.7 Q27.4 15.4 31 18 L168 18 L168 2 Z" fill="#d9a441" />
      <path d="M31 2 Q27.4 4.6 31 7.3 L168 7.3 L168 2 Z" fill="#e8bc5f" />
      <path d="M31 12.7 Q27.4 15.4 31 18 L168 18 L168 12.7 Z" fill="#c48d33" />
      {/* ferrule */}
      <rect x="168" y="1.3" width="14" height="17.4" rx="1" fill="#bdb6aa" />
      <path d="M171.2 1.3v17.4M174.8 1.3v17.4M178.4 1.3v17.4" stroke="#8f887d" strokeWidth="0.8" />
      {/* eraser */}
      <rect x="181.4" y="2" width="17.4" height="16" rx="3.6" fill="#d69a9a" />
      <rect x="181.4" y="2" width="17.4" height="4.6" rx="2.3" fill="#e4b3b1" />
    </svg>
  );
}

/** A plain wire paper clip, standing upright. */
export function PaperClip({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 18 46" aria-hidden="true" focusable="false">
      <path
        d="M6 14 V34 a3 3 0 0 0 6 0 V8 a4.5 4.5 0 0 0 -9 0 V36 a6 6 0 0 0 12 0 V18"
        fill="none"
        stroke="#8f8a82"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 14 V34 a3 3 0 0 0 6 0 V8 a4.5 4.5 0 0 0 -9 0 V36 a6 6 0 0 0 12 0 V18"
        fill="none"
        stroke="#d8d4cc"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-0.35 -0.35)"
      />
    </svg>
  );
}

/** A slightly wobbly hand-drawn box with a teacher's tick that overshoots it. */
export function CheckBox({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <path
        className="ch03-check__frame"
        d="M6 8.4 C10.6 7.6 16.4 8 21.6 8.3 C21.9 13 21.5 18.2 21.8 23 C16.6 23.4 11 23 6.3 23.3 C5.8 18.4 6.3 13 6 8.4 Z"
      />
      <path className="ch03-check__tick" d="M9 15.6 C10.6 17.2 12 19.3 13 21 C16 15 21 8.6 27.5 3.4" />
    </svg>
  );
}
