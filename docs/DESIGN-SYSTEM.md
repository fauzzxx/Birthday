# Design system — The Woman Who Made Me

A son's birthday story for his mother, told in thirteen chapters. This file is
the reference for anyone building or editing a scene.

**The test for every decision:** would his mother feel *"he remembers all these
little things; he sees what I have done; he wants to take care of me too"*? If an
effect does not serve that, leave it out.

---

## 1. Principles

1. **Story over spectacle.** Motion reveals meaning (light arriving, handwriting
   becoming clear, a frame growing up). Never motion for its own sake.
2. **Contrast in pacing.** Rich scenes (01, 03, 05, 06, 09, 12, 13) alternate with
   quiet ones (07, 11). Quiet scenes use almost no motion — only space and slow fades.
3. **Only what is true.** Every fact comes from `src/content/story/*`. Never invent
   memories, dates, names, schools, grades, dishes, preferences, quotations or
   religious text. Unknown details are placeholders (`ph()` + `<Fill>`).
4. **Final state is the markup.** Write HTML/CSS for the finished, readable scene.
   GSAP animates *from* hidden states. If JS or animation fails, everything is
   still visible.
5. **Native scroll is sacred.** No scroll-jacking, no smooth-scroll libraries.
   Pins only where specified, desktop only, ≤ 160% of the viewport.
6. **Respect.** Her faith is shown through restraint (arches, light, geometry at
   whisper-level opacity) — no invented calligraphy or verses. Her pain is never
   illustrated. Grief is stated, never dramatised.

## 2. Palette & themes

| Token | Hex | Use |
|---|---|---|
| `--ivory` | `#F6EFE5` | light scene ground |
| `--burgundy` | `#64263A` | depth, the letter, the finale |
| `--gold` | `#C9A46A` | the thread, ornaments, accents on dark |
| `--gold-ink` | `#7D5E2F` | gold *text* on light backgrounds (passes contrast) |
| `--rose` | `#DCA5A5` | petals, tenderness |
| `--espresso` | `#30211F` | deep warm dark |

Every chapter sets `data-theme` (via `<ChapterSection>`). Inside a theme use the
**semantic** variables, so components work in any scene:

`--bg --fg --fg-soft --fg-faint --accent (text-safe) --accent-strong --accent-deco (lines only) --line --surface --surface-strong --focus`

Themes: `night` (01, 02) · `paper` (03, 10) · `dusk` (04) · `midnight` (05) ·
`ivory` (06) · `rose` (07) · `dawn` (08) · `espresso` (09) · `lamplight` (11) ·
`burgundy` (12, 13). Raw scene colours: `var(--theme-<name>-bg)`.

## 3. Typography

| Class | Face | For |
|---|---|---|
| `.t-display` | Cormorant Garamond 300 | the opening line, the birthday greeting |
| `.t-title` | Cormorant 400 | chapter titles |
| `.t-headline` | Cormorant italic | large emphasis |
| `.t-lead` | Cormorant 400, `--step-2` | narrative beats — the story's voice |
| `.t-body` | Manrope | longer reading, explanations |
| `.t-hand` | Caveat | personal notes, captions, signatures (sparingly) |
| `.t-eyebrow` | Manrope caps, tracked | chapter numbers, small labels |
| `.keyline` / `.keyline--large` | Cormorant italic | each chapter's key sentence |

Fluid sizes: `--step--2 … --step-6`. Spacing: `--space-3xs … --space-3xl`,
`--gutter` (≥ 16px), `--section-pad`. Widths: `--measure` (36rem),
`--measure-wide`, `.container`.

## 4. Shared components (`src/components`)

