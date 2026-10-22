import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Photo, photoSlotVisible } from '../../components/Photo';
import { DustField } from '../../components/atmosphere/DustField';
import { chapter } from '../../content/chapters';
import { letter } from '../../content/story';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import { Envelope } from './Envelope';
import './letter.css';

/**
 * Chapter 12 — A letter from your son.
 *
 * On burgundy velvet, under one soft pool of light, lies a sealed ivory
 * envelope "For Ma". Opening it is a small ceremony (≈3.7s): the wax seal
 * cracks and falls away, the flap swings open, the old photograph of Ma slides
 * out and comes to rest beside the letter, the folded letter rises, is laid
 * down and unfolds — and the paper then opens out into the full letter, which
 * simply becomes part of the page. No overlay, no scroll lock.
 *
 * The "open" state is plain markup + CSS (`data-phase="open"`), so reduced
 * motion opens instantly and the animation always lands on the same layout.
 * A quiet "Keep this letter" button shows a clean keepsake copy in a native
 * <dialog>, and a print-only copy is portalled into <body> at all times.
 */

type Phase = 'sealed' | 'opening' | 'open';

const PAPER_ID = 'ch12-letter-paper';
const PHOTO_TILT = 5;
/** The last three short paragraphs are given a little more air. */
const CODA_FROM = Math.max(0, letter.paragraphs.length - 3);

function paragraphClass(base: string, i: number) {
  if (i < CODA_FROM) return base;
  return `${base} ${base}--coda${i === CODA_FROM ? ` ${base}--coda-first` : ''}`;
}

