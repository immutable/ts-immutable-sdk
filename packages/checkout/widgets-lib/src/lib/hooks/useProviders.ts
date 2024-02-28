import { useCallback, useEffect, useState } from 'react';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { EIP1193Provider } from 'mipd';
import { getPassportProviderDetail, InjectedProvidersManager } from '../eip6963';

export interface UseProvidersParams {
  checkout: Checkout | null;
}

/**
 * Hook that supplies a filters and sorted list of EIP-6963 injected providers.
 */
export const useProviders = ({ checkout }: UseProvidersParams) => {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

  const findProvider = useCallback((rdns: string) => (
    providers.find((provider) => provider.info.rdns === rdns)
  ), [providers]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Requesting all providers now!');
    InjectedProvidersManager.getInstance().reset();
    const cancelSubscription = InjectedProvidersManager
      .getInstance()
      .subscribe(async (injectedProviders: EIP6963ProviderDetail[]) => {
        // Filter providers
        const allowedWalletRdns = [
          'com.immutable.passport', // Immutable Passport
          'io.metamask', // MetaMask
          // 'xyz.frontier.wallet', // Frontier
          // 'me.rainbow', // Rainbow
          'com.coinbase.wallet', // Coinbase Wallet
        ];
        // console.log('**** Providers changed!');
        // console.log('**** Found', injectedProviders);
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

        // Add passport if its not in the list of injected providers
        if (checkout?.passport
          && !filteredProviders.some((provider) => provider.info.rdns === 'com.immutable.passport')) {
          const providerResult = await checkout.createProvider({
            walletProviderName: WalletProviderName.PASSPORT,
          });

          filteredProviders.unshift(getPassportProviderDetail(providerResult.provider.provider as EIP1193Provider));
        }

        // eslint-disable-next-line no-console
        console.log('Found providers!', injectedProviders, filteredProviders);
        setProviders(filteredProviders);
      });

    return () => cancelSubscription();
  }, []);

  return {
    findProvider,
    providers,
  };
};
