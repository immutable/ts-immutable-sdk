import { Web3Provider } from '@ethersproject/providers';
import { ProviderEvent } from './providerEvents';

/**
 * This class encapsulates the logic to handle adding and removing of event listeners on the provider.
 * It is intended to be instantiated and used when a new provider is set in the widget context.
 * This helps us to unsubscribe from events when the existing provider is changed
 */
export class ProviderSubscription {
  private provider: Web3Provider;

  private handleAccountsChanged: (event: any) => void;

  private handleChainChanged: (event: any) => void;

  constructor(
    provider: Web3Provider,
    handleAccountsChanged: (event: any) => void,
    handleChainChanged: (event: any) => void,
  ) {
    this.provider = provider;
    this.handleAccountsChanged = handleAccountsChanged;
    this.handleChainChanged = handleChainChanged;
  }

  private addProviderAccountsListener(provider: Web3Provider, handler: (event: any) => void) {
    console.log('[ProviderSubscription]: subscribing to accounts changed events');
    (provider.provider as any).on(ProviderEvent.ACCOUNTS_CHANGED, handler);
  }

  private addProviderChainListener(provider: Web3Provider, handler: (event: any) => void) {
    console.log('[ProviderSubscription]: subscribing to chain changed events');
    (provider.provider as any).on(ProviderEvent.CHAIN_CHANGED, handler);
  }

  subscribe() {
    console.log('[ProviderSubscription]: subscribing to accounts and chain changed events ');
    this.addProviderAccountsListener(this.provider, this.handleAccountsChanged);
    this.addProviderChainListener(this.provider, this.handleChainChanged);
  }

  updateAccountChangeHandler(handleAccountsChanged: (event: any) => void) {
    (this.provider.provider as any).removeListener(ProviderEvent.ACCOUNTS_CHANGED, this.handleAccountsChanged);
    this.handleAccountsChanged = handleAccountsChanged;
    this.addProviderAccountsListener(this.provider, this.handleAccountsChanged);
  }

  updateChainChangeHandler(handleChainChanged: (event: any) => void) {
    (this.provider.provider as any).removeListener(ProviderEvent.CHAIN_CHANGED, this.handleChainChanged);
    this.handleChainChanged = handleChainChanged;
    this.addProviderChainListener(this.provider, this.handleChainChanged);
  }

  unsubscribe() {
    console.log('[ProviderSubscription]: removing all event listeners on provider');
    (this.provider.provider as any).removeListener(ProviderEvent.ACCOUNTS_CHANGED, this.handleAccountsChanged);
    (this.provider.provider as any).removeListener(ProviderEvent.CHAIN_CHANGED, this.handleChainChanged);
  }
}
