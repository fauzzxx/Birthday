import { useId, useRef, type ReactNode } from 'react';
import { gsap } from '../../lib/gsap';
import { useScene } from '../../lib/scene';

/** Centres of the two lights (hers, then his) in the 560 × 220 drawing. */
const HER = { x: 110, y: 110 };
const HIS = { x: 450, y: 110 };
/** The filament between them hangs gently, like a thread. */
const FILAMENT = `M${HER.x} ${HER.y} C 220 172, 340 172, ${HIS.x} ${HIS.y}`;
/** Length of the bright trail behind a travelling pulse, as a fraction of the filament. */
const TAIL = 0.24;

interface LightPassageProps {
  /** The key line. The returning pulse waits for it to appear. */
  children: ReactNode;
}

/**
 * LIGHT PASSING FROM ONE GENERATION TO ANOTHER — two soft lights joined by a
 * golden filament. First a pulse travels from hers to his (all the years she
 * cared for him) and his light wakes; then, as the key line appears, a pulse
 * travels back and her light grows warmer (now he gives the comfort back).
 * Tied to scroll on every screen size (phones finish the passage sooner, see below).
 * Reduced motion: both lights rest, softly lit. Abstract and unlabelled.
 */
export function LightPassage({ children }: LightPassageProps) {
  const root = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  const filamentRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const herHaloRef = useRef<SVGCircleElement>(null);
  const herRippleRef = useRef<SVGCircleElement>(null);
  const herCoreRef = useRef<SVGGElement>(null);
  const hisHaloRef = useRef<SVGCircleElement>(null);
  const hisCoreRef = useRef<SVGGElement>(null);
  const outBeadRef = useRef<SVGGElement>(null);
  const backBeadRef = useRef<SVGGElement>(null);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids = {
    her: `${uid}-her`,
    his: `${uid}-his`,
    core: `${uid}-core`,
    bead: `${uid}-bead`,
    thread: `${uid}-thread`,
  };

  useScene(root, ({ reduce, desktop }) => {
    const light = lightRef.current;
    const key = keyRef.current;
    const path = filamentRef.current;
    const trail = trailRef.current;
    const herHalo = herHaloRef.current;
    const herRipple = herRippleRef.current;
    const herCore = herCoreRef.current;
    const hisHalo = hisHaloRef.current;
    const hisCore = hisCoreRef.current;
    const outBead = outBeadRef.current;
    const backBead = backBeadRef.current;
    if (reduce) return; // the markup already shows both lights, softly lit
    if (!light || !key || !path || !trail || !herHalo || !herRipple || !herCore) return;
    if (!hisHalo || !hisCore || !outBead || !backBead) return;

    const len = path.getTotalLength();
    const place = (bead: SVGGElement, p: number) => {
      const pt = path.getPointAtLength(gsap.utils.clamp(0, 1, p) * len);
      bead.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
    };
    /** Light up only the part of the filament between `from` and `to` (0–1). */
    const glowBetween = (from: number, to: number) => {
      const a = gsap.utils.clamp(0, 1, from) * len;
      const b = gsap.utils.clamp(0, 1, to) * len;
      trail.style.strokeDasharray = `${Math.max(0, b - a).toFixed(2)} ${len.toFixed(2)}`;
      trail.style.strokeDashoffset = `${(-a).toFixed(2)}`;
    };

    // Before: her light is lit; his is still waiting.
    const outward = { p: 0 };
    const back = { p: 0 };
    gsap.set(hisHalo, { opacity: 0.1 });
    gsap.set(hisCore, { opacity: 0.35 });
    gsap.set([outBead, backBead, trail], { opacity: 0 });
    place(outBead, 0);
    place(backBead, 1);
    glowBetween(0, 0);

    /** Hers → his. His light wakes. */
    const giveOut = (tl: gsap.core.Timeline, at: number) =>
      tl
        .to([outBead, trail], { opacity: 1, duration: 0.4, ease: 'power1.out' }, at)
        .to(
          outward,
          {
            p: 1,
            duration: 3,
            ease: 'power1.inOut',
            onUpdate: () => {
              place(outBead, outward.p);
              glowBetween(outward.p - TAIL, outward.p);
            },
          },
          at,
        )
        .to([outBead, trail], { opacity: 0, duration: 0.6, ease: 'power1.in' }, at + 2.7)
        .to(hisHalo, { opacity: 0.7, duration: 1.5, ease: 'power2.out' }, at + 2.6)
        .to(hisCore, { opacity: 1, duration: 1.1, ease: 'power2.out' }, at + 2.6);

    /** His → hers. Her light grows warmer, and a faint ring opens around it. */
    const giveBack = (tl: gsap.core.Timeline, at: number) =>
      tl
        .to([backBead, trail], { opacity: 1, duration: 0.4, ease: 'power1.out' }, at)
        .to(
          back,
          {
            p: 1,
            duration: 3,
            ease: 'power1.inOut',
            onUpdate: () => {
              const p = 1 - back.p;
              place(backBead, p);
              glowBetween(p, p + TAIL);
            },
          },
          at,
        )
        .to([backBead, trail], { opacity: 0, duration: 0.6, ease: 'power1.in' }, at + 2.7)
        .to(herHalo, { opacity: 1, scale: 1.16, transformOrigin: '50% 50%', duration: 1.8, ease: 'power2.out' }, at + 2.6)
        .to(herCore, { scale: 1.12, transformOrigin: '50% 50%', duration: 1.6, ease: 'power2.out' }, at + 2.6)
        .fromTo(
          herRipple,
          { attr: { r: 16 }, opacity: 0.55 },
          { attr: { r: 56 }, opacity: 0, duration: 2, ease: 'power1.out', immediateRender: false },
          at + 2.7,
        );

    // One scrubbed passage: out while the drawing rises into view, back once the key line has appeared.
    // Scrolling up plays it backwards. On phones the key line beneath the drawing runs to many
    // lines, so the passage is measured on the drawing itself and completes while the drawing is
    // still in the upper part of the screen; the back pulse begins just after the key line starts
    // to appear (about 45% → 52% of the way through).
    const tl = gsap.timeline({
      scrollTrigger: desktop
        ? { trigger: light, start: 'top 85%', endTrigger: key, end: 'bottom 50%', scrub: 1 }
        : { trigger: light, start: 'top 85%', end: 'bottom 40%', scrub: 0.8 },
    });
    giveOut(tl, 0.2);
    giveBack(tl, 5.6);
    tl.to({}, { duration: 0.4 });

    // The key line arrives on its own time (never scrubbed, so it is never left half-visible).
    gsap.fromTo(
      key,
      { opacity: 0, y: 14, filter: 'blur(3px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.6,
        ease: 'power2.out',
        clearProps: 'filter,transform',
        scrollTrigger: { trigger: key, start: 'top 80%' },
      },
    );

    return () => {
      outBead.setAttribute('transform', `translate(${HER.x} ${HER.y})`);
      backBead.setAttribute('transform', `translate(${HIS.x} ${HIS.y})`);
      trail.style.removeProperty('stroke-dasharray');
      trail.style.removeProperty('stroke-dashoffset');
    };
  });

  return (
    <div ref={root} className="ch11-passage">
      <div ref={lightRef} className="ch11-light" aria-hidden="true">
        <svg className="ch11-light__svg" viewBox="0 0 560 220" focusable="false">
          <defs>
            <radialGradient id={ids.her}>
              <stop offset="0" stopColor="#ffd296" stopOpacity="0.62" />
              <stop offset="0.42" stopColor="#f2b866" stopOpacity="0.2" />
              <stop offset="1" stopColor="#f2b866" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={ids.his}>
              <stop offset="0" stopColor="#f3e6c8" stopOpacity="0.55" />
              <stop offset="0.42" stopColor="#e8d2a4" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8d2a4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={ids.core}>
              <stop offset="0" stopColor="#fffaf0" />
              <stop offset="0.55" stopColor="#f6dcaa" />
              <stop offset="1" stopColor="#e2b06a" stopOpacity="0.85" />
            </radialGradient>
            <radialGradient id={ids.bead}>
              <stop offset="0" stopColor="#fff8ea" />
              <stop offset="0.3" stopColor="#ffe2ad" stopOpacity="0.85" />
              <stop offset="1" stopColor="#f2b866" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.thread} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f2b866" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#c9a46a" stopOpacity="0.45" />
              <stop offset="1" stopColor="#e8d2a4" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* The filament: a faint wide glow, the thread itself, and the travelling light. */}
          <path d={FILAMENT} fill="none" stroke="#c9a46a" strokeOpacity="0.1" strokeWidth="7" strokeLinecap="round" />
          <path
            ref={filamentRef}
            d={FILAMENT}
            fill="none"
            stroke={`url(#${ids.thread})`}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            ref={trailRef}
            className="ch11-light__trail"
            d={FILAMENT}
            fill="none"
            stroke="#fff0d2"
            strokeWidth="2"
            opacity="0"
          />

          <g transform={`translate(${HER.x} ${HER.y})`}>
            <circle ref={herHaloRef} r="80" fill={`url(#${ids.her})`} opacity="0.8" />
            <circle ref={herRippleRef} r="16" fill="none" stroke="#f6dcaa" strokeWidth="1" opacity="0" />
            <g ref={herCoreRef}>
              <circle r="13" fill={`url(#${ids.core})`} />
              <circle r="4" fill="#fffaf0" />
            </g>
          </g>

          <g transform={`translate(${HIS.x} ${HIS.y})`}>
            <circle ref={hisHaloRef} r="64" fill={`url(#${ids.his})`} opacity="0.7" />
            <g ref={hisCoreRef}>
              <circle r="10" fill={`url(#${ids.core})`} />
              <circle r="3.2" fill="#fffaf0" />
            </g>
          </g>

          <g ref={outBeadRef} transform={`translate(${HER.x} ${HER.y})`} opacity="0">
            <circle r="17" fill={`url(#${ids.bead})`} />
            <circle r="2.4" fill="#fffaf0" />
          </g>
          <g ref={backBeadRef} transform={`translate(${HIS.x} ${HIS.y})`} opacity="0">
            <circle r="17" fill={`url(#${ids.bead})`} />
            <circle r="2.4" fill="#fffaf0" />
          </g>
        </svg>
      </div>

      <div ref={keyRef} className="ch11-key">
        {children}
      </div>
    </div>
  );
}
