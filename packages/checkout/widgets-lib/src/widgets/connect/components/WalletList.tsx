import { Box } from '@biom3/react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import {
  ChainId,
  CheckoutErrorType,
  EIP6963ProviderDetail,
  WrappedBrowserProvider,
  WalletProviderName,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UnableToConnectDrawer } from '../../../components/UnableToConnectDrawer/UnableToConnectDrawer';
import { ChangedYourMindDrawer } from '../../../components/ChangedYourMindDrawer/ChangedYourMindDrawer';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { walletListStyle } from './WalletListStyles';
import {
  getProviderSlugFromRdns,
  isPassportProvider,
} from '../../../lib/provider';
import { addProviderListenersForWidgetRoot, getL1ChainId } from '../../../lib';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { WalletDrawer } from '../../../components/WalletDrawer/WalletDrawer';
import { WalletChangeEvent } from '../../../components/WalletDrawer/WalletDrawerEvents';
import { WalletConnectItem } from './WalletConnectItem';
import { BrowserWalletItem } from './BrowserWalletItem';
import { identifyUser } from '../../../lib/analytics/identifyUser';
import { NonPassportWarningDrawer } from './NonPassportWarningDrawer';
import { removeSpace } from '../../../lib/utils';

export interface WalletListProps {
  targetWalletRdns?: string;
  targetChainId: ChainId;
  allowedChains: ChainId[];
  blocklistWalletRdns?: string[];
  isCheckNetworkEnabled: boolean;
}

