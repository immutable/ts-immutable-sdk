import { ReactNode, useRef, useState } from 'react';
import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WalletProviderRdns,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

import { MenuItemProps } from '@biom3/react';
import { WalletDrawer } from './WalletDrawer';
import { WalletChangeEvent } from './WalletDrawerEvents';
import { identifyUser } from '../../lib/analytics/identifyUser';
import { getProviderSlugFromRdns, isPassportProvider } from '../../lib/provider';
import {
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  ProvidersContextActions,
  useProvidersContext,
} from '../../context/providers-context/ProvidersContext';
import { UnableToConnectDrawer } from '../UnableToConnectDrawer/UnableToConnectDrawer';
import {
  connectEIP6963Provider,
  ConnectEIP6963ProviderError,
} from '../../lib/connectEIP6963Provider';
import { EOAWarningDrawer } from '../EOAWarningDrawer/EOAWarningDrawer';
import { removeSpace } from '../../lib/utils';

type ConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: (address?: string) => void;
  onConnect?: (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
  onError?: (errorType: ConnectEIP6963ProviderError) => void;
  providerType: 'from' | 'to';
  walletOptions: EIP6963ProviderDetail[];
  bottomSlot?: ReactNode;
  menuItemSize?: MenuItemProps['size'];
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
  getShouldRequestWalletPermissions?: (providerInfo: EIP6963ProviderInfo) => boolean | undefined;
  shouldIdentifyUser?: boolean;
};

export function ConnectWalletDrawer({
  heading,
  visible,
  onClose,
  onConnect,
  onError,
  providerType,
  walletOptions,
  bottomSlot,
  menuItemSize = 'small',
  disabledOptions = [],
  getShouldRequestWalletPermissions,
  shouldIdentifyUser = true,
}: ConnectWalletDrawerProps) {
  const {
    providersState: { checkout, fromProvider, lockedToProvider },
    providersDispatch,
  } = useProvidersContext();

  const { identify, track, user } = useAnalytics();

  const prevWalletChangeEvent = useRef<WalletChangeEvent | undefined>();

  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);
  const [showEOAWarningDrawer, setShowEOAWarningDrawer] = useState(false);

  const setProviderInContext = async (
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    const address = await (await provider.getSigner()).getAddress();

    if (providerType === 'from') {
      providersDispatch({
        payload: {
          type: ProvidersContextActions.SET_PROVIDER,
          fromAddress: address,
          fromProvider: provider,
          fromProviderInfo: providerInfo,
        },
      });
    }

    if (providerType === 'to') {
      providersDispatch({
        payload: {
          type: ProvidersContextActions.SET_PROVIDER,
          toAddress: address,
          toProvider: provider,
          toProviderInfo: providerInfo,
        },
      });
    }

    return address;
  };

  const handleWalletConnection = async (event: WalletChangeEvent) => {
    const { providerDetail } = event;
    const { info } = providerDetail;

    // Trigger analytics connect wallet, menu item, with wallet details
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: removeSpace(info.name),
      controlType: 'MenuItem',
      extras: {
        providerType,
        wallet: getProviderSlugFromRdns(info.rdns),
        walletRdns: info.rdns,
      },
    });

    if (info.rdns === WalletProviderRdns.PASSPORT) {
      const { isConnected } = await checkout.checkIsWalletConnected({
        provider: new WrappedBrowserProvider(providerDetail.provider!),
      });

      if (isConnected) {
        if ((providerType === 'from' && !lockedToProvider)
         || (providerType === 'to' && !isPassportProvider(fromProvider))) {
          await checkout.passport?.logout();
        }
      }
    }

    let address: string | undefined;

    // Proceed to connect selected provider
    const shouldRequestWalletPermissions = getShouldRequestWalletPermissions?.(info);

    try {
      const { provider } = await connectEIP6963Provider(
        providerDetail,
        checkout,
        shouldRequestWalletPermissions,
      );

      // Identify connected wallet, retaining current anonymousId
      if (shouldIdentifyUser) {
        const userData = user ? await user() : undefined;
        const anonymousId = userData?.anonymousId();

        await identifyUser(identify, provider, { anonymousId });
      }

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

    const { info } = event.providerDetail;

    if (providerType === 'to' && info.rdns !== WalletProviderRdns.PASSPORT) {
      setShowEOAWarningDrawer(true);
      return;
    }

    handleWalletConnection(event);
  };

  const retrySelectedWallet = () => {
    if (prevWalletChangeEvent.current) {
      handleWalletConnection(prevWalletChangeEvent.current);
    }
  };

  const handleProceedEOA = () => {
    retrySelectedWallet();
    setShowEOAWarningDrawer(false);
  };

  const handleCloseEOAWarningDrawer = () => {
    setShowEOAWarningDrawer(false);
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
      />
      <UnableToConnectDrawer
        visible={showUnableToConnectDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowUnableToConnectDrawer(false)}
        onTryAgain={() => setShowUnableToConnectDrawer(false)}
      />
      <EOAWarningDrawer
        visible={showEOAWarningDrawer}
        onProceedClick={handleProceedEOA}
        onCloseDrawer={handleCloseEOAWarningDrawer}
      />
    </>
  );
}
