import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from './AudioContext';
import './audio-controls.css';

/**
 * Small, persistent music controls (bottom-right). Play/pause starts or stops
 * the music; mute silences it without stopping. Appear once the story begins
 * (or straight away if the visitor scrolls past the opening).
 */
export function AudioControls({ visible }: { visible: boolean }) {
  const { playing, muted, toggle, toggleMute } = useAudio();

  return (
    <div className="audio-controls" data-visible={visible || undefined} role="group" aria-label="Music">
      <button
        type="button"
        className="audio-controls__btn"
        onClick={toggle}
        aria-pressed={playing}
        title={playing ? 'Pause music' : 'Play music'}
      >
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        <span className="visually-hidden">{playing ? 'Pause music' : 'Play music'}</span>
        <span className={`audio-controls__bars ${playing && !muted ? 'is-playing' : ''}`} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <button
        type="button"
        className="audio-controls__btn"
        onClick={toggleMute}
        aria-pressed={muted}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        <span className="visually-hidden">{muted ? 'Unmute music' : 'Mute music'}</span>
      </button>
    </div>
  );
}
