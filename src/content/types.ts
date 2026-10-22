/** Shared content types. Story text lives in ./chapters, photos in ./photos.ts, names in ./settings.ts. */

export interface GeneratedPhoto {
  width: number;
  height: number;
  variants: { w: number; src: string }[];
  /** Tiny blurred preview shown while the real image loads. */
  lqip: string;
}

export interface PhotoEntry {
  /**
   * Key of the optimised photo: "<category>/<file-name-without-extension>" from /photos,
   * e.g. "mother/ma-pink-dupatta". Use `null` for a slot that still needs a photograph.
   */
  file: string | null;
  /** Describes what is visible, for screen readers. Required for every real photo. */
  alt: string;
  /** Short caption shown under framed photos (optional). */
  caption?: string;
  /** CSS object-position used when the photo is cropped, e.g. "50% 30%". */
  focus?: string;
  /** For placeholders only: what kind of photo belongs here. */
  wanted?: string;
}

/**
 * A line of text that is still waiting for a real detail from the family.
 * Rendered as a clearly-labelled placeholder while developing; hidden in the
 * finished site unless settings.placeholders is 'show'.
 */
export interface Placeholder {
  placeholder: true;
  /** What belongs here, e.g. "Her favourite dish". */
  label: string;
  /** Optional hint for whoever fills it in. */
  hint?: string;
}

export type Fillable = string | Placeholder;

export const isPlaceholder = (value: unknown): value is Placeholder =>
  typeof value === 'object' && value !== null && (value as Placeholder).placeholder === true;

export const ph = (label: string, hint?: string): Placeholder => ({ placeholder: true, label, hint });

export type ThemeName =
  | 'night'
  | 'midnight'
  | 'dusk'
  | 'paper'
  | 'ivory'
  | 'rose'
  | 'dawn'
  | 'espresso'
  | 'lamplight'
  | 'burgundy';
