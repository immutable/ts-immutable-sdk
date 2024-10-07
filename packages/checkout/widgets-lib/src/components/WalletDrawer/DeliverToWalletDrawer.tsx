import { useMemo } from 'react';
import { Checkout, WalletProviderRdns } from '@imtbl/checkout-sdk';

import { useInjectedProviders } from '../../lib/hooks/useInjectedProviders';
import { WalletDrawer } from './WalletDrawer';
import { WalletChangeEvent } from './WalletDrawerEvents';

type DeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  checkout: Checkout | null;
};

export function DeliverToWalletDrawer({
  visible,
  onClose,
  checkout,
}: DeliverToWalletDrawerProps) {
  const blocklistWalletRdns: string[] = [];
  const { providers: eip6963Providers } = useInjectedProviders({ checkout });
  const injectedProviders = useMemo(
    () => eip6963Providers
      .filter(
        (provider) => !(provider.info.rdns === WalletProviderRdns.PASSPORT),
      )
      .filter(
        (provider) => !blocklistWalletRdns.includes(provider.info.rdns),
      ),
    [eip6963Providers],
  );

  const handleOnWalletChangeEvent = async (event: WalletChangeEvent) => {
    const { providerDetail } = event;
    console.log('🐛 ~ providerDetail:', providerDetail);
    onClose();

    // handle provider detail
    // await selectProviderDetail(providerDetail);
    // setChosenProviderDetail(providerDetail);
  };

  return (
    <WalletDrawer
      testId="select-to-wallet-drawer"
      showWalletConnect
      showDrawer={visible}
      drawerText={{ heading: 'Deliver to' }}
      walletOptions={injectedProviders}
      setShowDrawer={(show: boolean) => {
        if (show === false) onClose();
      }}
      onWalletChange={handleOnWalletChangeEvent}
    />
  );
}
