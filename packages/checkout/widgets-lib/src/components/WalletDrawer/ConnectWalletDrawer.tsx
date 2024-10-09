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
import { NonPassportWarningDrawer } from './NonPassportWarningDrawer';
import { identifyUser } from '../../lib/analytics/identifyUser';
import { getProviderSlugFromRdns } from '../../lib/provider';
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
import { HAS_SEEN_NON_PASSPORT_WARNING_KEY } from '../../lib/constants';
import {
  connectEIP6963Provider,
  ConnectEIP6963ProviderError,
} from '../../lib/connectEIP6963Provider';

type ConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: () => void;
  onConnect?: (provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => void;
  providerType: 'from' | 'to';
  walletOptions: EIP6963ProviderDetail[];
  bottomSlot?: ReactNode;
  menuItemSize?: MenuItemProps['size'];
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
};

export function ConnectWalletDrawer({
  heading,
  visible,
  onClose,
  onConnect,
  providerType,
  walletOptions,
  bottomSlot,
  menuItemSize = 'small',
  disabledOptions = [],
}: ConnectWalletDrawerProps) {
  const {
    providersState: { checkout },
    providersDispatch,
  } = useProvidersContext();

  const { identify, track } = useAnalytics();

  const prevWalletChangeEvent = useRef<WalletChangeEvent | undefined>();
  const [showNonPassportWarning, setShowNonPassportWarning] = useState(false);
  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);
  const [showChangedMindDrawer, setShowChangedMindDrawer] = useState(false);

  const shouldShowNonPassportWarning = (rdns: string): boolean => {
    const hasSeenWarning = localStorage.getItem(
      HAS_SEEN_NON_PASSPORT_WARNING_KEY,
    );

    if (rdns !== WalletProviderRdns.PASSPORT && !hasSeenWarning) {
      return true;
    }

    return false;
  };

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
  };

  const handleOnWalletChangeEvent = async (event: WalletChangeEvent) => {
    // Keep prev wallet change event
    prevWalletChangeEvent.current = event;

    const { providerDetail } = event;
    const { info } = providerDetail;

    // check if selected a non passport wallet
    if (shouldShowNonPassportWarning(info.rdns)) {
      setShowNonPassportWarning(true);
      return;
    }

    // Trigger analytics connect wallet, menu item, with wallet details
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'AddFunds',
      control: info.name,
      controlType: 'MenuItem',
      extras: {
        providerType,
        wallet: getProviderSlugFromRdns(info.rdns),
        walletRdns: info.rdns,
      },
    });

    if (!checkout) {
      throw new Error('Checkout is not initialized');
    }

    // Proceed to connect selected provider
    try {
      const { provider } = await connectEIP6963Provider(
        providerDetail,
        checkout,
      );
      // Identify connected wallet
      await identifyUser(identify, provider);

      // Store selected provider as fromProvider in context
      setProviderInContext(provider, providerDetail.info);

      // Call onConnect callback
      onConnect?.(provider, providerDetail.info);
    } catch (error: ConnectEIP6963ProviderError | any) {
      if (error.message === ConnectEIP6963ProviderError.SANCTIONED_ADDRESS) {
        setShowUnableToConnectDrawer(true);
      }

      if (
        error.message
        === ConnectEIP6963ProviderError.USER_REJECTED_REQUEST_ERROR
      ) {
        setShowChangedMindDrawer(true);
      }

      if (error.message === ConnectEIP6963ProviderError.CONNECT_ERROR) {
        console.log('@TODO: handle connect error'); // eslint-disable-line no-console
      }

      return;
    }

    onClose();
  };

  const retrySelectedWallet = () => {
    if (prevWalletChangeEvent.current) {
      handleOnWalletChangeEvent(prevWalletChangeEvent.current);
    }
  };

  const handleCloseNonPassportWarningDrawer = () => {
    localStorage.setItem(HAS_SEEN_NON_PASSPORT_WARNING_KEY, 'true');
    setShowNonPassportWarning(false);
    retrySelectedWallet();
  };

  const handleCloseChangedMindDrawer = () => {
    setShowChangedMindDrawer(false);
    retrySelectedWallet();
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
      <NonPassportWarningDrawer
        visible={showNonPassportWarning}
        onCloseDrawer={handleCloseNonPassportWarningDrawer}
        handleCtaButtonClick={handleCloseNonPassportWarningDrawer}
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
    </>
  );
}
