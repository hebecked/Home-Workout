export interface PwaState {
  canInstall: boolean;
  updateReady: boolean;
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PwaController {
  private installPrompt: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private refreshing = false;
  private onChange: () => void = () => undefined;

  constructor(
    private readonly windowTarget: Window = window,
    private readonly navigatorTarget: Navigator = navigator
  ) {}

  state(): PwaState {
    return {
      canInstall: this.installPrompt !== null,
      updateReady: this.registration?.waiting !== null && this.registration?.waiting !== undefined
    };
  }

  start(onChange: () => void): void {
    this.onChange = onChange;
    this.windowTarget.addEventListener('beforeinstallprompt', this.captureInstallPrompt);
    this.windowTarget.addEventListener('appinstalled', this.clearInstallPrompt);

    const serviceWorker = this.navigatorTarget.serviceWorker;
    if (!serviceWorker) return;
    serviceWorker.addEventListener('controllerchange', () => {
      if (!this.refreshing) return;
      this.windowTarget.location.reload();
    });
    const register = (): void => {
      void serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
        .then((registration) => this.watchRegistration(registration))
        .catch(() => undefined);
    };
    if (this.windowTarget.document.readyState === 'complete') register();
    else this.windowTarget.addEventListener('load', register, { once: true });
  }

  async promptInstall(): Promise<void> {
    const prompt = this.installPrompt;
    if (!prompt) return;
    this.installPrompt = null;
    this.onChange();
    try {
      await prompt.prompt();
    } catch {
      // Installation is optional; a browser rejection must not disturb the app.
    }
  }

  applyUpdate(): void {
    const waiting = this.registration?.waiting;
    if (!waiting) return;
    this.refreshing = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  private readonly captureInstallPrompt = (event: Event): void => {
    event.preventDefault();
    this.installPrompt = event as InstallPromptEvent;
    this.onChange();
  };

  private readonly clearInstallPrompt = (): void => {
    this.installPrompt = null;
    this.onChange();
  };

  private watchRegistration(registration: ServiceWorkerRegistration): void {
    this.registration = registration;
    if (registration.waiting && this.navigatorTarget.serviceWorker.controller) this.onChange();
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && this.navigatorTarget.serviceWorker.controller) this.onChange();
      });
    });
  }
}
