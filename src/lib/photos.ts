import { photos, albumOrder, type PhotoId } from '../content/photos';
import { generatedPhotos } from '../content/photos.generated';
import type { GeneratedPhoto, PhotoEntry } from '../content/types';

export interface ResolvedPhoto {
  id: PhotoId;
  entry: PhotoEntry;
  /** Optimised image data, or null when this slot has no photograph yet. */
  image: GeneratedPhoto | null;
  /** Best default src (≤ 960px wide) and full srcset string. */
  src: string;
  srcSet: string;
  /** Largest available variant, for the lightbox. */
  largest: string;
  width: number;
  height: number;
}

export function resolvePhoto(id: PhotoId): ResolvedPhoto {
  const entry: PhotoEntry = photos[id];
  const image = entry.file ? (generatedPhotos[entry.file] ?? null) : null;
  if (!image) {
    return { id, entry, image: null, src: '', srcSet: '', largest: '', width: 4, height: 5 };
  }
  const sorted = [...image.variants].sort((a, b) => a.w - b.w);
  const medium = sorted.filter((v) => v.w <= 960).at(-1) ?? sorted[0];
  return {
    id,
    entry,
    image,
    src: medium.src,
    srcSet: sorted.map((v) => `${v.src} ${v.w}w`).join(', '),
    largest: sorted[sorted.length - 1].src,
    width: image.width,
    height: image.height,
  };
}

/** True when the id points at a real, optimised photograph. */
export function hasPhoto(id: PhotoId): boolean {
  return resolvePhoto(id).image !== null;
}

/** Returns `preferred` if it has a real photo, otherwise `fallback`. */
export function preferPhoto(preferred: PhotoId, fallback: PhotoId): PhotoId {
  return hasPhoto(preferred) ? preferred : fallback;
}

/** The album, in order, with empty slots removed. */
export function albumPhotos(): ResolvedPhoto[] {
  return albumOrder.map(resolvePhoto).filter((p) => p.image !== null);
}
