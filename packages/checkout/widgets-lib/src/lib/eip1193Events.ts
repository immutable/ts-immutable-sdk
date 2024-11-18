import { BrowserProvider } from 'ethers';

export const baseWidgetProviderEvent = 'IMTBL_WIDGET_PROVIDER_EVENT';

// as per EIP-1193 spec
export enum ProviderEvent {
  CHAIN_CHANGED = 'chainChanged',
  ACCOUNTS_CHANGED = 'accountsChanged',
}

export function addAccountsChangedListener(browserProvider: BrowserProvider, handleAccountsChanged: (e:any) => void) {
  (browserProvider.provider as any).on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

export function removeAccountsChangedListener(browserProvider: BrowserProvider, handleAccountsChanged: (e:any) => void) {
  (browserProvider.provider as any).removeListener(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
}

export function addChainChangedListener(browserProvider: BrowserProvider, handleChainChanged: (e:any) => void) {
  (browserProvider.provider as any).on(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

export function removeChainChangedListener(browserProvider: BrowserProvider, handleChainChanged: (e:any) => void) {
  (browserProvider.provider as any).removeListener(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
}

export function imtblWidgetsProviderUpdated() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}

export function addProviderListenersForWidgetRoot(provider: BrowserProvider) {
  removeAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  removeChainChangedListener(provider, imtblWidgetsProviderUpdated);
  addAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  addChainChangedListener(provider, imtblWidgetsProviderUpdated);
}
