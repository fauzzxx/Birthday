import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PhotoId } from '../../content/photos';
import { albumPhotos, resolvePhoto, type ResolvedPhoto } from '../../lib/photos';
import { GalleryContext } from './GalleryContext';
import './lightbox.css';

/**
 * Provides the album lightbox to the whole story. Any <Photo openable /> opens it.
 * Built on the native <dialog> element: focus is trapped, Escape closes, and
 * focus returns to whatever opened it. ← / → move between photos; swipe on touch.
 */
export function GalleryProvider({ children }: { children: ReactNode }) {
  const album = useMemo(albumPhotos, []);
  const [items, setItems] = useState<ResolvedPhoto[]>(album);
  const [index, setIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (id?: PhotoId) => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!id) {
        setItems(album);
        setIndex(0);
        return;
      }
      const at = album.findIndex((p) => p.id === id);
      if (at >= 0) {
        setItems(album);
        setIndex(at);
      } else {
        const single = resolvePhoto(id);
        if (!single.image) return;
        setItems([single]);
        setIndex(0);
      }
    },
    [album],
  );

  const close = useCallback(() => setIndex(null), []);
  const api = useMemo(() => ({ open }), [open]);

  return (
    <GalleryContext.Provider value={api}>
      {children}
      {index !== null && items.length > 0 && (
        <Lightbox
          items={items}
          index={index}
          onIndex={setIndex}
          onClose={close}
          restoreFocusTo={openerRef}
        />
      )}
    </GalleryContext.Provider>
  );
}

interface LightboxProps {
  items: ResolvedPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  restoreFocusTo: RefObject<HTMLElement | null>;
}

function Lightbox({ items, index, onIndex, onClose, restoreFocusTo }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const photo = items[index];
  const many = items.length > 1;

  const go = useCallback(
    (delta: number) => {
      if (!many) return;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, many, onIndex],
  );

  // Open as a modal on mount; lock page scroll; restore focus on unmount.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const opener = restoreFocusTo.current;
    return () => {
      root.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, [restoreFocusTo]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [photo.id]);

  // Preload neighbours so browsing feels instant.
  useEffect(() => {
    if (!many) return;
    [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]].forEach((p) => {
      const img = new Image();
      img.src = p.largest;
    });
  }, [index, items, many]);

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Photo album"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(-1);
        }
      }}
      onClick={(e) => {
        // Clicking the dark backdrop (the dialog itself, not its content) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="lightbox__stage"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') pointerStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (pointerStart.current === null) return;
          const dx = e.clientX - pointerStart.current;
          pointerStart.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <figure className="lightbox__figure" data-loaded={loaded || undefined}>
          {!failed ? (
            <img
              key={photo.id}
              className="lightbox__img"
              src={photo.largest}
              srcSet={photo.srcSet}
              sizes="92vw"
              alt={photo.entry.alt}
              width={photo.width}
              height={photo.height}
              style={{ backgroundImage: photo.image ? `url("${photo.image.lqip}")` : undefined }}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              draggable={false}
            />
          ) : (
            <div className="lightbox__error" role="img" aria-label={photo.entry.alt}>
              <p>This photograph could not be loaded.</p>
              <p className="lightbox__error-alt">{photo.entry.alt}</p>
            </div>
          )}
          <figcaption className="lightbox__caption">
            {photo.entry.caption && <span className="lightbox__caption-text">{photo.entry.caption}</span>}
            {many && (
              <span className="lightbox__count" aria-live="polite">
                {index + 1} / {items.length}
              </span>
            )}
          </figcaption>
        </figure>
      </div>

      <button type="button" className="lightbox__btn lightbox__close" onClick={onClose} autoFocus>
        <X aria-hidden="true" />
        <span className="visually-hidden">Close album</span>
      </button>
      {many && (
        <>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={() => go(-1)}>
            <ChevronLeft aria-hidden="true" />
            <span className="visually-hidden">Previous photo</span>
          </button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={() => go(1)}>
            <ChevronRight aria-hidden="true" />
            <span className="visually-hidden">Next photo</span>
          </button>
        </>
      )}
    </dialog>
  );
}
