import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

interface DustFieldProps {
  /** Number of motes. Keep it low — this is atmosphere, not confetti. */
  count?: number;
  /** 'drift' = dust in a beam of light; 'rise' = tiny lights floating upward (finale). */
  mode?: 'drift' | 'rise';
  /** RGB triplet, e.g. '255, 214, 150'. */
  color?: string;
  /** Largest mote radius in CSS px. */
  size?: number;
  /** Overall speed multiplier. */
  speed?: number;
  className?: string;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
  phase: number;
  twinkle: number;
}

/**
 * Floating dust / rising points of light, drawn on a single small canvas.
 * Runs only while on screen and while the tab is visible; renders one still
 * frame for reduced motion. Absolutely fills its (relatively positioned) parent.
 */
export function DustField({
  count = 36,
  mode = 'drift',
  color = '255, 222, 170',
  size = 2.2,
  speed = 1,
  className = '',
}: DustFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let last = performance.now();

    // Pre-rendered soft glow sprite (much cheaper than shadowBlur per mote).
    const sprite = document.createElement('canvas');
    const S = 64;
    sprite.width = sprite.height = S;
    const sctx = sprite.getContext('2d')!;
    const g = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, `rgba(${color}, 1)`);
    g.addColorStop(0.18, `rgba(${color}, 0.85)`);
    g.addColorStop(0.45, `rgba(${color}, 0.22)`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, S, S);

    const spawn = (initial: boolean): Mote => ({
      x: Math.random() * w,
      y: mode === 'rise' ? (initial ? Math.random() * h : h + 10) : Math.random() * h,
      r: (0.35 + Math.random() * 0.65) * size,
      a: 0.25 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 6,
      vy: mode === 'rise' ? -(10 + Math.random() * 22) : (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.4 + Math.random() * 1.4,
    });

    let motes: Mote[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(1, (w * h) / (1280 * 800));
      const n = Math.max(8, Math.round(count * (0.45 + 0.55 * density)));
      motes = Array.from({ length: n }, () => spawn(true));
      draw(0, performance.now());
    };

    const draw = (dt: number, now: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        if (dt) {
          m.x += (m.vx + Math.sin(now / 2400 + m.phase) * 4) * dt * speed;
          m.y += m.vy * dt * speed;
          if (mode === 'rise') {
            if (m.y < -12) Object.assign(m, spawn(false));
          } else {
            if (m.y < -10) m.y = h + 10;
            if (m.y > h + 10) m.y = -10;
          }
          if (m.x < -10) m.x = w + 10;
          if (m.x > w + 10) m.x = -10;
        }
        let alpha = m.a * (0.55 + 0.45 * Math.sin(now / 1000 * m.twinkle + m.phase));
        if (mode === 'rise') alpha *= Math.min(1, m.y / (h * 0.35));
        if (alpha <= 0.01) continue;
        const d = m.r * 7;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, m.x - d / 2, m.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt, now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduce || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: '100px' },
    );
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, mode, color, size, speed]);

  return <canvas ref={canvasRef} className={`dust-field ${className}`} aria-hidden="true" />;
}
