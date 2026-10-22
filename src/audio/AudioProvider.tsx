import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { settings } from '../content/settings';
import { AmbientEngine } from './ambientEngine';
import { AudioCtx, type AudioApi } from './AudioContext';

/**
 * One music source for the whole story:
 *  - settings.audio.src (your own file in /public/audio), looped and faded; or
 *  - the generated ambient score.
 * Never autoplays: music only starts from a click (browsers require this).
 * If your file is missing or can't play, it quietly falls back to the score.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(settings.audio.onByDefault);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const engineRef = useRef<AmbientEngine | null>(null);
  const fileRef = useRef<HTMLAudioElement | null>(null);
  const fileFailed = useRef(false);
  const fadeRaf = useRef(0);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const fadeFile = useCallback((to: number, seconds: number, then?: () => void) => {
    const el = fileRef.current;
    if (!el) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = el.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / (seconds * 1000));
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k < 1) fadeRaf.current = requestAnimationFrame(step);
      else then?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  }, []);

  const startEngine = useCallback(async () => {
    if (!engineRef.current) engineRef.current = new AmbientEngine(settings.audio.volume * 0.6);
    try {
      await engineRef.current.start();
      engineRef.current.setMuted(mutedRef.current);
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const play = useCallback(() => {
    if (settings.audio.src && !fileFailed.current) {
      if (!fileRef.current) {
        const el = new Audio(settings.audio.src);
        el.loop = true;
        el.preload = 'auto';
        el.volume = 0;
        el.addEventListener('error', () => {
          fileFailed.current = true;
          fileRef.current = null;
          void startEngine();
        });
        fileRef.current = el;
      }
      const el = fileRef.current;
      el.muted = mutedRef.current;
      el.play()
        .then(() => {
          setPlaying(true);
          fadeFile(settings.audio.volume, 3);
        })
        .catch(() => {
          fileFailed.current = true;
          fileRef.current = null;
          void startEngine();
        });
      return;
    }
    void startEngine();
  }, [fadeFile, startEngine]);

  const pause = useCallback(() => {
    setPlaying(false);
    if (fileRef.current) {
      const el = fileRef.current;
      fadeFile(0, 1.2, () => el.pause());
    }
    void engineRef.current?.stop();
  }, [fadeFile]);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (fileRef.current) fileRef.current.muted = next;
      engineRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const begin = useCallback(() => {
    setStarted(true);
    if (soundOn && !playing) play();
  }, [soundOn, playing, play]);

  // Quiet the music while the tab is hidden; resume when it returns.
  useEffect(() => {
    const onVisibility = () => {
      void engineRef.current?.setHidden(document.hidden);
      const el = fileRef.current;
      if (!el) return;
      if (document.hidden) el.pause();
      else if (playing) void el.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [playing]);

  useEffect(
    () => () => {
      cancelAnimationFrame(fadeRaf.current);
      engineRef.current?.dispose();
      fileRef.current?.pause();
    },
    [],
  );

  const api = useMemo<AudioApi>(
    () => ({ soundOn, setSoundOn, playing, muted, started, begin, play, pause, toggle, toggleMute }),
    [soundOn, playing, muted, started, begin, play, pause, toggle, toggleMute],
  );

  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>;
}
