import { describe, expect, it } from 'vitest';
import {
  createTimer,
  getElapsedMs,
  getRemainingMs,
  isTimerComplete,
  pauseTimer,
  resumeTimer
} from '../../src/core/timer';

describe('timestamp-based timer', () => {
  it('derives elapsed and remaining time from timestamps, not tick count', () => {
    const timer = createTimer(30_000, 1_000);

    expect(getElapsedMs(timer, 1_000)).toBe(0);
    expect(getRemainingMs(timer, 1_000)).toBe(30_000);
    expect(getRemainingMs(timer, 13_345)).toBe(17_655);
    expect(getRemainingMs(timer, 31_000)).toBe(0);
    expect(getRemainingMs(timer, 90_000)).toBe(0);
    expect(isTimerComplete(timer, 30_999)).toBe(false);
    expect(isTimerComplete(timer, 31_000)).toBe(true);
  });

  it('is unaffected by missing render frames or backgrounding', () => {
    const timer = createTimer(60_000, 10_000);

    // There are deliberately no intermediate calls, simulating a background tab.
    expect(getElapsedMs(timer, 54_321)).toBe(44_321);
    expect(getRemainingMs(timer, 54_321)).toBe(15_679);
  });

  it('freezes while paused and excludes the entire pause from elapsed time', () => {
    const running = createTimer(30_000, 1_000);
    const paused = pauseTimer(running, 11_000);

    expect(getElapsedMs(paused, 11_000)).toBe(10_000);
    expect(getElapsedMs(paused, 101_000)).toBe(10_000);
    expect(getRemainingMs(paused, 101_000)).toBe(20_000);

    const resumed = resumeTimer(paused, 101_000);
    expect(getRemainingMs(resumed, 101_000)).toBe(20_000);
    expect(getRemainingMs(resumed, 106_500)).toBe(14_500);
    expect(isTimerComplete(resumed, 121_000)).toBe(true);
  });

  it('does not mutate prior states when pausing or resuming', () => {
    const running = createTimer(5_000, 0);
    const paused = pauseTimer(running, 1_000);
    const resumed = resumeTimer(paused, 3_000);

    expect(running.pausedAtMs).toBeNull();
    expect(paused.pausedAtMs).toBe(1_000);
    expect(resumed.pausedAtMs).toBeNull();
    expect(resumed.accumulatedPausedMs).toBe(2_000);
  });

  it('treats duplicate pause/resume actions as idempotent', () => {
    const running = createTimer(5_000, 0);
    const paused = pauseTimer(running, 1_000);

    expect(pauseTimer(paused, 2_000)).toStrictEqual(paused);
    expect(resumeTimer(running, 2_000)).toStrictEqual(running);
  });

  it.each([
    [-1, 0],
    [Number.NaN, 0],
    [1_000, Number.POSITIVE_INFINITY]
  ])('rejects invalid duration/time input (%s, %s)', (duration, now) => {
    expect(() => createTimer(duration, now)).toThrow();
  });
});
