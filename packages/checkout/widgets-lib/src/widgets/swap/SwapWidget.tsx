import { BiomeThemeProvider, Body } from '@biom3/react';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useCallback, useReducer } from 'react';
import {
  BaseViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/ViewContext';
import { SwapWidgetViews } from '../../context/SwapViewContextTypes';
import { SwapCoins } from './views/SwapCoins';
import { SuccessView } from '../../components/Success/SuccessView';
import { LoadingView } from '../../components/Loading/LoadingView';
import { Environment } from '@imtbl/config';
import {
  SwapActions,
  SwapContext,
  initialSwapState,
  swapReducer,
} from './context/SwapContext';

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  theme: WidgetTheme;
  environment: Environment;
}

export interface SwapWidgetParams {
  providerPreference: ConnectionProviders;
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapWidget(props: SwapWidgetProps) {
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [swapState, swapDispatch] = useReducer(swapReducer, initialSwapState);

  const { params, theme, environment } = props;
  const { amount, fromContractAddress, toContractAddress, providerPreference } =
    params;

  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  const swapWidgetSetup = useCallback(async () => {
    if (!providerPreference) return;

    const checkout = new Checkout({ baseConfig: { environment: environment } });

    swapDispatch({
      payload: {
        type: SwapActions.SET_CHECKOUT,
        checkout,
      },
    });

    const connectResult = await checkout.connect({
      providerPreference: providerPreference ?? ConnectionProviders.METAMASK,
    });

    swapDispatch({
      payload: {
        type: SwapActions.SET_PROVIDER,
        provider: connectResult.provider,
      },
    });

    const address = await connectResult.provider.getSigner().getAddress();
    const tokenBalances = await checkout.getAllBalances({
      provider: connectResult.provider,
      walletAddress: address,
      chainId: connectResult.network.chainId,
    });

    swapDispatch({
      payload: {
        type: SwapActions.SET_NETWORK,
        network: connectResult.network,
        tokenBalances: tokenBalances.balances,
      },
    });

    const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
      {
        chainId: connectResult.network.chainId,
        type: TokenFilterTypes.SWAP,
      }
    );

    swapDispatch({
      payload: {
        type: SwapActions.SET_ALLOWED_TOKENS,
        allowedTokens: allowList.tokens,
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SwapWidgetViews.SWAP },
      },
    });
  }, [providerPreference, environment]);

  useEffect(() => {
    swapWidgetSetup();
  }, [swapWidgetSetup]);

  const renderFailure = () => {
    return <Body>Failure</Body>;
  };

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <SwapContext.Provider value={{ swapState, swapDispatch }}>
          {viewState.view.type === BaseViews.LOADING_VIEW && (
            <LoadingView loadingText="Loading" />
          )}
          {viewState.view.type === SwapWidgetViews.SWAP && (
            <SwapCoins
              amount={amount}
              fromContractAddress={fromContractAddress}
              toContractAddress={toContractAddress}
            />
          )}
          {viewState.view.type === SwapWidgetViews.SUCCESS && (
            <SuccessView
              successText={'Success'}
              actionText={'Contine'}
              onActionClick={() => console.log('success')}
            />
          )}
          {viewState.view.type === SwapWidgetViews.FAIL && renderFailure()}
        </SwapContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
