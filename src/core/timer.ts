export interface TimestampTimer {
  durationMs: number;
  startedAtMs: number;
  pausedAtMs: number | null;
  accumulatedPausedMs: number;
}

const validTime = (value: number): boolean => Number.isFinite(value) && value >= 0;

export function createTimer(durationMs: number, nowMs: number): TimestampTimer {
  if (!validTime(durationMs) || durationMs <= 0 || !validTime(nowMs)) throw new RangeError('Duration and timestamp must be finite positive values.');
  return { durationMs, startedAtMs: nowMs, pausedAtMs: null, accumulatedPausedMs: 0 };
}

export function getElapsedMs(timer: TimestampTimer, nowMs: number): number {
  const effectiveNow = timer.pausedAtMs ?? nowMs;
  return Math.min(timer.durationMs, Math.max(0, effectiveNow - timer.startedAtMs - timer.accumulatedPausedMs));
}

export function getRemainingMs(timer: TimestampTimer, nowMs: number): number {
  return Math.max(0, timer.durationMs - getElapsedMs(timer, nowMs));
}

export function isTimerComplete(timer: TimestampTimer, nowMs: number): boolean {
  return getRemainingMs(timer, nowMs) === 0;
}

export function pauseTimer(timer: TimestampTimer, nowMs: number): TimestampTimer {
  if (timer.pausedAtMs !== null) return timer;
  return { ...timer, pausedAtMs: nowMs };
}

export function resumeTimer(timer: TimestampTimer, nowMs: number): TimestampTimer {
  if (timer.pausedAtMs === null) return timer;
  return { ...timer, accumulatedPausedMs: timer.accumulatedPausedMs + Math.max(0, nowMs - timer.pausedAtMs), pausedAtMs: null };
}
