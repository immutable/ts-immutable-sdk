import { BiomeCombinedProviders, Body } from '@biom3/react';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useEffect, useCallback, useReducer, useMemo,
} from 'react';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { Exchange, ExchangeConfiguration } from '@imtbl/dex-sdk';
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

    allowedTokenBalances.entries();

    swapDispatch({
      payload: {
        type: SwapActions.SET_ALLOWED_TOKENS,
        allowedTokens: allowList.tokens,
      },
    });

    // FIXME: stop hardcoding this, only doing because dev net is reset
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
            address: '0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851',
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

    const exchange = new Exchange(new ExchangeConfiguration({
      chainId: connectResult.network.chainId,
      baseConfig: new ImmutableConfiguration({ environment }),
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
                actionText="Continue"
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
