import { ma } from '../settings';

/**
 * Quiet lines that sit on the golden thread between chapters — moments of
 * stillness. Set any of them to '' for pure silence.
 */
export const interludes = {
  /** The landing rose, before chapter 01. */
  rose: {
    eyebrow: `A birthday story for ${ma}`,
    hint: 'Scroll slowly',
    line: `For you, ${ma}.`,
  },
  /** between 06 and 07 */
  beforeStrength: 'Some of it, you carried quietly.',
  /** between 08 and 09 */
  beforeGrowingUp: 'And then, I grew up.',
  /** between 10 and 11 */
  beforeHands: 'At the end of every day…',
  /** between 11 and 12 */
  beforeLetter: 'There is something I have been trying to say.',
  /** between 12 and 13 */
  beforeCelebration: 'And so, today —',
};
