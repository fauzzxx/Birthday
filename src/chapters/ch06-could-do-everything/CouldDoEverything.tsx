import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { Reveal, SplitReveal } from '../../components/Reveal';
import { LightLeak } from '../../components/atmosphere/LightLeak';
import { couldDoEverything } from '../../content/story';
import { gsap } from '../../lib/gsap';
import { useIsDesktop, useReducedMotion } from '../../lib/motion';
import { useScene } from '../../lib/scene';
import { albumSections, CoverPage, SectionPage, type SectionId } from './pages';
import './could-do-everything.css';

interface Turn {
  from: SectionId;
  to: SectionId;
  /** Forward = the right-hand page lifts and turns over to the left; back = a page comes over from the left. */
  dir: 'fwd' | 'back';
  /** 'flip' on desktop (a real page turn), 'fade' on phones. */
  mode: 'flip' | 'fade';
  seq: number;
}

const HALF_TURN = 0.4; // seconds for each half of the turn (≈ 0.8s in all)

/**
 * Chapter 06 — The woman who could do everything.
 *
 * A lived-in family album: a burgundy cloth binding, cream pages, prints held by
 * photo corners, notes in handwriting. On the left page, Ma's photograph; on
 * the right, one section at a time — her kitchen, the things she knows, the
 * favourite — chosen with index tabs down the album's edge. Choosing a tab
 * turns the page (desktop), cross-fades it (phones) or simply shows it
 * (reduced motion). The tabs follow the WAI-ARIA tabs pattern; the inactive
 * pages stay stacked (invisibly) under the active one, so the album never
 * changes height and the page never jumps.
 */
