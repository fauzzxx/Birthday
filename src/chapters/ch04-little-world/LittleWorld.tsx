import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { HiddenNote } from '../../components/HiddenNote';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { SplitReveal } from '../../components/Reveal';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import type { PhotoId } from '../../content/photos';
import { littleWorld } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import { usePointerDepth } from '../../lib/usePointer';
import { Antenna, Meal, Steam } from './art';
import './little-world.css';

/**
 * Chapter 04 — Our little world.
 *
 * Childhood evenings at home: an old wooden television on a low cabinet, the
 * lamp's amber on one side and the screen's cool blue spilling into the room,
 * a warm bowl beside it, family prints on the wall. The screen plays an
 * original, abstract chase — a big soft shape after a small quick one, with
 * squash and stretch, scanlines and a gentle flicker — that evokes cartoons
 * without drawing any.
 *
 * The TV switches itself on (CRT line expanding) the first time it scrolls
 * into view; a knob button turns it off and on again. The loop only runs while
 * the set is on AND on screen. Reduced motion: the TV is on, a still frame,
 * no flicker, steam at rest.
 */

/* ── CRT power transitions ───────────────────────────────────────────── */

function powerOn(content: HTMLElement, flash: HTMLElement) {
  const tl = gsap.timeline();
  tl.fromTo(
    content,
    { autoAlpha: 1, scaleX: 0.03, scaleY: 0.012, filter: 'brightness(2.6)' },
    { scaleX: 1, duration: 0.22, ease: 'power2.out' },
  )
    .to(content, { scaleY: 1, duration: 0.5, ease: 'expo.out' })
    .to(content, { filter: 'brightness(1)', duration: 0.8, ease: 'power2.out' }, '<0.05');
  tl.fromTo(
    flash,
    { autoAlpha: 0, scaleX: 0.03, scaleY: 1 },
    { autoAlpha: 1, scaleX: 1, duration: 0.22, ease: 'power2.out' },
    0,
  ).to(flash, { autoAlpha: 0, scaleY: 8, duration: 0.45, ease: 'power2.out' }, 0.22);
  return tl;
}

function powerOff(content: HTMLElement, flash: HTMLElement) {
  const tl = gsap.timeline();
  tl.fromTo(
    content,
    { autoAlpha: 1, scaleX: 1, scaleY: 1, filter: 'brightness(1)' },
    { scaleY: 0.012, filter: 'brightness(2.6)', duration: 0.2, ease: 'power3.in' },
  )
    .to(content, { scaleX: 0, duration: 0.16, ease: 'power2.in' })
    .set(content, { autoAlpha: 0 });
  // The picture collapses to a bright line, then a dot, then the glass is dark.
  tl.fromTo(flash, { autoAlpha: 0, scaleX: 1, scaleY: 1 }, { autoAlpha: 1, duration: 0.1 }, 0.12)
    .to(flash, { scaleX: 0.015, duration: 0.16, ease: 'power2.in' }, 0.2)
    .to(flash, { autoAlpha: 0, duration: 0.55, ease: 'power1.out' }, 0.38);
  return tl;
}

/* ── A framed print on the wall ──────────────────────────────────────── */

interface WallFrameProps {
  id: PhotoId;
  slot: 'a' | 'b' | 'c';
  tilt: number;
  /** Pointer parallax strength in px (desktop, fine pointer only). */
  depth: number;
  sizes: string;
}

