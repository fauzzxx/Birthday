import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Photo } from '../../components/Photo';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { chapter } from '../../content/chapters';
import { boyGrewUp } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { preferPhoto, resolvePhoto, type ResolvedPhoto } from '../../lib/photos';
import { useScene } from '../../lib/scene';
import './boy-grew-up.css';

/**
 * Chapter 09 — The boy grew up. Your love never did.
 *
 * The turning point. One print "grows up": the old studio portrait (always
 * shown whole) and a recent photograph of Ma share a single frame. The stage
 * pins while a warm film light sweeps across it, the print reshapes from the
 * old photo's landscape to the new one's portrait, the past dissolves and the
 * present comes into focus — "Then" becomes "Still". All of it is tied to the
 * scroll on every screen size; phones get a shorter pin, a one-screen stacked
 * stage (print above, words below) and no blur. Reduced motion shows the two
 * prints as a static diptych. After that the scene goes quiet — an admission,
 * the key line, a plain apology and thanks — with slow fades only.
 */
export function BoyGrewUp() {
  const root = useRef<HTMLElement>(null);
  const { morph } = boyGrewUp;

  const then = resolvePhoto(morph.from);
  const still = resolvePhoto(preferPhoto(morph.preferredTo, morph.to));
  const canMorph = then.image !== null && still.image !== null;
  const thenRatio = then.width / then.height;
  const stillRatio = still.width / still.height;
  const to = fitSquare(stillRatio);

  const title = splitTitle(chapter(9).title);
  const keyParts = sentences(boyGrewUp.keyLine);

  useScene(root, ({ reduce, desktop }) => {
    const el = root.current;
    if (reduce || !el) return;

    // Switch the stage into its single-frame layout first, so every trigger
    // below measures the final page geometry. (Desktop and phones both morph;
    // the CSS gives each its own one-screen layout.)
    const stage = el.querySelector<HTMLElement>('.ch09-morph');
    const morphing = canMorph && stage !== null;
    if (morphing && stage) stage.dataset.mode = 'morph';

    const titleLines = el.querySelectorAll('.ch09-title-line');
    if (titleLines.length) {
      gsap.from(titleLines, {
        opacity: 0,
        y: 12,
        duration: 1.8,
        stagger: 0.55,
        ease: 'power2.out',
        scrollTrigger: { trigger: titleLines[0], start: 'top 82%' },
      });
    }

    if (morphing && stage) buildMorph(stage, thenRatio, stillRatio, desktop);
    else buildSequence(el, desktop);

    // After the morph the scene is quiet: slow fades only.
    el.querySelectorAll<HTMLElement>('.ch09-fade').forEach((node) => {
      gsap.from(node, {
        opacity: 0,
        duration: 1.9,
        ease: 'power1.out',
        scrollTrigger: { trigger: node, start: 'top 86%' },
      });
    });

    return () => {
      if (stage) delete stage.dataset.mode;
    };
  });

  const morphVars = {
    '--ch09-to-w': `${to.w}%`,
    '--ch09-to-h': `${to.h}%`,
    '--ch09-cols': canMorph ? `${thenRatio}fr ${stillRatio}fr` : '1fr',
  } as CSSProperties;

  return (
    <ChapterSection number={9} ref={root} className="ch09">
      <LightLeak tone="amber" position="top-left" intensity={0.3} />
      <LightLeak tone="rose" position="bottom-right" intensity={0.16} />

      <div className="container ch09-inner">
        <ChapterHeading number={9} align="center" className="ch09-head">
          {title ? (
            <>
              <span className="ch09-title-line">{title[0]}</span>{' '}
              <span className="ch09-title-line ch09-title-line--soft">{title[1]}</span>
            </>
          ) : undefined}
        </ChapterHeading>

        <div className="ch09-morph" style={morphVars}>
          <div className="ch09-stage">
            <div className="ch09-frame">
              <Shot photo={then} label={morph.fromLabel} variant="then" sizes="(min-width: 900px) 44vw, 92vw" />
              <Shot photo={still} label={morph.toLabel} variant="still" sizes="(min-width: 900px) 36vw, 80vw" />
              {canMorph && (
                <div className="ch09-sweep" aria-hidden="true">
                  <span className="ch09-sweep-band" />
                </div>
              )}
            </div>
          </div>

          <div className="ch09-copy">
            <p className="ch09-opening">{boyGrewUp.opening}</p>
            <span className="ch09-rule" aria-hidden="true" />
            <p className="t-lead ch09-growing">{boyGrewUp.growingUp}</p>
          </div>
        </div>

        <div className="ch09-after">
          <div className="ornament-rule ch09-ornament ch09-fade" aria-hidden="true">
            <span />
          </div>
          <p className="t-lead ch09-admission ch09-fade">{boyGrewUp.admission}</p>

          <p className="keyline keyline--large ch09-keyline">
            {keyParts.map((part, i) => (
              <span key={i} className="ch09-keyline-part ch09-fade">
                {part}
                {i < keyParts.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>

          <div className="ch09-apology ch09-fade">
            <p className="ch09-apology-text">{boyGrewUp.apology}</p>
          </div>

          <div className="ch09-gratitude">
            {boyGrewUp.gratitude.map((line, i) => (
              <p key={i} className="t-lead ch09-thanks ch09-fade">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}

/* ── The morph (pinned, scrubbed — desktop and phones) ───────────────────── */

/** The largest box of this aspect ratio that fits a square stage, in % (CSS fallback for the end state). */
function fitSquare(ratio: number): { w: number; h: number } {
  return ratio >= 1 ? { w: 100, h: 100 / ratio } : { w: 100 * ratio, h: 100 };
}

/**
 * Outer size (px) of the print whose photo window has exactly `ratio`, as
 * large as `box` allows (`mat` = the paper border around the photo) — so at
 * each end of the morph its photograph is shown whole, nobody cropped.
 */
function fitPrint(ratio: number, box: { w: number; h: number }, mat: number): { w: number; h: number } {
  const innerW = Math.max(0, box.w - 2 * mat);
  const innerH = Math.max(0, box.h - 2 * mat);
  const w = Math.min(innerW, innerH * ratio);
  return { w: w + 2 * mat, h: w / ratio + 2 * mat };
}

function buildMorph(stage: HTMLElement, fromRatio: number, toRatio: number, desktop: boolean) {
  const area = stage.querySelector<HTMLElement>('.ch09-stage');
  const frame = stage.querySelector<HTMLElement>('.ch09-frame');
  const thenShot = stage.querySelector<HTMLElement>('.ch09-shot--then');
  const thenPic = stage.querySelector<HTMLElement>('.ch09-shot--then .ch09-shot-pic');
  const stillPic = stage.querySelector<HTMLElement>('.ch09-shot--still .ch09-shot-pic');
  if (!area || !frame || !thenShot || !thenPic || !stillPic) return;

  /**
   * The room the print may fill (px), re-measured on every refresh.
   * Desktop: a square stage. Phones: whatever the screen leaves beside/above
   * the words, minus the strip kept under the print for its label (the
   * stage's bottom padding — see the CSS).
   */
  const box = () => {
    if (desktop) return { w: area.clientWidth, h: area.clientWidth };
    const labelRoom = parseFloat(getComputedStyle(area).paddingBottom) || 0;
    return { w: area.clientWidth, h: area.clientHeight - labelRoom };
  };
  const print = (ratio: number) => fitPrint(ratio, box(), thenShot.offsetLeft);

  const thenLabel = stage.querySelector('.ch09-shot--then .ch09-shot-label');
  const stillLabel = stage.querySelector('.ch09-shot--still .ch09-shot-label');
  const band = stage.querySelector('.ch09-sweep-band');
  const opening = stage.querySelector('.ch09-opening');
  const rule = stage.querySelector('.ch09-rule');
  const growing = stage.querySelector('.ch09-growing');

  // Positions are fractions of the pinned scroll distance (timeline length 1).
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      // Phones: a shorter pin over a one-screen stage (fits 360×640).
      end: desktop ? '+=150%' : '+=120%',
      scrub: desktop ? 0.8 : 0.6,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Desktop scrubs the words with the pictures; phones reveal them whole (below).
  if (desktop && opening) {
    tl.fromTo(opening, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0);
  }

  // A warm film light sweeps across the print…
  if (band) {
    tl.fromTo(band, { xPercent: -110 }, { xPercent: 175, duration: 0.42, ease: 'power1.inOut' }, 0.15);
    tl.fromTo(band, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.15);
    tl.to(band, { opacity: 0, duration: 0.1 }, 0.47);
  }

  // …the print grows up: landscape → portrait, and the paper loses its age…
  tl.fromTo(
    frame,
    { width: () => print(fromRatio).w, height: () => print(fromRatio).h, backgroundColor: '#e6d5b8' },
    {
      width: () => print(toRatio).w,
      height: () => print(toRatio).h,
      backgroundColor: '#f3ebdf',
      duration: 0.5,
      ease: 'power2.inOut',
    },
    0.28,
  );

  // …the past dissolves into warm light…
  if (desktop) {
    tl.fromTo(
      thenPic,
      { opacity: 1, filter: 'sepia(0.2) saturate(0.9) blur(0px)' },
      { opacity: 0, filter: 'sepia(0.75) saturate(0.7) blur(3px)', duration: 0.32, ease: 'power1.in' },
      0.3,
    );
  } else {
    // Phones: no blur — the old print just ages a little more as it fades.
    tl.fromTo(
      thenPic,
      { opacity: 1, filter: 'sepia(0.2) saturate(0.9)' },
      { opacity: 0, filter: 'sepia(0.75) saturate(0.7)', duration: 0.32, ease: 'power1.in' },
      0.3,
    );
  }

  // …and the present comes into focus.
  if (desktop) {
    tl.fromTo(
      stillPic,
      { opacity: 0, scale: 1.06, filter: 'blur(4px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.42, ease: 'power2.out' },
      0.36,
    );
  } else {
    tl.fromTo(stillPic, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.42, ease: 'power2.out' }, 0.36);
  }

  if (thenLabel) tl.fromTo(thenLabel, { opacity: 1, y: 0 }, { opacity: 0, y: -6, duration: 0.1 }, 0.42);
  if (stillLabel) tl.fromTo(stillLabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.12 }, 0.55);
  if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: 'power2.out' }, 0.5);
  if (desktop && growing) {
    tl.fromTo(growing, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.58);
  }

  // Hold the finished frame for the last stretch of the pin.
  tl.set({}, {}, 1);

  if (desktop) return;

  /* Phones only ─────────────────────────────────────────────────────────── */

  // The print rises into place as the stage scrolls up towards its pin.
  gsap.fromTo(
    frame,
    { opacity: 0, y: 48 },
    {
      opacity: 1,
      y: 0,
      ease: 'none',
      scrollTrigger: { trigger: stage, start: 'top 90%', end: 'top 30%', scrub: 0.6 },
    },
  );

  // The two lines must be read, so they are never left half-faded mid-scrub:
  // each plays through on its own when the scroll reaches its moment in the
  // morph, and rewinds if she scrolls back above it.
  const reveal = { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' };
  if (opening) {
    gsap.fromTo(opening, { opacity: 0, y: 14 }, {
      ...reveal,
      // Just before the pin engages, while the line is on screen.
      scrollTrigger: { trigger: stage, start: 'top 15%', toggleActions: 'play none none reverse' },
    });
  }
  const pin = tl.scrollTrigger;
  if (growing && pin) {
    gsap.fromTo(growing, { opacity: 0, y: 14 }, {
      ...reveal,
      scrollTrigger: {
        trigger: stage,
        // A plain number (measured from the pin itself), so ScrollTrigger doesn't
        // push it past the pin: just after the print has become the new one.
        start: () => pin.start + (pin.end - pin.start) * 0.55,
        toggleActions: 'play none none reverse',
      },
    });
  }
}

/* ── No morph (a photograph is missing): the prints one after another ───── */

function buildSequence(el: HTMLElement, desktop: boolean) {
  const thenShot = el.querySelector('.ch09-shot--then');
  const stillShot = el.querySelector('.ch09-shot--still');

  if (desktop) {
    if (thenShot) {
      gsap.from(thenShot, {
        opacity: 0,
        y: 28,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: thenShot, start: 'top 85%' },
      });
    }

    if (stillShot) {
      const pic = stillShot.querySelector('.ch09-shot-pic');
      const label = stillShot.querySelector('.ch09-shot-label');
      const tl = gsap.timeline({ scrollTrigger: { trigger: stillShot, start: 'top 82%' } });
      tl.from(stillShot, { opacity: 0, y: 28, duration: 1.5, ease: 'power3.out' });
      if (pic) tl.from(pic, { scale: 1.06, duration: 2.2, ease: 'power2.out' }, 0);
      if (label) tl.from(label, { opacity: 0, duration: 1.1, ease: 'power1.out' }, 0.6);
    }
  } else {
    // Phones: the prints rise in with the scroll (and sink back when scrolling up).
    if (thenShot) {
      gsap.fromTo(
        thenShot,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: thenShot, start: 'top 90%', end: 'top 55%', scrub: 0.6 },
        },
      );
    }

    if (stillShot) {
      const pic = stillShot.querySelector('.ch09-shot-pic');
      const label = stillShot.querySelector('.ch09-shot-label');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: stillShot, start: 'top 90%', end: 'center 50%', scrub: 0.6 },
      });
      tl.fromTo(stillShot, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6 }, 0);
      if (pic) tl.fromTo(pic, { scale: 1.06 }, { scale: 1, duration: 1 }, 0);
      if (label) tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.55);
    }
  }

  // The words: whole-line reveals on enter (never left half-faded).
  el.querySelectorAll('.ch09-copy > *').forEach((node) => {
    gsap.from(node, {
      opacity: 0,
      y: 16,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 88%' },
    });
  });
}

