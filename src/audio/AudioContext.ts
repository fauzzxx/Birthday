import { createContext, useContext } from 'react';

export interface AudioApi {
  /** The visitor's choice on the opening screen. */
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  /** Music is currently playing (it may still be muted). */
  playing: boolean;
  muted: boolean;
  /** Has the visitor started the story yet? (Controls appear after.) */
  started: boolean;
  /** Called by "Begin our story": starts music if soundOn. Must run inside a click. */
  begin: () => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  toggleMute: () => void;
}

export const AudioCtx = createContext<AudioApi | null>(null);

export function useAudio(): AudioApi {
  const api = useContext(AudioCtx);
  if (!api) throw new Error('useAudio must be used inside <AudioProvider>');
  return api;
}
