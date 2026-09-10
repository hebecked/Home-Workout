export interface TimerAudioSettings {
  enabled: boolean;
  volume: number;
}

export const TIMER_AUDIO_SETTINGS_KEY = 'home-workout:timer-audio';
export const DEFAULT_TIMER_AUDIO_SETTINGS: Readonly<TimerAudioSettings> = { enabled: false, volume: 0.5 };

export function loadTimerAudioSettings(storage: Pick<Storage, 'getItem'>): TimerAudioSettings {
  try {
    const raw = storage.getItem(TIMER_AUDIO_SETTINGS_KEY);
    if (raw === null) return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.enabled !== 'boolean' || typeof candidate.volume !== 'number'
      || !Number.isFinite(candidate.volume) || candidate.volume < 0 || candidate.volume > 1) {
      return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    }
    return { enabled: candidate.enabled, volume: candidate.volume };
  } catch {
    return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
  }
}

export function saveTimerAudioSettings(storage: Pick<Storage, 'setItem'>, settings: TimerAudioSettings): void {
  const volume = Number.isFinite(settings.volume) ? Math.min(1, Math.max(0, settings.volume)) : DEFAULT_TIMER_AUDIO_SETTINGS.volume;
  storage.setItem(TIMER_AUDIO_SETTINGS_KEY, JSON.stringify({ enabled: settings.enabled, volume }));
}

type AudioContextFactory = () => AudioContext;

export class TimerEndSignal {
  private context: AudioContext | null = null;

  constructor(
    private readonly createContext: AudioContextFactory = () => new AudioContext(),
    readonly supported: boolean = typeof globalThis.AudioContext === 'function'
  ) {}

  async unlock(): Promise<boolean> {
    if (!this.supported) return false;
    try {
      this.context ??= this.createContext();
      if (this.context.state === 'suspended') await this.context.resume();
      return this.context.state === 'running';
    } catch {
      return false;
    }
  }

  play(volume: number): boolean {
    if (this.context?.state !== 'running' || !Number.isFinite(volume) || volume <= 0) return false;
    try {
      const normalizedVolume = Math.min(1, volume);
      const start = this.context.currentTime;
      const stop = start + 0.32;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, start);
      oscillator.frequency.exponentialRampToValueAtTime(660, stop);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, normalizedVolume * 0.16), start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stop);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(stop);
      return true;
    } catch {
      return false;
    }
  }
}
