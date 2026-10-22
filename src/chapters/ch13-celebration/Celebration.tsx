import { useMemo, useRef, type CSSProperties } from 'react';
import { ArrowUp } from 'lucide-react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { SplitReveal } from '../../components/Reveal';
import { DustField } from '../../components/atmosphere/DustField';
import { useGallery } from '../../components/gallery/GalleryContext';
import type { PhotoId } from '../../content/photos';
import { celebration } from '../../content/story';
import { emit } from '../../lib/events';
import { gsap } from '../../lib/gsap';
import { scrollToChapter } from '../../lib/navigation';
import { resolvePhoto } from '../../lib/photos';
import { useScene } from '../../lib/scene';
import { CakeScene } from './Cake';
import './celebration.css';

/**
 * Chapter 13 — Today, the world celebrates you.
 *
 * The finale answers the opening: the golden hairline and its bead of light
 * arrive again, the greeting is set in the same display face and revealed
 * word by word, and the drifting dust of the first scene has become tiny
 * points of light rising. Then the cake (its candles light as it comes into
 * view; she can make a wish and blow), a scatter of photographs that drift in
 * and settle as she scrolls, one last large photograph, and the closing words
 * — given room and stillness — before the story can begin again.
 *
 * Before the cake, "Things I have never said out loud": each line lights up as it
 * scrolls to the middle of the screen, like a candle being lit.
 * Mobile: the same scroll-linked arrivals, with a tidy two-column collage.
 * Reduced motion: everything is static and visible; candles start lit.
 */

interface Placed {
  id: PhotoId;
  x: number;
  y: number;
  w: number;
  tilt: number;
}

/** The greeting, with its first two words kept together so narrow screens break before the name. */
const NBSP = String.fromCharCode(160);
const GREETING = celebration.greeting.replace(/^([^ ]+) ([^ ]+)/, `$1${NBSP}$2`);

const TILTS = [-3.5, 2.5, -2, 3, 4, -1.5, 2, -3, 1.5, -2.5, 3.5, -1];
const JITTER = [2, 0, 3.5, 0.5, 2.5, 0, 3, 1, 2, 0.5, 1.5, 3];
/** Where each print drifts in from on desktop (px / degrees). */
const SCATTER = [
  { x: -160, y: 150, r: -14 },
  { x: -60, y: 210, r: 10 },
  { x: 40, y: 240, r: -9 },
  { x: 150, y: 180, r: 12 },
  { x: -200, y: 130, r: 9 },
  { x: -40, y: 200, r: -11 },
  { x: 90, y: 230, r: 8 },
  { x: 190, y: 170, r: -13 },
];

/**
 * Lays the prints out in two loose, overlapping rows on a 100-unit-wide table.
 * Each print keeps its natural aspect ratio (no one is ever cropped out);
 * widths are balanced by √aspect so portraits and landscapes feel equal.
 */
function arrangeCollage(ids: PhotoId[]) {
  const shown = ids.filter((id) => photoSlotVisible(id));
  const aspect = (id: PhotoId) => {
    const p = resolvePhoto(id);
    return p.image ? p.width / p.height : 0.8;
  };
  const perRow = shown.length <= 4 ? shown.length : Math.ceil(shown.length / 2);
  const rows = [shown.slice(0, perRow), shown.slice(perRow)].filter((r) => r.length > 0);
  const items: Placed[] = [];
  const overlap = 3;
  let y = 0;
  let height = 0;
  let k = 0;
  rows.forEach((row, ri) => {
    const span = ri === 0 ? 96 : 90;
    const aspects = row.map(aspect);
    const weights = aspects.map((a) => Math.sqrt(a));
    const total = weights.reduce((s, w) => s + w, 0);
    const sumW = span + overlap * (row.length - 1);
    let x = (100 - span) / 2 + (ri === 1 ? 1.5 : 0);
    let rowMax = 0;
    row.forEach((id, i) => {
      const w = (weights[i] / total) * sumW;
      const h = w / aspects[i];
      const jy = JITTER[k % JITTER.length];
      items.push({ id, x, y: y + jy, w, tilt: TILTS[k % TILTS.length] });
      height = Math.max(height, y + jy + h);
      rowMax = Math.max(rowMax, h);
      x += w - overlap;
      k++;
    });
    y += rowMax * 0.8;
  });
  return { items, height: height + 4 };
}

