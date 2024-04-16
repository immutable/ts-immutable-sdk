import { createStore, Store } from './injected';
import { EIP6963ProviderDetail } from '../types';

export class InjectedProvidersManager {
  private static instance: InjectedProvidersManager;

  private store: Store;

  private resetTimeout: any;

  private isInit: boolean = false;

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

  public findProvider(args: { rdns: string }) {
    return this.store.findProvider(args);
  }

  public getProviders(): readonly EIP6963ProviderDetail[] {
    return this.store.getProviders();
  }

  public subscribe(callback: any): () => void {
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

  public initialise() {
    if (!this.isInit) {
      this.isInit = true;
      this.reset();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public requestProviders() {
    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
  }

  public destroy() {
    this.store.destroy();
  }
}
