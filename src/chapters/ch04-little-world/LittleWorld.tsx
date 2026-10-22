import { ChapterHeading, ChapterSection } from '../../components/Chapter';
import { littleWorld } from '../../content/story';

/** Chapter 04 — STUB (temporary). Replace with the full scene. */
export function LittleWorld() {
  return (
    <ChapterSection number={4}>
      <div className="container">
        <ChapterHeading number={4} />
        <p className="keyline">{littleWorld.keyLine}</p>
      </div>
    </ChapterSection>
  );
}
