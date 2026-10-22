# Photo manifest

Every photograph is registered once in `src/content/photos.ts` under an id.
Chapters refer to ids (set in `src/content/story/*.ts`), never to file paths —
so replacing a photo never touches story code.

## How to replace or add a photo

1. Put the original in `photos/<category>/<descriptive-name>.jpg` (JPG, PNG or WebP;
   phone photos are fine — orientation is fixed automatically).
2. Run `npm run photos`. This writes small, fast WebP versions to `public/images/…`
   and refreshes `src/content/photos.generated.ts` (sizes + blurred previews).
3. In `src/content/photos.ts`, point the entry's `file` at `"<category>/<descriptive-name>"`,
   and write an honest `alt` describing what is visible. Adjust `focus`
   (`"50% 30%"` = centre, upper third) if a frame crops the important part.

To fill an empty slot, do the same for an entry that currently has `file: null`.

## Which chapter uses which photo

| Chapter | Slot (id) | Current photo | Notes |
|---|---|---|---|
| 02 The little boy who needed you | `early-family-portrait` | childhood/early-family-portrait | Shown whole — nobody is cropped out. |
| 03 My first teacher was you | `ma-black-gold-saree-portrait` | mother/ma-black-gold-saree-portrait | Clipped to the notebook. |
| 03 | `school-days` | **empty** | A school photo (UKG / primary, a notebook, a project). |
| 04 Our little world | `car-ride-together`, `ma-hijab-with-little-one` | family/… | Framed prints around the TV. |
| 04 | `little-me-at-home` | **empty** | A childhood photo from home — evenings, mealtimes, TV time. |
| 06 The woman who could do everything | `ma-teal-saree-jhumkas` | mother/… | Album cover page. |
| 06 | `ma-cooking` | **empty** | Ma cooking, or a dish she made. |
| 06 | `ma-yellow-saree-full` | mother/… | "The favourite" page (small original — a larger copy would look sharper). |
| 07 The strength nobody saw | `ma-green-embroidered-hijab` | mother/… | |
| 08 A heart that chooses kindness | `ma-pink-dupatta` | mother/… | Arch frame. |
| 09 The boy grew up | `early-family-portrait` → `ma-green-kurta-knowing-smile` | | The frame "grows up" from then to now. If `us-together` gets a photo, it replaces the "now" image. |
| 11 The hands | `ma-hands-bangles-detail` | mother/… (cropped from the maroon-saree photo) | |
| 12 A letter from your son | `ma-young-mehndi` | memories/… | Tucked inside the envelope. |
| 13 Today, the world celebrates you | collage: `ma-family-wedding-evening`, `ma-yellow-saree-selfie`, `ma-family-selfie-red-dupatta`, `ma-maroon-saree-pose`, `ma-saree-collage`, `ma-teal-saree-jhumkas`, `ma-with-loved-one`, `car-ride-together` | | All open in the album. |
| 13 | `us-together` (final photograph) | **empty** → falls back to `ma-black-gold-saree-portrait` | A recent photo of the two of you would be the perfect ending. |
| Album (lightbox) | `albumOrder` in photos.ts | every real photo | Empty slots are skipped. |

## Empty slots

Slots with `file: null` show a clearly-labelled "Photo to add" card while you run
`npm run dev`, and disappear completely from the built site (`npm run build`), so
nothing broken or empty is ever shown to her. Change this with
`settings.placeholders` in `src/content/settings.ts`.

## Small originals

`ma-yellow-saree-full` (442×625) and `ma-with-loved-one` (343×475) are small files
and are displayed small. If you have larger originals, drop them into `photos/`
with the same names and re-run `npm run photos`.
