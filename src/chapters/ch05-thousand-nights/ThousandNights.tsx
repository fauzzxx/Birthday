import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { HiddenNote } from '../../components/HiddenNote';
import { Reveal, SplitReveal } from '../../components/Reveal';
import { DustField } from '../../components/atmosphere/DustField';
import { thousandNights } from '../../content/story';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useIsDesktop, useReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import { constellationPath, ORIGIN, pct, starSpots, VIEW_H, VIEW_W } from './constellation';
import { LaptopIcon, LaptopShape, Moon, NightSky, StarGlyph } from './sky';
import './thousand-nights.css';

/** Splits the key line into its sentences (falls back to the whole line). */
function sentencesOf(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["'”’]?/g)?.map((s) => s.trim()) ?? [];
  const normalise = (s: string) => s.replace(/\s+/g, ' ').trim();
  return parts.length > 0 && normalise(parts.join(' ')) === normalise(text) ? parts : [text];
}

/**
 * Chapter 05 — A thousand nights of never giving up.
 *
 * A deep night sky. At its foot, the small glow of a laptop screen — the light
 * she learned by, late at night. As you scroll, a golden line rises out of that
 * glow and joins six stars; each star lights as the line reaches it, and each
 * is one memory of those years. Choosing a star opens its memory in a small
 * card in the sky. On phones the constellation becomes a vertical line of
 * stars, each opening its memory beneath it.
 */
export function ThousandNights() {
  const rootRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const anchorRef = useRef<{ index: number; top: number } | null>(null);
  const prevCardSel = useRef<number | null>(null);
  const prevPanelSel = useRef<number | null>(null);

  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const { memories, ui } = thousandNights;
  const count = memories.length;

  const [selected, setSelected] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const cardId = `${uid}-memory`;
  const panelId = (i: number) => `${uid}-memory-${i}`;
  const mobileStarId = (i: number) => `${uid}-star-${i}`;

  const spots = useMemo(() => starSpots(count), [count]);
  const { d, fractions } = useMemo(() => constellationPath(spots.map((s) => s.at)), [spots]);
  const lastStar = spots[spots.length - 1]?.at ?? ORIGIN;
  const sentences = useMemo(() => sentencesOf(thousandNights.keyLine), []);
  const current = selected === null ? null : memories[selected];

  /* ── Choosing memories ─────────────────────────────────── */
  const choose = (i: number) => {
    setSelected(i);
    setFocusIndex(i);
  };

  const step = (dir: 1 | -1) => {
    if (count === 0) return;
    const from = selected ?? (dir === 1 ? -1 : 0);
    choose((from + dir + count) % count);
  };

  // Roving focus across the stars: ← → ↑ ↓ Home End (the line rises, so ↑ = later).
  const onStarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = -1;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = (focusIndex + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = (focusIndex - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setFocusIndex(next);
    starRefs.current[next]?.focus();
  };

  // Phones: one memory open at a time; pressing the open star closes it.
  const toggleMobile = (i: number) => {
    const btn = document.getElementById(mobileStarId(i));
    anchorRef.current = btn ? { index: i, top: btn.getBoundingClientRect().top } : null;
    setSelected((s) => (s === i ? null : i));
  };

  // Keep the pressed star where it was when a memory above it closes.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (!anchor) return;
    const btn = document.getElementById(mobileStarId(anchor.index));
    if (!btn) return;
    const delta = btn.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) > 1) window.scrollBy(0, delta);
  }, [selected]);

  /* ── Small transitions on change ───────────────────────── */

  // Desktop card: the new memory settles in.
  useEffect(() => {
    if (prevCardSel.current === selected) return;
    prevCardSel.current = selected;
    const body = bodyRef.current;
    if (!body || reduce || !isDesktop || body.children.length === 0) return;
    const items = Array.from(body.children);
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform' },
    );
    return () => {
      tween.kill();
      gsap.set(items, { clearProps: 'opacity,transform' });
    };
  }, [selected, reduce, isDesktop]);

  // Phones: the opened memory unfolds; later scroll scenes are re-measured.
  useEffect(() => {
    if (isDesktop) {
      prevPanelSel.current = selected;
      return;
    }
    if (prevPanelSel.current === selected) return;
    prevPanelSel.current = selected;
    const panel = selected === null ? null : document.getElementById(panelId(selected));
    let tween: gsap.core.Tween | null = null;
    let raf = 0;
    if (panel && !reduce) {
      tween = gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'height,opacity',
          onComplete: () => ScrollTrigger.refresh(),
        },
      );
    } else {
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    return () => {
      tween?.kill();
      if (panel) gsap.set(panel, { clearProps: 'height,opacity' });
      cancelAnimationFrame(raf);
    };
  }, [selected, isDesktop, reduce]);

  // Pause the twinkling stars while the chapter is off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.awake = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── Scroll choreography ───────────────────────────────── */
  useScene(
    rootRef,
    ({ reduce: still, desktop }) => {
      const root = rootRef.current;
      if (still || !root) return; // the markup is the finished sky: line drawn, every star lit

      if (desktop) {
        const stage = root.querySelector<HTMLElement>('.ch05-stage');
        if (!stage) return;
        const lines = gsap.utils.toArray<SVGPathElement>(stage.querySelectorAll('.ch05-line'));
        const lights = gsap.utils.toArray<HTMLElement>(stage.querySelectorAll('.ch05-star__light'));

        // The line rises from the screen as the sky passes through the viewport,
        // lighting each star as it arrives (scrubbed, never pinned).
        if (lines.length) {
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: stage, start: '86% bottom', end: '14% top', scrub: 0.8 },
          });
          tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1 }, 0);
          lights.forEach((light, i) => {
            const at = fractions[i] ?? 1;
            tl.fromTo(
              light,
              { opacity: 0.26, scale: 0.42 },
              { opacity: 1, scale: 1, duration: 0.07, ease: 'power2.out' },
              Math.max(0, at - 0.04),
            );
          });
        }

        const glow = stage.querySelectorAll('.ch05-laptop__glow, .ch05-laptop__screen');
        if (glow.length) {
          gsap.from(glow, {
            opacity: 0,
            duration: 2.4,
            stagger: 0.25,
            ease: 'power2.out',
            scrollTrigger: { trigger: stage, start: 'top 85%' },
          });
        }

        const card = root.querySelector('.ch05-card');
        if (card) {
          gsap.from(card, {
            opacity: 0,
            y: 24,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: { trigger: stage, start: 'top 70%' },
          });
        }
        return;
      }

      // Phones: a simple on-enter timeline — the line runs down, the stars arrive.
      const list = root.querySelector<HTMLElement>('.ch05-vwrap');
      if (!list) return;
      const segments = gsap.utils.toArray<HTMLElement>(list.querySelectorAll('.ch05-vseg'));
      const marks = gsap.utils.toArray<HTMLElement>(list.querySelectorAll('.ch05-vstar'));
      const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 78%' } });
      const laptop = list.querySelector('.ch05-vlaptop');
      if (laptop) tl.from(laptop, { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0);
      if (segments.length) {
        tl.from(segments, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.42, stagger: 0.32, ease: 'none' }, 0.3);
      }
      if (marks.length) {
        tl.from(marks, { opacity: 0, x: -10, duration: 0.8, stagger: 0.32, ease: 'power3.out' }, 0.55);
      }
    },
    [isDesktop, fractions],
  );

  return (
    <ChapterSection number={5} ref={rootRef} className="ch05">
      <NightSky />
      <DustField count={12} mode="drift" color="200, 216, 245" size={1.5} speed={0.45} />

      <div className="container ch05-inner">
        <ChapterHeading number={5} align="center" className="ch05-head" />
        <Reveal as="p" className="t-lead ch05-intro">
          {thousandNights.intro}
        </Reveal>

        {isDesktop ? (
          <div className="ch05-skyframe">
            <div className="ch05-stage">
              <svg
                className="ch05-chart"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <linearGradient
                    id={`${uid}-line`}
                    gradientUnits="userSpaceOnUse"
                    x1={ORIGIN[0]}
                    y1={ORIGIN[1]}
                    x2={lastStar[0]}
                    y2={lastStar[1]}
                  >
                    <stop offset="0" stopColor="#d6e5f5" />
                    <stop offset="0.2" stopColor="#e8d2a4" />
                    <stop offset="1" stopColor="#c9a46a" />
                  </linearGradient>
                  <linearGradient id={`${uid}-desk`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#c9a46a" stopOpacity="0" />
                    <stop offset="0.12" stopColor="#c9a46a" stopOpacity="0.34" />
                    <stop offset="0.5" stopColor="#c9a46a" stopOpacity="0.08" />
                    <stop offset="1" stopColor="#c9a46a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="831" x2={VIEW_W} y2="831" stroke={`url(#${uid}-desk)`} strokeWidth="1.5" />
                <LaptopShape />
                <path
                  className="ch05-ghost"
                  d={d}
                  fill="none"
                  stroke="rgba(232, 210, 164, 0.3)"
                  strokeWidth="1.4"
                  strokeDasharray="1.5 11"
                  strokeLinecap="round"
                />
                <path
                  className="ch05-line ch05-line--halo"
                  d={d}
                  fill="none"
                  stroke={`url(#${uid}-line)`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="ch05-line"
                  d={d}
                  fill="none"
                  stroke={`url(#${uid}-line)`}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <Moon className="ch05-moon--stage" />

              <div className="ch05-stars" role="toolbar" aria-label={ui.constellationLabel} onKeyDown={onStarKey}>
                {memories.map((m, i) => {
                  const spot = spots[i];
                  const p = pct(spot.at);
                  return (
                    <button
                      key={m.title}
                      ref={(el) => {
                        starRefs.current[i] = el;
                      }}
                      type="button"
                      className="ch05-star"
                      data-label={spot.label}
                      data-twinkle={spot.twinkle || undefined}
                      style={{ left: p.x, top: p.y, '--fx': spot.at[0] / VIEW_W } as CSSProperties}
                      aria-label={m.title}
                      aria-pressed={selected === i}
                      aria-controls={cardId}
                      tabIndex={i === focusIndex ? 0 : -1}
                      onClick={() => choose(i)}
                      onFocus={() => setFocusIndex(i)}
                    >
                      <span className="ch05-star__light" aria-hidden="true">
                        <span className="ch05-star__halo" />
                        <span className="ch05-star__ring" />
                        <StarGlyph className="ch05-star__core" />
                      </span>
                      <span className="ch05-star__label" aria-hidden="true">
                        {m.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              <HiddenNote text={thousandNights.hiddenNote} side="bottom" className="ch05-note ch05-note--stage" />
            </div>

            <div className="ch05-card">
              <div ref={bodyRef} id={cardId} className="ch05-card__body" aria-live="polite">
                {current ? (
                  <>
                    <p className="t-eyebrow ch05-card__title">{current.title}</p>
                    <p className="t-lead ch05-card__text">{current.text}</p>
                  </>
                ) : (
                  <p className="t-lead ch05-card__hint">{thousandNights.instruction}</p>
                )}
              </div>
              <div className="ch05-card__controls">
                <button type="button" className="ch05-card__btn" onClick={() => step(-1)}>
                  <ChevronLeft aria-hidden="true" />
                  <span>{ui.previous}</span>
                </button>
                <span className="ch05-card__count" aria-hidden="true">
                  {selected === null ? '' : `${selected + 1} / ${count}`}
                </span>
                <button type="button" className="ch05-card__btn" onClick={() => step(1)}>
                  <span>{ui.next}</span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ch05-vwrap">
            <div className="ch05-vtop">
              <span className="ch05-vseg ch05-vseg--from-screen" aria-hidden="true" />
              <LaptopIcon className="ch05-vlaptop" />
              <Moon className="ch05-moon--phone" />
              <HiddenNote text={thousandNights.hiddenNote} side="left" className="ch05-note ch05-note--phone" />
            </div>
            <p className="ch05-vhint">
              <span className="ch05-vseg" aria-hidden="true" />
              {thousandNights.instruction}
            </p>
            <ol className="ch05-vlist" role="list" aria-label={ui.constellationLabel}>
              {memories.map((m, i) => {
                const open = selected === i;
                return (
                  <li key={m.title} className="ch05-vitem">
                    <span className="ch05-vseg" aria-hidden="true" />
                    <button
                      id={mobileStarId(i)}
                      type="button"
                      className="ch05-vstar"
                      aria-expanded={open}
                      aria-controls={panelId(i)}
                      onClick={() => toggleMobile(i)}
                    >
                      <span className="ch05-vstar__mark" aria-hidden="true">
                        <span className="ch05-star__halo" />
                        <StarGlyph className="ch05-vstar__glyph" />
                      </span>
                      <span className="ch05-vstar__title">{m.title}</span>
                      <ChevronDown className="ch05-vstar__chev" aria-hidden="true" />
                    </button>
                    <div id={panelId(i)} className="ch05-vpanel" hidden={!open}>
                      <p className="t-lead">{m.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="ch05-keyline">
          {sentences.map((s, i) => (
            <SplitReveal
              key={s}
              text={s}
              by="lines"
              className={`keyline keyline--large ch05-keyline__line ${
                i === sentences.length - 1 && sentences.length > 1 ? 'ch05-keyline__line--last' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </ChapterSection>
  );
}
