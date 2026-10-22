/**
 * ─────────────────────────────────────────────────────────────
 *  Names, sign-offs and switches. Edit freely — nothing else
 *  in the code needs to change.
 * ─────────────────────────────────────────────────────────────
 */
export const settings = {
  mother: {
    /** How you address her throughout the story ("Happy Birthday, Mamma."). e.g. 'Ma', 'Ammi'. */
    salutation: 'Mamma',
    /** Written on the sealed envelope in Chapter 12. */
    envelopeName: 'Mamma',
  },

  son: {
    /** Closing words above the signature (letter + finale). */
    signOff: 'Always your little boy,',
    /** The signature itself. */
    signature: 'Your son',
    /** Optional: your first name, shown in small type under the signature. Leave '' to hide. */
    name: '',
  },

  /**
   * Placeholders mark details that are still missing (a favourite dish, a school photo…).
   *  'auto' — visible while running `npm run dev`, hidden in the built site.
   *  'show' — always visible.
   *  'hide' — never visible (missing items are simply left out).
   */
  placeholders: 'auto' as 'auto' | 'show' | 'hide',

  audio: {
    /** Path to your own music in /public/audio, e.g. '/audio/ambient.mp3'. null = generated ambient score. */
    src: null as string | null,
    /** 0–1. Keep it soft; the music should sit underneath the words. */
    volume: 0.55,
    /** Whether the "Sound" switch on the opening screen starts switched on. */
    onByDefault: true,
  },

  rose: {
    /**
     * Your rose video, scrubbed as she scrolls into the birthday (see public/video/README.md).
     * e.g. '/video/rose-bloom.mp4'. null = an illustrated rose opens instead.
     */
    src: null as string | null,
    /** Optional still image shown before the video loads, e.g. '/video/rose-bloom-poster.jpg'. */
    poster: null as string | null,
  },

  finale: {
    /** Purely decorative — not her age. */
    candles: 5,
  },
};

export const ma = settings.mother.salutation;
