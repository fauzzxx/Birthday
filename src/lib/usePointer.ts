import { useEffect, type RefObject } from 'react';
import { MQ, prefersReducedMotion } from './motion';

/**
 * Subtle pointer-responsive depth for desktop.
 * Writes --px and --py (each -1 … 1, eased) onto the element as the mouse moves
 * across the viewport. Use them in CSS, e.g.
 *   transform: translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * 8px), 0);
 * Does nothing on touch devices or with reduced motion. Pauses off-screen.
 */
export function usePointerDepth(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (prefersReducedMotion() || !window.matchMedia(MQ.finePointer).matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let visible = false;

    const tick = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      if (Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!visible || e.pointerType !== 'mouse') return;
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      el.style.removeProperty('--px');
      el.style.removeProperty('--py');
    };
  }, [ref, enabled]);
}
