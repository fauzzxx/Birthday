import type { PhotoId } from '../photos';

/** Chapter 04 — Our little world */
export const littleWorld = {
  photos: ['car-ride-together', 'ma-hijab-with-little-one', 'little-me-at-home'] as PhotoId[],
  beats: [
    'When I was small, I watched Tom and Jerry.',
    'You fed me while I watched. You cared for me. You made ordinary days feel safe.',
  ],
  keyLine:
    'I did not know then that these ordinary little moments would become some of the things I would miss most when I grew older.',
  tvOn: 'Turn on the TV',
  tvOff: 'Turn off the TV',
  /** UI: accessible descriptions of the illustrated television (no characters are drawn). */
  tvAltOn: 'An old wooden television on a low cabinet; on its screen, two soft shapes chase each other.',
  tvAltOff: 'An old wooden television on a low cabinet, switched off.',
  hiddenNote: 'Cartoons on the screen. You, with my plate, right beside me.',
};
