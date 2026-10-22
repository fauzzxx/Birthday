import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Clapperboard, GraduationCap, Landmark, Music } from 'lucide-react';
import { Botanical } from '../../components/Botanical';
import { Fill, isVisible } from '../../components/Fill';
import { HiddenNote } from '../../components/HiddenNote';
import { Photo, photoSlotVisible } from '../../components/Photo';
import type { PhotoId } from '../../content/photos';
import { couldDoEverything } from '../../content/story';

/* ==========================================================================
   Chapter 06 — the pages of the family album. Each section is one page;
   anything still waiting for a real detail disappears in the finished site,
   and every page is designed to look complete without it.
   ========================================================================== */

export type SectionId = 'kitchen' | 'knows' | 'sayings' | 'funny' | 'favourite';

export interface AlbumSection {
  id: SectionId;
  label: string;
}

const { album, ui } = couldDoEverything;

/** The album's sections in order; a section with nothing to show gets no tab. */
export function albumSections(): AlbumSection[] {
  const all: { id: SectionId; show: boolean }[] = [
    { id: 'kitchen', show: true },
    { id: 'knows', show: true },
    { id: 'sayings', show: album.sayings.items.some(isVisible) },
    { id: 'funny', show: album.funny.items.some(isVisible) },
    { id: 'favourite', show: true },
  ];
  return all.filter((s) => s.show).map((s) => ({ id: s.id, label: ui.tabs[s.id] }));
}

/* ── Small pieces ─────────────────────────────────────────── */

interface PastedPhotoProps {
  id: PhotoId;
  sizes: string;
  /** Rotation in degrees — prints are never pasted perfectly straight. */
  tilt?: number;
  caption?: boolean;
  className?: string;
  children?: ReactNode;
}

/** A real print held on the page by four little photo corners. */
export function PastedPhoto({ id, sizes, tilt = 0, caption = false, className = '', children }: PastedPhotoProps) {
  if (!photoSlotVisible(id)) return null;
  return (
    <div className={`ch06-mount ${className}`} style={{ '--ch06-tilt': `${tilt}deg` } as CSSProperties}>
      <Photo id={id} frame="print" sizes={sizes} caption={caption} captionStyle="hand" openable />
      <span className="ch06-corner ch06-corner--tl" aria-hidden="true" />
      <span className="ch06-corner ch06-corner--tr" aria-hidden="true" />
      <span className="ch06-corner ch06-corner--bl" aria-hidden="true" />
      <span className="ch06-corner ch06-corner--br" aria-hidden="true" />
      {children}
    </div>
  );
}

function PageTitle({ children }: { children: ReactNode }) {
  return <h3 className="ch06-page__title">{children}</h3>;
}

type IconType = ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;

/** An original line drawing: a cricket bat and ball, in the same weight as the other icons. */
function CricketIcon({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-35 12 12)">
        <path d="M12 2.5V7" />
        <rect x="9.6" y="7" width="4.8" height="13" rx="2" />
      </g>
      <circle cx="5.6" cy="18.2" r="2.3" />
      <path d="M4.3 16.8c.8.6 1.3 1.5 1.4 2.6" />
    </svg>
  );
}

/** A plain small mark for any subject added later without its own icon. */
function DotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

const SUBJECT_ICONS: Record<string, IconType> = {
  education: GraduationCap,
  politics: Landmark,
  movies: Clapperboard,
  songs: Music,
  cricket: CricketIcon,
};

/* ── The cover (left page) ────────────────────────────────── */

export function CoverPage() {
  return (
    <div className="ch06-cover">
      <PastedPhoto
        id={couldDoEverything.coverPhoto}
        sizes="(min-width: 900px) 300px, 64vw"
        tilt={-2.2}
        caption
        className="ch06-cover__photo"
      />
      <Botanical variant="corner" seed={4} flip className="ch06-cover__sprig" />
    </div>
  );
}

/* ── Section pages (right page) ───────────────────────────── */

