import { BiomeThemeProvider } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { WidgetTheme } from '@imtbl/checkout-widgets-react';

import { ChainId, Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { BalanceInfo } from './components/BalanceItem';
import {
  initialWalletState,
  WalletActions,
  WalletContext,
  walletReducer,
} from './context/WalletContext';
import {
  BaseViews,
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/ViewContext';
import { WalletWidgetViews } from '../../context/WalletViewContextTypes';
import { WalletBalances } from './views/WalletBalances';
import { ErrorView } from '../../components/Error/ErrorView';

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  theme: WidgetTheme;
}

export interface WalletWidgetParams {
  providerPreference?: ConnectionProviders;
  provider?: Web3Provider;
}

export function WalletWidget(props: WalletWidgetProps) {
  const { params, theme } = props;
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState
  );
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>([]);
  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const { checkout } = walletState;

  const getTokenBalances = useCallback(
    async (
      checkout: Checkout,
      provider: Web3Provider,
      networkName: string,
      chainId: ChainId
    ) => {
      if (checkout && provider && chainId) {
        const totalBalance = 0;
        const walletAddress = await provider.getSigner().getAddress();
        const getAllBalancesResult = await checkout.getAllBalances({
          provider,
          walletAddress,
          chainId,
        });

        const tokenBalances: BalanceInfo[] = [];
        getAllBalancesResult.balances.forEach((balance) => {
          tokenBalances.push({
            id: networkName + '-' + balance.token.symbol,
            balance: balance.formattedBalance,
            fiatAmount: '23.50', // todo: fetch fiat price from coinGecko apis
            symbol: balance.token.symbol,
            description: balance.token.name,
          });
        });

        setTokenBalances(tokenBalances);
        setTotalFiatAmount(totalBalance);
      }
    },
    []
  );

  useEffect(() => {
    const checkout = new Checkout();
    walletDispatch({
      payload: {
        type: WalletActions.SET_CHECKOUT,
        checkout: checkout,
      },
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!checkout) return;

      const connectResult = await checkout.connect({
        providerPreference:
          params.providerPreference ?? ConnectionProviders.METAMASK,
      });

      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });

      walletDispatch({
        payload: {
          type: WalletActions.SET_NETWORK_INFO,
          network: connectResult.network,
        },
      });

      // getBalances and set in context
      await getTokenBalances(
        checkout,
        connectResult.provider,
        connectResult.network.name,
        connectResult.network.chainId
      );

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: WalletWidgetViews.WALLET_BALANCES },
        },
      });
    })();
  }, [params.providerPreference, checkout, getTokenBalances]);

  const errorAction = () => {
    console.log('Something went wrong');
  };

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <WalletContext.Provider value={{ walletState, walletDispatch }}>
          {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (
            <WalletBalances
              tokenBalances={tokenBalances}
              totalFiatAmount={totalFiatAmount}
              networkName={walletState.network?.name ?? ''}
              getTokenBalances={getTokenBalances}
            />
          )}
          {viewState.view.type === BaseViews.ERROR && (
            <ErrorView actionText="Try again" onActionClick={errorAction} />
          )}
        </WalletContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
