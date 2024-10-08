import { ReactNode, useRef, useState } from 'react';
import {
  Checkout,
  CheckoutErrorType,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';

import { Web3Provider } from '@ethersproject/providers';
import { MenuItemProps } from '@biom3/react';
import { WalletDrawer } from './WalletDrawer';
import { WalletChangeEvent } from './WalletDrawerEvents';
import { NonPassportWarningDrawer } from './NonPassportWarningDrawer';
import { addProviderListenersForWidgetRoot } from '../../lib';
import { identifyUser } from '../../lib/analytics/identifyUser';
import { getProviderSlugFromRdns } from '../../lib/provider';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  ProvidersContextActions,
  useProvidersContext,
} from '../../context/providers-context/ProvidersContext';
import { UnableToConnectDrawer } from '../UnableToConnectDrawer/UnableToConnectDrawer';
import { ChangedYourMindDrawer } from '../ChangedYourMindDrawer/ChangedYourMindDrawer';

type ConnectWalletDrawerProps = {
  heading: string;
  visible: boolean;
  onClose: () => void;
  providerType: 'from' | 'to';
  walletOptions: EIP6963ProviderDetail[];
  bottomSlot?: ReactNode;
  menuItemSize?: MenuItemProps['size'];
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
};

const HAS_SEEN_NON_PASSPORT_WARNING_KEY = '@imtbl/checkout/has-seen-non-passport-warning';

enum ConnectEIP6963ProviderError {
  CONNECT_ERROR = 'CONNECT_ERROR',
  SANCTIONED_ADDRESS = 'SANCTIONED_ADDRESS',
  USER_REJECTED_REQUEST_ERROR = 'USER_REJECTED_REQUEST_ERROR',
}

type ConnectEIP6963ProviderResult = {
  provider: Web3Provider;
  providerName: string;
};
const connectEIP6963Provider = async (
  providerDetail: EIP6963ProviderDetail,
  checkout: Checkout,
): Promise<ConnectEIP6963ProviderResult> => {
  const web3Provider = new Web3Provider(providerDetail.provider as any);

  try {
    const requestWalletPermissions = providerDetail.info.rdns === WalletProviderRdns.METAMASK;
    const connectResult = await checkout.connect({
      provider: web3Provider,
      requestWalletPermissions,
    });

    const address = await connectResult.provider.getSigner().getAddress();
    const isSanctioned = await checkout.checkIsAddressSanctioned(
      address,
      checkout.config.environment,
    );

    if (isSanctioned) {
      throw new Error(ConnectEIP6963ProviderError.SANCTIONED_ADDRESS);
    }

    addProviderListenersForWidgetRoot(connectResult.provider);
    return {
      provider: connectResult.provider,
      providerName: getProviderSlugFromRdns(providerDetail.info.rdns),
    };
  } catch (error: CheckoutErrorType | any) {
    if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
      throw new Error(
        ConnectEIP6963ProviderError.USER_REJECTED_REQUEST_ERROR,
      );
    }

    throw new Error(ConnectEIP6963ProviderError.CONNECT_ERROR);
  }
};

export function ConnectWalletDrawer({
  heading,
  visible,
  onClose,
  providerType,
  walletOptions,
  bottomSlot,
  menuItemSize = 'small',
  disabledOptions = [],
}: ConnectWalletDrawerProps) {
  const { providersState: { checkout }, providersDispatch } = useProvidersContext();

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

  const setProviderInContext = (provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => {
    if (providerType === 'from') {
      providersDispatch({
        payload: {
          type: ProvidersContextActions.SET_PROVIDER,
          fromProvider: provider,
          fromProviderInfo: providerInfo,
        },
      });
    }

    if (providerType === 'to') {
      providersDispatch({
        payload: {
          type: ProvidersContextActions.SET_PROVIDER,
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
      screen: 'ConnectWallet',
      control: info.name,
      controlType: 'MenuItem',
      extras: {
        wallet: getProviderSlugFromRdns(info.rdns),
        walletRdns: info.rdns,
        walletUuid: info.uuid,
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
    } catch (error: ConnectEIP6963ProviderError | any) {
      if (error.message === ConnectEIP6963ProviderError.SANCTIONED_ADDRESS) {
        setShowUnableToConnectDrawer(true);
      }

      if (error.message === ConnectEIP6963ProviderError.USER_REJECTED_REQUEST_ERROR) {
        setShowChangedMindDrawer(true);
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