function KitchenPage() {
  const k = album.kitchen;
  const dishes = k.dishes.filter((d) => isVisible(d.name) || isVisible(d.note));
  const photoId = couldDoEverything.kitchenPhoto;
  const showPhoto = photoSlotVisible(photoId);
  const sparse = dishes.length === 0 && !showPhoto;

  return (
    <>
      <PageTitle>{k.title}</PageTitle>
      <div className={`ch06-kitchen ${showPhoto ? 'ch06-kitchen--photo' : ''}`}>
        <div className="ch06-recipe">
          <p className="ch06-recipe__note">{k.note}</p>
          <Botanical variant="sprig" seed={6} className="ch06-recipe__sprig" />
        </div>
        {showPhoto && (
          <PastedPhoto id={photoId} sizes="(min-width: 900px) 160px, 38vw" tilt={3} className="ch06-kitchen__photo" />
        )}
      </div>
      {dishes.length > 0 && (
        <ul role="list" className="ch06-dishes">
          {dishes.map((dish, i) => (
            <li key={i} className="ch06-dish">
              {isVisible(dish.name) && (
                <p className="ch06-dish__name">
                  <Fill value={dish.name} />
                </p>
              )}
              {isVisible(dish.note) && (
                <p className="ch06-dish__note">
                  <Fill value={dish.note} />
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {sparse && (
        <div className="ch06-pressed" aria-hidden="true">
          <span className="ch06-pressed__tape ch06-pressed__tape--a" />
          <Botanical variant="branch" seed={9} className="ch06-pressed__branch" />
          <span className="ch06-pressed__tape ch06-pressed__tape--b" />
        </div>
      )}
    </>
  );
}

function KnowsPage() {
  const k = album.knows;
  return (
    <>
      <PageTitle>{k.title}</PageTitle>
      <p className="ch06-hand ch06-page__note">{k.note}</p>
      <div className="ch06-catalogue">
        <ul role="list" className="ch06-index">
          {k.subjects.map((s) => {
            const Icon = SUBJECT_ICONS[s.subject.toLowerCase()] ?? DotIcon;
            return (
              <li key={s.subject} className="ch06-index__row">
                <Icon className="ch06-index__icon" strokeWidth={1.5} aria-hidden />
                <span className="ch06-index__subject">{s.subject}</span>
                {isVisible(s.detail) && (
                  <span className="ch06-index__detail">
                    <Fill value={s.detail} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <span className="ch06-catalogue__hole" aria-hidden="true" />
      </div>
    </>
  );
}

function SayingsPage() {
  const s = album.sayings;
  const items = s.items.filter(isVisible);
  return (
    <>
      <PageTitle>{s.title}</PageTitle>
      <span className="ch06-quote-mark" aria-hidden="true">
        “
      </span>
      <ul role="list" className="ch06-sayings">
        {items.map((item, i) => (
          <li key={i} className="ch06-saying">
            <Fill value={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

function FunnyPage() {
  const f = album.funny;
  const items = f.items.filter(isVisible);
  return (
    <>
      <PageTitle>{f.title}</PageTitle>
      <ul role="list" className="ch06-funny">
        {items.map((item, i) => (
          <li key={i} className="ch06-slip" style={{ '--ch06-slip-tilt': `${i % 2 ? 1.2 : -1.4}deg` } as CSSProperties}>
            <Fill value={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

function FavouritePage() {
  const f = album.favourite;
  return (
    <>
      <PageTitle>{f.title}</PageTitle>
      <div className="ch06-fav">
        <p className="t-lead ch06-fav__text">{f.text}</p>
        <div className="ch06-fav__keep">
          <PastedPhoto
            id={couldDoEverything.favouritePhoto}
            sizes="(min-width: 900px) 220px, 52vw"
            tilt={2.5}
            className="ch06-fav__photo"
          />
          <HiddenNote text={couldDoEverything.hiddenNote} side="top" className="ch06-fav__note" />
        </div>
      </div>
    </>
  );
}

export function SectionPage({ id }: { id: SectionId }) {
  switch (id) {
    case 'kitchen':
      return <KitchenPage />;
    case 'knows':
      return <KnowsPage />;
    case 'sayings':
      return <SayingsPage />;
    case 'funny':
      return <FunnyPage />;
    case 'favourite':
      return <FavouritePage />;
  }
}
