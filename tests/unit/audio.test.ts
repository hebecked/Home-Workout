import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_TIMER_AUDIO_SETTINGS,
  loadTimerAudioSettings,
  saveTimerAudioSettings,
  TIMER_AUDIO_SETTINGS_KEY,
  TimerEndSignal
} from '../../src/core/audio';

const storage = (value: string | null = null) => ({
  getItem: vi.fn(() => value),
  setItem: vi.fn()
});

describe('timer audio settings', () => {
  it('is opt-in', () => {
    expect(loadTimerAudioSettings(storage())).toStrictEqual({ enabled: false });
    expect(DEFAULT_TIMER_AUDIO_SETTINGS.enabled).toBe(false);
  });

  it.each([
    'not-json',
    'null',
    '{}',
    '{"enabled":"yes"}'
  ])('falls back safely for invalid stored settings: %s', (value) => {
    expect(loadTimerAudioSettings(storage(value))).toStrictEqual({ enabled: false });
  });

  it('loads legacy volume settings and persists only the current enabled state', () => {
    expect(loadTimerAudioSettings(storage('{"enabled":true,"volume":0.25}'))).toStrictEqual({ enabled: true });
    const target = storage();
    saveTimerAudioSettings(target, { enabled: true });
    expect(target.setItem).toHaveBeenCalledWith(TIMER_AUDIO_SETTINGS_KEY, '{"enabled":true}');
  });
});

describe('timer end signal', () => {
  const audioContext = (initialState: AudioContextState = 'suspended') => {
    const events: string[] = [];
    const oscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(() => events.push('frequency-start')),
        exponentialRampToValueAtTime: vi.fn(() => events.push('frequency-end'))
      },
      connect: vi.fn(() => events.push('oscillator-connect')),
      start: vi.fn(() => events.push('start')),
      stop: vi.fn(() => events.push('stop'))
    };
    const gain = {
      gain: {
        setValueAtTime: vi.fn(() => events.push('gain-start')),
        exponentialRampToValueAtTime: vi.fn(() => events.push('gain-ramp'))
      },
      connect: vi.fn(() => events.push('gain-connect'))
    };
    const resume = vi.fn(() => {
      context.state = 'running';
      return Promise.resolve();
    });
    const context = {
      state: initialState,
      currentTime: 4,
      destination: {},
      resume,
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain)
    };
    return { context: context as unknown as AudioContext, events, oscillator, gain, resume };
  };

  it('creates and resumes the context only after unlock, then synthesizes a short cue', async () => {
    const fake = audioContext();
    const factory = vi.fn(() => fake.context);
    const signal = new TimerEndSignal(factory, true);

    expect(signal.play()).toBe(false);
    expect(factory).not.toHaveBeenCalled();
    await expect(signal.unlock()).resolves.toBe(true);
    await expect(signal.unlock()).resolves.toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(fake.resume).toHaveBeenCalledTimes(1);
    expect(signal.play()).toBe(true);
    expect(fake.events).toStrictEqual([
      'frequency-start', 'frequency-end', 'gain-start', 'gain-ramp', 'gain-ramp',
      'oscillator-connect', 'gain-connect', 'start', 'stop'
    ]);
    expect(fake.oscillator.stop).toHaveBeenCalledWith(4.32);
  });

  it('fails silently when unsupported, unavailable, or suspended', async () => {
    const factory = vi.fn(() => { throw new Error('blocked'); });
    await expect(new TimerEndSignal(factory, false).unlock()).resolves.toBe(false);
    expect(factory).not.toHaveBeenCalled();
    await expect(new TimerEndSignal(factory, true).unlock()).resolves.toBe(false);

    const fake = audioContext('running');
    const signal = new TimerEndSignal(() => fake.context, true);
    await signal.unlock();
    expect(signal.play()).toBe(true);
  });
});
