import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Botanical } from '../../components/Botanical';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { SplitReveal } from '../../components/Reveal';
import { pad2 } from '../../content/chapters';
import { lessons } from '../../content/story';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { MQ, prefersReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import './lessons.css';

/**
 * Chapter 10 — The things you taught me without a textbook.
 *
 * A small deck of pressed-flower index cards. The first lesson lies on the
 * table; "Reveal the next lesson" draws the top card — on desktop it lifts off
 * the deck with a slight turn and settles at the end of the list, on phones it
 * slides up into place. Revealed cards stay, a tidy list in order. When the
 * deck is empty it quietly leaves, so no button is ever left with nothing to do.
 * Reduced motion: the same mechanics, every card appears instantly.
 */

const TOTAL = lessons.items.length;
const LIST_ID = 'ch10-lessons-list';
/** Leaf arrangement per card — every pressed sprig is a little different. */
const SEEDS = [3, 8, 12, 5, 9, 14, 6, 11, 15, 4];
/** Dried-flower tones, cycled card by card. */
const SPRIG_TONES = ['var(--ch10-sage)', 'var(--rose-ink)', 'var(--gold-ink)'];
const EDGES = lessons.items.map((_, i) => deckleEdge(i + 1));

type RevealMode = 'next' | 'all';

interface PendingReveal {
  /** Number of cards that were showing before this reveal. */
  from: number;
  mode: RevealMode;
  /** Keyboard focus was on the deck controls (which may be about to leave). */
  hadFocus: boolean;
}

export function Lessons() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const pending = useRef<PendingReveal | null>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);

  const [count, setCount] = useState(Math.min(1, TOTAL));
  const [deckGone, setDeckGone] = useState(TOTAL <= 1);
  const done = count >= TOTAL;

  const { contextSafe } = useGSAP({ scope: root });

  // The board settles in as it scrolls into view.
  useScene(root, ({ reduce }) => {
    const el = root.current;
    if (reduce || !el) return;
    const parts = el.querySelectorAll('.ch10-list, .ch10-panel');
    if (!parts.length) return;
    gsap.from(parts, {
      opacity: 0,
      y: 34,
      duration: 1.3,
      stagger: 0.18,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: parts[0], start: 'top 85%' },
    });
  });

  const reveal = (mode: RevealMode) => {
    if (count >= TOTAL) return;
    const prev = pending.current;
    pending.current = {
      from: prev ? prev.from : count,
      mode: prev?.mode === 'all' ? 'all' : mode,
      hadFocus: (prev?.hadFocus ?? false) || !!controlsRef.current?.contains(document.activeElement),
    };
    setCount((c) => (mode === 'all' ? TOTAL : Math.min(TOTAL, c + 1)));
  };

  const animateArrivals = contextSafe((slots: HTMLElement[], mode: RevealMode, desktop: boolean) => {
    const cards = slots
      .map((slot) => slot.querySelector<HTMLElement>('.ch10-card'))
      .filter((card): card is HTMLElement => card !== null);
    if (!cards.length) return;

    const deck = deckRef.current;
    if (mode === 'next' && desktop && deck && cards.length === slots.length) {
      cards.forEach((card, i) => flyFromDeck(card, slots[i], deck, i * 0.14));
      return;
    }

    gsap.from(cards, {
      opacity: 0,
      y: desktop ? 30 : 44,
      rotation: (i: number) => (i % 2 ? 1.2 : -1.2),
      duration: 0.9,
      stagger: 0.07,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    });
  });

  // After each reveal: animate the newcomers, keep focus sensible, keep them in view.
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;

    const slots = Array.from(listRef.current?.children ?? []).slice(p.from, count) as HTMLElement[];
    if (!slots.length) return;

    // The page just grew: let the scroll scenes further down re-measure.
    ScrollTrigger.refresh();

    const reduce = prefersReducedMotion();

    // Scroll first (if needed), so each frame the page moves before a flight measures it.
    scrollTween.current?.kill();
    scrollTween.current = bringIntoView(p.mode === 'all' ? slots[0] : slots[slots.length - 1], reduce);

    if (!reduce) animateArrivals(slots, p.mode, window.matchMedia(MQ.desktop).matches);

    // The controls leave once every lesson is out: hand focus to the first new lesson.
    if (count >= TOTAL && p.hadFocus) {
      slots[0].querySelector<HTMLElement>('.ch10-card-lesson')?.focus({ preventScroll: true });
    }
  }, [count]);

  // When the deck is empty, let it fade, then remove it (and its buttons).
  useEffect(() => {
    if (!done || deckGone) return;
    const timer = window.setTimeout(() => setDeckGone(true), prefersReducedMotion() ? 0 : 1150);
    return () => window.clearTimeout(timer);
  }, [done, deckGone]);

  useEffect(() => {
    if (deckGone) ScrollTrigger.refresh();
  }, [deckGone]);

  useEffect(() => () => void scrollTween.current?.kill(), []);

  const current = lessons.items[Math.max(0, count - 1)];
  const announcement = done
    ? fill(lessons.announceAll, { total: TOTAL })
    : fill(lessons.announceNext, { n: count, total: TOTAL, lesson: current?.lesson ?? '' });

  // Unrevealed cards, bottom of the deck first, so the next lesson is on top.
  const deck = Array.from({ length: TOTAL - count }, (_, k) => TOTAL - 1 - k);

  return (
    <ChapterSection number={10} ref={root} className="ch10">
      <Botanical variant="corner" seed={4} className="ch10-corner" />

      <div className="container">
        <ChapterHeading number={10} align="center" className="ch10-head" />
        <SplitReveal text={lessons.intro} className="keyline keyline--large ch10-intro" />

        <div className="ch10-board">
          <ol ref={listRef} id={LIST_ID} className="ch10-list" role="list" aria-label={lessons.listLabel}>
            {lessons.items.slice(0, count).map((item, i) => (
              <li key={i} className="ch10-slot">
                <LessonCard index={i} lesson={item.lesson} example={item.example} />
              </li>
            ))}
          </ol>

          <div className="ch10-panel">
            <p className="ch10-progress" aria-live="polite" aria-atomic="true">
              <span className="ch10-progress-count" aria-hidden="true">
                <span className="ch10-progress-n">{pad2(count)}</span>
                <span className="ch10-progress-total">/ {pad2(TOTAL)}</span>
              </span>
              <span className="visually-hidden">{announcement}</span>
            </p>

            {!deckGone && (
              <div ref={controlsRef} className={`ch10-deck-area${done ? ' is-leaving' : ''}`} inert={done}>
                <div ref={deckRef} className="ch10-deck" aria-hidden="true">
                  {deck.map((idx) => {
                    const depth = idx - count;
                    const style = {
                      '--ch10-depth': depth,
                      '--ch10-d-tilt': depth === 0 ? 0 : deckTilt(idx),
                    } as CSSProperties;
                    return (
                      <span key={idx} className="ch10-deck-card ch10-back" style={style}>
                        {depth === 0 && <CardFace n={idx + 1} />}
                      </span>
                    );
                  })}
                </div>

                <div className="ch10-actions">
                  <button
                    type="button"
                    className="btn btn--solid ch10-reveal"
                    aria-controls={LIST_ID}
                    onClick={() => reveal('next')}
                  >
                    {lessons.revealLabel}
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet ch10-reveal-all"
                    aria-controls={LIST_ID}
                    onClick={() => reveal('all')}
                  >
                    {lessons.revealAllLabel}
                  </button>
                </div>
              </div>
            )}

            {deckGone && <Botanical variant="jasmine" seed={7} draw className="ch10-complete" />}
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}