/* ── One print (old or new) ──────────────────────────────────────────────── */

interface ShotProps {
  photo: ResolvedPhoto;
  label: string;
  variant: 'then' | 'still';
  sizes: string;
}

/**
 * A photograph as a print: blurred preview while loading, the real image on
 * top, a small "Then" / "Still" label. Uses the manifest's alt text. If the
 * slot has no photograph, falls back to <Photo> (placeholder in development,
 * nothing in the finished site).
 */
function Shot({ photo, label, variant, sizes }: ShotProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Cached images can finish before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  if (!photo.image) return <Photo id={photo.id} frame="none" className="ch09-shot ch09-shot--missing" />;

  const focus = photo.entry.focus ?? '50% 50%';
  return (
    <figure
      className={`ch09-shot ch09-shot--${variant}`}
      data-state={state}
      style={{ ['--ch09-ratio' as string]: String(photo.width / photo.height) }}
    >
      <div className="ch09-shot-print">
        <div className="ch09-shot-media">
          <div className="ch09-shot-pic">
            <img className="ch09-shot-lqip" src={photo.image.lqip} alt="" aria-hidden="true" decoding="async" />
            {state === 'error' ? (
              <div className="ch09-shot-error" role="img" aria-label={photo.entry.alt} />
            ) : (
              <img
                ref={imgRef}
                className="ch09-shot-img"
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={sizes}
                alt={photo.entry.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={() => setState('loaded')}
                onError={() => setState('error')}
                style={{ objectPosition: focus }}
              />
            )}
          </div>
        </div>
      </div>
      <figcaption className="t-eyebrow ch09-shot-label">{label}</figcaption>
    </figure>
  );
}

/* ── Text helpers (presentation only — the words are never changed) ─────── */

/** "The boy grew up. Your love never did." → two lines, split after the first full stop. */
function splitTitle(title: string): [string, string] | null {
  const m = title.match(/^(.+?[.!?])\s+(.+)$/);
  return m ? [m[1], m[2]] : null;
}

/** Splits a passage into its sentences so each can sit on its own line. */
function sentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["'’”]?/g)?.map((s) => s.trim()) ?? [];
  const covers = parts.join('').replace(/\s+/g, '') === text.replace(/\s+/g, '');
  return parts.length > 1 && covers ? parts : [text];
}
