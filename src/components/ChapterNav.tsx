import { useEffect, useRef, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { chapters, pad2, type ChapterMeta } from '../content/chapters';
import { scrollToChapter } from '../lib/navigation';
import './chapter-nav.css';

/**
 * The persistent, unobtrusive chapter indicator.
 *  - Desktop: a slim rail of 13 marks on the right edge; the current chapter's
 *    mark is drawn in gold, and a hairline shows overall progress.
 *  - Mobile: a small pill at the bottom-left with the current chapter.
 * Either one opens the full chapter list (a native modal dialog).
 */
export function ChapterNav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Which chapter is in the middle of the screen?
  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.slug))
      .filter((el): el is HTMLElement => !!el);
    // The rose and the album epilogue count as part of the final chapter.
    document.querySelectorAll<HTMLElement>('.album, .rose').forEach((el) => sections.push(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const n = Number((entry.target as HTMLElement).dataset.chapter);
            if (n) setActive(n);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Overall reading progress (a thin gold hairline), throttled to animation frames.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressRef.current?.style.setProperty('--progress', p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  const openMenu = (trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setMenuOpen(true);
  };

  const go = (c: ChapterMeta) => {
    setMenuOpen(false);
    // Let the dialog close (and release focus) before gliding.
    requestAnimationFrame(() => scrollToChapter(c.slug));
  };

  const current = chapters[active - 1];

  return (
    <>
      <nav className="chapter-nav" data-visible={visible || undefined} aria-label="Chapters">
        {/* Desktop rail */}
        <div className="chapter-nav__rail">
          <span ref={progressRef} className="chapter-nav__progress" aria-hidden="true" />
          <ol className="chapter-nav__marks" role="list">
            {chapters.map((c) => (
              <li key={c.slug}>
                <a
                  href={`#${c.slug}`}
                  className="chapter-nav__mark"
                  aria-current={c.number === active ? 'step' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToChapter(c.slug);
                  }}
                >
                  <span className="chapter-nav__tick" aria-hidden="true" />
                  <span className="chapter-nav__label">
                    <span className="chapter-nav__label-num">{pad2(c.number)}</span>
                    {c.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="chapter-nav__menu-btn"
            onClick={(e) => openMenu(e.currentTarget)}
            aria-haspopup="dialog"
          >
            <BookOpen aria-hidden="true" />
            <span className="visually-hidden">All chapters</span>
          </button>
        </div>

        {/* Mobile pill */}
        <button
          type="button"
          className="chapter-nav__pill"
          onClick={(e) => openMenu(e.currentTarget)}
          aria-haspopup="dialog"
        >
          <span className="chapter-nav__pill-num" aria-hidden="true">
            {pad2(active)}
          </span>
          <span className="chapter-nav__pill-title" aria-hidden="true">
            {current.title}
          </span>
          <span className="visually-hidden">
            Chapter {active} of {chapters.length}: {current.title}. Open the list of chapters.
          </span>
        </button>
      </nav>

      <dialog
        ref={dialogRef}
        className="chapter-menu"
        aria-labelledby="chapter-menu-title"
        onClose={() => {
          setMenuOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="chapter-menu__inner">
          <div className="chapter-menu__head">
            <p className="t-eyebrow">The Woman Who Made Me</p>
            <h2 id="chapter-menu-title" className="chapter-menu__title">
              Chapters
            </h2>
            <button type="button" className="chapter-menu__close" onClick={() => setMenuOpen(false)} autoFocus>
              <X aria-hidden="true" />
              <span className="visually-hidden">Close chapter list</span>
            </button>
          </div>
          <ol className="chapter-menu__list" role="list">
            {chapters.map((c) => (
              <li key={c.slug}>
                <a
                  href={`#${c.slug}`}
                  className="chapter-menu__item"
                  aria-current={c.number === active ? 'step' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(c);
                  }}
                >
                  <span className="chapter-menu__num">{pad2(c.number)}</span>
                  <span className="chapter-menu__name">{c.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </dialog>
    </>
  );
}
