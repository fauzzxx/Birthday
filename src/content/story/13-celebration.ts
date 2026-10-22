import { ma, settings } from '../settings';
import type { PhotoId } from '../photos';

/** Chapter 13 — Today, the world celebrates you */
export const celebration = {
  greeting: `Happy Birthday, ${ma}.`,
  message:
    'Today is not just a celebration of the day you were born. It is a celebration of all the love you have brought into this world, especially into mine.',
  lightLabel: 'Light the candles',
  wishLabel: 'Make a wish & blow',
  wishMade: 'Wish made.',
  relightLabel: 'Light them again',
  collage: [
    'ma-family-wedding-evening',
    'ma-yellow-saree-selfie',
    'ma-family-selfie-red-dupatta',
    'ma-maroon-saree-pose',
    'ma-saree-collage',
    'ma-teal-saree-jhumkas',
    'ma-with-loved-one',
    'car-ride-together',
  ] as PhotoId[],
  /** The final photograph. If 'us-together' has no photo yet, `finalPhotoFallback` is shown. */
  finalPhoto: 'us-together' as PhotoId,
  finalPhotoFallback: 'ma-black-gold-saree-portrait' as PhotoId,
  /**
   * A quiet moment before the cake: things a son feels but rarely says.
   * These are feelings, not memories — edit or remove any line freely.
   */
  unsaid: {
    title: 'Things I have never said out loud',
    items: [
      'I am proud to be your son. I don’t say it nearly enough.',
      'You were the first person to believe in me, long before I believed in myself.',
      'Your blessings have followed me everywhere — into classrooms, into exams, into rooms you have never seen.',
      'Everything good in me, I can trace back to you.',
      'However old I get, some part of me will always be the little boy who needs you.',
      'Your happiness matters to me more than I know how to show.',
      'You never had to earn my love. You have had it from my very first breath.',
    ],
  },
  /** A personal closing message — grounded in the story above. Edit freely. */
  closing: 'Thank you for every night, every lesson, every meal and every time you forgave me.',
  finalLine: 'If I get to choose a thousand times, I will always be grateful that I got to be your son.',
  /** Optional birthday blessing. Set to '' to hide it. */
  blessing: `May this year be gentle with you, ${ma} — full of good health, real rest and quiet happiness.`,
  signOff: settings.son.signOff,
  signature: settings.son.signature,
  name: settings.son.name,
  albumLabel: 'Open the album',
  replayLabel: 'Begin our story again',
  /** UI: describes the illustrated cake for screen readers. */
  cakeLabel: 'An illustrated two-tier birthday cake on a slender gold stand, with candles.',
  /** UI: announced politely when the candles have been lit. */
  candlesLitStatus: 'The candles are lit.',
};
