import type { CSSProperties } from 'react';

interface LightLeakProps {
  /** Warm film light-leak colours. */
  tone?: 'amber' | 'rose' | 'gold' | 'lamp';
  /** Where the light pours in from. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top';
  /** 0–1 */
  intensity?: number;
  className?: string;
  style?: CSSProperties;
}

/** A slow, breathing wash of warm light — like late-afternoon sun on old film. */
export function LightLeak({ tone = 'amber', position = 'top-right', intensity = 0.6, className = '', style }: LightLeakProps) {
  return (
    <div
      className={`light-leak light-leak--${tone} light-leak--${position} ${className}`}
      style={{ ...style, ['--leak-intensity' as string]: intensity }}
      aria-hidden="true"
    />
  );
}