/* ── A lesson card ──────────────────────────────────────────────────────── */

interface LessonCardProps {
  index: number;
  lesson: string;
  example: string;
}

/**
 * Cream card stock with a deckled edge, an index-card rule, the lesson, where
 * he learned it (in his hand), and a pressed sprig taped in the corner.
 * The hidden "cover" is the card's back, shown only while it is in flight.
 */
function LessonCard({ index, lesson, example }: LessonCardProps) {
  const n = index + 1;
  const style = {
    '--ch10-tilt': `${index % 2 ? 0.45 : -0.35}deg`,
    '--ch10-sprig': SPRIG_TONES[index % SPRIG_TONES.length],
  } as CSSProperties;

  return (
    <div className="ch10-card" style={style}>
      <div className="ch10-card-paper" style={{ clipPath: EDGES[index] }}>
        <p className="t-eyebrow ch10-card-num">
          {lessons.lessonLabel} {pad2(n)}
        </p>
        <h3 id={`ch10-lesson-${n}`} tabIndex={-1} className="t-headline ch10-card-lesson">
          {lesson}
        </h3>
        <p className="ch10-card-label">{lessons.learnedLabel}</p>
        <p className="ch10-card-example">{example}</p>

        <span className="ch10-card-pressed" aria-hidden="true">
          <Botanical variant="sprig" seed={seedFor(index)} flip={index % 2 === 1} className="ch10-card-sprig" />
          <span className="ch10-card-tape" />
        </span>

        <span className="ch10-card-cover ch10-back" aria-hidden="true">
          <CardFace n={n} />
        </span>
      </div>
    </div>
  );
}

