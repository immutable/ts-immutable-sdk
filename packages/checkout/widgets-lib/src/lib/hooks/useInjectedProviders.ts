import { useCallback, useEffect, useState } from 'react';
import {
  Checkout,
  EIP1193Provider,
  EIP6963ProviderDetail,
  getMetaMaskProviderDetail,
  getPassportProviderDetail,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { BrowserProvider } from 'ethers';

const DEFAULT_PRIORITY_INDEX = 999;

export interface UseInjectedProvidersParams {
  checkout: Checkout | null;
}

type ConnectConfig = {
  injected: {
    priorityWalletRdns: WalletProviderRdns | string[];
    blocklistWalletRdns: WalletProviderRdns | string[];
  };
};

declare global {
  interface Window {
    ethereum: any;
  }
}

let passportBrowserProvider: BrowserProvider;
const processProviders = (
  checkout: Checkout | null,
  injectedProviders: EIP6963ProviderDetail[],
  priorityWalletRdns: WalletProviderRdns | string[] = [],
  blocklistWalletRdns: WalletProviderRdns | string[] = [],
) => {
  const getIndex = (rdns: string) => {
    const index = priorityWalletRdns.indexOf(rdns);
    return index >= 0 ? index : DEFAULT_PRIORITY_INDEX;
  };

  // Injected providers
  const filteredProviders = [...injectedProviders];

  // Attempt to fallback to window.ethereum if no EIP-6963 providers are found
  // Assuming this is MetaMask on mobile
  if (filteredProviders.length === 0 && window.ethereum) {
    filteredProviders.unshift(getMetaMaskProviderDetail(window.ethereum as EIP1193Provider));
  }

  // Add passport from checkout config if not from injected providers
  if (checkout?.passport
    && priorityWalletRdns.includes(WalletProviderRdns.PASSPORT)
    && !filteredProviders.some((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT)) {
    if (!passportBrowserProvider) {
      passportBrowserProvider = new BrowserProvider(checkout.passport.connectEvm());
    }
    filteredProviders.unshift(getPassportProviderDetail(passportBrowserProvider.provider as unknown as EIP1193Provider));
  }

  // Filter & sort providers
  return filteredProviders
    .filter(({ info }) => !blocklistWalletRdns.includes(info.rdns))
    .sort((a, b) => (
      getIndex(a.info.rdns) - getIndex(b.info.rdns)
    ));
};

/**
 * Hook that supplies a sorted list of EIP-6963 injected provider detail.
 */
export const useInjectedProviders = ({ checkout }: UseInjectedProvidersParams) => {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

  const findProvider = useCallback((rdns: string) => (
    providers.find((provider) => provider.info.rdns === rdns)
  ), [providers]);

  const filterAndProcessProviders = useCallback(async (injectedProviders: EIP6963ProviderDetail[]) => {
    const connectConfig = await checkout?.config.remote.getConfig('connect') as ConnectConfig;
    const priorityWalletRdns = connectConfig.injected?.priorityWalletRdns ?? [];
    const blocklistWalletRdns = connectConfig.injected?.blocklistWalletRdns ?? [];
    const filteredProviders = processProviders(
      checkout,
      injectedProviders,
      priorityWalletRdns,
      blocklistWalletRdns,
    );
    setProviders(filteredProviders);
  }, [checkout, setProviders]);

  useEffect(() => {
    if (!checkout) return () => {};
    const cancelSubscription = checkout.onInjectedProvidersChange(
      async (injectedProviders: EIP6963ProviderDetail[]) => {
        await filterAndProcessProviders(injectedProviders);
      },
    );

    filterAndProcessProviders([...checkout.getInjectedProviders()]);
    return () => cancelSubscription();
  }, [checkout]);

  return {
    findProvider,
    providers,
  };
};
