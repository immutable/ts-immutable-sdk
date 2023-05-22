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
import { BigNumber } from 'ethers';
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
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  widgetConfig: StrongCheckoutWidgetsConfig
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
  const [swapFormState, swapFormDispatch] = useReducer(
    swapFormReducer,
    initialSwapFormState,
  );
  const swapFormReducerValues = useMemo(
    () => ({ swapFormState, swapFormDispatch }),
    [swapFormState, swapFormDispatch],
  );

  const { params, widgetConfig } = props;
  const {
    amount, fromContractAddress, toContractAddress, providerPreference,
  } = params;

  const biomeTheme: BaseTokens = widgetConfig.theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const swapWidgetSetup = useCallback(async () => {
    if (!providerPreference) return;

    const checkout = new Checkout({
      baseConfig: { environment: widgetConfig.environment },
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

    allowedTokenBalances.entries();

    swapDispatch({
      payload: {
        type: SwapActions.SET_ALLOWED_TOKENS,
        allowedTokens: allowList.tokens,
      },
    });

    // FIXME: stop hardcoing this, only doing becuase dev net is reset
    swapDispatch({
      payload: {
        type: SwapActions.SET_TOKEN_BALANCES,
        tokenBalances: [{
          balance: BigNumber.from('1560000000000000000'),
          formattedBalance: '1.56',
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
          },
        }],
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
  }, [providerPreference, widgetConfig.environment]);

  useEffect(() => {
    swapWidgetSetup();
  }, [swapWidgetSetup]);

  const renderFailure = () => <Body>Failure</Body>;

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SwapContext.Provider value={swapReducerValues}>
          <SwapFormContext.Provider value={swapFormReducerValues}>
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
