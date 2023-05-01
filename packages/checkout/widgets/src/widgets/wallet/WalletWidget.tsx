import { BiomeThemeProvider } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { WidgetTheme } from '@imtbl/checkout-ui-types';

import {
  ChainId,
  Checkout,
  ConnectionProviders,
} from '@imtbl/checkout-sdk-web';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { BalanceInfo } from './components/BalanceItem';
import { initialWalletState, WalletActions, WalletContext, walletReducer } from './context/WalletContext';
import { initialViewState, ViewActions, ViewContext, viewReducer } from '../../context/ViewContext';
import { WalletWidgetViews } from '../../context/WalletViewContextTypes';
import { WalletBalances } from './views/WalletBalances';

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  theme: WidgetTheme;
}

export interface WalletWidgetParams {
  providerPreference?: ConnectionProviders;
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

  const getTokenBalances = useCallback(
    async (
      checkout: Checkout,
      provider: Web3Provider,
      networkName: string,
      chainId: ChainId
    ) => {
      if(checkout && provider && chainId) {
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
    (async () => {
      // set checkout in context
      const checkout = new Checkout();
      walletDispatch({
        payload: {
          type: WalletActions.SET_CHECKOUT,
          checkout: checkout
        },
      });

      const connectResult = await checkout.connect({
        providerPreference: params.providerPreference ?? ConnectionProviders.METAMASK
      });

      // create provider and set in context
      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider: connectResult.provider,
        }
      });

      // set network info in context
      walletDispatch({
        payload: {
          type: WalletActions.SET_NETWORK_INFO,
          network: connectResult.network,
        }
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
          view: {type: WalletWidgetViews.WALLET_BALANCES}
        }
      });
    })();
  }, [params.providerPreference, getTokenBalances]);



  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{viewState, viewDispatch}}>
        <WalletContext.Provider value={{walletState, walletDispatch}}>
            {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && 
              (<WalletBalances 
                tokenBalances={tokenBalances} 
                totalFiatAmount={totalFiatAmount}  
                networkName={walletState.network?.name ?? ""}
                getTokenBalances={getTokenBalances}
                />)
            }
        </WalletContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
