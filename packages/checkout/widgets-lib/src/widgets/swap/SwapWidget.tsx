import { BiomeCombinedProviders, Body } from '@biom3/react';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useEffect, useCallback, useReducer, useMemo,
} from 'react';
import { ImmutableConfiguration } from '@imtbl/config';
import { Exchange, ExchangeConfiguration } from '@imtbl/dex-sdk';
import { SwapCoins } from './views/SwapCoins';
import { SuccessView } from '../../components/Success/SuccessView';
import { LoadingView } from '../../components/Loading/LoadingView';
import {
  SwapActions,
  SwapContext,
  initialSwapState,
  swapReducer,
} from './context/swapContext';
import {
  BaseViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { getDexConfigOverrides } from './DexConfigOverrides';

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  config: StrongCheckoutWidgetsConfig
}

export interface SwapWidgetParams {
  providerPreference: ConnectionProviders;
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapWidget(props: SwapWidgetProps) {
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const [swapState, swapDispatch] = useReducer(swapReducer, initialSwapState);
  const swapReducerValues = useMemo(
    () => ({ swapState, swapDispatch }),
    [swapState, swapDispatch],
  );

  const { params, config } = props;
  const { environment, theme } = config;
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

    // check default values for amount, toTokenAddress and fromTokenAddress
    // set in form state

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SwapWidgetViews.SWAP },
      },
    });

    const exchange = new Exchange(new ExchangeConfiguration({
      chainId: connectResult.network.chainId,
      baseConfig: new ImmutableConfiguration({ environment }),
      overrides: getDexConfigOverrides(),
    }));

    swapDispatch({
      payload: {
        type: SwapActions.SET_EXCHANGE,
        exchange,
      },
    });
  }, [providerPreference, environment]);

  useEffect(() => {
    swapWidgetSetup();
  }, [swapWidgetSetup]);

  const renderFailure = () => <Body>Failure</Body>;

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SwapContext.Provider value={swapReducerValues}>
          {viewState.view.type === BaseViews.LOADING_VIEW && (
          <LoadingView loadingText="Loading" />
          )}
          {viewState.view.type === SwapWidgetViews.SWAP && (
          <CryptoFiatProvider>
            <SwapCoins
              amount={amount}
              fromContractAddress={fromContractAddress}
              toContractAddress={toContractAddress}
            />
          </CryptoFiatProvider>
          )}
          {viewState.view.type === SwapWidgetViews.SUCCESS && (
          <SuccessView
            successText="Success"
            actionText="Continue"
                // eslint-disable-next-line no-console
            onActionClick={() => console.log('success')}
          />
          )}
          {viewState.view.type === SwapWidgetViews.FAIL && renderFailure()}
        </SwapContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
