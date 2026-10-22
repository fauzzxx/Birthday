import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { couldDoEverything } from '../../content/story';

/** Chapter 06 — STUB (temporary). Replace with the full scene. */
export function CouldDoEverything() {
  return (
    <ChapterSection number={6}>
      <div className="container">
        <ChapterHeading number={6} />
        <p className="keyline">{couldDoEverything.keyLine}</p>
      </div>
    </ChapterSection>
  );
}
