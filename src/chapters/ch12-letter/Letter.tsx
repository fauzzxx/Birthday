import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { letter } from '../../content/story';

/** Chapter 12 — STUB (temporary). Replace with the full scene. */
export function Letter() {
  return (
    <ChapterSection number={12}>
      <div className="container">
        <ChapterHeading number={12} />
        <p className="keyline">{letter.envelopeTo}</p>
      </div>
    </ChapterSection>
  );
}