| Component | What it does |
|---|---|
| `<ChapterSection number theme? flush?>` | The chapter `<section>`: id, theme, `aria-labelledby`. |
| `<ChapterHeading number size? align? hidden?>` | "Chapter 03" eyebrow + `<h2>` title (focus target for navigation). |
| `<Photo id …>` | Real photo: responsive WebP, blur-up, error state, placeholder slots, `frame` (`print`/`polaroid`/`soft`/`arch`/`oval`/`none`), `tone` (`natural`/`warm`/`vintage`), `caption`, `aspect`, `focus`, `zoom`, `parallax`, `openable`, `tilt`, `fallbackId`. |
| `photoSlotVisible(id, fallbackId?)` | Whether a slot should take space (real photo, or placeholders visible). |
| `<Reveal variant stagger? scrub?>` | Scroll-in reveal (`up`/`fade`/`blur`/`mask`/`scale`). |
| `<SplitReveal text by="lines"\|"words"\|"chars">` | Masked line / word / letter reveal; accessible. `manual` + `play` for timed use. |
| `<Thread from to line? length?>` | The golden thread between chapters (used in `App.tsx`). |
| `<Botanical variant seed draw flip>` | Original line-art sprigs: `sprig`, `branch`, `jasmine`, `corner`, `vine`. `currentColor`. |
| `<HiddenNote text side style>` | Tiny gold glyph that unfolds a handwritten note. Place inside a `position: relative` parent. |
| `<Fill value>` / `isVisible(value)` | Renders text or a placeholder (hidden in production). |
| `<DustField mode count color size>` | Canvas dust / rising lights; fills a `position: relative` parent. |
| `<LightLeak tone position intensity>` | Slow, warm film light. |
| `<Petals count color>` | A few drifting petals (CSS only). |

Libraries (`src/lib`): `gsap.ts` (import gsap, ScrollTrigger, SplitText,
DrawSVGPlugin from here), `scene.ts` (`useScene`), `motion.ts`
(`useReducedMotion`, `useIsDesktop`, `prefersReducedMotion`), `usePointer.ts`
(`usePointerDepth` → `--px`/`--py`), `navigation.ts` (`scrollToChapter`),
`events.ts` (`emit`/`on` for `story:begin`, `story:replay`), `photos.ts`
(`resolvePhoto`, `hasPhoto`, `preferPhoto`, `albumPhotos`).

Audio (`src/audio`): `useAudio()` → `{ soundOn, setSoundOn, begin, play, pause, toggle, toggleMute, playing, muted }`.
Gallery: `useGallery().open(id?)` opens the album lightbox.

## 5. Motion rules

```tsx
const root = useRef<HTMLElement>(null);
useScene(root, ({ reduce, desktop, mobile, finePointer }) => {
  if (reduce) return;                       // markup is already the final state
  if (desktop) { /* pinned / scrubbed choreography */ }
  else { /* simple on-enter timeline, no pins */ }
});
```

- Everything created inside `useScene` is reverted on unmount and when the
  breakpoint / motion preference changes.
- Scrub with `scrub: 0.6–1`. Pins: `pin: true, anticipatePin: 1`, end ≤ `+=160%`.
- Animate `transform`, `opacity`, `clip-path`, CSS variables. Avoid animating
  `filter: blur` on large areas (small text is fine).
- After anything changes page height (opening the letter), call `ScrollTrigger.refresh()`.
- Eases: `power3.out` (arrivals), `power4.out` (masked lines), `power2.inOut` (journeys), `none` (scrubs).
- Reduced motion (OS setting or `?reduced-motion` in the URL): no scrubs, no pins,
  no particles in motion; content fully visible.

## 6. Accessibility

- Real `<button>`s for actions, `<a>` for navigation; visible `:focus-visible`.
- `aria-pressed` for toggles, `aria-expanded` + `aria-controls` for disclosures,
  `aria-live="polite"` for status changes (candles lit, lesson 3 of 10).
- Touch targets ≥ 44px. Decorative SVG `aria-hidden="true"`.
- Every photo has descriptive alt text from `src/content/photos.ts`.
- Text over imagery always has a scrim or sufficient contrast.

## 7. Files & naming

Each chapter lives in `src/chapters/chNN-name/` with its component and one CSS
file. All its classes are prefixed (`.ch05-…`). Chapter text lives in
`src/content/story/NN-*.ts`.
