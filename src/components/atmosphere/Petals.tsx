import { useEffect, useMemo, useRef } from 'react';

interface PetalsProps {
  /** Restraint: 6–14 petals is plenty. */
  count?: number;
  /** CSS colour of the petals. */
  color?: string;
  seed?: number;
  className?: string;
}

/**
 * A few petals drifting slowly down through a scene. Pure CSS animation,
 * paused while off-screen; hidden entirely for reduced motion.
 */
export function Petals({ count = 9, color = 'var(--rose)', seed = 7, className = '' }: PetalsProps) {
  const ref = useRef<HTMLDivElement>(null);

  const petals = useMemo(() => {
    let s = seed;
    const r = () => {
      s = (s * 16807) % 2147483647;
      return (s % 1000) / 1000;
    };
    return Array.from({ length: count }, (_, i) => ({
      left: `${(i / count) * 100 + r() * (100 / count)}%`,
      size: 9 + r() * 9,
      duration: 16 + r() * 14,
      delay: -r() * 30,
      sway: 30 + r() * 70,
      spin: 180 + r() * 360,
      opacity: 0.45 + r() * 0.4,
    }));
  }, [count, seed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? 'false' : 'true';
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`petals ${className}`} aria-hidden="true" data-paused="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petals__petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.72,
            color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--sway' as string]: `${p.sway}px`,
            ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