export function CouldDoEverything() {
  const rootRef = useRef<HTMLElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({});
  const turnSeq = useRef(0);
  const interacted = useRef(false);

  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const sections = useMemo(albumSections, []);
  const [active, setActive] = useState<SectionId>(sections[0]?.id ?? 'kitchen');
  const [turn, setTurn] = useState<Turn | null>(null);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const tabId = (id: SectionId) => `${uid}-tab-${id}`;
  const panelId = (id: SectionId) => `${uid}-page-${id}`;
  const { intro, ui, keyLine } = couldDoEverything;

  /* ── Choosing a page ───────────────────────────────────── */
  const select = (next: SectionId) => {
    if (next === active) return;
    interacted.current = true;
    const order = (id: SectionId) => sections.findIndex((s) => s.id === id);
    const from = active;
    setActive(next);
    // A new choice always replaces a turn in progress (its tween is killed in cleanup).
    setTurn(
      reduce
        ? null
        : {
            from,
            to: next,
            dir: order(next) > order(from) ? 'fwd' : 'back',
            mode: isDesktop ? 'flip' : 'fade',
            seq: ++turnSeq.current,
          },
    );
  };

  // Tabs keyboard model: ← → (and ↑ ↓ when the tabs stand vertically), Home, End.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const n = sections.length;
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
        next = index + 1;
        break;
      case 'ArrowLeft':
        next = index - 1;
        break;
      case 'ArrowDown':
        if (!isDesktop) return;
        next = index + 1;
        break;
      case 'ArrowUp':
        if (!isDesktop) return;
        next = index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const id = sections[(next + n) % n].id;
    select(id);
    tabRefs.current[id]?.focus();
  };

  /* ── The page turn ─────────────────────────────────────── */
  useLayoutEffect(() => {
    const pages = pagesRef.current;
    const back = backRef.current;
    const cast = castRef.current;
    if (!turn || !pages || !back || !cast) return;
    const leaving = pages.querySelector<HTMLElement>(`[data-section="${turn.from}"]`);
    const entering = pages.querySelector<HTMLElement>(`[data-section="${turn.to}"]`);
    if (!leaving || !entering) return;

    const seq = turn.seq;
    const tl = gsap.timeline({
      onComplete: () => setTurn((t) => (t && t.seq === seq ? null : t)),
    });

    if (turn.mode === 'fade') {
      tl.fromTo(entering, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0).fromTo(
        leaving,
        { opacity: 1 },
        { opacity: 0, duration: 0.3, ease: 'power1.out' },
        0,
      );
    } else {
      // Each leaf hinges on the spine (its left edge), with its own perspective.
      gsap.set([leaving, entering, back], { transformOrigin: '0% 50%', transformPerspective: 2200 });

      if (turn.dir === 'fwd') {
        // The old page lifts to the spine, darkening; its blank back side
        // falls over to the left and settles onto the left page.
        tl.fromTo(
          leaving,
          { rotationY: 0, '--ch06-shade': 0 },
          { rotationY: -90, '--ch06-shade': 0.5, duration: HALF_TURN, ease: 'power2.in' },
          0,
        )
          .fromTo(cast, { opacity: 0 }, { opacity: 1, duration: HALF_TURN, ease: 'power1.in' }, 0)
          .fromTo(
            back,
            { rotationY: -90, '--ch06-shade': 0.5, autoAlpha: 1 },
            { rotationY: -180, '--ch06-shade': 0, duration: HALF_TURN, ease: 'power2.out', immediateRender: false },
            HALF_TURN,
          )
          .to(cast, { opacity: 0, duration: HALF_TURN, ease: 'power1.out' }, HALF_TURN)
          .to(back, { autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, HALF_TURN * 2 - 0.16);
      } else {
        // A page comes back over from the left: first its blank side rises from
        // the left page, then its front settles down onto the right.
        gsap.set(entering, { rotationY: -90 });
        tl.fromTo(
          back,
          { rotationY: -180, '--ch06-shade': 0 },
          { rotationY: -90, '--ch06-shade': 0.5, duration: HALF_TURN, ease: 'power2.in' },
          0,
        )
          .fromTo(back, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: 'power1.out' }, 0)
          .fromTo(cast, { opacity: 0 }, { opacity: 1, duration: HALF_TURN, ease: 'power1.in' }, 0)
          .set(back, { autoAlpha: 0 }, HALF_TURN)
          .fromTo(
            entering,
            { rotationY: -90, '--ch06-shade': 0.5 },
            { rotationY: 0, '--ch06-shade': 0, duration: HALF_TURN, ease: 'power2.out', immediateRender: false },
            HALF_TURN,
          )
          .to(cast, { opacity: 0, duration: HALF_TURN, ease: 'power1.out' }, HALF_TURN);
      }
    }

    return () => {
      tl.kill();
      gsap.set([leaving, entering, back, cast], { clearProps: 'all' });
    };
  }, [turn]);

  // Phones: keep the chosen tab in view inside its scrolling row (never scrolls the page).
  useEffect(() => {
    if (!interacted.current || isDesktop) return;
    const row = tablistRef.current;
    const tab = tabRefs.current[active];
    if (!row || !tab) return;
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }, [active, isDesktop, reduce]);

  /* ── Arrival ───────────────────────────────────────────── */
  useScene(
    rootRef,
    ({ reduce: still, desktop }) => {
      const root = rootRef.current;
      if (still || !root) return;
      const book = root.querySelector<HTMLElement>('.ch06-book');
      if (!book) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: book, start: 'top 80%' } });
      // clearProps: once settled, nothing keeps a transform (no lingering stacking contexts).
      tl.from(book, { opacity: 0, y: 48, duration: 1.3, ease: 'power3.out', clearProps: 'opacity,transform' }, 0);
      const cover = book.querySelector('.ch06-cover__photo');
      if (cover) {
        tl.from(
          cover,
          { opacity: 0, scale: 1.05, rotation: -5, duration: 1.1, ease: 'power3.out', clearProps: 'opacity,transform' },
          0.45,
        );
      }
      const tabs = book.querySelectorAll('.ch06-tab');
      if (tabs.length) {
        tl.from(
          tabs,
          desktop
            ? { opacity: 0, x: -16, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform' }
            : { opacity: 0, y: 8, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'opacity,transform' },
          0.6,
        );
      }
    },
    [isDesktop],
  );

  return (
    <ChapterSection number={6} ref={rootRef} className="ch06">
      <LightLeak tone="gold" position="top-right" intensity={0.3} />

      <div className="container ch06-inner">
        <div className="ch06-header">
          <ChapterHeading number={6} className="ch06-head" />
          <Reveal className="ch06-intro" stagger={0.14}>
            {intro.map((p) => (
              <p key={p} className="t-lead ch06-intro__p">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <div className="ch06-book">
          <div className="ch06-cloth" aria-hidden="true" />
          <span className="ch06-ribbon" aria-hidden="true" />

          <div className="ch06-page ch06-page--left">
            <CoverPage />
          </div>

          <div
            ref={tablistRef}
            role="tablist"
            aria-label={ui.albumLabel}
            aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
            className="ch06-tabs"
          >
            {sections.map((s, i) => {
              const selected = s.id === active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabRefs.current[s.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(s.id)}
                  aria-selected={selected}
                  aria-controls={panelId(s.id)}
                  tabIndex={selected ? 0 : -1}
                  className="ch06-tab"
                  data-tone={i % 5}
                  onClick={() => select(s.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="ch06-page ch06-page--right">
            <div
              ref={pagesRef}
              className="ch06-pages"
              data-mode={turn?.mode}
              data-dir={turn?.mode === 'flip' ? turn.dir : undefined}
            >
              {sections.map((s) => {
                const state = s.id === active ? 'active' : turn && s.id === turn.from ? 'leaving' : 'idle';
                const isActive = state === 'active';
                return (
                  <div
                    key={s.id}
                    role="tabpanel"
                    id={panelId(s.id)}
                    aria-labelledby={tabId(s.id)}
                    aria-hidden={isActive ? undefined : true}
                    inert={!isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={`ch06-panel ch06-panel--${s.id}`}
                    data-section={s.id}
                    data-state={state}
                  >
                    <SectionPage id={s.id} />
                    <div className="ch06-panel__foot" aria-hidden="true">
                      <span className="ornament-rule">
                        <span />
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={castRef} className="ch06-cast" aria-hidden="true" />
              <div ref={backRef} className="ch06-leafback" aria-hidden="true" />
            </div>
          </div>
        </div>

        <SplitReveal text={keyLine} by="lines" className="keyline keyline--large ch06-keyline" />
      </div>
    </ChapterSection>
  );
}
