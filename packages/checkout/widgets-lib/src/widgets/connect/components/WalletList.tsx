import { Box, MenuItem } from '@biom3/react';
import {
  ChainId,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext, useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { EIP1193Provider } from 'mipd';
import { ConnectConfig } from '@imtbl/checkout-sdk/dist/types';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { useAnalytics, UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';
import { useProviders } from '../../../lib/hooks/useProviders';

export interface WalletListProps {
  targetChainId: ChainId,
}

export function WalletList(props: WalletListProps) {
  const { t } = useTranslation();
  const {
    targetChainId,
  } = props;
  const {
    connectDispatch,
    connectState: { checkout },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [enableWalletConnect, setEnableWalletConnect] = useState(false);
  const { track } = useAnalytics();

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

  const { providers } = useProviders();
  const { walletConnectBusy, openWalletConnectModal } = useWalletConnect({
    connectCallback: async (ethereumProvider) => {
      const web3Provider = new Web3Provider(ethereumProvider as any);
      selectWeb3Provider(web3Provider, 'WalletConnect');

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
    },
  });

  // Use eth_requestAccounts to unlock provider
  const isProviderConnected = async (provider: EIP1193Provider) => {
    let isConnected = false;

    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (accounts.length > 0) {
        isConnected = true;
      }
    } catch (err: any) {
      isConnected = false;
    }

    return isConnected;
  };

  useEffect(() => {
    if (!checkout) return;
    (async () => {
      const connectConfig: ConnectConfig = await checkout.config.remote.getConfig('connect') as ConnectConfig;
      setEnableWalletConnect(connectConfig.walletConnect);
    })();
  }, [checkout]);

  const onWalletClick = useCallback(async (providerDetail: EIP6963ProviderDetail) => {
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: providerDetail.info.name,
      controlType: 'MenuItem',
    });
    if (checkout) {
      const isConnected = await isProviderConnected(providerDetail.provider);
      if (isConnected) {
        try {
          const web3Provider = new Web3Provider(providerDetail.provider as any);
          selectWeb3Provider(web3Provider, providerDetail.info.name);

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
    }
  }, [track]);

  return (
    <Box
      testId="wallet-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {providers.map((providerDetail) => (
        <WalletItem
          onWalletClick={onWalletClick}
          providerDetail={providerDetail}
          key={providerDetail.info.rdns}
        />
      ))}
      {enableWalletConnect && (
        <MenuItem
          testId="wallet-list-walletconnect"
          size="medium"
          emphasized
          disabled={walletConnectBusy}
          onClick={() => openWalletConnectModal()}
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
