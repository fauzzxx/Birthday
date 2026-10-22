import type { ThemeName } from './types';

/**
 * The thirteen chapters, in order. The chapter navigation, section ids and
 * colour themes all come from here. Chapter text lives in ./story/.
 */
export const chapters = [
  { number: 1, slug: 'before-the-world-knew-me', title: 'Before the world knew me', theme: 'night' },
  { number: 2, slug: 'the-little-boy', title: 'The little boy who needed you', theme: 'night' },
  { number: 3, slug: 'my-first-teacher', title: 'My first teacher was you', theme: 'paper' },
  { number: 4, slug: 'our-little-world', title: 'Our little world', theme: 'dusk' },
  { number: 5, slug: 'a-thousand-nights', title: 'A thousand nights of never giving up', theme: 'midnight' },
  { number: 6, slug: 'could-do-everything', title: 'The woman who could do everything', theme: 'ivory' },
  { number: 7, slug: 'the-strength-nobody-saw', title: 'The strength nobody saw', theme: 'rose' },
  { number: 8, slug: 'a-heart-that-chooses-kindness', title: 'A heart that chooses kindness', theme: 'dawn' },
  { number: 9, slug: 'the-boy-grew-up', title: 'The boy grew up. Your love never did.', theme: 'espresso' },
  { number: 10, slug: 'lessons-without-a-textbook', title: 'The things you taught me without a textbook', theme: 'paper' },
  { number: 11, slug: 'the-hands', title: 'The hands I want to take care of now', theme: 'lamplight' },
  { number: 12, slug: 'a-letter-from-your-son', title: 'A letter from your son', theme: 'burgundy' },
  { number: 13, slug: 'today-the-world-celebrates-you', title: 'Today, the world celebrates you', theme: 'burgundy' },
] as const satisfies readonly { number: number; slug: string; title: string; theme: ThemeName }[];

export type ChapterMeta = (typeof chapters)[number];
export type ChapterNumber = ChapterMeta['number'];
export type ChapterSlug = ChapterMeta['slug'];

export const chapter = (n: ChapterNumber): ChapterMeta => chapters[n - 1];

/** id of a chapter's heading element (used for aria-labelledby and focus after navigation). */
export const chapterTitleId = (slug: ChapterSlug) => `${slug}__title`;

export const pad2 = (n: number) => String(n).padStart(2, '0');