export function WalletList(props: WalletListProps) {
  const { t } = useTranslation();
  const {
    targetWalletRdns,
    targetChainId,
    allowedChains,
    isCheckNetworkEnabled,
  } = props;
  const blocklistWalletRdns = props?.blocklistWalletRdns || [];
  const {
    connectDispatch,
    connectState: { checkout },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { track, identify, user } = useAnalytics();
  const { providers } = useInjectedProviders({ checkout });
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  const { isWalletConnectEnabled, openWalletConnectModal } = useWalletConnect();
  const walletConnectItemRef = useRef(null);
  const [showChangedYourMindDrawer, setShowChangedYourMindDrawer] = useState(false);
  const [showUnableToConnectDrawer, setShowUnableToConnectDrawer] = useState(false);
  const [showNonPassportWarning, setShowNonPassportWarning] = useState(false);
  const [chosenProviderDetail, setChosenProviderDetail] = useState<EIP6963ProviderDetail>();

  const filteredProviders = useMemo(
    () => providers
      .filter(
        (provider) => !(provider.info.rdns === WalletProviderRdns.PASSPORT),
      )
      .filter(
        (provider) => !blocklistWalletRdns.includes(provider.info.rdns),
      ),
    [providers],
  );

  // Don't allow Passport if targetChainId is L1
  const passportProviderDetail = useMemo(
    () => targetChainId !== getL1ChainId(checkout!.config)
      && providers
        .filter((provider) => !blocklistWalletRdns.includes(provider.info.rdns))
        .find((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT),
    [providers, checkout],
  );

  const selectBrowserProvider = useCallback(
    (browserProvider: WrappedBrowserProvider, providerName: string) => {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider: browserProvider,
        },
      });
      connectDispatch({
        payload: {
          type: ConnectActions.SET_WALLET_PROVIDER_NAME,
          walletProviderName: providerName as WalletProviderName,
        },
      });
    },
    [],
  );

  const handleConnectViewUpdate = async (provider: WrappedBrowserProvider) => {
    const isPassport = isPassportProvider(provider);
    const chainId = await provider.send!('eth_chainId', []);
    // eslint-disable-next-line radix
    const parsedChainId = parseInt(chainId.toString());
    if (
      parsedChainId !== targetChainId
      && !allowedChains?.includes(parsedChainId)
    ) {
      // TODO: What do we do with Passport here as it can't connect to L1
      if (isPassport) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.SUCCESS },
          },
        });
        return;
      }
      if (isCheckNetworkEnabled) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.SWITCH_NETWORK },
          },
        });
        return;
      }
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: ConnectWidgetViews.SUCCESS },
      },
    });
  };

  const selectProviderDetail = useCallback(
    async (providerDetail: EIP6963ProviderDetail) => {
      if (!checkout) return;

      try {
        const isMetaMask = providerDetail.info.rdns === WalletProviderRdns.METAMASK;

        const browserProvider = new WrappedBrowserProvider(
          providerDetail.provider,
        );

        try {
          // TODO: Find a nice way to detect if the wallet supports switching accounts via requestPermissions
          const changeAccount = isMetaMask;
          const connectResult = await checkout.connect({
            provider: browserProvider,
            requestWalletPermissions: changeAccount,
          });

          // Set up EIP-1193 provider event listeners for widget root instances
          addProviderListenersForWidgetRoot(connectResult.provider);

          const userData = user ? await user() : undefined;
          const anonymousId = userData?.anonymousId();
          await identifyUser(identify, connectResult.provider, { anonymousId });

          selectBrowserProvider(
            browserProvider,
            getProviderSlugFromRdns(providerDetail.info.rdns),
          );
          await handleConnectViewUpdate(browserProvider);
        } catch (err: CheckoutErrorType | any) {
          if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
            // eslint-disable-next-line no-console
            console.error('Connect rejected', err);

            setShowChangedYourMindDrawer(true);
          } else {
            // eslint-disable-next-line no-console
            console.error('Connect error', err);

            setShowUnableToConnectDrawer(true);
          }
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Connect unknown error', err);

        setShowUnableToConnectDrawer(true);
      }
    },
    [checkout],
  );

  const connectCallback = async (ethereumProvider: EthereumProvider) => {
    if (ethereumProvider.connected && ethereumProvider.session) {
      const browserProvider = new WrappedBrowserProvider(ethereumProvider);
      selectBrowserProvider(browserProvider, 'walletconnect');

      const { chainId } = await ((await browserProvider.getSigner()).provider.getNetwork());

      if (ethereumProvider.chainId !== targetChainId) {
        // @ts-ignore allow protected method `switchEthereumChain` to be called
        await ethereumProvider.switchEthereumChain(targetChainId);
      }

      if (chainId as unknown as ChainId !== targetChainId) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.SWITCH_NETWORK },
          },
        });
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: ConnectWidgetViews.SUCCESS },
        },
      });
    }
  };

  const handleWalletConnectConnection = async () => {
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: 'WalletConnect',
      controlType: 'MenuItem',
    });
    await openWalletConnectModal({
      connectCallback,
      restoreSession: false,
    });
  };

  const handleWalletChange = async (event: WalletChangeEvent) => {
    const { providerDetail } = event;
    setChosenProviderDetail(providerDetail);
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: removeSpace(providerDetail.info.name),
      controlType: 'MenuItem',
      extras: {
        wallet: getProviderSlugFromRdns(providerDetail.info.rdns),
        walletRdns: providerDetail.info.rdns,
        walletUuid: providerDetail.info.uuid,
      },
    });
    await selectProviderDetail(providerDetail);
    setShowWalletDrawer(false);
  };

  const handleWalletItemClick = useCallback(
    async (providerDetail: EIP6963ProviderDetail) => {
      const isPassport = providerDetail.info.rdns === WalletProviderRdns.PASSPORT;
      const hasSeenNonPassportWarning = localStorage.getItem(
        'hasSeenNonPassportWarning',
      );

      if (!isPassport && !hasSeenNonPassportWarning) {
        setChosenProviderDetail(providerDetail);
        setShowNonPassportWarning(true);
        return;
      }

      setShowChangedYourMindDrawer(false);
      setShowUnableToConnectDrawer(false);
      setChosenProviderDetail(providerDetail);
      track({
        userJourney: UserJourney.CONNECT,
        screen: 'ConnectWallet',
        control: removeSpace(providerDetail.info.name),
        controlType: 'MenuItem',
        extras: {
          wallet: getProviderSlugFromRdns(providerDetail.info.rdns),
          walletRdns: providerDetail.info.rdns,
          walletUuid: providerDetail.info.uuid,
        },
      });
      await selectProviderDetail(providerDetail);
    },
    [track, checkout],
  );

  const onChosenProviderDetailChange = useCallback(() => {
    if (!chosenProviderDetail) return;
    handleWalletItemClick(chosenProviderDetail!);
  }, [chosenProviderDetail]);

  const onBrowserWalletsClick = useCallback(() => {
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: 'BrowserWallets',
      controlType: 'MenuItem',
    });
    setShowWalletDrawer(true);
  }, [track]);

  useEffect(() => {
    // Auto-trigger wallet connection via rdns
    if (targetWalletRdns && targetWalletRdns?.length > 0) {
      if (
        targetWalletRdns === WalletProviderRdns.PASSPORT
        && passportProviderDetail
      ) {
        handleWalletItemClick(passportProviderDetail);
      } else if (
        targetWalletRdns === WalletProviderRdns.WALLETCONNECT
        && walletConnectItemRef.current
      ) {
        (walletConnectItemRef.current as any).connect();
      } else {
        const targetProviderDetail = filteredProviders.find(
          (providerDetail) => providerDetail.info.rdns === targetWalletRdns,
        );
        if (targetProviderDetail) {
          handleWalletItemClick(targetProviderDetail);
        }
      }
    }
  }, [filteredProviders, targetWalletRdns]);

  const handleNonPassportWarningDrawerButtonClick = async () => {
    if (chosenProviderDetail) {
      localStorage.setItem('hasSeenNonPassportWarning', 'true');
      setShowNonPassportWarning(false);
      await selectProviderDetail(chosenProviderDetail);
    }
  };

  return (
    <Box
      testId="wallet-list"
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
      sx={walletListStyle}
    >
      {passportProviderDetail && (
        <WalletItem
          recommended
          key={passportProviderDetail.info.rdns}
          onWalletItemClick={() => handleWalletItemClick(passportProviderDetail)}
          providerInfo={passportProviderDetail.info}
          rc={(
            <motion.div
              variants={listItemVariants}
              custom={0}
              style={{ width: '100%' }}
            />
          )}
        />
      )}
      {filteredProviders.length === 1 && (
        <WalletItem
          key={filteredProviders[0].info.rdns}
          onWalletItemClick={() => handleWalletItemClick(filteredProviders[0])}
          providerInfo={filteredProviders[0].info}
          rc={(
            <motion.div
              variants={listItemVariants}
              custom={0 + (passportProviderDetail ? 1 : 0)}
              style={{ width: '100%' }}
            />
          )}
        />
      )}
      {filteredProviders.length > 1 && (
        <motion.div
          variants={listItemVariants}
          custom={0 + (passportProviderDetail ? 1 : 0)}
          key="browserwallet"
          style={{ width: '100%' }}
        >
          <BrowserWalletItem
            onClick={onBrowserWalletsClick}
            providers={filteredProviders}
          />
        </motion.div>
      )}
      {isWalletConnectEnabled && (
        <motion.div
          variants={listItemVariants}
          custom={
            0
            + (passportProviderDetail ? 1 : 0)
            + (filteredProviders.length > 0 ? 1 : 0)
          }
          key="walletconnect"
          style={{ width: '100%' }}
        >
          <WalletConnectItem
            ref={walletConnectItemRef}
            onConnect={handleWalletConnectConnection}
          />
        </motion.div>
      )}

      <WalletDrawer
        testId="select-wallet-drawer"
        drawerText={{
          heading: t('views.CONNECT_WALLET.walletSelection.heading'),
        }}
        showWalletConnect={false}
        showWalletSelectorTarget={false}
        walletOptions={filteredProviders}
        showDrawer={showWalletDrawer}
        setShowDrawer={(show: boolean) => {
          setShowWalletDrawer(show);
        }}
        onWalletChange={handleWalletChange}
      />

      <ChangedYourMindDrawer
        visible={showChangedYourMindDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowChangedYourMindDrawer(false)}
        onTryAgain={onChosenProviderDetailChange}
      />

      <UnableToConnectDrawer
        visible={showUnableToConnectDrawer}
        checkout={checkout!}
        onCloseDrawer={() => setShowUnableToConnectDrawer(false)}
        onTryAgain={() => setShowUnableToConnectDrawer(false)}
      />

      <NonPassportWarningDrawer
        visible={showNonPassportWarning}
        onCloseDrawer={() => setShowNonPassportWarning(false)}
        handleCtaButtonClick={handleNonPassportWarningDrawerButtonClick}
      />
    </Box>
  );
}
