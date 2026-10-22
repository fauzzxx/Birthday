import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { useScene } from '../lib/scene';

/* ==========================================================================
   <Reveal> — fades/lifts content in as it scrolls into view.
   <SplitReveal> — reveals a sentence line-by-line (masked), word-by-word or
   letter-by-letter. Both render their FINAL state in the markup, so the text is
   always readable even if animation never runs (reduced motion, errors).
   ========================================================================== */

type RevealVariant = 'up' | 'fade' | 'blur' | 'mask' | 'scale';

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  /** Animate direct children one after another with this gap (seconds). */
  stagger?: number;
  /** ScrollTrigger start, e.g. 'top 80%'. */
  start?: string;
  /** Tie progress to scroll position instead of playing once. */
  scrub?: boolean;
  [key: string]: unknown;
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { opacity: 0, y: 34 },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: 'blur(12px)', y: 12 },
  mask: { clipPath: 'inset(0% 0% 100% 0%)', y: 20 },
  scale: { opacity: 0, scale: 0.96 },
};

export function Reveal({
  as: Tag = 'div',
  children,
  className,
  style,
  variant = 'up',
  delay = 0,
  duration = 1.3,
  stagger,
  start = 'top 82%',
  scrub = false,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ reduce }) => {
    const el = ref.current;
    if (reduce || !el) return;
    const targets = stagger ? Array.from(el.children) : el;
    const vars: gsap.TweenVars = {
      ...FROM[variant],
      duration,
      delay,
      ease: variant === 'mask' ? 'power4.out' : 'power3.out',
      stagger,
      clearProps: scrub ? undefined : 'filter,clipPath',
      scrollTrigger: scrub
        ? { trigger: el, start, end: 'top 35%', scrub: 0.8 }
        : { trigger: el, start, toggleActions: 'play none none none' },
    };
    if (variant === 'mask') vars.clipPath = 'inset(0% 0% 100% 0%)';
    gsap.from(targets, vars);
  });

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}

interface SplitRevealProps {
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'span' | 'div';
  text: string;
  by?: 'lines' | 'words' | 'chars';
  className?: string;
  style?: CSSProperties;
  id?: string;
  tabIndex?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  scrub?: boolean;
  /** Don't trigger on scroll; play when `play` becomes true instead. */
  manual?: boolean;
  play?: boolean;
}

export function SplitReveal({
  as: Tag = 'p',
  text,
  by = 'lines',
  className,
  style,
  id,
  tabIndex,
  delay = 0,
  stagger,
  start = 'top 82%',
  scrub = false,
  manual = false,
  play = false,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const splitRef = useRef<HTMLSpanElement>(null);

  useScene(
    ref,
    ({ reduce }) => {
      const target = by === 'chars' ? splitRef.current : ref.current;
      if (reduce || !target || !ref.current) return;
      if (manual && !play) {
        gsap.set(target, { autoAlpha: 0 });
        return;
      }
      const trigger = ref.current;
      SplitText.create(target, {
        type: by === 'lines' ? 'lines' : by === 'words' ? 'words' : 'words,chars',
        mask: by === 'lines' ? 'lines' : undefined,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        tag: 'span',
        // Screen readers read the real text (or the hidden copy for chars).
        aria: 'none',
        autoSplit: true,
        onSplit(self) {
          const scrollTrigger = manual
            ? undefined
            : scrub
              ? { trigger, start, end: 'bottom 45%', scrub: 0.9 }
              : { trigger, start, toggleActions: 'play none none none' as const };
          if (by === 'lines') {
            return gsap.from(self.lines, {
              yPercent: 105,
              opacity: 0,
              duration: 1.35,
              ease: 'power4.out',
              stagger: stagger ?? 0.12,
              delay,
              scrollTrigger,
            });
          }
          if (by === 'words') {
            return gsap.from(self.words, {
              opacity: 0,
              y: '0.35em',
              filter: 'blur(8px)',
              duration: 1.1,
              ease: 'power3.out',
              stagger: stagger ?? 0.045,
              delay,
              scrollTrigger,
            });
          }
          return gsap.from(self.chars, {
            opacity: 0,
            y: '0.25em',
            duration: 0.9,
            ease: 'power2.out',
            stagger: stagger ?? 0.022,
            delay,
            scrollTrigger,
          });
        },
      });
    },
    [manual, play, text],
  );

  if (by === 'chars') {
    return (
      <Tag ref={ref as never} className={className} style={style} id={id} tabIndex={tabIndex}>
        <span className="visually-hidden">{text}</span>
        <span ref={splitRef} aria-hidden="true">
          {text}
        </span>
      </Tag>
    );
  }

  return (
    <Tag ref={ref as never} className={className} style={style} id={id} tabIndex={tabIndex}>
      {text}
    </Tag>
  );
}
