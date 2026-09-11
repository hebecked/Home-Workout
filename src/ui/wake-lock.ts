export interface ScreenWakeLockSentinel {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void, options?: { once?: boolean }): void;
}

export interface ScreenWakeLockProvider {
  request(type: 'screen'): Promise<ScreenWakeLockSentinel>;
}

type VisibilitySource = Pick<Document, 'visibilityState' | 'addEventListener'>;

export class WorkoutWakeLock {
  private sentinel: ScreenWakeLockSentinel | null = null;
  private requested = false;
  private shouldHold = false;

  constructor(
    private readonly provider: ScreenWakeLockProvider | undefined = (navigator as Navigator & { wakeLock?: ScreenWakeLockProvider }).wakeLock,
    private readonly visibility: VisibilitySource = document
  ) {
    this.visibility.addEventListener('visibilitychange', () => {
      if (this.shouldHold && this.visibility.visibilityState === 'visible') void this.acquire();
    });
  }

  setActive(active: boolean): void {
    this.shouldHold = active;
    if (active) void this.acquire();
    else void this.release();
  }

  private async acquire(): Promise<void> {
    if (!this.shouldHold || !this.provider || this.visibility.visibilityState !== 'visible' || this.sentinel || this.requested) return;
    this.requested = true;
    try {
      const sentinel = await this.provider.request('screen');
      if (!this.shouldHold) {
        await sentinel.release();
        return;
      }
      this.sentinel = sentinel;
      sentinel.addEventListener('release', () => {
        if (this.sentinel === sentinel) this.sentinel = null;
      }, { once: true });
    } catch {
      // Power-saving settings and browser policy may reject the request.
    } finally {
      this.requested = false;
    }
  }

  private async release(): Promise<void> {
    const sentinel = this.sentinel;
    this.sentinel = null;
    if (!sentinel || sentinel.released) return;
    try {
      await sentinel.release();
    } catch {
      // Releasing an already revoked lock must never interrupt the workout.
    }
  }
}