export function Celebration() {
  const rootRef = useRef<HTMLElement>(null);
  const gallery = useGallery();
  const collage = useMemo(() => arrangeCollage(celebration.collage), []);
  const showFinal = photoSlotVisible(celebration.finalPhoto, celebration.finalPhotoFallback);

  useScene(rootRef, ({ reduce, desktop }) => {
    const root = rootRef.current;
    if (reduce || !root) return;
    const one = (selector: string) => root.querySelector<HTMLElement>(selector);

    // The hairline draws down and its bead of light arrives above the greeting.
    const hair = one('.ch13-hairline');
    const bead = one('.ch13-bead');
    if (hair && bead) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: hair, start: 'top 88%', once: true } });
      tl.from(hair, { scaleY: 0, transformOrigin: '50% 0%', duration: 1.5, ease: 'power2.inOut' }, 0);
      tl.from(bead, { y: () => -hair.offsetHeight, opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0.1);
    }

    const message = one('.ch13-message');
    if (message) {
      gsap.from(message, {
        opacity: 0,
        y: 26,
        duration: 1.4,
        delay: 0.45,
        scrollTrigger: { trigger: message, start: 'top 88%' },
      });
    }

    const cake = one('.ch13-cake-figure');
    if (cake) {
      gsap.from(cake, { opacity: 0, y: 50, duration: 1.6, scrollTrigger: { trigger: cake, start: 'top 90%' } });
    }

    // The prints drift in from a loose scatter and settle as she scrolls (desktop),
    // or simply arrive one by one (mobile).
    const table = one('.ch13-collage');
    const prints = gsap.utils.toArray<HTMLElement>('.ch13-print', root);
    if (table && prints.length) {
      if (desktop) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: table, start: 'top 88%', end: 'center 55%', scrub: 0.8 },
        });
        prints.forEach((print, i) => {
          const s = SCATTER[i % SCATTER.length];
          tl.from(print, { x: s.x, y: s.y, rotation: s.r, opacity: 0, duration: 1, ease: 'power2.out' }, i * 0.14);
        });
      } else {
        // Phones: each print drifts up and settles as it scrolls into view.
        prints.forEach((print, i) => {
          gsap.from(print, {
            opacity: 0,
            y: 70,
            x: i % 2 ? 24 : -24,
            rotation: i % 2 ? 7 : -7,
            ease: 'power2.out',
            scrollTrigger: { trigger: print, start: 'top 98%', end: 'top 62%', scrub: 0.6 },
          });
        });
      }
    }

    // Things never said out loud: each line lights as it reaches the middle of the screen.
    gsap.utils.toArray<HTMLElement>('.ch13-unsaid__item', root).forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0.16, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: item, start: 'top 88%', end: 'top 58%', scrub: 0.6 },
        },
      );
      const dot = item.querySelector('.ch13-unsaid__dot');
      if (dot) {
        gsap.fromTo(
          dot,
          { scale: 0.3, opacity: 0.2 },
          { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 80%', end: 'top 58%', scrub: 0.6 } },
        );
      }
    });

    const finalPhoto = one('.ch13-final');
    if (finalPhoto) {
      gsap.from(finalPhoto, {
        opacity: 0,
        y: 60,
        rotation: -2.5,
        duration: 1.8,
        scrollTrigger: { trigger: finalPhoto, start: 'top 86%' },
      });
    }

    for (const el of [one('.ch13-closing-lead'), one('.ch13-blessing'), one('.ch13-sign'), one('.ch13-end')]) {
      if (!el) continue;
      gsap.from(el, { opacity: 0, y: 22, duration: 1.4, scrollTrigger: { trigger: el, start: 'top 90%' } });
    }

    // The last words: no movement, only a slow arrival.
    const finalLine = one('.ch13-finalline');
    if (finalLine) {
      gsap.from(finalLine, {
        opacity: 0,
        duration: 2.6,
        ease: 'power1.inOut',
        scrollTrigger: { trigger: finalLine, start: 'top 80%' },
      });
    }
  });

  const replay = () => {
    scrollToChapter('top');
    emit('story:replay');
  };

  return (
    <ChapterSection number={13} ref={rootRef} className="ch13">
      <div className="ch13-glow" aria-hidden="true" />
      <div className="ch13-dust ch13-dust--top" aria-hidden="true">
        <DustField mode="rise" count={34} size={2.2} speed={0.8} />
      </div>
      <div className="ch13-dust ch13-dust--end" aria-hidden="true">
        <DustField mode="rise" count={40} size={2} speed={0.7} />
      </div>

      <div className="container ch13-content">
        <div className="ch13-top">
          <div className="ch13-thread" aria-hidden="true">
            <span className="ch13-hairline" />
            <span className="ch13-bead" />
          </div>
          <ChapterHeading number={13} size="headline" align="center" className="ch13-heading" />
          <SplitReveal as="p" by="words" text={GREETING} className="t-display ch13-greeting" delay={0.25} />
          <p className="t-lead ch13-message">{celebration.message}</p>
        </div>

        {celebration.unsaid.items.length > 0 && (
          <section className="ch13-unsaid" aria-labelledby="ch13-unsaid-title">
            <h3 id="ch13-unsaid-title" className="t-eyebrow ch13-unsaid__title">
              {celebration.unsaid.title}
            </h3>
            <ul className="ch13-unsaid__list" role="list">
              {celebration.unsaid.items.map((line) => (
                <li key={line} className="ch13-unsaid__item">
                  <span className="ch13-unsaid__dot" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        )}

        <CakeScene />

        {collage.items.length > 0 && (
          <div className="ch13-gallery">
            <ul
              className="ch13-collage"
              role="list"
              style={{ ['--ch13-ratio' as string]: `100 / ${collage.height.toFixed(2)}` } as CSSProperties}
            >
              {collage.items.map((item) => (
                <li
                  key={item.id}
                  className="ch13-print"
                  style={
                    {
                      ['--x' as string]: item.x.toFixed(2),
                      ['--y' as string]: ((item.y / collage.height) * 100).toFixed(2),
                      ['--w' as string]: item.w.toFixed(2),
                    } as CSSProperties
                  }
                >
                  <Photo
                    id={item.id}
                    frame="print"
                    tone="warm"
                    tilt={item.tilt}
                    openable
                    sizes="(min-width: 900px) 30vw, 46vw"
                  />
                </li>
              ))}
            </ul>
            <div className="ch13-album">
              <button type="button" className="btn" onClick={() => gallery.open()}>
                {celebration.albumLabel}
              </button>
            </div>
          </div>
        )}

        {showFinal && (
          <div className="ch13-final">
            <Photo
              id={celebration.finalPhoto}
              fallbackId={celebration.finalPhotoFallback}
              frame="print"
              tone="warm"
              tilt={-1}
              openable
              sizes="(min-width: 900px) 34rem, 92vw"
            />
          </div>
        )}

        <div className="ch13-closing">
          <p className="t-lead ch13-closing-lead">{celebration.closing}</p>
          <p className="keyline keyline--large ch13-finalline">{celebration.finalLine}</p>
          {celebration.blessing && <p className="ch13-blessing">{celebration.blessing}</p>}
          <div className="ch13-sign">
            <p className="ch13-signoff">{celebration.signOff}</p>
            <p className="ch13-signature">{celebration.signature}</p>
            {celebration.name && <p className="ch13-name">{celebration.name}</p>}
          </div>
        </div>

        <div className="ch13-end">
          <span className="ch13-endrule" aria-hidden="true">
            <span className="ch13-endbead" />
          </span>
          <button type="button" className="btn ch13-replay" onClick={replay}>
            <ArrowUp aria-hidden="true" />
            {celebration.replayLabel}
          </button>
        </div>
      </div>
    </ChapterSection>
  );
}
