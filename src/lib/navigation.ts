import { chapterTitleId, type ChapterSlug } from '../content/chapters';
import { gsap } from './gsap';
import { prefersReducedMotion } from './motion';

/**
 * Smoothly scroll to a chapter (or the very top) and move keyboard focus to its
 * heading, so screen-reader and keyboard users land in the right place.
 * Native scrolling stays in charge: any wheel/touch input cancels the glide.
 */
export function scrollToChapter(slug: ChapterSlug | 'top', options: { focus?: boolean } = {}) {
  const { focus = true } = options;
  const target = slug === 'top' ? 0 : document.getElementById(slug);
  if (target === null) return;

  const targetY = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
  const distance = Math.abs(targetY - window.scrollY);

  const finish = () => {
    if (!focus || slug === 'top') return;
    const heading = document.getElementById(chapterTitleId(slug));
    heading?.focus({ preventScroll: true });
  };

  if (prefersReducedMotion() || distance < 2) {
    window.scrollTo({ top: targetY, behavior: 'auto' });
    finish();
    return;
  }

  gsap.to(window, {
    scrollTo: { y: targetY, autoKill: true },
    duration: gsap.utils.clamp(0.9, 2.6, distance / 4200),
    ease: 'power2.inOut',
    onComplete: finish,
    onInterrupt: finish,
  });
}
