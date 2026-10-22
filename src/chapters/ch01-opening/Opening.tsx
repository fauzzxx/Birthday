import { useId, useRef } from 'react';
import { useAudio } from '../../audio/AudioContext';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { DustField } from '../../components/atmosphere/DustField';
import { opening } from '../../content/story';
import { emit, on } from '../../lib/events';
import { gsap, SplitText } from '../../lib/gsap';
import { scrollToChapter } from '../../lib/navigation';
import { useScene } from '../../lib/scene';
import { usePointerDepth } from '../../lib/usePointer';
import './opening.css';

/**
 * Chapter 01 — Before the world knew me. The cinematic opening.
 *
 * Pure darkness. A single bead of warm light (the same bead that later travels
 * down the golden thread) appears at the centre, stretches into a hairline of
 * gold like light under a door, and blooms into a warm glow while dust begins
 * to drift. Then, quietly: the title, the line, the invitation, and a short
 * gold line at the bottom where the thread begins.
 *
 * Any input during the intro jumps straight to the end. Scrolling away lifts
 * the words and lets the glow warm, then dim into the night of chapter 02.
 * Reduced motion: everything is simply there.
 */

/** Inputs that mean "I'm here, show me everything" while the intro plays. */
const SKIP_EVENTS = ['wheel', 'touchmove', 'keydown', 'click'] as const;

/** The last two words of the headline are set in italic gold. */
function splitTail(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length < 5) return [text, ''];
  return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')];
}

