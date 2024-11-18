import { NamedBrowserProvider } from '@imtbl/checkout-sdk';

export const baseWidgetProviderEvent = 'IMTBL_WIDGET_PROVIDER_EVENT';

// as per EIP-1193 spec
export enum ProviderEvent {
  CHAIN_CHANGED = 'chainChanged',
  ACCOUNTS_CHANGED = 'accountsChanged',
}

// eslint-disable-next-line max-len
export function addAccountsChangedListener(browserProvider: NamedBrowserProvider, handleAccountsChanged: (e:any) => void) {
  (browserProvider.provider as any).on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

// eslint-disable-next-line max-len
export function removeAccountsChangedListener(browserProvider: NamedBrowserProvider, handleAccountsChanged: (e:any) => void) {
  (browserProvider.provider as any).removeListener(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

export function addChainChangedListener(browserProvider: NamedBrowserProvider, handleChainChanged: (e:any) => void) {
  (browserProvider.provider as any).on(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

export function removeChainChangedListener(browserProvider: NamedBrowserProvider, handleChainChanged: (e:any) => void) {
  (browserProvider.provider as any).removeListener(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

export function imtblWidgetsProviderUpdated() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}

export function addProviderListenersForWidgetRoot(provider: NamedBrowserProvider) {
  removeAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  removeChainChangedListener(provider, imtblWidgetsProviderUpdated);
  addAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  addChainChangedListener(provider, imtblWidgetsProviderUpdated);
}
