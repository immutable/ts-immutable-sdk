import { createStore } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';

export class InjectedProvidersManager {
  private static instance: InjectedProvidersManager;

  private store: any;

  private resetTimeout: any;

  private constructor() {
    this.store = createStore();
    this.store.reset();
  }

  public static getInstance(): InjectedProvidersManager {
    if (!InjectedProvidersManager.instance) {
      InjectedProvidersManager.instance = new InjectedProvidersManager();
    }

    return InjectedProvidersManager.instance;
  }

  public getProviders(): EIP6963ProviderDetail[] {
    return this.store.getProviders();
  }

  public subscribe(callback: any) {
    return this.store.subscribe(callback);
  }

  public clear() {
    this.store.clear();
  }

  public reset() {
    clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.store.reset();
    }, 200);
  }

  public destroy() {
    this.store.destroy();
  }
}
