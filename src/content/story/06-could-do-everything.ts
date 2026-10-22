import { ma } from '../settings';
import type { PhotoId } from '../photos';
import { ph, type Fillable } from '../types';

/**
 * Chapter 06 — The woman who could do everything
 * Anything wrapped in ph(...) is a PLACEHOLDER waiting for a real detail.
 * Replace it with a plain string, e.g.   name: 'Chicken biryani',
 */
export const couldDoEverything = {
  coverPhoto: 'ma-teal-saree-jhumkas' as PhotoId,
  kitchenPhoto: 'ma-cooking' as PhotoId,
  favouritePhoto: 'ma-yellow-saree-full' as PhotoId,
  intro: [
    'You are the best cook I have ever known. If I ask you to make something, you try your best to make my wish come true.',
    'You know about education, politics, movies, songs, cricket — everything. A true all-rounder. You are intelligent, curious, practical, and the hardest-working woman I have ever seen.',
  ],
  album: {
    kitchen: {
      title: `From ${ma}’s kitchen`,
      note: 'If I ask, you make it. Every time, you try your best.',
      dishes: [
        {
          name: ph('Her favourite dish to cook', 'the dish she is proudest of') as Fillable,
          note: ph('Why it matters, or a small memory') as Fillable,
        },
        { name: ph('The dish I always ask for') as Fillable, note: ph('When she makes it for me') as Fillable },
        {
          name: ph('Her special-occasion dish', 'e.g. for Eid or birthdays') as Fillable,
          note: ph('A family detail about it') as Fillable,
        },
      ],
    },
    knows: {
      title: `Things ${ma} knows about`,
      note: 'Ask her anything. Honestly — anything.',
      subjects: [
        { subject: 'Education', detail: ph('Something she always says about studying') as Fillable },
        { subject: 'Politics', detail: ph('A topic she loves to discuss') as Fillable },
        { subject: 'Movies', detail: ph('Her favourite film') as Fillable },
        { subject: 'Songs', detail: ph('A song she loves') as Fillable },
        { subject: 'Cricket', detail: ph('A cricket memory or favourite player') as Fillable },
      ],
    },
    sayings: {
      title: 'Things she says',
      items: [
        ph('A family saying of hers', 'in her own words — any language') as Fillable,
        ph('Another thing she always says') as Fillable,
      ],
    },
    funny: {
      title: 'Funny family moments',
      items: [ph('A funny family moment') as Fillable, ph('Another one that still makes everyone laugh') as Fillable],
    },
    favourite: {
      title: 'The favourite',
      text: 'Some people say you are biased towards me. Honestly? I treasure every bit of that special affection.',
    },
  },
  keyLine: `You never needed to know everything about the world, ${ma}. Somehow, whenever I needed you, you knew exactly what to do.`,
  hiddenNote: 'Yes, I know I’m the favourite. No, I’m not giving it back.',
  /** Small interface labels for the album (tab names, screen-reader names). */
  ui: {
    albumLabel: `Pages of ${ma}’s album`,
    tabs: {
      kitchen: 'Kitchen',
      knows: `Ask ${ma}`,
      sayings: 'Sayings',
      funny: 'Funny moments',
      favourite: 'The favourite',
    },
  },
};
