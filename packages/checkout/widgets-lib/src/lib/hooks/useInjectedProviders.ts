import { useCallback, useEffect, useState } from 'react';
import {
  Checkout,
  EIP1193Provider,
  EIP6963ProviderDetail,
  getMetaMaskProviderDetail,
  getPassportProviderDetail,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';

const DEFAULT_PRIORITY_INDEX = 999;

export interface UseInjectedProvidersParams {
  checkout: Checkout | null;
}

type ConnectConfig = {
  injected: {
    priorityWalletRdns: WalletProviderRdns | string[];
    blacklistWalletRdns: WalletProviderRdns | string[];
  };
};

declare global {
  interface Window {
    ethereum: any;
  }
}

let passportWeb3Provider: Web3Provider;
const processProviders = (
  checkout: Checkout | null,
  injectedProviders: EIP6963ProviderDetail[],
  priorityWalletRdns: WalletProviderRdns | string[] = [],
  blacklistWalletRdns: WalletProviderRdns | string[] = [],
) => {
  const getIndex = (rdns: string) => {
    const index = priorityWalletRdns.indexOf(rdns);
    return index >= 0 ? index : DEFAULT_PRIORITY_INDEX;
  };

  // Filter & sort providers
  const filteredProviders = injectedProviders
    .filter(({ info }) => !blacklistWalletRdns.includes(info.rdns))
    .sort((a, b) => (
      getIndex(a.info.rdns) - getIndex(b.info.rdns)
    ));

  // Attempt to fallback to window.ethereum if no EIP-6963 providers are found
  // Assuming this is MetaMask on mobile
  if (filteredProviders.length === 0 && window.ethereum) {
    filteredProviders.unshift(getMetaMaskProviderDetail(window.ethereum as EIP1193Provider));
  }

  // Add passport from checkout config if not from injected providers
  if (checkout?.passport
    && priorityWalletRdns.includes(WalletProviderRdns.PASSPORT)
    && !filteredProviders.some((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT)) {
    if (!passportWeb3Provider) {
      passportWeb3Provider = new Web3Provider(checkout.passport.connectEvm());
    }
    filteredProviders.unshift(getPassportProviderDetail(passportWeb3Provider.provider as EIP1193Provider));
  }

  return filteredProviders;
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
    const blacklistWalletRdns = connectConfig.injected?.blacklistWalletRdns ?? [];
    const filteredProviders = processProviders(
      checkout,
      injectedProviders,
      priorityWalletRdns,
      blacklistWalletRdns,
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
