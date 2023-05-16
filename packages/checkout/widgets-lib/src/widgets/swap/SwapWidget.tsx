import { BiomeCombinedProviders, Body } from '@biom3/react';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useCallback, useReducer } from 'react';
import { Environment } from '@imtbl/config';
import { SwapCoins } from './views/SwapCoins';
import { SuccessView } from '../../components/Success/SuccessView';
import { LoadingView } from '../../components/Loading/LoadingView';
import {
  SwapActions,
  SwapContext,
  initialSwapState,
  swapReducer,
} from './context/swap-context/SwapContext';
import {
  BaseViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import {
  SwapFormContext,
  initialSwapFormState,
  swapFormReducer,
} from './context/swap-form-context/SwapFormContext';

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
  const [swapFormState, swapFormDispatch] = useReducer(
    swapFormReducer,
    initialSwapFormState,
  );

  const { params, theme, environment } = props;
  const {
    amount, fromContractAddress, toContractAddress, providerPreference,
  } = params;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const swapWidgetSetup = useCallback(async () => {
    if (!providerPreference) return;

    const checkout = new Checkout({
      baseConfig: { environment },
    });

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

    const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
      {
        chainId: connectResult.network.chainId,
        type: TokenFilterTypes.SWAP,
      },
    );

    const allowedTokenBalances = tokenBalances.balances.filter((balance) => allowList.tokens
      .map((token) => token.address)
      .includes(balance.token.address));

    swapDispatch({
      payload: {
        type: SwapActions.SET_ALLOWED_TOKENS,
        allowedTokens: allowList.tokens,
      },
    });

    swapDispatch({
      payload: {
        type: SwapActions.SET_TOKEN_BALANCES,
        tokenBalances: allowedTokenBalances,
      },
    });

    swapDispatch({
      payload: {
        type: SwapActions.SET_NETWORK,
        network: connectResult.network,
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

  const renderFailure = () => <Body>Failure</Body>;

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {/* TODO: The object passed as the value prop to the Context provider changes every render.
            To fix this consider wrapping it in a useMemo hook. */}
        {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
        <SwapContext.Provider value={{ swapState, swapDispatch }}>
          {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
          <SwapFormContext.Provider value={{ swapFormState, swapFormDispatch }}>
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
                successText="Success"
                actionText="Contine"
                // eslint-disable-next-line no-console
                onActionClick={() => console.log('success')}
              />
            )}
            {viewState.view.type === SwapWidgetViews.FAIL && renderFailure()}
          </SwapFormContext.Provider>
        </SwapContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
