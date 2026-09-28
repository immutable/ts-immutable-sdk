import {
  ReactNode, useRef, useState,
} from 'react';
import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WalletProviderRdns,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

import { MenuItemProps } from '@biom3/react';
import { UnableToConnectDrawer } from '../../../components/UnableToConnectDrawer/UnableToConnectDrawer';
import { WalletDrawer } from '../../../components/WalletDrawer/WalletDrawer';
import { WalletChangeEvent } from '../../../components/WalletDrawer/WalletDrawerEvents';
import { useProvidersContext, ProvidersContextActions } from '../../../context/providers-context/ProvidersContext';
import { ConnectEIP6963ProviderError, connectEIP6963Provider } from '../../../lib/connectEIP6963Provider';
import { } from '../../../lib/provider';
import { } from '../../../lib/utils';

type PurchaseConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: (address?: string) => void;
  onConnect?: (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
  onError?: (errorType: ConnectEIP6963ProviderError) => void;
  walletOptions: EIP6963ProviderDetail[];
  bottomSlot?: ReactNode;
  menuItemSize?: MenuItemProps['size'];
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
  drawerBackground: string | undefined;
};

export function PurchaseConnectWalletDrawer({
  heading,
  visible,
  onClose,
  onConnect,
  onError,
  walletOptions,
  bottomSlot,
  menuItemSize = 'small',
  disabledOptions = [],
  drawerBackground,
}: PurchaseConnectWalletDrawerProps) {
  const {
    providersState: { checkout },
    providersDispatch,
  } = useProvidersContext();
  const prevWalletChangeEvent = useRef<WalletChangeEvent | undefined>();

  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);

  const setProviderInContext = async (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    const address = await (await provider.getSigner()).getAddress();
    providersDispatch({
      payload: {
        type: ProvidersContextActions.SET_PROVIDER,
        fromAddress: address,
        fromProvider: provider,
        fromProviderInfo: providerInfo,
      },
    });

    providersDispatch({
      payload: {
        type: ProvidersContextActions.SET_PROVIDER,
        toAddress: address,
        toProvider: provider,
        toProviderInfo: providerInfo,
      },
    });

    return address;
  };

  const handleWalletConnection = async (event: WalletChangeEvent) => {
    const { providerDetail } = event;
    const { info } = providerDetail;
    if (info.rdns === WalletProviderRdns.PASSPORT) {
      const { isConnected } = await checkout.checkIsWalletConnected({
        provider: new WrappedBrowserProvider(providerDetail.provider!),
      });

      if (isConnected) {
        await checkout.passport?.logout();
      }
    }

    let address: string | undefined;

    try {
      const { provider } = await connectEIP6963Provider(
        providerDetail,
        checkout,
        true,
      );
      // Store selected provider as fromProvider in context
      address = await setProviderInContext(provider, providerDetail.info);

      // Notify successful connection
      onConnect?.(provider, providerDetail.info);
    } catch (error: ConnectEIP6963ProviderError | any) {
      let errorType = error.message;
      switch (error.message) {
        case ConnectEIP6963ProviderError.CONNECT_ERROR:
          setShowUnableToConnectDrawer(true);
          break;
        default:
          errorType = ConnectEIP6963ProviderError.CONNECT_ERROR;
      }

      // Notify failure to connect
      onError?.(errorType as ConnectEIP6963ProviderError);
      return;
    }

    onClose(address);
  };

  const handleOnWalletChangeEvent = async (event: WalletChangeEvent) => {
    // Keep prev wallet change event
    prevWalletChangeEvent.current = event;

    handleWalletConnection(event);
  };

  return (
    <>
      <WalletDrawer
        testId="select-from-wallet-drawer"
        showWalletConnect
        showDrawer={visible}
        drawerText={{ heading }}
        walletOptions={walletOptions}
        disabledOptions={disabledOptions}
        menuItemSize={menuItemSize}
        setShowDrawer={(show: boolean) => {
          if (show === false) onClose();
        }}
        onWalletChange={handleOnWalletChangeEvent}
        bottomSlot={bottomSlot}
        drawerBackground={drawerBackground}
      />
      <UnableToConnectDrawer
        visible={showUnableToConnectDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowUnableToConnectDrawer(false)}
        onTryAgain={() => setShowUnableToConnectDrawer(false)}
      />
    </>
  );
}
