import { Web3Provider } from '@ethersproject/providers';
import {
  addAccountsChangedListener, addChainChangedListener, removeAccountsChangedListener, removeChainChangedListener,
} from 'lib';

export const baseWidgetProviderEvent = 'IMTBL_WIDGET_PROVIDER_EVENT';

export function imtblWidgetsProviderUpdated() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}

export function addProviderListenersForWidgetRoot(provider: Web3Provider) {
  removeAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  removeChainChangedListener(provider, imtblWidgetsProviderUpdated);
  addAccountsChangedListener(provider, imtblWidgetsProviderUpdated);
  addChainChangedListener(provider, imtblWidgetsProviderUpdated);
}