function WallFrame({ id, slot, tilt, depth, sizes }: WallFrameProps) {
  return (
    <div className={`ch04-frame ch04-frame--${slot}`} style={{ ['--depth' as string]: depth } as CSSProperties}>
      <div className="ch04-frame__inner">
        <div className="ch04-frame__hang" style={{ ['--tilt' as string]: `${tilt}deg` } as CSSProperties}>
          <svg className="ch04-frame__string" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M10 24 L50 2 L90 24" />
          </svg>
          <span className="ch04-frame__nail" aria-hidden="true" />
          <div className="ch04-frame__wood">
            <Photo id={id} frame="print" tone="warm" openable sizes={sizes} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────── */

export function LittleWorld() {
  const root = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  // Reduced motion: the set is simply on. Otherwise it waits to be seen.
  const [on, setOn] = useState(prefersReducedMotion);
  const [inView, setInView] = useState(false);
  const touched = useRef(false);
  const shown = useRef(on);

  usePointerDepth(sceneRef);

  // Track visibility (to pause the loops) and switch the TV on, once, by itself.
  useEffect(() => {
    const tv = tvRef.current;
    if (!tv) return;
    let armed = true;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (armed && entry.intersectionRatio >= 0.5) {
          armed = false;
          timer = window.setTimeout(() => {
            if (!touched.current) setOn(true);
          }, 450);
        }
      },
      { threshold: [0, 0.5] },
    );
    io.observe(tv);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Play the CRT transition whenever the state changes (instant for reduced motion).
  useLayoutEffect(() => {
    if (shown.current === on) return;
    shown.current = on;
    const content = contentRef.current;
    const flash = flashRef.current;
    if (!content || !flash || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (on) powerOn(content, flash);
      else powerOff(content, flash);
    });
    return () => ctx.revert();
  }, [on]);

  useScene(root, ({ reduce, desktop }) => {
    const el = root.current;
    const scene = sceneRef.current;
    if (reduce || !el || !scene) return;
    const all = (selector: string, scope: Element = el) => gsap.utils.toArray<HTMLElement>(selector, scope);

    const beats = all('.ch04-beat');
    if (beats.length) {
      gsap.from(beats, {
        autoAlpha: 0,
        y: 28,
        duration: 1.3,
        stagger: 0.25,
        scrollTrigger: { trigger: beats[0], start: 'top 82%' },
      });
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: scene, start: desktop ? 'top 70%' : 'top 82%' },
    });
    const furniture = all('.ch04-cabinet, .ch04-tv', scene);
    if (furniture.length) tl.from(furniture, { autoAlpha: 0, y: 34, duration: 1.2, stagger: 0.12 }, 0);
    const meal = all('.ch04-meal', scene);
    if (meal.length) tl.from(meal, { autoAlpha: 0, y: 12, duration: 1 }, 0.5);
    const controls = all('.ch04-controls', scene);
    if (controls.length) tl.from(controls, { autoAlpha: 0, y: 10, duration: 0.9 }, 0.7);

    // The prints settle onto the wall (beneath the TV on phones, so they get their own trigger).
    const frames = all('.ch04-frame__inner', scene);
    if (frames.length) {
      const vars: gsap.TweenVars = {
        autoAlpha: 0,
        y: -18,
        rotation: (i: number) => (i % 2 ? 4 : -4),
        duration: 1.3,
        stagger: 0.16,
        ease: 'power3.out',
      };
      if (desktop) tl.from(frames, vars, 0.25);
      else gsap.from(frames, { ...vars, scrollTrigger: { trigger: frames[0], start: 'top 88%' } });
    }
  });

  const toggle = () => {
    touched.current = true;
    setOn((value) => !value);
  };

  // Car ride and Ma with the little one on the wall; the home photo slot only once it exists.
  const [idA, idB, idC] = littleWorld.photos;
  const frames = [
    { id: idA, slot: 'a' as const, tilt: -3, depth: 12 },
    { id: idB, slot: 'b' as const, tilt: 2.5, depth: 9 },
    { id: idC, slot: 'c' as const, tilt: -1.5, depth: 6 },
  ].filter((f) => Boolean(f.id) && photoSlotVisible(f.id));
  const running = on && inView;

  return (
    <ChapterSection number={4} ref={root} className={`ch04 ${on ? 'ch04--on' : ''}`}>
      <LightLeak tone="lamp" position="top-left" intensity={0.5} />
      <div className="ch04-roomglow" aria-hidden="true" />

      <div className="container ch04-inner">
        <ChapterHeading number={4} />

        <div className="ch04-layout">
          <div className="ch04-text">
            {littleWorld.beats.map((beat, i) => (
              <p key={i} className={`t-lead ch04-beat ${i === 0 ? 'ch04-beat--first' : ''}`}>
                {beat}
              </p>
            ))}
          </div>

          <div className="ch04-scene" ref={sceneRef} data-visible={inView}>
            <div className="ch04-glow" aria-hidden="true" />

            <div className="ch04-wall">
              {frames.map((f) => (
                <WallFrame
                  key={f.slot}
                  id={f.id}
                  slot={f.slot}
                  tilt={f.tilt}
                  depth={f.depth}
                  sizes="(min-width: 900px) 22vw, 46vw"
                />
              ))}
            </div>

            <div className="ch04-room">
              <div className="ch04-cabinet" aria-hidden="true">
                <span className="ch04-cabinet__sheen" />
              </div>

              <div
                ref={tvRef}
                className="ch04-tv"
                data-on={on}
                role="img"
                aria-label={on ? littleWorld.tvAltOn : littleWorld.tvAltOff}
              >
                <Antenna className="ch04-tv__antenna" />
                <div className="ch04-tv__body">
                  <div className="ch04-tv__bezel">
                    <div className="ch04-screen" data-run={running}>
                      <div ref={contentRef} className="ch04-screen__content">
                        <span className="ch04-screen__floor" />
                        <span className="ch04-chase ch04-chase--big">
                          <span className="ch04-chase__lean">
                            <span className="ch04-chase__body" />
                          </span>
                        </span>
                        <span className="ch04-chase ch04-chase--small">
                          <span className="ch04-chase__lean">
                            <span className="ch04-chase__body" />
                          </span>
                        </span>
                        <span className="ch04-screen__roll" />
                        <span className="ch04-screen__scan" />
                        <span className="ch04-screen__flicker" />
                      </div>
                      <span ref={flashRef} className="ch04-screen__flash" />
                      <span className="ch04-screen__glass" />
                    </div>
                  </div>
                  <div className="ch04-tv__panel">
                    <span className="ch04-tv__knob ch04-tv__knob--power" />
                    <span className="ch04-tv__knob" />
                    <span className="ch04-tv__led" />
                    <span className="ch04-tv__grille" />
                  </div>
                </div>
                <span className="ch04-tv__feet" />
              </div>

              <div className="ch04-meal">
                <Steam className="ch04-steam" />
                <Meal className="ch04-meal__art" />
                <HiddenNote text={littleWorld.hiddenNote} side="left" className="ch04-note" />
              </div>
            </div>

            <div className="ch04-controls">
              <button type="button" className="btn ch04-power" aria-pressed={on} onClick={toggle}>
                <span className="ch04-power__knob" aria-hidden="true" />
                <span>{on ? littleWorld.tvOff : littleWorld.tvOn}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="ch04-coda">
          <span className="ornament-rule ch04-coda__rule" aria-hidden="true">
            <span />
          </span>
          <SplitReveal text={littleWorld.keyLine} by="lines" className="keyline keyline--large ch04-keyline" />
        </div>
      </div>
    </ChapterSection>
  );
}
