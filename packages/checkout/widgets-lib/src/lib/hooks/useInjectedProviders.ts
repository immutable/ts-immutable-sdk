import { useCallback, useEffect, useState } from 'react';
import { Checkout, WalletProviderRdns } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  EIP1193Provider,
  EIP6963ProviderDetail,
  getPassportProviderDetail,
  InjectedProvidersManager,
} from '../provider';

export interface UseInjectedProvidersParams {
  checkout: Checkout | null;
}

type ConnectConfig = {
  injected: {
    priorityWalletRdns: WalletProviderRdns | string[];
    blacklistWalletRdns: WalletProviderRdns | string[];
  };
};

let passportWeb3Provider: Web3Provider;
const processProviders = (
  checkout: Checkout | null,
  injectedProviders: EIP6963ProviderDetail<EIP1193Provider>[],
  priorityWalletRdns: WalletProviderRdns | string[] = [],
  blacklistWalletRdns: WalletProviderRdns | string[] = [],
) => {
  // Filter providers
  const filteredProviders = injectedProviders
    .filter((provider) => !blacklistWalletRdns.includes(provider.info.rdns))
    .sort((a, b) => {
      let indexA = priorityWalletRdns.indexOf(a.info.rdns);
      if (indexA < 0) indexA = 999;
      let indexB = priorityWalletRdns.indexOf(b.info.rdns);
      if (indexB < 0) indexB = 999;

      return indexA - indexB;
    });

  console.log('Providers filtered', filteredProviders, injectedProviders);

  // Add passport from checkout config if not from injected providers
  if (checkout?.passport
    // && priorityWalletRdns.includes(WalletProviderRdns.PASSPORT) TODO: // Uncomment this when config JSON is updated
    && !filteredProviders.some((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT)) {
    if (!passportWeb3Provider) {
      passportWeb3Provider = new Web3Provider(checkout.passport.connectEvm());
    }
    filteredProviders.unshift(getPassportProviderDetail(passportWeb3Provider.provider as EIP1193Provider));
  }

  console.log('Adding passport provider', filteredProviders[0]);

  return filteredProviders;
};

/**
 * Hook that supplies a sorted list of EIP-6963 injected providers.
 */
export const useInjectedProviders = ({ checkout }: UseInjectedProvidersParams) => {
  let defaultPriorityWalletRdns: WalletProviderRdns | string[] = [];
  let defaultBlacklistWalletRdns: WalletProviderRdns | string[] = [];
  (async () => {
    const connectConfig = await checkout?.config.remote.getConfig('connect') as ConnectConfig;
    defaultPriorityWalletRdns = connectConfig.injected?.priorityWalletRdns ?? [];
    defaultBlacklistWalletRdns = connectConfig.injected?.blacklistWalletRdns ?? [];
  })();
  console.log('Preparing default providers', defaultBlacklistWalletRdns, defaultPriorityWalletRdns);
  const defaultProviders = processProviders(
    checkout,
    InjectedProvidersManager.getInstance().getProviders(),
    defaultPriorityWalletRdns,
    defaultBlacklistWalletRdns,
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
      });

    return () => cancelSubscription();
  }, []);

  return {
    findProvider,
    providers,
  };
};
