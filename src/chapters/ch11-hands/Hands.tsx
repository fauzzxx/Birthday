import { useEffect, useRef, type RefObject } from 'react';
import { Botanical } from '../../components/Botanical';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { DustField } from '../../components/atmosphere/DustField';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { hands } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useScene } from '../../lib/scene';
import { LightPassage } from './LightPassage';
import './hands.css';

/** A sentence settling into place, slowly, as it rises into view. */
function settle(target: Element, delay: number) {
  gsap.fromTo(
    target,
    { opacity: 0, y: 12, filter: 'blur(3px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 2.4,
      delay,
      ease: 'power2.out',
      clearProps: 'filter,transform',
      scrollTrigger: { trigger: target, start: 'top 80%' },
    },
  );
}

/**
 * Chapter 11 — THE HANDS I WANT TO TAKE CARE OF NOW.
 * A dark, warm room at the end of the day: one lamp above, a little drifting
 * dust, a sprig of jasmine. Her hands, small and close, in an oval of lamplight;
 * the quiet bedtime memory beside them. Then two soft lights joined by a golden
 * filament pass the light from her to him and, with the key line, back again.
 * Almost no movement — only slow fades and that one exchange of light.
 */
export function Hands() {
  const root = useRef<HTMLElement>(null);
  const showPhoto = photoSlotVisible(hands.photo);
  usePauseOffscreen(root);

  useScene(root, ({ reduce }) => {
    const el = root.current;
    if (reduce || !el) return;

    const head = el.querySelector('.chapter__head');
    if (head) {
      gsap.from(head, { opacity: 0, duration: 2, ease: 'power1.out', scrollTrigger: { trigger: head, start: 'top 85%' } });
    }

    const intro = el.querySelector('.ch11-intro');
    const cameo = el.querySelector('.ch11-cameo');
    if (intro && cameo) {
      gsap.from(cameo, {
        opacity: 0,
        scale: 0.97,
        duration: 2.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: intro, start: 'top 78%' },
      });
    }

    // The memory beside her hands, one sentence after the other; later, the promise.
    el.querySelectorAll('.ch11-memory > p').forEach((line, i) => settle(line, 0.4 + i * 0.7));
    const promise = el.querySelector('.ch11-promise');
    if (promise) settle(promise, 0);
  });

  return (
    <ChapterSection number={11} ref={root} className="ch11">
      <div className="ch11-room" aria-hidden="true">
        <div className="ch11-room__view">
          <LightLeak tone="lamp" position="top" intensity={0.6} />
          <DustField count={18} color="255, 210, 150" size={2} speed={0.55} />
        </div>
      </div>

      <div className="container ch11-inner">
        <ChapterHeading number={11} align="center" />

        <div className={`ch11-intro${showPhoto ? '' : ' ch11-intro--solo'}`}>
          {showPhoto && (
            <div className="ch11-cameo">
              <Botanical variant="jasmine" seed={4} draw className="ch11-jasmine" />
              <Photo
                id={hands.photo}
                frame="oval"
                tone="warm"
                caption
                aspect={0.9}
                focus="45% 52%"
                sizes="(min-width: 900px) 280px, 64vw"
                className="ch11-photo"
              />
            </div>
          )}

          <div className="ch11-memory">
            {hands.memory.map((line) => (
              <p key={line} className="t-lead">
                {line}
              </p>
            ))}
          </div>
        </div>

        <LightPassage>
          <p className="keyline keyline--large ch11-keyline">{hands.keyLine}</p>
        </LightPassage>

        <p className="t-lead ch11-promise">{hands.promise}</p>
      </div>
    </ChapterSection>
  );
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