export function Opening() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const mastheadRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  /** The intro plays once; a later re-setup (e.g. resizing across 900px) starts at the end. */
  const playedRef = useRef(false);

  const hintId = useId();
  const { soundOn, setSoundOn, begin, started, play, pause } = useAudio();
  const [lead, tail] = splitTail(opening.headline);

  usePointerDepth(rootRef);

  useScene(rootRef, ({ reduce }) => {
    if (reduce) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    const glow = glowRef.current;
    const core = coreRef.current;
    const warm = warmRef.current;
    const dust = dustRef.current;
    const bead = beadRef.current;
    const line = lineRef.current;
    const masthead = mastheadRef.current;
    const headline = headlineRef.current;
    const sub = subRef.current;
    const invite = inviteRef.current;
    const cue = cueRef.current;
    if (
      !root || !stage || !glow || !core || !warm || !dust || !bead || !line ||
      !masthead || !headline || !sub || !invite || !cue
    ) {
      return;
    }

    // ── Intro: darkness → a bead → a hairline → warm light → the words ──
    const words = SplitText.create(headline, {
      type: 'words',
      wordsClass: 'ch01-word',
      tag: 'span',
      aria: 'none', // the words stay real text in reading order
    }).words;

    let detach = () => {};
    const intro = gsap.timeline({
      delay: 0.3,
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        playedRef.current = true;
        detach();
      },
    });

    intro
      .fromTo(bead, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'sine.out' }, 0)
      .to(bead, { scale: 1.3, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.85)
      .fromTo(line, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 1.25, ease: 'expo.inOut' }, 1.45)
      .to(bead, { opacity: 0, scale: 0.5, duration: 0.8, ease: 'power2.in' }, 1.6)
      .from(core, { opacity: 0, scale: 0.55, duration: 2.4, ease: 'power2.out' }, 2.25)
      .to(line, { opacity: 0, scaleY: 9, duration: 1.4, ease: 'power2.out' }, 2.35)
      .from(dust, { opacity: 0, duration: 2.2, ease: 'power1.out' }, 2.5)
      .from(masthead.children, { opacity: 0, y: 10, duration: 1.3, stagger: 0.16 }, 2.8)
      .from(
        words,
        { opacity: 0, y: '0.3em', filter: 'blur(10px)', duration: 1.3, stagger: 0.07, clearProps: 'filter' },
        3.2,
      )
      .from(sub, { opacity: 0, y: 16, duration: 1.2 }, 4.6)
      .from(invite, { autoAlpha: 0, y: 14, duration: 1.1 }, 5.15)
      .from(cue, { autoAlpha: 0, duration: 1.1 }, 5.55);

    // Nobody waits: any input jumps to the end of the intro.
    const skip = () => {
      detach();
      if (intro.progress() < 1) intro.progress(1);
    };
    const onScroll = () => {
      if (window.scrollY > 8) skip();
    };
    const attach = () => {
      detach();
      SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { capture: true, passive: true }));
      window.addEventListener('scroll', onScroll, { passive: true });
      detach = () => {
        SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip, { capture: true }));
        window.removeEventListener('scroll', onScroll);
        detach = () => {};
      };
    };

    if (playedRef.current || window.scrollY > window.innerHeight * 0.25) intro.progress(1);
    else attach();

    // ── Scroll-out: the words lift away; the glow warms, then dims into 02's night ──
    const canvas = dust.querySelector('canvas');
    const out = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    out
      .to(stage, { y: () => -Math.round(window.innerHeight * 0.12), duration: 1 }, 0)
      .to(stage, { opacity: 0, duration: 0.7 }, 0.05)
      .to(warm, { opacity: 1, duration: 0.45 }, 0)
      .to(glow, { scale: 1.12, duration: 0.5 }, 0)
      .to(glow, { opacity: 0, duration: 0.5 }, 0.5);
    if (canvas) out.to(canvas, { opacity: 0.2, duration: 1 }, 0);

    // ── Replay from the finale: once the page is back at the top, play it again ──
    let raf = 0;
    const offReplay = on('story:replay', () => {
      cancelAnimationFrame(raf);
      const since = performance.now();
      let still = 0;
      const waitForTop = () => {
        still = window.scrollY < 4 ? still + 1 : 0;
        if (still >= 4) {
          raf = 0;
          intro.restart(true);
          attach();
          return;
        }
        // If the visitor goes somewhere else instead, let it be.
        raf = performance.now() - since < 8000 ? requestAnimationFrame(waitForTop) : 0;
      };
      raf = requestAnimationFrame(waitForTop);
    });

    return () => {
      detach();
      offReplay();
      cancelAnimationFrame(raf);
    };
  });

  const onBegin = () => {
    begin(); // must run inside the click: browsers only allow sound after a gesture
    emit('story:begin');
    scrollToChapter('the-little-boy');
  };

  const onSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    // Coming back up after the story has begun: the switch should still do what it says.
    if (started) {
      if (next) play();
      else pause();
    }
  };

  return (
    <ChapterSection number={1} flush ref={rootRef} className="ch01">
      {/* Atmosphere: warm glow, drifting dust, and the first point of light. */}
      <div className="ch01-depth ch01-depth--glow" aria-hidden="true">
        <div ref={glowRef} className="ch01-glow">
          <div ref={coreRef} className="ch01-glow__core" />
          <div ref={warmRef} className="ch01-glow__warm" />
        </div>
      </div>
      <div ref={dustRef} className="ch01-depth ch01-depth--dust" aria-hidden="true">
        <DustField mode="drift" count={40} color="255, 214, 160" size={2.1} speed={0.75} />
      </div>
      <div className="ch01-light" aria-hidden="true">
        <span ref={lineRef} className="ch01-light__line" />
        <span ref={beadRef} className="ch01-light__bead" />
      </div>

      <div ref={stageRef} className="container ch01-stage">
        <div ref={mastheadRef} className="ch01-masthead">
          <h1 className="t-eyebrow ch01-title">{opening.siteTitle}</h1>
          <p className="ch01-dedication">{opening.dedication}</p>
        </div>

        <div className="ch01-main">
          <ChapterHeading number={1} hidden />
          <p ref={headlineRef} className="t-display ch01-headline">
            {lead}
            {tail && (
              <>
                {' '}
                <span className="ch01-headline__tail">{tail}</span>
              </>
            )}
          </p>
          <p ref={subRef} className="t-lead ch01-sub">
            {opening.sub}
          </p>

          <div ref={inviteRef} className="ch01-invite">
            <div className="ch01-actions">
              <button type="button" className="btn btn--solid ch01-begin" onClick={onBegin}>
                {opening.invitation}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                aria-describedby={hintId}
                className="ch01-sound"
                onClick={onSound}
              >
                <span className="ch01-sound__track" aria-hidden="true">
                  <span className="ch01-sound__thumb" />
                </span>
                <span className="ch01-sound__label">{opening.soundLabel}</span>
              </button>
            </div>
            <p id={hintId} className="ch01-hint">
              {opening.soundHint}
            </p>
          </div>
        </div>

        <div ref={cueRef} className="ch01-cue">
          <span className="ch01-cue__text">{opening.scrollHint}</span>
          <span className="ch01-cue__line" aria-hidden="true">
            <span className="ch01-cue__bead" />
          </span>
        </div>
      </div>
    </ChapterSection>
  );
}
