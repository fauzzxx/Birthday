import { useRef } from 'react';
import { ma } from '../content/settings';
import { albumPhotos } from '../lib/photos';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/scene';
import { Photo } from './Photo';
import { useGallery } from './gallery/GalleryContext';
import { Botanical } from './Botanical';
import './album.css';

/**
 * EPILOGUE — the album. Every photograph from the story in one place, like the
 * pages after a film's last scene. Each print opens full-screen; ← → browse.
 */
export function Album() {
  const ref = useRef<HTMLElement>(null);
  const gallery = useGallery();
  const items = albumPhotos();

  useScene(ref, ({ reduce }) => {
    if (reduce) return;
    gsap.from('.album__item', {
      opacity: 0,
      y: 40,
      rotate: (i) => (i % 2 ? 3 : -3),
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.album__grid', start: 'top 85%' },
    });
  });

  return (
    <section ref={ref} className="album" data-theme="burgundy" data-chapter="13" aria-labelledby="album-title">
      <div className="container">
        <header className="album__head">
          <Botanical variant="branch" seed={11} className="album__sprig" draw />
          <p className="t-eyebrow">Epilogue</p>
          <h2 id="album-title" className="t-title">
            {ma}, in pictures
          </h2>
          <button type="button" className="btn" onClick={() => gallery.open()}>
            Open the album
          </button>
        </header>

        <ul className="album__grid" role="list">
          {items.map((p, i) => (
            <li key={p.id} className="album__item">
              <Photo
                id={p.id}
                frame="print"
                tone="warm"
                caption={!!p.entry.caption}
                openable
                tilt={i % 3 === 0 ? -1.5 : i % 3 === 1 ? 1.2 : 0}
                sizes="(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw"
              />
            </li>
          ))}
        </ul>

        <p className="album__colophon t-hand">Made with love by your son, for your birthday.</p>
      </div>
    </section>
  );
}
