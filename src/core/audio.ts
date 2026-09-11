export interface TimerAudioSettings {
  enabled: boolean;
}

export const TIMER_AUDIO_SETTINGS_KEY = 'home-workout:timer-audio';
export const DEFAULT_TIMER_AUDIO_SETTINGS: Readonly<TimerAudioSettings> = { enabled: false };

export function loadTimerAudioSettings(storage: Pick<Storage, 'getItem'>): TimerAudioSettings {
  try {
    const raw = storage.getItem(TIMER_AUDIO_SETTINGS_KEY);
    if (raw === null) return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.enabled !== 'boolean') return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
    return { enabled: candidate.enabled };
  } catch {
    return { ...DEFAULT_TIMER_AUDIO_SETTINGS };
  }
}

export function saveTimerAudioSettings(storage: Pick<Storage, 'setItem'>, settings: TimerAudioSettings): void {
  storage.setItem(TIMER_AUDIO_SETTINGS_KEY, JSON.stringify({ enabled: settings.enabled }));
}

type AudioContextFactory = () => AudioContext;
export type TimerCueKind = 'countdown' | 'complete';

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

  play(kind: TimerCueKind = 'complete'): boolean {
    if (this.context?.state !== 'running') return false;
    try {
      const start = this.context.currentTime;
      const complete = kind === 'complete';
      const stop = start + (complete ? 0.48 : 0.16);
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(complete ? 1046.5 : 880, start);
      oscillator.frequency.exponentialRampToValueAtTime(complete ? 880 : 760, stop);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(complete ? 0.24 : 0.2, start + 0.01);
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
