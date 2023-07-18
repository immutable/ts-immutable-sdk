import { useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { addProviderAccountsListener, addProviderChainListener, removeProviderEventListeners } from '../providerEvents';

export function useProviderEventSubscriptions({
  provider,
}: { provider: Web3Provider | null }) {
  useEffect(() => {
    if (!provider) {
      console.log('provider is null');
      return () => {};
    }
    function handleAccountsChanged(e:any) {
      console.log(e);
    }
    function handleChainChanged(e:any) {
      console.log(e);
    }
    addProviderAccountsListener(provider, handleAccountsChanged);
    addProviderChainListener(provider, handleChainChanged);

    return () => {
      console.log('[Connect Widget]');
      removeProviderEventListeners(provider, handleAccountsChanged, handleChainChanged);
    };
  }, [provider]);
}
