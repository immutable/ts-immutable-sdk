import { Badge, BiomeThemeProvider, Body, Box, Button } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { WidgetTheme, Network } from '@imtbl/checkout-ui-types';

import {
  ChainId,
  Checkout,
  ConnectionProviders,
  SwitchNetworkParams,
} from '@imtbl/checkout-sdk-web';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import {
  WalletWidgetStyle,
  WidgetBodyStyle,
  WidgetHeaderStyle,
} from './WalletStyles';
import { NetworkStatus } from './components/NetworkStatus';
import { TotalTokenBalance } from './components/TotalTokenBalance';
import { TokenBalanceList } from './components/TokenBalanceList';
import { BalanceInfo } from './components/BalanceItem';
import {
  sendNetworkSwitchEvent,
  sendWalletWidgetCloseEvent,
} from './WalletWidgetEvents';
import { initialWalletState, WalletActions, WalletContext, walletReducer } from './context/WalletContext';
import { initialViewState, ViewActions, ViewContext, viewReducer } from '../../context/ViewContext';
import { WalletWidgetViews } from '../../context/WalletViewContextTypes';

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

  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>();
  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const [isLoading, setIsLoading] = useState(false);


  const getTokenBalances = useCallback(
    async (
      checkout: Checkout,
      provider: Web3Provider,
      networkName: string,
      chainId: ChainId
    ) => {
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

  const switchNetwork = useCallback(async (chainId: ChainId) => {
    if(walletState.checkout && walletState.provider){
      setIsLoading(true);
      try {
        const switchNetworkResult = await walletState.checkout.switchNetwork({
          provider: walletState.provider,
          chainId: chainId,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult.provider
          }
        });
        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK_INFO,
            network: switchNetworkResult.network
          }
        });
        await getTokenBalances(
          walletState.checkout,
          switchNetworkResult.provider,
          switchNetworkResult.network.name,
          switchNetworkResult.network.chainId
        );
        sendNetworkSwitchEvent(switchNetworkResult.network);
      } catch (err) {
        // user proably rejected the switch network request
        // should we do anything here...
      } finally {
        setIsLoading(false);
      }
    }
  }, [walletState.checkout, walletState.provider, getTokenBalances]);

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{viewState, viewDispatch}}>
        <WalletContext.Provider value={{walletState, walletDispatch}}>
          <Box sx={WalletWidgetStyle}>
            <Box sx={WidgetHeaderStyle}>
              <NetworkStatus networkName={walletState.network?.name ?? ""} />
              <Button
                size={'small'}
                sx={{ alignSelf: 'flex-end' }}
                testId="close-button"
                onClick={() => sendWalletWidgetCloseEvent()}
              >
                x
              </Button>
            </Box>
            <TotalTokenBalance totalBalance={totalFiatAmount} />
            <Box sx={WidgetBodyStyle}>
              {!isLoading && <TokenBalanceList balanceInfoItems={tokenBalances} />}
              {isLoading && (
                <Box sx={{ width: '100%', height: '100px' }}>
                  <Body>Loading</Body>
                </Box>
              )}
            </Box>
            {walletState.network && (
              <Box
                sx={{
                  display: 'flex',
                  direction: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {Network.GOERLI !== walletState.network.name && (
                  <Button
                    size={'small'}
                    testId="goerli-network-button"
                    onClick={() => switchNetwork(ChainId.GOERLI)}
                  >
                    <Badge isAnimated={false} />
                    Switch to Goerli
                  </Button>
                )}
                {Network.ETHEREUM !== walletState.network.name && (
                  <Button
                    size={'small'}
                    testId="eth-network-button"
                    onClick={() => switchNetwork(ChainId.ETHEREUM)}
                  >
                    <Badge isAnimated={false} />
                    Switch to Ethereum
                  </Button>
                )}
                {Network.POLYGON !== walletState.network.name && (
                  <Button
                    size={'small'}
                    testId="polygon-network-button"
                    onClick={() => switchNetwork(ChainId.POLYGON)}
                  >
                    <Badge isAnimated={false} />
                    Switch to Polygon
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </WalletContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
