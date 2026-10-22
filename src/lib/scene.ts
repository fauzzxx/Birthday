import type { RefObject } from 'react';
import { gsap, useGSAP } from './gsap';
import { MQ } from './motion';

export interface SceneConditions {
  /** Visitor prefers reduced motion → show final states, no scrubbing, no pinning. */
  reduce: boolean;
  /** ≥ 900px wide. Pinned/scrubbed choreography is allowed. */
  desktop: boolean;
  /** < 900px wide. Prefer simple enter animations; avoid pins. */
  mobile: boolean;
  /** Mouse/trackpad present → pointer-responsive effects allowed. */
  finePointer: boolean;
}

/**
 * The standard way to animate a scene.
 *
 *   const root = useRef<HTMLElement>(null);
 *   useScene(root, ({ reduce, desktop }) => {
 *     if (reduce) return;               // final state is the default markup
 *     gsap.from('.thing', { ... , scrollTrigger: { trigger: '.thing' } });
 *   });
 *
 * - Selector strings are scoped to `scope`.
 * - Every tween / ScrollTrigger / SplitText created inside is reverted automatically
 *   on unmount AND whenever the conditions change (resize across 900px, motion setting).
 * - You may return a cleanup function for anything non-GSAP (event listeners).
 * - Write markup so the FINAL state is the default; animate FROM hidden states.
 *   If animation fails, everything is still visible and readable.
 */
export function useScene(
  scope: RefObject<Element | null>,
  setup: (conditions: SceneConditions) => void | (() => void),
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { reduce: MQ.reduce, desktop: MQ.desktop, finePointer: MQ.finePointer },
        (context) => {
          const c = context.conditions as { reduce: boolean; desktop: boolean; finePointer: boolean };
          return setup({
            reduce: !!c.reduce,
            desktop: !!c.desktop,
            mobile: !c.desktop,
            finePointer: !!c.finePointer && !c.reduce,
          });
        },
        scope.current ?? undefined,
      );
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
