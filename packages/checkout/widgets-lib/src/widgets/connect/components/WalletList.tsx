import { Box, MenuItem } from '@biom3/react';
import {
  WalletFilterTypes,
  WalletFilter,
  WalletInfo,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import {
  ConnectContext,
  ConnectActions,
} from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';
import {
  UserJourney,
  useAnalytics,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';

export interface WalletListProps {
  walletFilterTypes?: WalletFilterTypes;
  excludeWallets?: WalletFilter[];
}

export function WalletList(props: WalletListProps) {
  const { t } = useTranslation();
  const { walletFilterTypes, excludeWallets } = props;
  const {
    connectDispatch,
    connectState: { checkout, passport },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [walletConnectEnabled] = useState(true);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const { track } = useAnalytics();
  const { ethereumProvider, walletConnectModal, getWalletConnectDisplayUri } = useWalletConnect();

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

  const onWalletConnectClick = useCallback(async () => {
    try {
      const uri = await getWalletConnectDisplayUri();
      walletConnectModal?.openModal({
        uri,
      });
    } catch (error) {
      // TODO: Handle wallet connect cancelled?
    }
  }, [ethereumProvider, walletConnectModal]);

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

        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: web3Provider,
          },
        });
        connectDispatch({
          payload: {
            type: ConnectActions.SET_WALLET_PROVIDER_NAME,
            walletProviderName,
          },
        });
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.READY_TO_CONNECT },
          },
        });
      } catch (err: any) {
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
      {walletConnectEnabled && (
        <MenuItem
          testId="wallet-list-walletconnect"
          size="medium"
          emphasized
          onClick={() => onWalletConnectClick()}
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
