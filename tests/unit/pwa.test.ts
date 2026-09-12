import { describe, expect, it, vi } from 'vitest';
import { PwaController } from '../../src/ui/pwa';

const nextTask = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('PWA controls', () => {
  it('only offers installation after a browser install event and consumes the prompt once', async () => {
    const windowTarget = new EventTarget() as Window;
    Object.defineProperties(windowTarget, {
      document: { value: { readyState: 'loading' } },
      location: { value: { reload: vi.fn() } }
    });
    const navigatorTarget = {} as Navigator;
    const changed = vi.fn();
    const prompt = vi.fn().mockResolvedValue({ outcome: 'dismissed' });
    const controller = new PwaController(windowTarget, navigatorTarget);
    controller.start(changed);

    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt });
    windowTarget.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(controller.state()).toEqual({ canInstall: true, updateReady: false });

    await controller.promptInstall();
    expect(prompt).toHaveBeenCalledOnce();
    expect(controller.state().canInstall).toBe(false);
    windowTarget.dispatchEvent(new Event('appinstalled'));
    expect(changed).toHaveBeenCalledTimes(3);
  });

  it('treats a rejected browser installation prompt as a silent no-op', async () => {
    const windowTarget = new EventTarget() as Window;
    Object.defineProperties(windowTarget, {
      document: { value: { readyState: 'loading' } },
      location: { value: { reload: vi.fn() } }
    });
    const controller = new PwaController(windowTarget, {} as Navigator);
    controller.start(vi.fn());
    const prompt = vi.fn().mockRejectedValue(new Error('unavailable'));
    windowTarget.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), { prompt }));

    await expect(controller.promptInstall()).resolves.toBeUndefined();
    expect(controller.state().canInstall).toBe(false);
  });

  it('announces a waiting worker and reloads only after the user applies it', async () => {
    const waiting = { postMessage: vi.fn() };
    const registration = Object.assign(new EventTarget(), {
      waiting,
      installing: null
    }) as unknown as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);
    const serviceWorker = Object.assign(new EventTarget(), {
      controller: {},
      register
    }) as unknown as ServiceWorkerContainer;
    const reload = vi.fn();
    const windowTarget = new EventTarget() as Window;
    Object.defineProperties(windowTarget, {
      document: { value: { readyState: 'complete' } },
      location: { value: { reload } }
    });
    const navigatorTarget = { serviceWorker } as Navigator;
    const controller = new PwaController(windowTarget, navigatorTarget);
    controller.start(vi.fn());
    await nextTask();

    expect(register).toHaveBeenCalledWith('/service-worker.js', { updateViaCache: 'none' });
    expect(controller.state().updateReady).toBe(true);
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    expect(reload).not.toHaveBeenCalled();
    controller.applyUpdate();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    serviceWorker.dispatchEvent(new Event('controllerchange'));
    expect(reload).toHaveBeenCalledOnce();
  });

  it('detects a newly installed update worker', async () => {
    const installing = Object.assign(new EventTarget(), { state: 'installing' }) as ServiceWorker;
    const registration = Object.assign(new EventTarget(), {
      waiting: null,
      installing
    }) as unknown as ServiceWorkerRegistration;
    const serviceWorker = Object.assign(new EventTarget(), {
      controller: {},
      register: vi.fn().mockResolvedValue(registration)
    }) as unknown as ServiceWorkerContainer;
    const windowTarget = new EventTarget() as Window;
    Object.defineProperties(windowTarget, {
      document: { value: { readyState: 'complete' } },
      location: { value: { reload: vi.fn() } }
    });
    const changed = vi.fn();
    new PwaController(windowTarget, { serviceWorker } as Navigator).start(changed);
    await nextTask();
    registration.dispatchEvent(new Event('updatefound'));
    Object.defineProperty(installing, 'state', { value: 'installed' });
    installing.dispatchEvent(new Event('statechange'));
    expect(changed).toHaveBeenCalledOnce();
  });
});
