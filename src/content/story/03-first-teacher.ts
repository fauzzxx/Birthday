import type { PhotoId } from '../photos';

/** Chapter 03 — My first teacher was you */
export const firstTeacher = {
  photo: 'ma-black-gold-saree-portrait' as PhotoId,
  /** Optional slot for a real school photograph (hidden until one is added in photos.ts). */
  schoolPhoto: 'school-days' as PhotoId,
  intro: 'I never went to nursery.',
  story: [
    'You taught me at home. When I finally walked into school, I went straight into UKG.',
    'You helped me learn to write. You sat with my homework, built school projects with me, and made sure I understood my subjects.',
    'You did it for years — while managing our whole family at the same time.',
  ],
  /** Written down the notebook margin, ticked off one by one. */
  checklist: ['Handwriting', 'Homework', 'School projects', 'Understanding every subject'],
  /** UI: accessible name of the ticked list in the notebook margin. */
  checklistLabel: 'Ticked off, one by one',
  /** Practice line on the notebook page, written shakily first, then clearly. */
  practice: 'a  b  c  d  e',
  keyLine: 'My first classroom was home. My first teacher was you.',
  hiddenNote: 'Every letter I write, you taught me first.',
};
