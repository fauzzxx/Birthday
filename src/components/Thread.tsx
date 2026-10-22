import { useId, useRef } from 'react';
import type { ThemeName } from '../content/types';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/scene';
import './thread.css';

interface ThreadProps {
  /** Theme of the chapter above and below — the background blends between them. */
  from: ThemeName;
  to: ThemeName;
  /** An optional quiet line, written by hand, in the middle of the pause. */
  line?: string;
  /** How long the pause feels. 'long' = a moment of real stillness. */
  length?: 'short' | 'medium' | 'long';
}

const DARK: ThemeName[] = ['night', 'midnight', 'dusk', 'espresso', 'lamplight', 'burgundy'];

/**
 * THE GOLDEN THREAD — one continuous line of light that runs between every
 * chapter. As you scroll, it draws itself downwards and a small bead of light
 * travels along it, leading you into the next part of the story.
 */
export function Thread({ from, to, line, length = 'medium' }: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGGElement>(null);
  const lineIsDark = DARK.includes(from) && DARK.includes(to);
  const tone = DARK.includes(to) ? 'dark' : 'light';
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  useScene(ref, ({ reduce }) => {
    const path = pathRef.current;
    const bead = beadRef.current;
    if (!path || !bead) return;
    const len = path.getTotalLength();
    const place = (p: number) => {
      const pt = path.getPointAtLength(Math.max(0.001, p) * len);
      bead.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    };

    if (reduce) {
      place(1);
      gsap.set(bead, { opacity: 0 });
      return;
    }

    const state = { p: 0 };
    gsap.set(path, { drawSVG: '0%' });
    place(0);
    gsap.to(state, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        end: 'bottom 35%',
        scrub: 0.6,
      },
      onUpdate: () => {
        gsap.set(path, { drawSVG: `0% ${state.p * 100}%` });
        place(state.p);
      },
    });

    if (line) {
      gsap.from('.thread__line', {
        opacity: 0,
        y: 16,
        filter: 'blur(6px)',
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 55%' },
      });
    }
  }, [line]);

  return (
    <div
      ref={ref}
      className={`thread thread--${length} thread--${tone} ${lineIsDark ? 'thread--on-dark' : ''}`}
      style={{
        ['--thread-from' as string]: `var(--theme-${from}-bg)`,
        ['--thread-to' as string]: `var(--theme-${to}-bg)`,
      }}
      aria-hidden={line ? undefined : true}
    >
      <svg className="thread__svg" viewBox="0 0 60 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9a46a" stopOpacity="0.15" />
            <stop offset="0.35" stopColor="#e8d2a4" />
            <stop offset="1" stopColor="#c9a46a" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id={`${uid}-bead`}>
            <stop offset="0" stopColor="#fff6e2" />
            <stop offset="0.35" stopColor="#e8d2a4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c9a46a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          ref={pathRef}
          className="thread__path"
          d="M30 0 C 30 70, 14 110, 26 170 S 46 270, 32 320 S 30 380, 30 400"
          fill="none"
          stroke={`url(#${uid}-gold)`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <g ref={beadRef} className="thread__bead">
          <circle r="9" fill={`url(#${uid}-bead)`} />
          <circle r="1.8" fill="#fff6e2" />
        </g>
      </svg>
      {line && <p className="thread__line">{line}</p>}
    </div>
  );
}