/** The letter set simply — used by the keepsake dialog and the print copy. */
function PlainLetter({ prefix }: { prefix: 'ch12-keep' | 'ch12-print' }) {
  return (
    <>
      <p className={`${prefix}-to`}>{letter.envelopeTo}</p>
      <p className={`${prefix}-sal`}>{letter.salutation}</p>
      {letter.paragraphs.map((text, i) => (
        <p key={i} className={paragraphClass(`${prefix}-p`, i)}>
          {text}
        </p>
      ))}
      <div className={`${prefix}-sign`}>
        <p className={`${prefix}-signoff`}>{letter.signOff}</p>
        <p className={`${prefix}-signature`}>{letter.signature}</p>
        {letter.name && <p className={`${prefix}-name`}>{letter.name}</p>}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   The opening sequence. Built inside a gsap.context that is reverted the
   moment the phase becomes "open", so CSS for the open state takes over.
   Every end value below equals that CSS (stage hidden, paper unclipped,
   photograph at rest), which is what makes the hand-over seamless.
   ────────────────────────────────────────────────────────────────────────── */
function stageOpening(desk: HTMLElement, tucked: HTMLElement | null, done: () => void): (() => void) | void {
  const one = <T extends Element = HTMLElement>(selector: string) => desk.querySelector<T>(selector);
  const all = (selector: string) => Array.from(desk.querySelectorAll<HTMLElement>(selector));

  const env = one('.ch12-env');
  const sheet = one('.ch12-sheet');
  const paper = one('.ch12-paper');
  if (!env || !sheet || !paper) {
    done();
    return;
  }
  const actions = one('.ch12-actions');
  const seal = one('.ch12-seal');
  const halfL = one<SVGSVGElement>('.ch12-seal-half--l');
  const halfR = one<SVGSVGElement>('.ch12-seal-half--r');
  const flap = one('.ch12-flap');
  const flapInner = one('.ch12-flap-inner');
  const flapShade = one('.ch12-flap-shade');
  const sheetTop = one('.ch12-sheet-top');
  const sheetBot = one('.ch12-sheet-bot');
  const sheetShadow = one('.ch12-sheet-shadow');
  const shades = all('.ch12-sheet-shade');
  const lines = all('.ch12-sheet-lines');
  const parts = all('.ch12-env-part');
  const paperShadow = one('.ch12-paper-shadow');
  const salutation = one('.ch12-salutation');

  const envR = env.getBoundingClientRect();
  const sheetR = sheet.getBoundingClientRect();
  const paperR = paper.getBoundingClientRect();
  const W = envR.width;
  const H = envR.height;
  const h = sheetR.height;

  const tl = gsap.timeline({ onComplete: done });

  // 0 — the button steps back.
  if (actions) tl.to(actions, { autoAlpha: 0, y: 10, duration: 0.35, ease: 'power2.out' }, 0);

  // 1 — the seal lifts a little, cracks, and its two halves fall away.
  if (seal) tl.to(seal, { y: -H * 0.015, scale: 1.05, duration: 0.3, ease: 'power2.out' }, 0);
  if (halfL) tl.to(halfL, { x: -W * 0.05, y: H * 0.16, rotation: -24, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 0.26);
  if (halfR) tl.to(halfR, { x: W * 0.045, y: H * 0.19, rotation: 20, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 0.3);

  // 2 — the flap swings open on its hinge; past 90° we see its lined inside.
  if (flap) {
    gsap.set(flap, { transformPerspective: Math.max(640, W * 2), transformOrigin: '50% 0%' });
    tl.to(flap, { rotationX: 180, duration: 0.72, ease: 'power2.inOut' }, 0.44);
    tl.set(flap, { zIndex: 2 }, 0.8);
    if (flapInner) tl.set(flapInner, { opacity: 1 }, 0.8);
    if (flapShade) {
      tl.to(flapShade, { opacity: 1, duration: 0.36, ease: 'power1.in' }, 0.44);
      tl.to(flapShade, { opacity: 0, duration: 0.36, ease: 'power1.out' }, 0.8);
    }
  }

  // 3 — the photograph slides out of the envelope first, then comes to rest.
  if (tucked) {
    const pr = tucked.getBoundingClientRect();
    if (pr.width > 0 && pr.height > 0) {
      const s = Math.min(1, (H * 0.68) / pr.height, (W * 0.44) / pr.width);
      const startCx = envR.left + W * 0.63;
      const startTop = envR.top + H * 0.2;
      const dx = startCx - (pr.left + pr.width / 2);
      const dy = startTop + (pr.height * s) / 2 - (pr.top + pr.height / 2);
      // How high it must rise before no part is still behind the side flaps.
      const fl = (startCx - (pr.width * s) / 2 - envR.left) / W;
      const fr = (startCx + (pr.width * s) / 2 - envR.left) / W;
      const clearAt = H * Math.min(1.06 * (1 - fr), fl < 0.5 ? 1.06 * fl : 1) - 6;
      const rise = startTop + pr.height * s - (envR.top + clearAt);
      gsap.set(tucked, { x: dx, y: dy, scale: s, rotation: -PHOTO_TILT, zIndex: 4, transformOrigin: '50% 50%' });
      tl.to(tucked, { y: dy - rise, rotation: -PHOTO_TILT + 2, duration: 0.6, ease: 'power2.out' }, 0.86);
      tl.set(tucked, { zIndex: 11 }, 1.46);
      tl.to(tucked, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.85, ease: 'power3.inOut' }, 1.46);
    }
  }

  // 4 — the folded letter rises out of the envelope, then is laid down in front of it…
  if (sheetTop) gsap.set(sheetTop, { rotationX: -180, transformOrigin: '50% 100%' });
  if (sheetBot) gsap.set(sheetBot, { rotationX: 180, transformOrigin: '50% 0%' });
  if (shades.length) gsap.set(shades, { opacity: 1 });
  const riseY = envR.top + H * 0.08 - sheetR.bottom;
  const settleY = paperR.top + h - sheetR.top; // middle panel lands one panel below the paper's top
  tl.to(sheet, { y: riseY, duration: 0.6, ease: 'power2.out' }, 0.98);
  tl.set(sheet, { zIndex: 10 }, 1.58);
  tl.to(sheet, { y: settleY, duration: 0.62, ease: 'power3.inOut' }, 1.58);

  // 5 — …and unfolds, its faint lines of writing coming into view.
  const unfold = 2.12;
  if (sheetTop) tl.to(sheetTop, { rotationX: 0, duration: 0.72, ease: 'power2.inOut' }, unfold);
  if (sheetBot) tl.to(sheetBot, { rotationX: 0, duration: 0.72, ease: 'power2.inOut' }, unfold + 0.06);
  if (sheetShadow) tl.to(sheetShadow, { top: -h, bottom: -h, duration: 0.72, ease: 'power2.inOut' }, unfold);
  if (shades.length) tl.to(shades, { opacity: 0, duration: 0.6, ease: 'power1.out' }, unfold + 0.15);
  if (lines.length) tl.to(lines, { opacity: 1, duration: 0.4, ease: 'power1.out' }, unfold + 0.42);

  // 6 — the envelope recedes into the velvet.
  if (parts.length) tl.to(parts, { autoAlpha: 0, y: H * 0.05, duration: 0.75, ease: 'power2.out' }, unfold + 0.1);

  // 7 — the real paper takes the sheet's place and opens out into the whole letter.
  const swap = unfold + 0.74;
  const clip = {
    t: 0,
    r: Math.max(0, paperR.right - sheetR.right),
    b: Math.max(0, paperR.height - 3 * h),
    l: Math.max(0, sheetR.left - paperR.left),
  };
  const applyClip = () => {
    paper.style.clipPath = `inset(${clip.t}px ${clip.r}px ${clip.b}px ${clip.l}px)`;
  };
  tl.call(applyClip, undefined, swap);
  tl.to(sheet, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, swap + 0.02);
  tl.to(clip, { l: 0, r: 0, duration: 0.8, ease: 'power3.inOut', onUpdate: applyClip }, swap + 0.02);
  tl.to(clip, { b: 0, duration: 0.9, ease: 'power2.in', onUpdate: applyClip }, swap + 0.02);
  if (paperShadow) tl.to(paperShadow, { opacity: 1, duration: 0.9, ease: 'power1.out' }, swap + 0.1);
  if (salutation) {
    tl.fromTo(salutation, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, swap + 0.2);
  }

  // Not a GSAP property, so clean it up by hand when the context reverts.
  return () => paper.style.removeProperty('clip-path');
}

/** If the envelope is not comfortably in view, glide it there (any wheel/touch cancels). */
function bringIntoView(desk: HTMLElement): gsap.core.Tween | null {
  const top = desk.getBoundingClientRect().top;
  const vh = window.innerHeight;
  const want = Math.min(vh * 0.1, 96);
  if (top >= want - 24 && top <= vh * 0.32) return null;
  return gsap.to(window, {
    scrollTo: { y: window.scrollY + top - want, autoKill: true },
    duration: 0.9,
    ease: 'power2.inOut',
  });
}

export function Letter() {
  const sectionRef = useRef<HTMLElement>(null);
  const readRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const tuckedRef = useRef<HTMLDivElement>(null);
  const salutationRef = useRef<HTMLParagraphElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepsakeOpener = useRef<HTMLElement | null>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const phaseRef = useRef<Phase>('sealed');
  const focusOnOpen = useRef(false);
  const [phase, setPhase] = useState<Phase>('sealed');
  const [animated, setAnimated] = useState(false);
  const showPhoto = photoSlotVisible(letter.tuckedPhoto);

  const openLetter = useCallback(() => {
    if (phaseRef.current !== 'sealed') return;
    const intro = introRef.current;
    if (intro) {
      intro.scrollTrigger?.kill();
      intro.progress(1);
    }
    const reduce = prefersReducedMotion();
    const next: Phase = reduce ? 'open' : 'opening';
    phaseRef.current = next;
    focusOnOpen.current = true;
    setAnimated(!reduce);
    setPhase(next);
  }, []);

  // Entrance: the heading, then the envelope floats up into its pool of light.
  useScene(sectionRef, ({ reduce }) => {
    if (reduce) return;
    const head = sectionRef.current?.querySelector<HTMLElement>('.chapter__head');
    if (head && head.children.length) {
      gsap.from(head.children, {
        opacity: 0,
        y: 26,
        duration: 1.3,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 85%' },
      });
    }
    const desk = deskRef.current;
    if (!desk || phaseRef.current !== 'sealed') return;
    const spot = desk.querySelector('.ch12-spot');
    const actions = desk.querySelector('.ch12-actions');
    const tl = gsap.timeline({ scrollTrigger: { trigger: desk, start: 'top 80%', once: true } });
    tl.from(desk, { opacity: 0, y: 48, duration: 1.7, ease: 'power3.out', clearProps: 'opacity,transform' }, 0);
    if (spot) tl.from(spot, { opacity: 0, scale: 0.55, duration: 2.6, ease: 'power2.out', clearProps: 'opacity,transform' }, 0);
    if (actions) tl.from(actions, { opacity: 0, y: 14, duration: 1.1, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.9);
    introRef.current = tl;
    return () => {
      introRef.current = null;
    };
  });

  // The opening ceremony (motion only).
  useLayoutEffect(() => {
    if (phase !== 'opening') return;
    const desk = deskRef.current;
    if (!desk) return;
    // The paper is now in the layout: re-measure every later chapter first.
    ScrollTrigger.refresh();
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      phaseRef.current = 'open';
      setPhase('open');
    };
    const ctx = gsap.context(() => stageOpening(desk, tuckedRef.current, done), desk);
    const glide = bringIntoView(desk);
    return () => {
      glide?.kill();
      ctx.revert();
    };
  }, [phase]);

  // Once open (with motion): paragraphs arrive one by one as they come into view.
  useScene(
    readRef,
    ({ reduce }) => {
      if (reduce || !animated || phase !== 'open') return;
      const scope = readRef.current;
      if (!scope) return;
      const vh = window.innerHeight;
      const now: HTMLElement[] = [];
      const later: HTMLElement[] = [];
      for (const el of Array.from(scope.querySelectorAll<HTMLElement>('.ch12-reveal'))) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0) continue; // already read past — leave it be
        (r.top < vh * 0.92 ? now : later).push(el);
      }
      if (now.length) {
        gsap.from(now, { autoAlpha: 0, y: 16, duration: 1.2, ease: 'power3.out', stagger: 0.22, delay: 0.1 });
      }
      if (later.length) {
        gsap.set(later, { autoAlpha: 0, y: 22 });
        ScrollTrigger.batch(later, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.16, overwrite: true });
          },
        });
      }
    },
    [animated, phase],
  );

  // After opening: land keyboard / screen-reader users in the letter, and re-measure the page.
  useEffect(() => {
    if (phase !== 'open') return;
    if (focusOnOpen.current) {
      focusOnOpen.current = false;
      salutationRef.current?.focus({ preventScroll: false });
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [phase]);

  const openKeepsake = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    keepsakeOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
  }, []);
  const closeKeepsake = useCallback(() => dialogRef.current?.close(), []);

  return (
    <ChapterSection number={12} ref={sectionRef} className="ch12">
      <div className="ch12-velvet" aria-hidden="true" />
      <div className="ch12-dust" aria-hidden="true">
        <DustField count={16} size={1.8} speed={0.6} />
      </div>

      <div className="container ch12-content">
        <ChapterHeading number={12} align="center" />

        <div ref={readRef} className="ch12-read">
          <div ref={deskRef} className="ch12-desk" data-phase={phase}>
            <div className="ch12-spot" aria-hidden="true" />

            <div className="ch12-stage">
              <Envelope to={letter.envelopeTo} onOpen={openLetter} />
              <div className="ch12-actions">
                <button
                  type="button"
                  className="btn btn--solid ch12-open"
                  aria-expanded={phase !== 'sealed'}
                  aria-controls={PAPER_ID}
                  aria-disabled={phase !== 'sealed' || undefined}
                  onClick={openLetter}
                >
                  {letter.openLabel}
                </button>
              </div>
            </div>

            <div className="ch12-paperwrap" hidden={phase === 'sealed'}>
              <div className="ch12-paper-shadow" aria-hidden="true" />
              <article id={PAPER_ID} className={`ch12-paper${showPhoto ? ' ch12-paper--photo' : ''}`}>
                <div className="ch12-paper-body">
                  <div className="ch12-head">
                    <p ref={salutationRef} className="ch12-salutation" tabIndex={-1}>
                      {letter.salutation}
                    </p>
                  </div>
                  {letter.paragraphs.map((text, i) => (
                    <p key={i} className={`${paragraphClass('ch12-p', i)} ch12-reveal`}>
                      {text}
                    </p>
                  ))}
                  <div className="ch12-sign ch12-reveal">
                    <p className="ch12-signoff">{letter.signOff}</p>
                    <p className="ch12-signature">{letter.signature}</p>
                    {letter.name && <p className="ch12-name">{letter.name}</p>}
                  </div>
                </div>
              </article>
            </div>

            {showPhoto && (
              <div ref={tuckedRef} className="ch12-tucked">
                <Photo
                  id={letter.tuckedPhoto}
                  frame="print"
                  tone="vintage"
                  tilt={PHOTO_TILT}
                  openable
                  sizes="(min-width: 1240px) 13rem, 10rem"
                />
              </div>
            )}
          </div>

          {phase === 'open' && (
            <div className="ch12-after ch12-reveal">
              <button type="button" className="btn ch12-keep-btn" aria-haspopup="dialog" onClick={openKeepsake}>
                {letter.keepsakeLabel}
              </button>
            </div>
          )}
        </div>

        <dialog
          ref={dialogRef}
          className="ch12-keepsake"
          aria-label={chapter(12).title}
          onClose={() => keepsakeOpener.current?.focus({ preventScroll: true })}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeKeepsake();
          }}
        >
          <div className="ch12-keepsake-bar">
            <button type="button" className="btn ch12-keepsake-print" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              {letter.printLabel}
            </button>
            <button type="button" className="ch12-keepsake-close" onClick={closeKeepsake}>
              <X aria-hidden="true" />
              <span className="visually-hidden">{letter.keepsakeCloseLabel}</span>
            </button>
          </div>
          <div className="ch12-keepsake-sheet">
            <PlainLetter prefix="ch12-keep" />
          </div>
        </dialog>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div className="keepsake-print ch12-print">
            <PlainLetter prefix="ch12-print" />
          </div>,
          document.body,
        )}
    </ChapterSection>
  );
}
