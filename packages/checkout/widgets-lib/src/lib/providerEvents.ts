import { Web3Provider } from '@ethersproject/providers';

// as per EIP-1193 spec
export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
}

export function addProviderAccountsListener(provider: Web3Provider, handler: (event: any) => void) {
  console.log('[provider events]: subscribing to accounts changed events');
  (provider.provider as any).on(ProviderEvent.ACCOUNTS_CHANGED, handler);
}

export function addProviderChainListener(provider: Web3Provider, handler: (event: any) => void) {
  console.log('[provider events]: subscribing to chain changed events');
  (provider.provider as any).on(ProviderEvent.CHAIN_CHANGED, handler);
}

export function removeProviderEventListeners(
  provider: Web3Provider,
  accountHandler: (event: any) => void,
  chainHandler: (e: any) => void,
) {
  console.log('[provider events]: removing event listeners');
  (provider.provider as any).removeListener(ProviderEvent.ACCOUNTS_CHANGED, accountHandler);
  (provider.provider as any).removeListener(ProviderEvent.CHAIN_CHANGED, chainHandler);
}
