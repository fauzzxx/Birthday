import type { PhotoId } from '../photos';

/** Chapter 09 — The boy grew up. Your love never did. (The emotional turning point.) */
export const boyGrewUp = {
  /** The image transition: from a childhood photograph to a recent one. */
  morph: {
    /** Shown whole (never cropped): everyone in this family portrait stays in frame. */
    from: 'early-family-portrait' as PhotoId,
    fromLabel: 'Then',
    /** If 'us-together' gets a real photo in photos.ts, it is used instead of `to`. */
    preferredTo: 'us-together' as PhotoId,
    to: 'ma-green-kurta-knowing-smile' as PhotoId,
    toLabel: 'Still',
  },
  opening: 'In your eyes, I am still four or five years old — the little boy you once took care of.',
  growingUp:
    'But I am growing up now, trying to figure out my future, my responsibilities and what is going on in my own life. You don’t always see what I am working through — and none of that is your fault.',
  admission:
    'Sometimes, I speak roughly to you. I regret those moments. My struggles do not excuse hurting you, and I want to take responsibility for the way I speak and the way I behave.',
  keyLine:
    'Sometimes I forget how much my words can hurt the person who has spent her entire life protecting my heart. You deserve gentleness from me, especially on the days when I am struggling to find it within myself.',
  apology:
    'I am sorry for the times I have spoken roughly, for the times I have failed to understand you, and for the times I have made you worry. I cannot change those moments, but I can work on the man I am becoming.',
  gratitude: [
    'You keep forgiving me, and you keep helping me become a better person, every single day. I never want to take that for granted.',
    'Even now, your first priority is my future — my plans, my master’s degree. I love that you believe in it.',
  ],
};
