import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Maximize2 } from 'lucide-react';
import type { PhotoId } from '../content/photos';
import { gsap } from '../lib/gsap';
import { hasPhoto, resolvePhoto } from '../lib/photos';
import { showPlaceholders } from '../lib/placeholders';
import { useScene } from '../lib/scene';
import { useGallery } from './gallery/GalleryContext';
import { Botanical } from './Botanical';
import './photo.css';

export type PhotoFrame = 'none' | 'print' | 'polaroid' | 'soft' | 'arch' | 'oval';
export type PhotoTone = 'natural' | 'warm' | 'vintage';

export interface PhotoProps {
  id: PhotoId;
  /** Shown instead when `id` has no photograph yet. */
  fallbackId?: PhotoId;
  /** Responsive sizes hint, e.g. "(min-width: 900px) 40vw, 90vw". */
  sizes?: string;
  /** Above-the-fold photos: load eagerly. */
  priority?: boolean;
  frame?: PhotoFrame;
  tone?: PhotoTone;
  /** true = caption from photos.ts; a string overrides it. */
  caption?: boolean | string;
  captionStyle?: 'hand' | 'serif' | 'sans';
  /** Crop the photo to this aspect ratio (width / height), e.g. 4 / 5. Default: natural. */
  aspect?: number;
  /** Override the manifest focus point (CSS object-position). */
  focus?: string;
  /** Zoom into the focus point (1 = none). */
  zoom?: number;
  /** Scroll parallax strength, e.g. 0.08. Disabled for reduced motion. */
  parallax?: number;
  /** Clicking opens the album lightbox at this photo. */
  openable?: boolean;
  /** Rotation in degrees (for prints / polaroids). */
  tilt?: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

/** True when a photo slot should take up space (real photo, or placeholders are visible). */
export function photoSlotVisible(id: PhotoId, fallbackId?: PhotoId): boolean {
  return hasPhoto(id) || (!!fallbackId && hasPhoto(fallbackId)) || showPlaceholders;
}

/**
 * A real family photograph, art-directed. Handles responsive sources, a blurred
 * preview while loading, a graceful message if loading fails, placeholders for
 * photos still to come, scroll parallax and opening in the album.
 */
export function Photo(props: PhotoProps) {
  const { id, fallbackId } = props;
  const useId = hasPhoto(id) ? id : fallbackId && hasPhoto(fallbackId) ? fallbackId : id;
  const photo = resolvePhoto(useId);

  if (!photo.image) {
    return showPlaceholders ? <PhotoPlaceholder {...props} /> : null;
  }
  return <PhotoImage {...props} id={useId} />;
}

function PhotoImage({
  id,
  sizes = '(min-width: 900px) 45vw, 92vw',
  priority = false,
  frame = 'print',
  tone = 'natural',
  caption = false,
  captionStyle = 'hand',
  aspect,
  focus,
  zoom = 1,
  parallax = 0,
  openable = false,
  tilt = 0,
  alt,
  className = '',
  style,
}: PhotoProps) {
  const photo = resolvePhoto(id);
  const gallery = useGallery();
  const figureRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Images already in the cache may finish before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  useScene(
    figureRef,
    ({ reduce, mobile }) => {
      if (reduce || !parallax) return;
      const p = mobile ? parallax * 0.6 : parallax;
      const amount = (p * 100) / (1 + 2 * p);
      gsap.fromTo(
        '.photo__inner',
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: figureRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    [parallax],
  );

  const ratio = aspect ?? photo.width / photo.height;
  const objectPosition = focus ?? photo.entry.focus ?? '50% 50%';
  const captionText = typeof caption === 'string' ? caption : caption ? photo.entry.caption : undefined;
  const altText = alt ?? photo.entry.alt;

  const classes = ['photo', `photo--${frame}`, `photo--tone-${tone}`, openable && 'photo--openable', className]
    .filter(Boolean)
    .join(' ');

  return (
    <figure
      ref={figureRef}
      className={classes}
      data-state={state}
      style={{ ...style, ['--tilt' as string]: `${tilt}deg` }}
    >
      <div className="photo__frame" style={{ aspectRatio: String(ratio) }}>
        <div
          className="photo__inner"
          style={parallax ? { top: `${-parallax * 100}%`, bottom: `${-parallax * 100}%` } : undefined}
        >
          {photo.image && (
            <img className="photo__lqip" src={photo.image.lqip} alt="" aria-hidden="true" decoding="async" />
          )}
          {state !== 'error' && (
            <img
              ref={imgRef}
              className="photo__img"
              src={photo.src}
              srcSet={photo.srcSet}
              sizes={sizes}
              alt={altText}
              width={photo.width}
              height={photo.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : undefined}
              draggable={false}
              onLoad={() => setState('loaded')}
              onError={() => setState('error')}
              style={{
                objectPosition,
                transformOrigin: objectPosition,
                transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              }}
            />
          )}
        </div>
        {state === 'error' && (
          <div className="photo__error" role="img" aria-label={altText}>
            <Botanical variant="sprig" className="photo__error-sprig" />
            <p>This photograph could not be loaded.</p>
          </div>
        )}
        {openable && state !== 'error' && (
          <button type="button" className="photo__open" onClick={() => gallery.open(id)}>
            <span className="visually-hidden">View larger: {altText}</span>
            <Maximize2 aria-hidden="true" className="photo__open-icon" />
          </button>
        )}
      </div>
      {captionText && <figcaption className={`photo__caption photo__caption--${captionStyle}`}>{captionText}</figcaption>}
    </figure>
  );
}

function PhotoPlaceholder({ id, aspect = 4 / 5, frame = 'print', tilt = 0, className = '', style }: PhotoProps) {
  const photo = resolvePhoto(id);
  return (
    <figure
      className={`photo photo--${frame} photo--placeholder ${className}`}
      style={{ ...style, ['--tilt' as string]: `${tilt}deg` }}
      aria-label={`Photo still to add: ${photo.entry.wanted ?? id}`}
    >
      <div className="photo__frame" style={{ aspectRatio: String(aspect) }}>
        <div className="photo__placeholder">
          <Botanical variant="sprig" className="photo__placeholder-sprig" />
          <p className="photo__placeholder-label">Photo to add</p>
          <p className="photo__placeholder-hint">{photo.entry.wanted}</p>
          <p className="photo__placeholder-key">photos.ts → '{id}'</p>
        </div>
      </div>
    </figure>
  );
}
