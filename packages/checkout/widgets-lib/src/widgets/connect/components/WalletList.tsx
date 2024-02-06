import { Box } from '@biom3/react';
import {
  WalletFilterTypes,
  WalletFilter,
  WalletInfo,
  WalletProviderName,
  ChainId,
} from '@imtbl/checkout-sdk';
import {
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { addProviderListenersForWidgetRoot } from 'lib';
import { identifyUser } from 'lib/analytics/identifyUser';
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

export interface WalletListProps {
  targetChainId: ChainId;
  allowedChains: ChainId[];
  walletFilterTypes?: WalletFilterTypes;
  excludeWallets?: WalletFilter[];
}

export function WalletList(props: WalletListProps) {
  const {
    targetChainId, allowedChains, walletFilterTypes, excludeWallets,
  } = props;
  const {
    connectDispatch,
    connectState: { checkout, passport },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const { track, identify } = useAnalytics();

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
        let web3Provider: Web3Provider | null = null;

        const providerResult = await checkout.createProvider({
          walletProviderName,
        });
        web3Provider = providerResult.provider;

        if (!web3Provider) {
          console.log(`failed to create web3Provider for ${walletProviderName}`);
          return;
        }

        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: web3Provider!,
          },
        });
        connectDispatch({
          payload: {
            type: ConnectActions.SET_WALLET_PROVIDER_NAME,
            walletProviderName,
          },
        });

        if (walletProviderName === WalletProviderName.WALLET_CONNECT) {
          track({
            userJourney: UserJourney.CONNECT,
            screen: 'ReadyToConnect',
            control: 'Connect',
            controlType: 'Button',
          });
          const connectResult = await checkout.connect({
            provider: web3Provider,
          });

          console.log(connectResult);

          // Set up EIP-1193 provider event listeners for widget root instances
          // addProviderListenersForWidgetRoot(connectResult.provider);

          // await identifyUser(identify, connectResult.provider);

          const chainId = await web3Provider.getSigner().getChainId();
          if (chainId !== targetChainId && !allowedChains?.includes(chainId)) {
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
        } else {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: ConnectWidgetViews.READY_TO_CONNECT },
            },
          });
        }
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
    </Box>
  );
}
