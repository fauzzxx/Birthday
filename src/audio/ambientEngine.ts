/**
 * A soft, generated ambient score — warm pads moving slowly through four chords,
 * with an occasional music-box note drifting over the top. Built with the Web
 * Audio API, so no audio file is needed and nothing is downloaded.
 *
 * Used when settings.audio.src is null, or as a fallback if that file fails.
 */

// Fmaj7 → Am7 → Dm7 → B♭maj7 — warm, unhurried, never resolving too hard.
const CHORDS: number[][] = [
  [87.31, 130.81, 164.81, 220.0, 261.63],
  [110.0, 164.81, 196.0, 261.63, 329.63],
  [73.42, 146.83, 174.61, 220.0, 261.63],
  [116.54, 174.61, 220.0, 293.66, 349.23],
];

// Music-box notes that sit well over each chord (F major pentatonic, upper register).
const MELODY: number[][] = [
  [523.25, 659.26, 698.46, 783.99, 880.0],
  [523.25, 587.33, 659.26, 783.99, 880.0],
  [440.0, 523.25, 587.33, 698.46, 880.0],
  [466.16, 587.33, 698.46, 783.99, 880.0],
];

const CHORD_SECONDS = 9;

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padBus: GainNode | null = null;
  private bellBus: GainNode | null = null;
  private timers: number[] = [];
  private chordIndex = 0;
  private running = false;
  private volume: number;

  constructor(volume = 0.5) {
    this.volume = volume;
  }

  get isRunning() {
    return this.running;
  }

  private build() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    master.connect(compressor).connect(ctx.destination);

    // Long, soft reverb from a synthesised impulse response.
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 5.5, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 1150;
    padFilter.Q.value = 0.3;
    const padBus = ctx.createGain();
    padBus.gain.value = 0.5;
    padBus.connect(padFilter);
    padFilter.connect(master);
    padFilter.connect(reverb);

    const bellBus = ctx.createGain();
    bellBus.gain.value = 0.32;
    bellBus.connect(master);
    bellBus.connect(reverb);

    this.ctx = ctx;
    this.master = master;
    this.padBus = padBus;
    this.bellBus = bellBus;
  }

  private impulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  private playChord() {
    const ctx = this.ctx;
    const bus = this.padBus;
    if (!ctx || !bus || !this.running) return;
    const now = ctx.currentTime;
    const chord = CHORDS[this.chordIndex % CHORDS.length];
    const attack = 3.2;
    const hold = CHORD_SECONDS - 1;
    const release = 5;

    chord.forEach((freq, i) => {
      [-5, 5].forEach((cents, j) => {
        const osc = ctx.createOscillator();
        osc.type = j === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = cents;
        const g = ctx.createGain();
        const level = (i === 0 ? 0.11 : 0.075) * (j === 0 ? 1 : 0.45);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(level, now + attack);
        g.gain.setValueAtTime(level, now + hold);
        g.gain.linearRampToValueAtTime(0, now + hold + release);
        osc.connect(g).connect(bus);
        osc.start(now);
        osc.stop(now + hold + release + 0.1);
      });
    });

    this.scheduleBells(this.chordIndex % CHORDS.length);
    this.chordIndex++;
    this.timers.push(window.setTimeout(() => this.playChord(), CHORD_SECONDS * 1000));
  }

  private scheduleBells(index: number) {
    const notes = MELODY[index];
    let t = 1.2 + Math.random() * 1.5;
    while (t < CHORD_SECONDS - 0.5) {
      if (Math.random() < 0.62) {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const at = t;
        this.timers.push(window.setTimeout(() => this.bell(freq), at * 1000));
      }
      t += 1.5 + Math.random() * 1.9;
    }
  }

  private bell(freq: number) {
    const ctx = this.ctx;
    const bus = this.bellBus;
    if (!ctx || !bus || !this.running) return;
    const now = ctx.currentTime;
    const partials: [number, number][] = [
      [1, 1],
      [2, 0.22],
      [3.01, 0.07],
    ];
    partials.forEach(([mult, amp]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      const peak = 0.09 * amp * (0.7 + Math.random() * 0.3);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6 / mult + 0.6);
      osc.connect(g).connect(bus);
      osc.start(now);
      osc.stop(now + 3.4);
    });
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') await ctx.resume();
    if (this.running) return;
    this.running = true;
    const now = ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(this.volume, now + 4);
    this.playChord();
  }

  async stop(fadeSeconds = 1.6) {
    if (!this.ctx || !this.running) return;
    this.running = false;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    const now = this.ctx.currentTime;
    const g = this.master!.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + fadeSeconds);
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (!this.running && ctx.state === 'running') void ctx.suspend();
    }, fadeSeconds * 1000 + 100);
  }

  setMuted(muted: boolean) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const g = this.master.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(muted || !this.running ? 0 : this.volume, now + 0.5);
  }

  /** Pause/resume the audio clock when the tab is hidden, without losing state. */
  async setHidden(hidden: boolean) {
    if (!this.ctx) return;
    if (hidden && this.ctx.state === 'running') await this.ctx.suspend();
    else if (!hidden && this.running && this.ctx.state === 'suspended') await this.ctx.resume();
  }

  dispose() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.running = false;
    void this.ctx?.close();
    this.ctx = null;
  }
}
