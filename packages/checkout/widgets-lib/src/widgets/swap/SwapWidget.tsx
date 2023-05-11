import { BiomeThemeProvider, Body } from '@biom3/react';
import {
  Checkout,
  ConnectResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useState, useMemo, useCallback, useReducer } from 'react';
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
  const [connection, setConnection] = useState<ConnectResult>();
  const [allowedTokens, setAllowedTokens] = useState<TokenInfo[]>([]);
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const { params, theme, environment } = props;
  const { amount, fromContractAddress, toContractAddress, providerPreference } =
    params;
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: environment } }),
    [environment]);

  const connectToCheckout = useCallback(async () => {
    if (!providerPreference) return;
    const result = await checkout.connect({
      providerPreference,
    });
    setConnection(result);
    const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
      { chainId: 1, type: TokenFilterTypes.SWAP } // TODO: THIS NEEDS TO BE CHANGED BACK TO THE NETWORK CHAIN ID
    );
    setAllowedTokens(allowList.tokens);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SwapWidgetViews.SWAP },
      },
    });
  }, [checkout, providerPreference]);

  useEffect(() => {
    connectToCheckout();
  }, [connectToCheckout]);

  const renderFailure = () => {
    return <Body>Failure</Body>;
  };

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {viewState.view.type === BaseViews.LOADING_VIEW && (
          <LoadingView loadingText="Loading" />
        )}
        {viewState.view.type === SwapWidgetViews.SWAP && (
          <SwapCoins
            allowedTokens={allowedTokens}
            amount={amount}
            fromContractAddress={fromContractAddress}
            toContractAddress={toContractAddress}
            connection={connection}
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
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
