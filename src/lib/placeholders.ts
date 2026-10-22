import { settings } from '../content/settings';

/** Whether "still to add" placeholders should be shown (see settings.placeholders). */
export const showPlaceholders =
  settings.placeholders === 'show' || (settings.placeholders === 'auto' && import.meta.env.DEV);
