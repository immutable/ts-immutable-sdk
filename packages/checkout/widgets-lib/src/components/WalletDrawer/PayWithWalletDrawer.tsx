import { useMemo } from 'react';
import { Checkout } from '@imtbl/checkout-sdk';

import { useInjectedProviders } from '../../lib/hooks/useInjectedProviders';
import { WalletDrawer } from './WalletDrawer';
import { WalletChangeEvent } from './WalletDrawerEvents';

type PayWithWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  checkout: Checkout | null;
};

export function PayWithWalletDrawer({
  visible,
  onClose,
  checkout,
}: PayWithWalletDrawerProps) {
  const blocklistWalletRdns: string[] = [];
  const { providers: eip6963Providers } = useInjectedProviders({ checkout });
  const injectedProviders = useMemo(
    () => eip6963Providers
    // TODO: Check if must filter passport on L1
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
      testId="select-from-wallet-drawer"
      showWalletConnect
      showDrawer={visible}
      drawerText={{ heading: 'Pay with' }}
      walletOptions={injectedProviders}
      menuItemSize="small"
      setShowDrawer={(show: boolean) => {
        if (show === false) onClose();
      }}
      onWalletChange={handleOnWalletChangeEvent}
    />
  );
}
