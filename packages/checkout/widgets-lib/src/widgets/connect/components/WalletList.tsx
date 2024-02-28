import { Box, MenuItem } from '@biom3/react';
import {
  ChainId,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { EIP1193Provider } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { getL1ChainId } from 'lib';
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
import { useProviders } from '../../../lib/hooks/useProviders';
import { getProviderSlugFromRdns } from '../../../lib/eip6963';
import { useAnimation } from '../../../lib/hooks/useAnimation';

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

  const { isWalletConnectEnabled, walletConnectBusy, openWalletConnectModal } = useWalletConnect({ checkout });
  const { providers } = useProviders({ checkout });

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
          walletRdns: providerDetail.info.rdns,
          walletUuid: providerDetail.info.uuid,
        },
      });
      if (checkout) {
        try {
          const web3Provider = new Web3Provider(providerDetail.provider as any);
          selectWeb3Provider(web3Provider, getProviderSlugFromRdns(providerDetail.info.rdns));

          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: ConnectWidgetViews.SUCCESS },
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
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {providers.map((providerDetail, index) => (
        <WalletItem
          rc={(
            <motion.div variants={listItemVariants} custom={index} />
          )}
          onWalletClick={onWalletClick}
          providerDetail={providerDetail}
          key={providerDetail.info.rdns}
        />
      ))}
      {isWalletConnectEnabled && (
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
      )}
    </Box>
  );
}
