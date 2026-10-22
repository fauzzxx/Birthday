import { useRef, type CSSProperties } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { HiddenNote } from '../../components/HiddenNote';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { firstTeacher } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useScene } from '../../lib/scene';
import { CheckBox, PaperClip, Pencil } from './art';
import './first-teacher.css';

/**
 * Chapter 03 — My first teacher was you.
 *
 * "My first classroom was home." A child's school notebook lies on the desk.
 * On desktop the scene pins: the burgundy cloth cover swings open to show Ma's
 * photo clipped inside it; a pencil passes over the practice letters, which
 * start shaky and settle into clear handwriting; it writes the key line on
 * the next ruled lines; then the margin boxes are ticked, one by one, in a
 * teacher's red. Learning, made visible.
 *
 * Mobile shows the notebook already open and plays a short version once on
 * enter. Reduced motion shows the finished page: clean letters, key line
 * written, every box ticked.
 */

/* ── Static content derived from the story ───────────────────────────── */

type PracticeToken = { kind: 'glyph'; char: string; index: number } | { kind: 'gap'; size: number };

/** "a  b  c" → glyphs and the (sized) gaps between them, so the spacing is kept. */
function practiceTokens(text: string): PracticeToken[] {
  const tokens: PracticeToken[] = [];
  let index = 0;
  for (const part of text.match(/\s+|\S/g) ?? []) {
    if (/\s/.test(part)) tokens.push({ kind: 'gap', size: part.length });
    else tokens.push({ kind: 'glyph', char: part, index: index++ });
  }
  return tokens;
}

