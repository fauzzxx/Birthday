import { useEffect, useId, useRef, type RefObject } from 'react';
import { Botanical } from '../../components/Botanical';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { HiddenNote } from '../../components/HiddenNote';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { Petals } from '../../components/atmosphere/Petals';
import { kindness } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useIsDesktop } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import './kindness.css';

/** Size of one lattice tile, in CSS pixels. */
const TILE = 48;
const LATTICE = latticeTile(TILE);

const HIDDEN: gsap.TweenVars = { opacity: 0, y: 14, filter: 'blur(3px)' };
const SHOWN: gsap.TweenVars = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  ease: 'power2.out',
  clearProps: 'filter,transform',
};

function settle(target: Element, { duration = 2.2, start = 'top 82%' } = {}) {
  gsap.fromTo(target, { ...HIDDEN }, { ...SHOWN, duration, scrollTrigger: { trigger: target, start } });
}

/**
 * Chapter 08 — A HEART THAT CHOOSES KINDNESS.
 * A serene dawn. Her portrait stands in an arch — a quiet, respectful nod to her
 * faith — over an original eight-point-star lattice at whisper-level opacity,
 * framed by drawn jasmine and a branch. The lines arrive one by one beside her;
 * then, set apart and smaller, the remembrance of her parents, stated simply.
 * A small hidden note waits beneath the line about forgiveness.
 */
export function Kindness() {
  const root = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const patternId = `ch08-lattice-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const showPhoto = photoSlotVisible(kindness.photo);
  const twoColumns = isDesktop && showPhoto;
  const { remembrance } = kindness;
  const prayer = remembrance.prayer.trim();
  usePauseOffscreen(root);

  useScene(root, ({ reduce }) => {
    const el = root.current;
    if (reduce || !el) return;

    const head = el.querySelector('.ch08-head');
    if (head) {
      gsap.from(head, { opacity: 0, duration: 2, ease: 'power1.out', scrollTrigger: { trigger: head, start: 'top 85%' } });
    }

    // The arch arrives first; the lattice behind it surfaces a moment later, barely.
    const stage = el.querySelector('.ch08-stage');
    const arch = el.querySelector('.ch08-arch');
    const lattice = el.querySelector('.ch08-lattice');
    if (stage && arch) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 72%' } });
      tl.from(arch, { opacity: 0, y: 24, duration: 2.4, ease: 'power2.out' });
      if (lattice) tl.from(lattice, { opacity: 0, scale: 1.06, duration: 3.6, ease: 'power1.out' }, 0.5);
    }

    el.querySelectorAll('.ch08-line').forEach((line) => settle(line));

    const note = el.querySelector('.ch08-note');
    if (note) {
      gsap.from(note, { opacity: 0, duration: 1.6, delay: 0.8, scrollTrigger: { trigger: note, start: 'top 92%' } });
    }

    // Remembrance: the rule draws, then each sentence fades in slowly, in its own time.
    const block = el.querySelector('.ch08-remembrance');
    const rule = el.querySelector('.ch08-rule');
    const quiet = el.querySelectorAll('.ch08-memory, .ch08-prayer');
    if (block && quiet.length) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: block, start: 'top 75%' } });
      if (rule) tl.from(rule, { scaleX: 0, opacity: 0, duration: 1.8, ease: 'power2.inOut' });
      tl.fromTo(
        quiet,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 2.2, ease: 'power1.out', stagger: 0.95, clearProps: 'transform' },
        rule ? 0.9 : 0,
      );
    }

    const key = el.querySelector('.ch08-key');
    if (key) settle(key, { duration: 2.6, start: 'top 80%' });
  });

  return (
    <ChapterSection number={8} ref={root} className="ch08">
      <LightLeak tone="gold" position="top" intensity={0.75} className="ch08-dawn" />
      <div className="ch08-air" aria-hidden="true">
        <div className="ch08-air__view">
          <Petals count={8} seed={19} color="var(--rose)" />
        </div>
      </div>

      <div className="container ch08-inner">
        <div className={`ch08-stage${showPhoto ? '' : ' ch08-stage--solo'}`}>
          <div className="ch08-head">
            <ChapterHeading number={8} align={twoColumns ? 'start' : 'center'} />
          </div>

          {showPhoto && (
            <div className="ch08-figure">
              <div className="ch08-arch">
                <svg className="ch08-lattice" aria-hidden="true" focusable="false">
                  <defs>
                    <pattern id={patternId} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
                      <path d={LATTICE} fill="none" stroke="currentColor" strokeWidth={0.75} />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </svg>
                <Botanical variant="branch" seed={6} flip draw className="ch08-branch" />
                <Botanical variant="jasmine" seed={9} draw className="ch08-jasmine" />
                <Photo
                  id={kindness.photo}
                  frame="arch"
                  tone="warm"
                  openable
                  parallax={0.05}
                  aspect={0.6}
                  sizes="(min-width: 900px) 25rem, 76vw"
                  className="ch08-photo"
                />
              </div>
            </div>
          )}

          <div className="ch08-text">
            <div className="ch08-lines">
              {kindness.lines.map((line, i) => (
                <p key={line} className={`t-lead ch08-line${i === 0 ? ' ch08-line--first' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
            {/* Just beneath "you have forgiven me…": a little note for whoever looks closely. */}
            <div className="ch08-note">
              <HiddenNote text={kindness.hiddenNote} side={twoColumns ? 'right' : 'bottom'} style={{ left: 0, top: 0 }} />
            </div>
          </div>
        </div>

        <div className="ch08-remembrance">
          <div className="ornament-rule ch08-rule" aria-hidden="true">
            <span />
          </div>
          {remembrance.lines.map((line, i) => (
            <p
              key={line}
              className={`ch08-memory${i === remembrance.lines.length - 1 ? ' ch08-memory--last' : ''}`}
            >
              {line}
            </p>
          ))}
          {prayer && <p className="ch08-prayer">{prayer}</p>}
        </div>

        <div className="ch08-key">
          <p className="keyline keyline--large">{kindness.keyLine}</p>
        </div>
      </div>
    </ChapterSection>
  );
}

