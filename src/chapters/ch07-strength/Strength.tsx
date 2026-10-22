import { useEffect, useRef, type RefObject } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { strength } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useScene } from '../../lib/scene';
import './strength.css';

/** The first lines stand alone in the column; her portrait joins beside the rest. */
const ALONE = 3;

const HIDDEN: gsap.TweenVars = { opacity: 0, y: 12, filter: 'blur(3px)' };
const SHOWN: gsap.TweenVars = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  ease: 'power2.out',
  clearProps: 'filter,transform',
};

/** A sentence settling into place, slowly, when it reaches three-quarters of the screen. */
function settle(target: Element, { duration = 2.4, start = 'top 75%' } = {}) {
  gsap.fromTo(target, { ...HIDDEN }, { ...SHOWN, duration, scrollTrigger: { trigger: target, start } });
}

/**
 * Chapter 07 — THE STRENGTH NOBODY SAW.
 * A quiet scene told almost entirely with space. Each sentence arrives on its
 * own, slowly, in a narrow column; her portrait joins beside the later lines.
 * As the chapter turns towards what she deserves, a soft warm light gathers
 * behind the words — comfort arriving. No pins, no imagery of pain, no hidden note.
 */
export function Strength() {
  const root = useRef<HTMLElement>(null);
  const showPortrait = photoSlotVisible(strength.photo);
  const alone = strength.lines.slice(0, ALONE);
  const later = strength.lines.slice(ALONE);
  usePauseOffscreen(root);

  useScene(root, ({ reduce, desktop }) => {
    const el = root.current;
    if (reduce || !el) return;

    const head = el.querySelector('.chapter__head');
    if (head) {
      gsap.from(head, { opacity: 0, duration: 2, ease: 'power1.out', scrollTrigger: { trigger: head, start: 'top 85%' } });
    }

    // Every sentence on its own, with room to be read before the next one comes.
    el.querySelectorAll('.ch07-fade').forEach((line) => {
      settle(line, { duration: line.classList.contains('ch07-turn') ? 2.8 : 2.4 });
    });

    const laterBlock = el.querySelector('.ch07-later');
    const portrait = el.querySelector('.ch07-portrait');
    if (laterBlock && portrait) {
      gsap.from(portrait, {
        opacity: 0,
        y: 18,
        duration: 2.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: laterBlock, start: 'top 75%' },
      });
    }

    // "You deserve" — then each thing she deserves settles in after the one before, and stays.
    const deserve = el.querySelector('.ch07-deserve');
    const lead = el.querySelector('.ch07-deserve__lead');
    const items = el.querySelectorAll('.ch07-deserve__item');
    if (deserve && lead && items.length) {
      gsap
        .timeline({ scrollTrigger: { trigger: deserve, start: 'top 72%' } })
        .fromTo(lead, { ...HIDDEN }, { ...SHOWN, duration: 1.8 })
        .fromTo(items, { ...HIDDEN }, { ...SHOWN, duration: 1.8, stagger: 0.7 }, '-=0.9');
    }

    const key = el.querySelector('.ch07-key');
    const glow = el.querySelector('.ch07-key__glow');
    const keyline = el.querySelector('.ch07-keyline');
    if (key && glow && keyline) {
      gsap
        .timeline({ scrollTrigger: { trigger: key, start: 'top 78%' } })
        .from(glow, { opacity: 0, scale: 0.8, duration: 3.6, ease: 'power1.out' })
        .fromTo(keyline, { ...HIDDEN }, { ...SHOWN, duration: 2.8 }, 0.4);
    }

    // Comfort arriving: the warm light gathers from the turn until the key line.
    const warmth = el.querySelector('.ch07-warmth');
    const turn = el.querySelector('.ch07-turn');
    if (warmth && turn && key) {
      if (desktop) {
        gsap.fromTo(
          warmth,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: turn, start: 'top 85%', endTrigger: key, end: 'center 55%', scrub: 1 },
          },
        );
      } else {
        gsap.fromTo(
          warmth,
          { opacity: 0 },
          { opacity: 1, duration: 4.5, ease: 'power1.inOut', scrollTrigger: { trigger: turn, start: 'top 70%' } },
        );
      }
    }
  });

  return (
    <ChapterSection number={7} ref={root} className="ch07">
      <div className="ch07-warmth" aria-hidden="true">
        <LightLeak tone="rose" position="center" intensity={0.55} className="ch07-leak ch07-leak--rose" />
        <LightLeak tone="amber" position="center" intensity={0.45} className="ch07-leak ch07-leak--amber" />
      </div>

      <div className="container ch07-inner">
        <ChapterHeading number={7} align="center" />

        <div className="ch07-column">
          {alone.map((line) => (
            <p key={line} className="t-lead ch07-line ch07-line--quiet ch07-fade">
              {line}
            </p>
          ))}
        </div>

        <div className={`ch07-later${showPortrait ? '' : ' ch07-later--solo'}`}>
          {showPortrait && (
            <div className="ch07-aside">
              <div className="ch07-portrait">
                <Photo
                  id={strength.photo}
                  frame="soft"
                  tone="warm"
                  sizes="(min-width: 900px) 270px, 62vw"
                  className="ch07-photo"
                />
              </div>
            </div>
          )}

          <div className="ch07-later__text">
            {later.map((line) => (
              <p key={line} className="t-lead ch07-line ch07-fade">
                {line}
              </p>
            ))}

            <p className="ch07-turn ch07-fade">{strength.turn}</p>

            <div className="ch07-deserve">
              <p id="ch07-deserve-lead" className="ch07-deserve__lead">
                {strength.deservesLead}
              </p>
              <ul role="list" className="ch07-deserve__list" aria-labelledby="ch07-deserve-lead">
                {strength.deserves.map((item) => (
                  <li key={item} className="ch07-deserve__item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="ch07-key">
          <span className="ch07-key__glow" aria-hidden="true" />
          <p className="keyline keyline--large ch07-keyline">{strength.keyLine}</p>
        </div>
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