/** Random-but-stable number in [-1, 1] for a given letter. */
function stable(i: number, salt: number) {
  const s = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

const PRACTICE = practiceTokens(firstTeacher.practice);
const GLYPH_COUNT = PRACTICE.filter((t) => t.kind === 'glyph').length;
/** The shaky first attempt of each letter: ±7–16° and ±7px. */
const WOBBLE = Array.from({ length: GLYPH_COUNT }, (_, i) => {
  const r = stable(i, 1);
  return { rotation: Math.sign(r || 1) * (7 + Math.abs(r) * 9), y: stable(i, 2) * 7 };
});
const SHAKY_BLUR = 'blur(1.6px)';
const SHAKY_ALPHA = 0.38;

/** The key line, one sentence per ruled line. */
const KEY_ROWS = firstTeacher.keyLine.split(/(?<=[.!?])\s+/).filter(Boolean);

/* ── Pencil choreography ─────────────────────────────────────────────── */

const WRITE_ANGLE = -52;
const REST_ANGLE = -24; // matches .ch03-pencil in CSS

type Getter = () => number;
interface Waypoint {
  x: Getter;
  y: Getter;
  rotation: number;
}

interface Rig {
  book: HTMLElement;
  pencil: HTMLElement;
  glyphs: HTMLElement[];
  guides: HTMLElement[];
  inks: HTMLElement[];
  rows: HTMLElement[];
  checks: HTMLElement[];
  boxes: HTMLElement[];
  ticks: SVGPathElement[];
  note: HTMLElement | null;
}

/** Layout position of `el` inside `ancestor` (ignores transforms, so wobbling letters measure true). */
function offsetIn(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * Pencil waypoints, as functions so ScrollTrigger can re-measure on resize.
 * The pencil's graphite tip sits at its left-middle; x/y move that tip away
 * from its resting place (set in CSS) to a point on the page.
 */
function waypoints(rig: Rig) {
  const { book, pencil } = rig;
  const tipX = () => pencil.offsetLeft;
  const tipY = () => pencil.offsetTop + pencil.offsetHeight / 2;
  const point = (fx: Getter, fy: Getter, rotation = WRITE_ANGLE): Waypoint => ({
    x: () => fx() - tipX(),
    y: () => fy() - tipY(),
    rotation,
  });
  const m = (el: HTMLElement) => offsetIn(el, book);
  return {
    rest: { x: () => 0, y: () => 0, rotation: REST_ANGLE } as Waypoint,
    /** Lying on the desk beside the closed notebook. */
    desk: point(() => book.offsetWidth * 1.07, () => book.offsetHeight * 0.26, 78),
    /** Lifted over the page while the cover opens. */
    lift: point(() => book.offsetWidth * 0.62, () => book.offsetHeight * 0.1, -38),
    glyph: (i: number) =>
      point(
        () => { const b = m(rig.glyphs[i]); return b.x + b.w * 0.55; },
        () => { const b = m(rig.glyphs[i]); return b.y + b.h * 0.8; },
      ),
    rowStart: (j: number) =>
      point(
        () => m(rig.rows[j]).x,
        () => { const b = m(rig.rows[j]); return b.y + b.h * 0.66; },
      ),
    rowEnd: (j: number) =>
      point(
        () => { const b = m(rig.rows[j]); return b.x + b.w; },
        () => { const b = m(rig.rows[j]); return b.y + b.h * 0.62; },
      ),
    tickStart: (n: number) =>
      point(
        () => { const b = m(rig.boxes[n]); return b.x + b.w * 0.32; },
        () => { const b = m(rig.boxes[n]); return b.y + b.h * 0.52; },
      ),
    tickEnd: (n: number) =>
      point(
        () => { const b = m(rig.boxes[n]); return b.x + b.w * 0.95; },
        () => { const b = m(rig.boxes[n]); return b.y - b.h * 0.05; },
      ),
  };
}

/**
 * The writing itself — shared by the pinned desktop scrub and the mobile
 * on-enter timeline. `k` scales every duration. Every tween is a fromTo, so the
 * scrub stays exact when scrolled backwards or re-measured.
 */
function writePage(tl: gsap.core.Timeline, rig: Rig, opts: { from: Waypoint; at: number; k: number }) {
  const { k } = opts;
  const wp = waypoints(rig);
  let t = opts.at;
  let prev = opts.from;
  let first = true;

  const move = (to: Waypoint, duration: number, ease = 'power1.inOut') => {
    tl.fromTo(
      rig.pencil,
      { x: prev.x, y: prev.y, rotation: prev.rotation },
      { x: to.x, y: to.y, rotation: to.rotation, duration: duration * k, ease, immediateRender: first },
      t,
    );
    first = false;
    prev = to;
    t += duration * k;
  };

  // 1 — dotted tracing guides, then the first, shaky attempt at each letter.
  if (rig.guides.length) {
    tl.fromTo(rig.guides, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 * k, stagger: 0.07 * k, ease: 'power1.out' }, t);
  }
  if (rig.inks.length) {
    tl.fromTo(
      rig.inks,
      {
        autoAlpha: 0,
        rotation: (i: number) => WOBBLE[i]?.rotation ?? 0,
        y: (i: number) => WOBBLE[i]?.y ?? 0,
        filter: SHAKY_BLUR,
      },
      { autoAlpha: SHAKY_ALPHA, duration: 0.45 * k, stagger: 0.08 * k, ease: 'power1.out' },
      t + 0.35 * k,
    );
  }

  // 2 — the pencil goes over each letter, and each one settles: clear and straight.
  rig.inks.forEach((ink, i) => {
    move(wp.glyph(i), i === 0 ? 0.8 : 0.42);
    tl.fromTo(
      ink,
      { autoAlpha: SHAKY_ALPHA, rotation: WOBBLE[i]?.rotation ?? 0, y: WOBBLE[i]?.y ?? 0, filter: SHAKY_BLUR },
      { autoAlpha: 1, rotation: 0, y: 0, filter: 'blur(0px)', duration: 0.55 * k, ease: 'power2.out', immediateRender: false },
      t - 0.22 * k,
    );
  });

  // 3 — the key line is written, left to right, one ruled line at a time.
  rig.rows.forEach((row, j) => {
    move(wp.rowStart(j), j === 0 ? 0.5 : 0.32, 'power2.inOut');
    const duration = j === 0 ? 1.3 : 1.1;
    tl.fromTo(
      row,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: duration * k, ease: 'none' },
      t,
    );
    move(wp.rowEnd(j), duration, 'none');
  });

  // 4 — the margin list appears; each box gets its tick.
  if (rig.checks.length) {
    tl.fromTo(rig.checks, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5 * k, stagger: 0.1 * k, ease: 'power2.out' }, t);
  }
  rig.ticks.forEach((tick, n) => {
    if (!rig.boxes[n]) return;
    move(wp.tickStart(n), n === 0 ? 0.55 : 0.3, 'power2.inOut');
    tl.fromTo(tick, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.38 * k, ease: 'power1.in' }, t);
    move(wp.tickEnd(n), 0.38, 'power1.in');
  });

  // 5 — the little note becomes findable; the pencil is set down.
  if (rig.note) tl.fromTo(rig.note, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 * k }, t);
  move(wp.rest, 0.7, 'power2.inOut');
  return t;
}

