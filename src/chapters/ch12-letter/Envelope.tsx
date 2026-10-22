import { useId } from 'react';
import { SealArt } from './SealArt';

/**
 * The ivory envelope, built from separate layers so the opening can be staged:
 * the back (its burgundy-and-gold liner shows through the mouth), the flap,
 * the folded letter inside, the front pocket with "For Ma" written on it, and
 * the wax seal in two halves. The layers deliberately share ONE stacking
 * context with the tucked photograph and the reading paper (the `.ch12-desk`),
 * so their z-order can be interleaved while the letter comes out.
 *
 * Not focusable: the "Open the letter" button is the control; clicking the
 * envelope itself is only a convenience for mouse and touch.
 */

/** Widths (in %) of the faint, abstract "lines of writing" on each panel of the folded sheet. */
const LINES: number[][] = [
  [34, 92, 88, 95, 71, 90, 84],
  [93, 86, 97, 90, 62, 94, 88],
  [91, 95, 79, 92, 88, 56, 0],
];

function SheetLines({ widths }: { widths: number[] }) {
  return (
    <span className="ch12-sheet-lines">
      {widths.map((w, i) => (
        <span key={i} className="ch12-sheet-line" style={{ width: `${w}%`, opacity: w ? undefined : 0 }} />
      ))}
    </span>
  );
}

interface EnvelopeProps {
  to: string;
  onOpen: () => void;
}

export function Envelope({ to, onOpen }: EnvelopeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div className="ch12-env" onClick={onOpen}>
      <div className="ch12-env-back ch12-env-part" aria-hidden="true" />

      <div className="ch12-flap ch12-env-part" aria-hidden="true">
        <div className="ch12-flap-face" />
        <div className="ch12-flap-inner" />
        <div className="ch12-flap-shade" />
      </div>

      {/* The folded letter: a middle panel with one panel hinged above and one below. */}
      <div className="ch12-sheet" aria-hidden="true">
        <div className="ch12-sheet-shadow" />
        <div className="ch12-sheet-face ch12-sheet-mid">
          <SheetLines widths={LINES[1]} />
        </div>
        <div className="ch12-sheet-face ch12-sheet-bot">
          <SheetLines widths={LINES[2]} />
          <span className="ch12-sheet-shade" />
        </div>
        <div className="ch12-sheet-face ch12-sheet-top">
          <SheetLines widths={LINES[0]} />
          <span className="ch12-sheet-shade" />
        </div>
      </div>

      <div className="ch12-pocket ch12-env-part">
        <div className="ch12-pocket-l" aria-hidden="true" />
        <div className="ch12-pocket-r" aria-hidden="true" />
        <div className="ch12-pocket-b" aria-hidden="true" />
        <svg className="ch12-pocket-edges" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 100 L74.4 49.5 Q80 46.4 85.6 49.5 L160 100"
            fill="none"
            stroke="rgba(96, 62, 40, 0.2)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <p className="ch12-env-to">{to}</p>
      </div>

      <div className="ch12-seal" aria-hidden="true">
        <SealArt idPrefix={`${uid}-l`} className="ch12-seal-half ch12-seal-half--l" />
        <SealArt idPrefix={`${uid}-r`} className="ch12-seal-half ch12-seal-half--r" />
      </div>
    </div>
  );
}
