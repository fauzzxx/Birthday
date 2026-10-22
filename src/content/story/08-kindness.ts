import type { PhotoId } from '../photos';

/** Chapter 08 — A heart that chooses kindness */
export const kindness = {
  photo: 'ma-pink-dupatta' as PhotoId,
  lines: [
    'You are the purest, kindest soul I have ever known. No one comes close.',
    'When someone hurts you, you never shout and you never reach for anger. You remind yourself that Allah is watching, and you trust that everything will be all right.',
    'You never ask for anything for yourself. You only want everyone else to be happy — so much that you often forget your own needs.',
    'And you have forgiven me more times than I can count.',
  ],
  /** Handled gently: facts only, no invented feelings or details. */
  remembrance: {
    lines: [
      'You lost your father only months after your marriage.',
      'Around ten years ago, you lost your mother.',
      'I will not pretend to know everything you carried through those years.',
      'I only know that you kept choosing kindness.',
      'And I want you to know: you will always have me.',
    ],
    /** Optional prayer for your grandparents. Set to '' to remove it. */
    prayer: 'May Allah have mercy on them both.',
  },
  keyLine:
    'You taught me that kindness is not weakness, that forgiveness is a choice, and that Allah sees the goodness people sometimes fail to notice.',
  hiddenNote: 'You have forgiven me more times than I deserve. I have noticed every single one.',
};
