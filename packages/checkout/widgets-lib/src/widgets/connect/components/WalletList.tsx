import { Box, MenuItem } from '@biom3/react';
import {
  ChainId,
  WalletFilter,
  WalletFilterTypes,
  WalletInfo,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { useAnalytics, UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';

export interface WalletListProps {
  targetChainId: ChainId,
  walletFilterTypes?: WalletFilterTypes;
  excludeWallets?: WalletFilter[];
}

export function WalletList(props: WalletListProps) {
  const { t } = useTranslation();
  const {
    targetChainId,
    walletFilterTypes,
    excludeWallets,
  } = props;
  const {
    connectDispatch,
    connectState: { checkout, passport },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const { track } = useAnalytics();

  const selectWeb3Provider = useCallback((web3Provider: any) => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
    connectDispatch({
      payload: {
        type: ConnectActions.SET_WALLET_PROVIDER_NAME,
        walletProviderName: WalletProviderName.METAMASK,
      },
    });
  }, []);

  const { isWalletConnectEnabled, walletConnectBusy, openWalletConnectModal } = useWalletConnect({ checkout });

  const connectCallback = async (ethereumProvider) => {
    const web3Provider = new Web3Provider(ethereumProvider as any);
    selectWeb3Provider(web3Provider);

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

  const handleWalletConnectConnection = async () => {
    await openWalletConnectModal({
      connectCallback,
      restoreSession: true
    })
  }

  const excludedWallets = useCallback(() => {
    const passportWalletProvider = { walletProviderName: WalletProviderName.PASSPORT };
    if (!excludeWallets && !passport) {
      return [passportWalletProvider];
    }
    if (excludeWallets && !passport) {
      excludeWallets.push(passportWalletProvider);
      return excludeWallets;
    }
    return excludeWallets;
  }, [excludeWallets, passport]);

  useEffect(() => {
    const getAllowedWallets = async () => {
      const allowedWallets = await checkout?.getWalletAllowList({
        type: walletFilterTypes ?? WalletFilterTypes.ALL,
        exclude: excludedWallets(),
      });
      setWallets(allowedWallets?.wallets || []);
    };
    getAllowedWallets();
  }, [checkout, excludedWallets, walletFilterTypes]);


  const onWalletClick = useCallback(async (walletProviderName: WalletProviderName) => {
    track({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
      control: walletProviderName,
      controlType: 'MenuItem',
    });
    if (checkout) {
      try {
        const providerResult = await checkout.createProvider({
          walletProviderName,
        });
        const web3Provider = providerResult.provider;
        selectWeb3Provider(web3Provider);

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
  }, [track]);

  return (
    <Box
      testId="wallet-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {wallets.map((wallet) => (
        <WalletItem
          onWalletClick={onWalletClick}
          wallet={wallet}
          key={wallet.walletProviderName}
        />
      ))}
      {isWalletConnectEnabled
        && (
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