/**
 * One tile of an original star-and-diamond lattice: an eight-point star (two
 * interlaced squares) tied to its neighbours, with a small diamond at each corner
 * and a ring at its heart. Repeated by an SVG <pattern>.
 */
function latticeTile(s: number): string {
  const c = s / 2;
  const R = s * 0.29;
  const r = R * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  const n = (v: number) => Math.round(v * 100) / 100;

  const star = Array.from({ length: 16 }, (_, k) => {
    const a = (k * Math.PI) / 8;
    const rad = k % 2 ? r : R;
    return `${n(c + Math.cos(a) * rad)} ${n(c + Math.sin(a) * rad)}`;
  });
  const parts = [`M${star.join(' L')} Z`];

  // Straight ties to the stars above, below and beside.
  parts.push(`M${n(c + R)} ${c} H${s}`, `M${n(c - R)} ${c} H0`, `M${c} ${n(c + R)} V${s}`, `M${c} ${n(c - R)} V0`);

  // Diagonal ties, each ending on a small diamond at the tile's corner.
  const d = s * 0.125;
  const o = R * Math.SQRT1_2;
  const corners: [number, number][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [sx, sy] of corners) {
    const cx = sx > 0 ? s : 0;
    const cy = sy > 0 ? s : 0;
    parts.push(`M${n(c + sx * o)} ${n(c + sy * o)} L${n(cx - (sx * d) / 2)} ${n(cy - (sy * d) / 2)}`);
    parts.push(`M${n(cx - d)} ${cy} L${cx} ${n(cy - d)} L${n(cx + d)} ${cy} L${cx} ${n(cy + d)} Z`);
  }

  const ring = R * 0.3;
  parts.push(`M${n(c - ring)} ${c} a${n(ring)} ${n(ring)} 0 1 0 ${n(ring * 2)} 0 a${n(ring)} ${n(ring)} 0 1 0 ${n(-ring * 2)} 0`);
  return parts.join(' ');
}

/** Rest the slow CSS light loop while this scene is off-screen. */
function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.offscreen = entry.isIntersecting ? 'false' : 'true';
      },
      { rootMargin: '25% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.offscreen;
    };
  }, [ref]);
}
