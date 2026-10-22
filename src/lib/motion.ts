import { useSyncExternalStore } from 'react';

/**
 * Motion preferences.
 * Respects the OS "reduce motion" setting. For previewing, the reduced-motion
 * version can also be forced by adding ?reduced-motion to the URL.
 */
const forced =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('reduced-motion');

if (forced && typeof document !== 'undefined') {
  document.documentElement.classList.add('force-reduced-motion');
}

/** Media queries for gsap.matchMedia(). 'all' always matches, 'not all' never does. */
export const MQ = {
  reduce: forced ? 'all' : '(prefers-reduced-motion: reduce)',
  motion: forced ? 'not all' : '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 900px)',
  mobile: '(max-width: 899.98px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

const reduceQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function prefersReducedMotion(): boolean {
  return forced || !!reduceQuery?.matches;
}

function subscribe(callback: () => void) {
  reduceQuery?.addEventListener('change', callback);
  return () => reduceQuery?.removeEventListener('change', callback);
}

/** React hook: true when the visitor prefers reduced motion (live-updates). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

const desktopQuery = typeof window !== 'undefined' ? window.matchMedia(MQ.desktop) : null;
function subscribeDesktop(callback: () => void) {
  desktopQuery?.addEventListener('change', callback);
  return () => desktopQuery?.removeEventListener('change', callback);
}
/** React hook: true at ≥ 900px wide (live-updates). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, () => !!desktopQuery?.matches, () => true);
}
