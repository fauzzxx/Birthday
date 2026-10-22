import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import './hidden-note.css';

interface HiddenNoteProps {
  /** The note itself — short, handwritten, personal. */
  text: string;
  /** Where to place the glyph (absolute positioning inside a relatively positioned parent). */
  style?: CSSProperties;
  className?: string;
  /** Which side the note unfolds towards. */
  side?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * A tiny folded note hidden in a scene, rewarding whoever looks closely.
 * A small gold glyph; press it (mouse, touch or keyboard) to unfold the note.
 * Escape or clicking elsewhere folds it again.
 */
export function HiddenNote({ text, style, className = '', side = 'top' }: HiddenNoteProps) {
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={`hidden-note hidden-note--${side} ${className}`} style={style} data-open={open || undefined}>
      <button
        ref={buttonRef}
        type="button"
        className={`hidden-note__glyph ${found ? 'is-found' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen((o) => !o);
          setFound(true);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5c.9 3.6 2.1 4.9 5.5 5.7-3.4.9-4.6 2.1-5.5 5.7-.9-3.6-2.1-4.8-5.5-5.7 3.4-.8 4.6-2.1 5.5-5.7z" />
          <circle cx="18.5" cy="17.5" r="1.1" />
          <circle cx="6" cy="18.5" r="0.8" />
        </svg>
        <span className="visually-hidden">{open ? 'Fold the little note' : 'A little note — open it'}</span>
      </button>
      <span id={id} className="hidden-note__paper" role="note" hidden={!open}>
        {text}
      </span>
    </span>
  );
}
