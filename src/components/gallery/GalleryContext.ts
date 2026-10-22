import { createContext, useContext } from 'react';
import type { PhotoId } from '../../content/photos';

export interface GalleryApi {
  /** Open the full-screen album at this photo (or at the start). */
  open: (id?: PhotoId) => void;
}

export const GalleryContext = createContext<GalleryApi | null>(null);

export function useGallery(): GalleryApi {
  const api = useContext(GalleryContext);
  if (!api) throw new Error('useGallery must be used inside <GalleryProvider>');
  return api;
}
