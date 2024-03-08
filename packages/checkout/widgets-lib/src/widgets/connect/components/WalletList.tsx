import { Box } from '@biom3/react';
import {
  ChainId,
  WalletProviderName, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import {
  SharedViews,
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
  EIP1193Provider,
  EIP6963ProviderDetail,
  getProviderSlugFromRdns,
} from '../../../lib/provider';
import { getL1ChainId } from '../../../lib';
import { listItemVariants, listVariants } from '../../../lib/animation/listAnimation';
import { WalletDrawer } from '../../bridge/components/WalletDrawer';
import { WalletChangeEvent } from '../../bridge/components/WalletDrawerEvents';
import { WalletConnectItem } from './WalletConnectItem';
import { BrowserWalletItem } from './BrowserWalletItem';

export interface WalletListProps {
  targetChainId: ChainId;
}

export function WalletList(props: WalletListProps) {
  const { t } = useTranslation();
  const { targetChainId } = props;
  const {
    connectDispatch,
    connectState: { checkout },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { track } = useAnalytics();
  const { providers } = useInjectedProviders({ checkout });
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  const { isWalletConnectEnabled, openWalletConnectModal } = useWalletConnect();

  const filteredProviders = useMemo(() => (
    providers.filter((provider) => (!(provider.info.rdns === WalletProviderRdns.PASSPORT)))
  ), [providers]);

  // Don't allow Passport if targetChainId is L1
  const passportProviderDetail = useMemo(() => (
    targetChainId !== getL1ChainId(checkout!.config)
    && providers.find((provider) => provider.info.rdns === WalletProviderRdns.PASSPORT)
  ), [providers, checkout]);

  const selectWeb3Provider = useCallback((web3Provider: any, providerName: string) => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
    connectDispatch({
      payload: {
        type: ConnectActions.SET_WALLET_PROVIDER_NAME,
        walletProviderName: providerName as WalletProviderName,
      },
    });
  }, []);

  const selectProviderDetail = (providerDetail: EIP6963ProviderDetail) => {
    try {
      selectWeb3Provider(
        new Web3Provider(providerDetail.provider as any),
        getProviderSlugFromRdns(providerDetail.info.rdns),
      );

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: ConnectWidgetViews.READY_TO_CONNECT },
        },
      });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SharedViews.ERROR_VIEW, error: err },
        },
      });
    }
  };

  const connectCallback = async (ethereumProvider) => {
    if (ethereumProvider.connected && ethereumProvider.session) {
      const web3Provider = new Web3Provider(ethereumProvider as any);
      selectWeb3Provider(web3Provider, 'walletconnect');

      const chainId = await web3Provider.getSigner().getChainId();
      if (chainId !== targetChainId) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.SWITCH_NETWORK },
          },
        });
        return;
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
    await openWalletConnectModal({
      connectCallback,
      restoreSession: true,
    });
  };

  const handleWalletChange = async (event: WalletChangeEvent) => {
    setShowWalletDrawer(false);

    const { providerDetail } = event;
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: providerDetail.info.name,
      controlType: 'MenuItem',
      extras: {
        wallet: getProviderSlugFromRdns(providerDetail.info.rdns),
        walletRdns: providerDetail.info.rdns,
        walletUuid: providerDetail.info.uuid,
      },
    });
    selectProviderDetail(providerDetail);
  };

  const onWalletClick = useCallback(
    async (providerDetail: EIP6963ProviderDetail<EIP1193Provider>) => {
      track({
        userJourney: UserJourney.CONNECT,
        screen: 'ConnectWallet',
        control: providerDetail.info.name,
        controlType: 'MenuItem',
        extras: {
          wallet: getProviderSlugFromRdns(providerDetail.info.rdns),
          walletRdns: providerDetail.info.rdns,
          walletUuid: providerDetail.info.uuid,
        },
      });
      selectProviderDetail(providerDetail);
    },
    [track, checkout],
  );

  const onBrowserWalletsClick = useCallback(() => {
    setShowWalletDrawer(true);
  }, [track]);

  return (
    <Box
      testId="wallet-list"
      rc={(
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
        />
      )}
      sx={walletListStyle}
    >
      {passportProviderDetail && (
        <WalletItem
          key={passportProviderDetail.info.rdns}
          onWalletClick={onWalletClick}
          providerDetail={passportProviderDetail}
          rc={(
            <motion.div variants={listItemVariants} custom={0} />
          )}
        />
      )}
      {filteredProviders.length === 1 && (
        <WalletItem
          key={filteredProviders[0].info.rdns}
          onWalletClick={onWalletClick}
          providerDetail={filteredProviders[0]}
          rc={(
            <motion.div variants={listItemVariants} custom={0 + (passportProviderDetail ? 1 : 0)} />
          )}
        />
      )}
      {filteredProviders.length > 1 && (
        <motion.div
          variants={listItemVariants}
          custom={0 + (passportProviderDetail ? 1 : 0)}
          key="browserwallet"
        >
          <BrowserWalletItem onClick={onBrowserWalletsClick} providers={filteredProviders} />
        </motion.div>
      )}
      {isWalletConnectEnabled && (
        <motion.div
          variants={listItemVariants}
          custom={0 + (passportProviderDetail ? 1 : 0) + (filteredProviders.length > 0 ? 1 : 0)}
          key="walletconnect"
        >
          <WalletConnectItem onConnect={handleWalletConnectConnection} />
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
    </Box>
  );
}