/** The back of a card: "Lesson 03" and a tiny sprig inside a fine gold frame. */
function CardFace({ n }: { n: number }) {
  return (
    <span className="ch10-face">
      <span className="ch10-face-frame" />
      <span className="ch10-face-label">{lessons.lessonLabel}</span>
      <span className="ch10-face-n">{pad2(n)}</span>
      <Botanical variant="sprig" seed={seedFor(n - 1)} className="ch10-face-sprig" />
    </span>
  );
}

/* ── Motion helpers ─────────────────────────────────────────────────────── */

/**
 * Lifts a freshly revealed card off the deck and settles it into its slot.
 * Both ends are measured every frame, so the flight stays true while the page
 * scrolls (the deck is sticky; the slot moves with the page).
 */
function flyFromDeck(card: HTMLElement, slot: HTMLElement, deck: HTMLElement, delay: number) {
  const startRect = deck.getBoundingClientRect();
  const cover = card.querySelector<HTMLElement>('.ch10-card-cover');
  const state = { t: 0 };

  const place = () => {
    const s = slot.getBoundingClientRect();
    if (!s.width || !s.height) return;
    const d = deck.isConnected ? deck.getBoundingClientRect() : startRect;
    const t = state.t;
    const inv = 1 - t;
    const arc = Math.sin(t * Math.PI);
    const dx = (d.left + d.width / 2 - (s.left + s.width / 2)) * inv;
    const dy = (d.top + d.height / 2 - (s.top + s.height / 2)) * inv - arc * 40;
    const sx = 1 + (d.width / s.width - 1) * inv;
    const sy = 1 + (d.height / s.height - 1) * inv;
    card.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${(-6 * arc).toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    card.style.setProperty('--ch10-lift', arc.toFixed(3));
  };

  const finish = () => {
    card.classList.remove('is-flying');
    card.style.removeProperty('transform');
    card.style.removeProperty('--ch10-lift');
    cover?.style.removeProperty('opacity');
  };

  card.classList.add('is-flying');
  if (cover) cover.style.opacity = '1';
  place(); // sits exactly on the deck before the first paint

  const tl = gsap.timeline({ delay, onComplete: finish, onInterrupt: finish });
  tl.to(state, { t: 1, duration: 1.05, ease: 'power2.inOut', onUpdate: place }, 0);
  if (cover) tl.to(cover, { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, 0.3);
}

/** Scrolls just enough for `el` to be comfortably visible (never if it already is). */
function bringIntoView(el: HTMLElement, reduce: boolean): gsap.core.Tween | null {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const margin = Math.min(72, vh * 0.09);
  const topOk = r.top >= margin;
  const bottomOk = r.bottom <= vh - margin;
  if (topOk && bottomOk) return null;

  const delta = topOk ? Math.min(r.bottom - (vh - margin), r.top - margin) : r.top - margin;
  if (Math.abs(delta) < 2) return null;
  const y = window.scrollY + delta;

  if (reduce) {
    window.scrollTo({ top: y, behavior: 'auto' });
    return null;
  }
  return gsap.to(window, { scrollTo: { y, autoKill: true }, duration: 0.9, ease: 'power2.inOut' });
}

/* ── Small pure helpers ─────────────────────────────────────────────────── */

function seedFor(index: number): number {
  return SEEDS[index % SEEDS.length] + Math.floor(index / SEEDS.length) * 17;
}

/** A slight, stable tilt for the cards waiting in the deck (degrees). */
function deckTilt(index: number): number {
  return (((index * 37) % 7) - 3) * 0.45;
}

/** Replaces {key} tokens in a microcopy template. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/**
 * A softly irregular, deckled outline for a card (CSS polygon), stable per seed:
 * every edge point sits 0.4–2.6px inside the card's box.
 */
function deckleEdge(seed: number): string {
  let s = (seed * 9301 + 49297) % 233280;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const j = () => (0.4 + rand() * 2.2).toFixed(2);
  const pct = (v: number) => `${v.toFixed(2)}%`;
  const across = 28;
  const down = 12;
  const pts: string[] = [];
  for (let i = 0; i <= across; i++) pts.push(`${pct((i / across) * 100)} ${j()}px`);
  for (let i = 1; i <= down; i++) pts.push(`calc(100% - ${j()}px) ${pct((i / down) * 100)}`);
  for (let i = across - 1; i >= 0; i--) pts.push(`${pct((i / across) * 100)} calc(100% - ${j()}px)`);
  for (let i = down - 1; i >= 1; i--) pts.push(`${j()}px ${pct((i / down) * 100)}`);
  return `polygon(${pts.join(', ')})`;
}
