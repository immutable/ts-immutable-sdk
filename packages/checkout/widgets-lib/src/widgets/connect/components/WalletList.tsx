import { Box, MenuItem } from '@biom3/react';
import {
  ChainId,
  WalletProviderName, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useMemo,
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
import { useAnimation } from '../../../lib/hooks/useAnimation';
import { walletListStyle } from './WalletListStyles';
import {
  EIP1193Provider,
  EIP6963ProviderDetail,
  getProviderSlugFromRdns,
} from '../../../lib/provider';
import { getL1ChainId } from '../../../lib';

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
  const { listVariants, listItemVariants } = useAnimation();
  const { providers } = useInjectedProviders({ checkout });
  const filteredProviders = useMemo(() => (
    providers.filter((provider) => (
      !(provider.info.rdns === WalletProviderRdns.PASSPORT && targetChainId === getL1ChainId(checkout!.config))))
  ), [providers]);

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

  const { isWalletConnectEnabled, walletConnectBusy, openWalletConnectModal } = useWalletConnect();

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
      if (checkout) {
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
      }
    },
    [track],
  );

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
      {filteredProviders.map((providerDetail, index) => (
        <WalletItem
          key={providerDetail.info.rdns}
          onWalletClick={onWalletClick}
          providerDetail={providerDetail}
          rc={(
            <motion.div variants={listItemVariants} custom={index} />
          )}
        />
      ))}
      {isWalletConnectEnabled && (
        <motion.div
          variants={listItemVariants}
          custom={filteredProviders.length}
          key="walletconnect"
        >
          <MenuItem
            testId="wallet-list-walletconnect"
            size="medium"
            emphasized
            disabled={walletConnectBusy}
            onClick={() => handleWalletConnectConnection()}
            sx={{ marginBottom: 'base.spacing.x1' }}
          >
            <MenuItem.FramedLogo
              logo="WalletConnectSymbol"
              sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
            />
            <MenuItem.Label size="medium">
              {t('wallets.walletconnect.heading')}
            </MenuItem.Label>
            <MenuItem.IntentIcon />
            <MenuItem.Caption>
              {t('wallets.walletconnect.description')}
            </MenuItem.Caption>
          </MenuItem>
        </motion.div>
      )}
    </Box>
  );
}
