import { ReactNode, useRef, useState } from 'react';
import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';

import { Web3Provider } from '@ethersproject/providers';
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
import { ChangedYourMindDrawer } from '../ChangedYourMindDrawer/ChangedYourMindDrawer';
import {
  connectEIP6963Provider,
  ConnectEIP6963ProviderError,
} from '../../lib/connectEIP6963Provider';
import { EOAWarningDrawer } from '../EOAWarningDrawer/EOAWarningDrawer';

type ConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: (address?: string) => void;
  onConnect?: (
    provider: Web3Provider,
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
}: ConnectWalletDrawerProps) {
  const {
    providersState: { checkout, fromProvider },
    providersDispatch,
  } = useProvidersContext();

  const { identify, track } = useAnalytics();

  const prevWalletChangeEvent = useRef<WalletChangeEvent | undefined>();

  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);
  const [showChangedMindDrawer, setShowChangedMindDrawer] = useState(false);
  const [showEOAWarningDrawer, setShowEOAWarningDrawer] = useState(false);

  const setProviderInContext = async (
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    const address = await provider.getSigner().getAddress();

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
      control: info.name,
      controlType: 'MenuItem',
      extras: {
        providerType,
        wallet: getProviderSlugFromRdns(info.rdns),
        walletRdns: info.rdns,
      },
    });

    if (info.rdns === WalletProviderRdns.PASSPORT) {
      const { isConnected } = await checkout.checkIsWalletConnected({
        provider: new Web3Provider(providerDetail.provider!),
      });

      if (isConnected) {
        if (providerType === 'from' || (providerType === 'to' && !isPassportProvider(fromProvider))) {
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
      // Identify connected wallet
      await identifyUser(identify, provider);

      // Store selected provider as fromProvider in context
      address = await setProviderInContext(provider, providerDetail.info);

      // Notify successful connection
      onConnect?.(provider, providerDetail.info);
    } catch (error: ConnectEIP6963ProviderError | any) {
      let errorType = error.message;
      switch (error.message) {
        case ConnectEIP6963ProviderError.USER_REJECTED_REQUEST_ERROR:
          setShowChangedMindDrawer(true);
          break;
        case ConnectEIP6963ProviderError.SANCTIONED_ADDRESS:
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

  const handleCloseChangedMindDrawer = () => {
    retrySelectedWallet();
    setShowChangedMindDrawer(false);
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
      <ChangedYourMindDrawer
        visible={showChangedMindDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowChangedMindDrawer(false)}
        onTryAgain={handleCloseChangedMindDrawer}
      />
      <EOAWarningDrawer
        visible={showEOAWarningDrawer}
        onProceedClick={handleProceedEOA}
        onCloseDrawer={handleCloseEOAWarningDrawer}
      />
    </>
  );
}
