import { useEffect, useState } from 'react';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { InjectedProvidersManager } from '../eip6963';

/**
 * Hook that supplies a filters and sorted list of EIP-6963 injected providers.
 */
export const useProviders = () => {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    console.log('Requesting all providers now!');
    InjectedProvidersManager.getInstance().reset();
    const cancelSubscription = InjectedProvidersManager
      .getInstance()
      .subscribe((injectedProviders: EIP6963ProviderDetail[]) => {
        // Filter providers
        const allowedWalletRdns = [
          'com.immutable.passport', // Immutable Passport
          'io.metamask', // MetaMask
          'xyz.frontier.wallet', // Frontier
          // 'me.rainbow', // Rainbow
        ];
        const filteredProviders = injectedProviders
          .filter((provider) => allowedWalletRdns.includes(provider.info.rdns))
          .sort((a, b) => {
            // Get the index of the rdns for each provider
            const indexA = allowedWalletRdns.indexOf(a.info.rdns);
            const indexB = allowedWalletRdns.indexOf(b.info.rdns);

            // Sort based on the index
            return indexA - indexB;
          });

        console.log('Found providers!', injectedProviders, filteredProviders);
        setProviders(filteredProviders);
      });

    return () => cancelSubscription();
  }, []);

  return {
    providers,
  };
};
