import { useEffect, useRef, useState } from 'react';
import { settings } from '../content/settings';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/scene';
import { DustField } from './atmosphere/DustField';
import './rose-bloom.css';

/**
 * THE ROSE — the landing scene. A single closed rose; as she scrolls it opens
 * and begins to glow, and then the story begins. The stage stays on screen (CSS sticky, so
 * native scrolling is untouched) while scroll progress drives the bloom.
 *
 * Uses the video in settings.rose.src when provided (scrubbed frame by frame);
 * otherwise, or if the video can't load, an illustrated rose opens instead.
 * Reduced motion: the rose is simply shown open.
 */
interface RoseBloomProps {
  /** Small line at the top of the screen (e.g. the dedication). */
  eyebrow?: string;
  /** Invitation to scroll, shown before the bloom begins. */
  hint?: string;
  /** Handwritten line that appears as the rose finishes opening. */
  line?: string;
}

export function RoseBloom({ eyebrow, hint, line }: RoseBloomProps) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(!!settings.rose.src);
  const [duration, setDuration] = useState(0);

  // iOS Safari only paints seeked frames after the video has played once.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;
    const prime = () => {
      video
        .play()
        .then(() => video.pause())
        .catch(() => undefined);
    };
    window.addEventListener('touchstart', prime, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', prime);
  }, [useVideo]);

  useScene(
    ref,
    ({ reduce }) => {
      const section = ref.current;
      if (!section) return;
      const video = videoRef.current;

      if (reduce) {
        if (video && duration) video.currentTime = Math.max(0, duration - 0.05);
        return;
      }

      // Bloom timeline, driven by scroll through the tall section.
      const state = { t: 0 };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      });
      tl.to(state, { t: 1, duration: 1 }, 0);
      tl.fromTo('.rose__glow', { opacity: 0.15, scale: 0.7 }, { opacity: 1, scale: 1.15, duration: 0.6 }, 0.4);
      tl.fromTo('.rose__media', { scale: 0.86 }, { scale: 1, duration: 1 }, 0);
      if (hint) tl.to('.rose__hint', { opacity: 0, y: 12, duration: 0.12 }, 0.02);
      if (eyebrow) tl.to('.rose__eyebrow', { opacity: 0.35, duration: 0.3 }, 0.3);
      if (line) tl.fromTo('.rose__line', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.7);

      if (!useVideo) {
        // Illustrated rose: petals unfurl layer by layer, outside first.
        section.querySelectorAll<SVGGElement>('.rose__petal').forEach((petal) => {
          const layer = Number(petal.dataset.layer);
          const angle = Number(petal.dataset.angle);
          const open = Number(petal.dataset.open);
          tl.fromTo(
            petal,
            { rotation: angle + 18 * (layer + 1), scaleX: 0.42, scaleY: 0.5, svgOrigin: '0 0' },
            { rotation: angle, scaleX: open, scaleY: open, svgOrigin: '0 0', duration: 0.55, ease: 'sine.inOut' },
            0.05 + (3 - layer) * 0.09,
          );
        });
        return;
      }

      // Video: ease currentTime toward the scroll target for smooth scrubbing.
      if (!video || !duration) return;
      let shown = -1;
      let raf = 0;
      const tick = () => {
        const target = state.t * (duration - 0.05);
        const current = shown < 0 ? target : shown + (target - shown) * 0.18;
        if (Math.abs(current - shown) > 1 / 120) {
          shown = current;
          if (!video.seeking) video.currentTime = current;
        }
        raf = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) raf = requestAnimationFrame(tick);
      });
      io.observe(section);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
      };
    },
    [useVideo, duration, line, hint, eyebrow],
  );

  return (
    <section ref={ref} className="rose" data-theme="night" data-chapter="1" aria-label={line || 'A rose for you'}>
      <div className="rose__stage">
        <DustField mode="rise" count={22} color="255, 214, 170" size={1.8} speed={0.6} />
        <div className="rose__glow" aria-hidden="true" />
        <div className="rose__media" aria-hidden="true">
          {useVideo && settings.rose.src ? (
            <video
              ref={videoRef}
              className="rose__video"
              src={settings.rose.src}
              poster={settings.rose.poster ?? undefined}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              tabIndex={-1}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onError={() => setUseVideo(false)}
            />
          ) : (
            <IllustratedRose />
          )}
        </div>
        {eyebrow && <p className="rose__eyebrow t-eyebrow">{eyebrow}</p>}
        {line && <p className="rose__line">{line}</p>}
        {hint && (
          <p className="rose__hint">
            <span>{hint}</span>
            <span className="rose__hint-line" aria-hidden="true" />
          </p>
        )}
      </div>
    </section>
  );
}

/** A broad, rounded rose petal growing from the centre (tip at the top). */
const petalPath = (k: number) =>
  `M0 0 C ${-44 * k} ${-8 * k}, ${-52 * k} ${-70 * k}, ${-24 * k} ${-92 * k} Q 0 ${-106 * k}, ${24 * k} ${-92 * k} C ${52 * k} ${-70 * k}, ${44 * k} ${-8 * k}, 0 0 Z`;

/** An original, top-down rose: four rings of petals around a spiral heart. */
function IllustratedRose() {
  const layers = [
    { count: 5, size: 1, open: 1, offset: 0 },
    { count: 5, size: 0.78, open: 1, offset: 36 },
    { count: 5, size: 0.56, open: 0.95, offset: 12 },
    { count: 4, size: 0.36, open: 0.9, offset: 50 },
  ];
  return (
    <svg className="rose__svg" viewBox="-110 -110 220 220">
      <defs>
        <linearGradient id="rose-petal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3a0714" />
          <stop offset="0.42" stopColor="#861a36" />
          <stop offset="0.82" stopColor="#bb3f58" />
          <stop offset="1" stopColor="#e48a8f" />
        </linearGradient>
      </defs>
      {layers.map((l, layer) =>
        Array.from({ length: l.count }, (_, k) => {
          const angle = l.offset + (k * 360) / l.count;
          return (
            <g
              key={`${layer}-${k}`}
              className="rose__petal"
              data-layer={layer}
              data-angle={angle}
              data-open={l.open}
              transform={`rotate(${angle}) scale(${l.open})`}
            >
              <path
                d={petalPath(l.size)}
                fill="url(#rose-petal)"
                stroke="#f2c2bd"
                strokeOpacity="0.55"
                strokeWidth="0.9"
              />
            </g>
          );
        }),
      )}
      <path
        className="rose__heart"
        d="M0 0 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 16 0 a11 11 0 1 1 -22 0"
        fill="none"
        stroke="#e9a3a3"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