/* ── Component ───────────────────────────────────────────────────────── */

export function FirstTeacher() {
  const root = useRef<HTMLElement>(null);
  const showPortrait = photoSlotVisible(firstTeacher.photo);
  const showSchool = photoSlotVisible(firstTeacher.schoolPhoto);

  useScene(root, ({ reduce, desktop }) => {
    const el = root.current;
    if (reduce || !el) return;

    const all = <T extends Element = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, el);
    const scene = el.querySelector<HTMLElement>('.ch03-scene');
    const stage = el.querySelector<HTMLElement>('.ch03-stage');
    const book = el.querySelector<HTMLElement>('.ch03-book');
    const pencil = el.querySelector<HTMLElement>('.ch03-pencil');
    if (!scene || !stage || !book || !pencil) return;

    const rig: Rig = {
      book,
      pencil,
      glyphs: all('.ch03-glyph'),
      guides: all('.ch03-glyph__guide'),
      inks: all('.ch03-glyph__ink'),
      rows: all('.ch03-keyline__row'),
      checks: all('.ch03-check'),
      boxes: all('.ch03-check__box'),
      ticks: all<SVGPathElement>('.ch03-check__tick'),
      note: el.querySelector<HTMLElement>('.ch03-note'),
    };
    const prints = all('.ch03-print');

    // The story column arrives gently, on both layouts.
    const words = all('.ch03-text > *');
    if (words.length) {
      gsap.from(words, {
        autoAlpha: 0,
        y: 26,
        duration: 1.3,
        stagger: 0.16,
        scrollTrigger: { trigger: words[0], start: 'top 82%' },
      });
    }

    if (desktop) {
      const cover = el.querySelector<HTMLElement>('.ch03-cover');
      const frontShade = el.querySelector<HTMLElement>('.ch03-cover__front .ch03-cover__shade');
      const backShade = el.querySelector<HTMLElement>('.ch03-cover__back .ch03-cover__shade');
      const pageShade = el.querySelector<HTMLElement>('.ch03-page__shade');

      // Wide screens pin the text and notebook together; narrower ones stack
      // the text above, so only the notebook stage pins.
      const layout = gsap.matchMedia();
      layout.add({ wide: '(min-width: 1180px)', narrow: '(max-width: 1179.98px)' }, (context) => {
        const { wide } = context.conditions as { wide: boolean };
        const wp = waypoints(rig);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: wide ? scene : stage,
            start: 'center center',
            end: '+=150%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // The cover swings open on its spine; the closed book slides to make room.
        tl.fromTo(book, { xPercent: -50 }, { xPercent: 0, duration: 2, ease: 'power2.inOut' }, 0);
        if (cover) {
          tl.fromTo(cover, { '--ch03-open': '0deg' }, { '--ch03-open': '-174deg', duration: 2, ease: 'power2.inOut' }, 0);
        }
        if (frontShade) tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.6, duration: 1, ease: 'power1.in' }, 0);
        if (backShade) tl.fromTo(backShade, { opacity: 0.55 }, { opacity: 0, duration: 1, ease: 'power1.out' }, 1);
        if (pageShade) tl.fromTo(pageShade, { opacity: 0.75 }, { opacity: 0, duration: 1.5, ease: 'power2.out' }, 0.5);

        // Her photo, clipped inside the cover.
        if (prints.length) {
          tl.fromTo(
            prints,
            { autoAlpha: 0, y: -28, rotation: -5, scale: 1.04 },
            { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 0.8, stagger: 0.25, ease: 'power2.out' },
            1.75,
          );
        }

        // The pencil is picked up from the desk while the cover opens…
        tl.fromTo(
          pencil,
          { x: wp.desk.x, y: wp.desk.y, rotation: wp.desk.rotation },
          { x: wp.lift.x, y: wp.lift.y, rotation: wp.lift.rotation, duration: 1.4, ease: 'power1.inOut' },
          0.5,
        );
        // …and the lesson begins.
        writePage(tl, rig, { from: wp.lift, at: 1.9, k: 1 });
      });
      return () => layout.revert();
    }

    // Mobile: the notebook is already open. One short lesson when it arrives.
    if (prints.length) {
      gsap.fromTo(
        prints,
        { autoAlpha: 0, y: 24, rotation: -5 },
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 1.1,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: { trigger: prints[0], start: 'top 85%' },
        },
      );
    }
    const tl = gsap.timeline({ scrollTrigger: { trigger: book, start: 'top 72%', once: true } });
    writePage(tl, rig, { from: waypoints(rig).rest, at: 0, k: 0.62 });
  });

  return (
    <ChapterSection number={3} ref={root} className="ch03">
      <LightLeak tone="gold" position="top-left" intensity={0.34} />

      <div className="container ch03-inner">
        <ChapterHeading number={3} />

        <div className="ch03-scene">
          <div className="ch03-text">
            <p className="t-lead ch03-intro">{firstTeacher.intro}</p>
            {firstTeacher.story.map((paragraph, i) => (
              <p key={i} className={`t-lead ch03-beat ${i === firstTeacher.story.length - 1 ? 'ch03-beat--last' : ''}`}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="ch03-stage">
            {(showPortrait || showSchool) && (
              <div className={`ch03-prints ${showPortrait && showSchool ? 'ch03-prints--two' : ''}`}>
                {showPortrait && (
                  <div className="ch03-print ch03-print--portrait">
                    <div className="ch03-print__tilt">
                      <Photo
                        id={firstTeacher.photo}
                        frame="polaroid"
                        caption
                        captionStyle="hand"
                        aspect={4 / 5}
                        focus="48% 56%"
                        openable
                        sizes="(min-width: 900px) 16rem, 60vw"
                      />
                      <PaperClip className="ch03-clip" />
                    </div>
                  </div>
                )}
                {showSchool && (
                  <div className="ch03-print ch03-print--school">
                    <div className="ch03-print__tilt">
                      <Photo id={firstTeacher.schoolPhoto} frame="print" aspect={4 / 3} openable sizes="(min-width: 900px) 14rem, 46vw" />
                      <span className="ch03-tape" aria-hidden="true" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="ch03-book">
              <div className="ch03-page">
                <span className="ch03-page__rules" aria-hidden="true" />
                <span className="ch03-page__margin" aria-hidden="true" />
                <span className="ch03-page__gutter" aria-hidden="true" />

                <p className="ch03-row ch03-practice">
                  <span className="visually-hidden">{firstTeacher.practice}</span>
                  <span aria-hidden="true">
                    {PRACTICE.map((token, i) =>
                      token.kind === 'gap' ? (
                        <span key={i} className="ch03-gap" style={{ ['--n' as string]: token.size } as CSSProperties} />
                      ) : (
                        <span key={i} className="ch03-glyph">
                          <span className="ch03-glyph__guide">{token.char}</span>
                          <span className="ch03-glyph__ink">{token.char}</span>
                        </span>
                      ),
                    )}
                  </span>
                </p>

                <p className="ch03-row ch03-keyline">
                  {KEY_ROWS.map((row, i) => (
                    <span key={i} className="ch03-keyline__row">
                      {row}
                      {i < KEY_ROWS.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>

                <ul className="ch03-checklist" role="list" aria-label={firstTeacher.checklistLabel}>
                  {firstTeacher.checklist.map((item) => (
                    <li key={item} className="ch03-check">
                      <span className="ch03-check__box" aria-hidden="true">
                        <CheckBox />
                      </span>
                      <span className="ch03-check__label">{item}</span>
                    </li>
                  ))}
                </ul>

                <span className="ch03-page__shade" aria-hidden="true" />
                <HiddenNote text={firstTeacher.hiddenNote} side="right" className="ch03-note" />
              </div>

              <div className="ch03-cover" aria-hidden="true">
                <div className="ch03-cover__face ch03-cover__front">
                  <span className="ch03-label">
                    <span className="ch03-label__line" />
                    <span className="ch03-label__line" />
                    <span className="ch03-label__line" />
                  </span>
                  <span className="ch03-cover__shade" />
                </div>
                <div className="ch03-cover__face ch03-cover__back">
                  <span className="ch03-cover__shade" />
                </div>
              </div>

              <Pencil className="ch03-pencil" />
            </div>
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
