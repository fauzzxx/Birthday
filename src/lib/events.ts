/**
 * Tiny story-wide event bus for the few moments chapters talk to each other.
 *  - 'story:begin'  the visitor pressed "Begin our story"
 *  - 'story:replay' the visitor asked to start again from the finale
 */
export type StoryEvent = 'story:begin' | 'story:replay';

const target = typeof window !== 'undefined' ? new EventTarget() : null;

export function emit(event: StoryEvent) {
  target?.dispatchEvent(new Event(event));
}

export function on(event: StoryEvent, handler: () => void) {
  target?.addEventListener(event, handler);
  return () => target?.removeEventListener(event, handler);
}
