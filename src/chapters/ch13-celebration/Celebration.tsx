import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { celebration } from '../../content/story';

/** Chapter 13 — STUB (temporary). Replace with the full scene. */
export function Celebration() {
  return (
    <ChapterSection number={13}>
      <div className="container">
        <ChapterHeading number={13} />
        <p className="keyline">{celebration.finalLine}</p>
      </div>
    </ChapterSection>
  );
}
