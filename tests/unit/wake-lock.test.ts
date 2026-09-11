import { describe, expect, it, vi } from 'vitest';
import { WorkoutWakeLock, type ScreenWakeLockSentinel } from '../../src/ui/wake-lock';

class Visibility extends EventTarget {
  visibilityState: DocumentVisibilityState = 'visible';
}

function sentinel() {
  const target = new EventTarget();
  let released = false;
  const release = vi.fn(() => {
    if (released) return Promise.resolve();
    released = true;
    target.dispatchEvent(new Event('release'));
    return Promise.resolve();
  });
  const value: ScreenWakeLockSentinel = {
    get released() { return released; },
    release,
    addEventListener: (type, listener, options) => target.addEventListener(type, listener, options)
  };
  return { value, release };
}

describe('workout screen wake lock', () => {
  it('acquires once while active and releases when paused or finished', async () => {
    const visibility = new Visibility();
    const first = sentinel();
    const request = vi.fn(() => Promise.resolve(first.value));
    const wakeLock = new WorkoutWakeLock({ request }, visibility);

    wakeLock.setActive(true);
    wakeLock.setActive(true);
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith('screen');

    wakeLock.setActive(false);
    await vi.waitFor(() => expect(first.release).toHaveBeenCalledTimes(1));
  });

  it('reacquires after the document becomes visible again', async () => {
    const visibility = new Visibility();
    const first = sentinel();
    const second = sentinel();
    const request = vi.fn()
      .mockResolvedValueOnce(first.value)
      .mockResolvedValueOnce(second.value);
    const wakeLock = new WorkoutWakeLock({ request }, visibility);

    wakeLock.setActive(true);
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    visibility.visibilityState = 'hidden';
    await first.value.release();
    visibility.dispatchEvent(new Event('visibilitychange'));
    expect(request).toHaveBeenCalledTimes(1);

    visibility.visibilityState = 'visible';
    visibility.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('silently handles unsupported, rejected, and late requests', async () => {
    const visibility = new Visibility();
    expect(() => new WorkoutWakeLock(undefined, visibility).setActive(true)).not.toThrow();

    const rejected = new WorkoutWakeLock({ request: vi.fn().mockRejectedValue(new Error('denied')) }, visibility);
    expect(() => rejected.setActive(true)).not.toThrow();

    let resolveRequest!: (value: ScreenWakeLockSentinel) => void;
    const lateSentinel = sentinel();
    const late = new WorkoutWakeLock({ request: () => new Promise((resolve) => { resolveRequest = resolve; }) }, visibility);
    late.setActive(true);
    late.setActive(false);
    resolveRequest(lateSentinel.value);
    await vi.waitFor(() => expect(lateSentinel.release).toHaveBeenCalledTimes(1));
  });
});
