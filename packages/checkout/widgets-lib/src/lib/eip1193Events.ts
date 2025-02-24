import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';

export const baseWidgetProviderEvent = 'IMTBL_WIDGET_PROVIDER_EVENT';

// as per EIP-1193 spec
export enum ProviderEvent {
  CHAIN_CHANGED = 'chainChanged',
  ACCOUNTS_CHANGED = 'accountsChanged',
}

// eslint-disable-next-line max-len
export function addAccountsChangedListener(browserProvider: WrappedBrowserProvider, handleAccountsChanged: (e:any) => void) {
  browserProvider.ethereumProvider?.on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

// eslint-disable-next-line max-len
export function removeAccountsChangedListener(browserProvider: WrappedBrowserProvider, handleAccountsChanged: (e:any) => void) {
  browserProvider.ethereumProvider?.removeListener(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

// eslint-disable-next-line max-len
export function addChainChangedListener(browserProvider: WrappedBrowserProvider, handleChainChanged: (e:any) => void) {
  browserProvider.ethereumProvider?.on(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

// eslint-disable-next-line max-len
export function removeChainChangedListener(browserProvider: WrappedBrowserProvider, handleChainChanged: (e:any) => void) {
  browserProvider.ethereumProvider?.removeListener(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

export function imtblWidgetsProviderUpdated() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}

export function addProviderListenersForWidgetRoot(provider: WrappedBrowserProvider) {
  removeAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  removeChainChangedListener(provider, imtblWidgetsProviderUpdated);
  addAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  addChainChangedListener(provider, imtblWidgetsProviderUpdated);
}
