import { useRef } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { HiddenNote } from '../../components/HiddenNote';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { SplitReveal } from '../../components/Reveal';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { littleBoy } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useScene } from '../../lib/scene';
import { usePointerDepth } from '../../lib/usePointer';
import './little-boy.css';

/**
 * Chapter 02 — The little boy who needed you.
 *
 * A child's room at night. In the dark, a lamp switches on: a warm pool of
 * light opens behind the old family portrait and its circle grows until the
 * whole photograph is there (scrubbed on desktop, played once on phones). On
 * a mouse, the light leans a little toward the cursor. Beside it the nights
 * are told plainly, and the things she did light up one by one, like small
 * lamps along a cord. Then the key line, on its own.
 * Reduced motion: no mask, the room is simply lit.
 */
export function LittleBoy() {
  const rootRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const careRef = useRef<HTMLUListElement>(null);
  const cordRef = useRef<HTMLSpanElement>(null);
  const withPhoto = photoSlotVisible(littleBoy.photo);

  usePointerDepth(rootRef, withPhoto);

  useScene(
    rootRef,
    ({ reduce, desktop }) => {
      if (reduce) return;
      const cleanups: (() => void)[] = [];

      // ── The lamp: darkness, then a circle of warm light that reveals the portrait ──
      const photo = photoRef.current;
      const print = printRef.current;
      const pool = poolRef.current;
      if (photo && print && pool) {
        const setLamp = (lit: boolean) => {
          // Fully lit → drop the mask entirely (no repaint on pointer moves).
          print.dataset.lamp = lit ? 'full' : 'dim';
        };
        setLamp(false);
        cleanups.push(() => {
          delete print.dataset.lamp;
        });

        if (desktop) {
          const lamp: gsap.core.Timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: print, start: 'top 85%', end: 'center 42%', scrub: 0.8 },
            onUpdate: () => setLamp(lamp.progress() >= 0.999),
          });
          lamp
            .fromTo(pool, { opacity: 0, scale: 0.45 }, { opacity: 1, scale: 1, duration: 0.8 }, 0)
            .fromTo(print, { '--r': '-32%' }, { '--r': '105%', duration: 1, ease: 'power1.in' }, 0);
        } else {
          gsap
            .timeline({
              scrollTrigger: { trigger: print, start: 'top 78%' },
              onComplete: () => setLamp(true),
            })
            .fromTo(pool, { opacity: 0, scale: 0.45 }, { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
            .fromTo(print, { '--r': '-32%' }, { '--r': '105%', duration: 2.6, ease: 'power2.inOut' }, 0.15);
        }

        // Gentle parallax of the whole print, so the photograph itself is never cropped.
        const drift = desktop ? 4 : 2.5;
        gsap.fromTo(
          photo,
          { yPercent: -drift },
          {
            yPercent: drift,
            ease: 'none',
            scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      }

      // ── The nights, told plainly ──
      const beats = beatsRef.current ? Array.from(beatsRef.current.children) : [];
      if (beats.length) {
        gsap.from(beats, {
          opacity: 0,
          y: 24,
          duration: 1.4,
          stagger: 0.45,
          scrollTrigger: { trigger: beatsRef.current, start: 'top 80%' },
        });
      }

      // ── What she did: each line lights up like a small lamp ──
      const care = careRef.current;
      const lines = care ? Array.from(care.querySelectorAll<HTMLElement>('.ch02-care__line')) : [];
      if (care && lines.length) {
        const lightUp = gsap.timeline({
          scrollTrigger: desktop
            ? { trigger: care, start: 'top 76%', end: 'bottom 54%', scrub: 0.8 }
            : { trigger: care, start: 'top 82%' },
        });
        lines.forEach((line, i) => {
          lightUp.from(
            line,
            { '--lit': 0, duration: desktop ? 1 : 0.9, ease: desktop ? 'none' : 'power2.out' },
            i * (desktop ? 1 : 0.55),
          );
        });
      }

      // ── A short cord of light before the key line ──
      const cord = cordRef.current;
      if (cord) {
        gsap.from(cord, {
          scaleY: 0,
          transformOrigin: '50% 0%',
          duration: 1.6,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: cord, start: 'top 85%' },
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    [withPhoto],
  );

  return (
    <ChapterSection number={2} ref={rootRef} className="ch02">
      <div className={`container ch02-grid${withPhoto ? '' : ' ch02-grid--solo'}`}>
        <ChapterHeading number={2} className="ch02-head" />

        {withPhoto && (
          <div ref={photoRef} className="ch02-photo">
            <div ref={poolRef} className="ch02-pool" aria-hidden="true">
              <LightLeak tone="lamp" position="center" intensity={0.55} />
            </div>
            <div ref={printRef} className="ch02-print">
              <Photo
                id={littleBoy.photo}
                frame="print"
                tone="vintage"
                caption
                openable
                tilt={-1}
                sizes="(min-width: 1400px) 680px, (min-width: 900px) 52vw, 92vw"
              />
            </div>
            <HiddenNote text={littleBoy.hiddenNote} side="right" className="ch02-note" />
          </div>
        )}

        <div className="ch02-text">
          <div ref={beatsRef} className="ch02-beats">
            {littleBoy.beats.map((beat) => (
              <p key={beat} className="t-lead ch02-beat">
                {beat}
              </p>
            ))}
          </div>

          <ul ref={careRef} role="list" className="ch02-care">
            {littleBoy.care.map((line) => (
              <li key={line} className="ch02-care__line">
                <span className="ch02-care__lamp" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="ch02-key">
          <span ref={cordRef} className="ch02-key__cord" aria-hidden="true" />
          <SplitReveal text={littleBoy.keyLine} by="lines" className="keyline keyline--large ch02-keyline" />
        </div>
      </div>
    </ChapterSection>
  );
}
