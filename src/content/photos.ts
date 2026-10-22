import type { PhotoEntry } from './types';

/**
 * ─────────────────────────────────────────────────────────────
 *  PHOTO MANIFEST
 *  Every photograph used in the story is listed here once.
 *
 *  To replace or add a photo:
 *   1. Put the original in /photos/<category>/<descriptive-name>.jpg
 *   2. Run `npm run photos`
 *   3. Point an entry below at "<category>/<descriptive-name>"
 *
 *  `focus` is where the important part of the photo is (used when
 *  a frame crops it): "50% 30%" = horizontally centred, upper third.
 *  Entries with `file: null` are slots still waiting for a photo.
 *  See docs/PHOTO-MANIFEST.md for which chapter uses which photo.
 * ─────────────────────────────────────────────────────────────
 */
export const photos = {
  // ── Childhood & early years ──────────────────────────────
  'early-family-portrait': {
    file: 'childhood/early-family-portrait',
    alt: 'An old family studio portrait in front of a red painted backdrop: a man in a dark suit holding a small boy, an older woman in a pale blue dupatta, and Mamma in an orange saree holding a toddler.',
    caption: 'The early years',
    focus: '50% 42%',
  },
  'ma-young-mehndi': {
    file: 'memories/ma-young-mehndi',
    alt: 'An old photograph of Mamma when she was young, dressed in pink and gold, her hands decorated with mehndi and stacked bangles, smiling softly.',
    caption: 'Mamma, years ago',
    focus: '47% 40%',
  },

  // ── Mamma ───────────────────────────────────────────────────
  'ma-black-gold-saree-portrait': {
    file: 'mother/ma-black-gold-saree-portrait',
    alt: 'Mamma smiling gently, in a pink blouse and a black saree with a woven gold border, a long gold necklace, in front of a pale teal wall.',
    caption: 'My first teacher',
    focus: '45% 50%',
  },
  'ma-green-kurta-knowing-smile': {
    file: 'mother/ma-green-kurta-knowing-smile',
    alt: 'Mamma in a green printed kurta and gold chain, one eyebrow raised and a small, knowing smile, in front of a lilac curtain.',
    caption: 'That look',
    focus: '50% 60%',
  },
  'ma-pink-dupatta': {
    file: 'mother/ma-pink-dupatta',
    alt: 'Mamma with a soft pink dupatta draped over her head, wearing a pink and turquoise pendant necklace, smiling calmly.',
    caption: 'Mamma',
    focus: '50% 34%',
  },
  'ma-printed-hijab': {
    file: 'mother/ma-printed-hijab',
    alt: 'Mamma in a cream and rose printed hijab, looking towards the camera, against a plain pale wall.',
    focus: '72% 62%',
  },
  'ma-green-embroidered-hijab': {
    file: 'mother/ma-green-embroidered-hijab',
    alt: 'Mamma in an olive green hijab embroidered with pink, orange and white thread, looking directly at the camera.',
    focus: '48% 44%',
  },
  'ma-teal-saree-jhumkas': {
    file: 'mother/ma-teal-saree-jhumkas',
    alt: 'Mamma in a teal silk saree with a gold border, gold jhumka earrings and a long green beaded necklace, in front of a marble wall.',
    caption: 'Mamma',
    focus: '55% 50%',
  },
  'ma-yellow-saree-selfie': {
    file: 'mother/ma-yellow-saree-selfie',
    alt: 'A tilted selfie of Mamma in a marigold-yellow saree with silver paisley embroidery and a kundan and pearl necklace.',
    focus: '62% 40%',
  },
  'ma-yellow-saree-full': {
    file: 'mother/ma-yellow-saree-full',
    alt: 'Mamma standing in a marigold-yellow saree with silver paisley embroidery, holding a small silver clutch.',
    focus: '50% 38%',
  },
  'ma-maroon-saree-standing': {
    file: 'mother/ma-maroon-saree-standing',
    alt: 'Mamma standing beside a blue floral curtain in an embroidered maroon saree, gold bangles on her wrist.',
    focus: '45% 26%',
  },
  'ma-maroon-saree-pose': {
    file: 'mother/ma-maroon-saree-pose',
    alt: 'Mamma in an embroidered maroon saree, one hand raised to her hair, posing beside a blue curtain.',
    focus: '44% 22%',
  },
  'ma-hands-bangles-detail': {
    file: 'mother/ma-hands-bangles-detail',
    alt: 'A close view of Mamma’s hand, gold and red bangles at her wrist and a gold ring, resting on the embroidered maroon fabric of her saree.',
    caption: 'Your hands',
    focus: '50% 50%',
  },

  // ── Family ───────────────────────────────────────────────
  'ma-family-selfie-red-dupatta': {
    file: 'family/ma-family-selfie-red-dupatta',
    alt: 'A selfie of a young woman in glasses and a pink kurta, with Mamma close beside her in a red dupatta and pink beads.',
    focus: '62% 35%',
  },
  'ma-family-wedding-evening': {
    file: 'family/ma-family-wedding-evening',
    alt: 'Mamma at a wedding celebration in a black saree with silver embroidery and a gold choker, beside a young woman in black and gold.',
    focus: '55% 36%',
  },
  'ma-hijab-with-little-one': {
    file: 'family/ma-hijab-with-little-one',
    alt: 'Mamma in a shimmering cream hijab and maroon outfit, with a little girl wearing a pearl maang tikka resting against her.',
    focus: '50% 45%',
  },
  'car-ride-together': {
    file: 'family/car-ride-together',
    alt: 'A car selfie: Mamma smiling in the front seat, with a boy in blue glasses and a girl in a hijab and glasses sitting behind her.',
    caption: 'Ordinary days',
    focus: '45% 36%',
  },
  'ma-saree-collage': {
    file: 'memories/ma-saree-collage',
    alt: 'A collage of four photos of Mamma in different sarees: red and gold, violet with a pearl necklace, navy with a gold necklace, and black.',
    focus: '50% 50%',
  },
  'ma-with-loved-one': {
    file: 'memories/ma-with-loved-one',
    alt: 'Mamma and a smiling woman in a pink and blue dupatta, leaning in close together for a photo.',
    focus: '50% 50%',
  },

  // ── Slots still waiting for a photograph ─────────────────
  'school-days': {
    file: null,
    alt: '',
    wanted: 'A school photo from my early years — UKG or primary school, a uniform, a notebook, a school project.',
  },
  'little-me-at-home': {
    file: null,
    alt: '',
    wanted: 'A childhood photo from home — evenings, mealtimes, TV time.',
  },
  'ma-cooking': {
    file: null,
    alt: '',
    wanted: 'A photo of Mamma cooking, or of a dish she made for me.',
  },
  'us-together': {
    file: null,
    alt: '',
    wanted: 'A recent photo of Mamma and me together.',
  },
} satisfies Record<string, PhotoEntry>;

export type PhotoId = keyof typeof photos;

/** Order of the photo album (lightbox). Placeholders are skipped automatically. */
export const albumOrder: PhotoId[] = [
  'early-family-portrait',
  'ma-young-mehndi',
  'car-ride-together',
  'ma-hijab-with-little-one',
  'ma-black-gold-saree-portrait',
  'ma-green-kurta-knowing-smile',
  'ma-pink-dupatta',
  'ma-teal-saree-jhumkas',
  'ma-family-wedding-evening',
  'ma-family-selfie-red-dupatta',
  'ma-yellow-saree-selfie',
  'ma-yellow-saree-full',
  'ma-maroon-saree-standing',
  'ma-maroon-saree-pose',
  'ma-saree-collage',
  'ma-green-embroidered-hijab',
  'ma-printed-hijab',
  'ma-with-loved-one',
  'ma-hands-bangles-detail',
  'us-together',
];
