import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { chapter, chapterTitleId, pad2, type ChapterNumber } from '../content/chapters';
import type { ThemeName } from '../content/types';

interface ChapterSectionProps {
  number: ChapterNumber;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Override the theme from chapters.ts (rarely needed). */
  theme?: ThemeName;
  /** Remove the default vertical padding (for full-bleed / pinned scenes). */
  flush?: boolean;
}

/**
 * The outer <section> of every chapter. Supplies the id used by navigation,
 * the colour theme, and the accessible name (via the chapter heading).
 */
export const ChapterSection = forwardRef<HTMLElement, ChapterSectionProps>(function ChapterSection(
  { number, children, className = '', style, theme, flush = false },
  ref,
) {
  const meta = chapter(number);
  return (
    <section
      ref={ref}
      id={meta.slug}
      data-chapter={number}
      data-theme={theme ?? meta.theme}
      aria-labelledby={chapterTitleId(meta.slug)}
      className={`chapter chapter--${pad2(number)} ${flush ? 'chapter--flush' : ''} ${className}`}
      style={style}
    >
      {children}
    </section>
  );
});

interface ChapterHeadingProps {
  number: ChapterNumber;
  /** Visual size of the title. */
  size?: 'display' | 'title' | 'headline';
  align?: 'start' | 'center';
  className?: string;
  /** Render the title differently (e.g. split across lines); must still be the chapter title. */
  children?: ReactNode;
  /** Hide visually but keep for screen readers (when the scene shows the title another way). */
  hidden?: boolean;
}

/**
 * "CHAPTER 03 ——" eyebrow + the chapter title as an <h2>. The <h2> receives
 * focus after chapter navigation (tabIndex -1), so keyboard users land here.
 */
export function ChapterHeading({ number, size = 'title', align = 'start', className = '', children, hidden }: ChapterHeadingProps) {
  const meta = chapter(number);
  return (
    <header
      className={`chapter__head ${align === 'center' ? 'chapter__head--center' : ''} ${hidden ? 'visually-hidden' : ''} ${className}`}
    >
      <p className="t-eyebrow chapter__number">
        <span>Chapter {pad2(number)}</span>
      </p>
      <h2 id={chapterTitleId(meta.slug)} tabIndex={-1} className={`chapter__title t-${size}`}>
        {children ?? meta.title}
      </h2>
    </header>
  );
}
