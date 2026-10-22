import { isPlaceholder, type Fillable } from '../content/types';
import { showPlaceholders } from '../lib/placeholders';

/**
 * Renders a piece of content that may still be a placeholder.
 * Real text renders as-is. A placeholder renders as a clearly-marked
 * "to add" chip while developing, and as nothing in the finished site.
 */
export function Fill({ value, className }: { value: Fillable; className?: string }) {
  if (!isPlaceholder(value)) return <span className={className}>{value}</span>;
  if (!showPlaceholders) return null;
  return (
    <span className={`placeholder-text ${className ?? ''}`} title="Placeholder — add the real detail in src/content/story">
      To add: {value.label}
      {value.hint && <span className="placeholder-text__hint"> ({value.hint})</span>}
    </span>
  );
}

/** True if this value should take up space on the page (real text, or visible placeholder). */
export function isVisible(value: Fillable): boolean {
  return !isPlaceholder(value) || showPlaceholders;
}
