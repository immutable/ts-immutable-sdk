import { useCallback, useEffect, useState } from 'react';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { Checkout, WalletProviderRdns } from '@imtbl/checkout-sdk';
import { EIP1193Provider } from 'mipd';
import { Web3Provider } from '@ethersproject/providers';
import { getPassportProviderDetail, InjectedProvidersManager } from '../eip6963';

export interface UseInjectedProvidersParams {
  checkout: Checkout | null;
}

let passportWeb3Provider: Web3Provider;
const processProviders = (checkout: Checkout | null, injectedProviders: EIP6963ProviderDetail<EIP1193Provider>[]) => {
  // Apply wallet providers allowlist
  const allowedWalletRdns = [
    'com.immutable.passport', // Immutable Passport
    'io.metamask', // MetaMask
    // 'xyz.frontier.wallet', // Frontier
    // 'me.rainbow', // Rainbow
    // 'com.coinbase.wallet', // Coinbase Wallet
  ];
  const uniqueRdnsSet = new Set();
  const filteredProviders = injectedProviders
    .filter((provider) => {
      if (allowedWalletRdns.includes(provider.info.rdns)) {
        if (!uniqueRdnsSet.has(provider.info.rdns)) {
          uniqueRdnsSet.add(provider.info.rdns);
          return true;
        }
      }

      return false;
    })
    .sort((a, b) => {
      // Get the index of the rdns for each provider
      const indexA = allowedWalletRdns.indexOf(a.info.rdns);
      const indexB = allowedWalletRdns.indexOf(b.info.rdns);

      // Sort based on the index
      return indexA - indexB;
    });

  // Add passport from checkout config if not from injected providers
  if (checkout?.passport
    && allowedWalletRdns.includes(WalletProviderRdns.PASSPORT)
    && !filteredProviders.some((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT)) {
    if (!passportWeb3Provider) {
      passportWeb3Provider = new Web3Provider(checkout.passport.connectEvm());
    }
    filteredProviders.unshift(getPassportProviderDetail(passportWeb3Provider.provider as EIP1193Provider));
  }

  return filteredProviders;
};

/**
 * Hook that supplies a filters and sorted list of EIP-6963 injected providers.
 */
export const useInjectedProviders = ({ checkout }: UseInjectedProvidersParams) => {
  const defaultProviders = processProviders(
    checkout,
    InjectedProvidersManager.getInstance().getProviders(),
  );
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>(
    defaultProviders,
  );

  const findProvider = useCallback((rdns: string) => (
    providers.find((provider) => provider.info.rdns === rdns)
  ), [providers]);

  useEffect(() => {
    const cancelSubscription = InjectedProvidersManager
      .getInstance()
      .subscribe(async (injectedProviders: EIP6963ProviderDetail[]) => {
        const filteredProviders = processProviders(checkout, injectedProviders);
        setProviders(filteredProviders);
      });

    return () => cancelSubscription();
  }, []);

  return {
    findProvider,
    providers,
  };
};
