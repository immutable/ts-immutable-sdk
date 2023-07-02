import { BiomeCombinedProviders } from '@biom3/react';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useEffect, useCallback, useReducer, useMemo,
} from 'react';
import { ImmutableConfiguration } from '@imtbl/config';
import { Exchange, ExchangeConfiguration, ExchangeOverrides } from '@imtbl/dex-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { SwapCoins } from './views/SwapCoins';
import { LoadingView } from '../../views/loading/LoadingView';
import {
  SwapActions,
  SwapContext,
  initialSwapState,
  swapReducer,
} from './context/SwapContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { SwapSuccessView, SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { StatusView } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
import { text } from '../../resources/text/textConfig';
import { ErrorView } from '../../views/error/ErrorView';
import {
  sendSwapFailedEvent, sendSwapRejectedEvent,
  sendSwapSuccessEvent, sendSwapWidgetCloseEvent,
} from './SwapWidgetEvents';
import { SwapInProgress } from './views/SwapInProgress';
import { ApproveERC20Onboarding } from './views/ApproveERC20Onboarding';
import { RemoteConfig, RemoteConfigResult } from '../../lib/remoteConfig';
import { TopUpView } from '../../views/top-up/TopUpView';

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  config: StrongCheckoutWidgetsConfig
  web3Provider?: Web3Provider
}

export interface SwapWidgetParams {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapWidget(props: SwapWidgetProps) {
  const { success, failed, rejected } = text.views[SwapWidgetViews.SWAP];
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;
  const { actionText } = text.views[SharedViews.ERROR_VIEW];
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

  const { params, config, web3Provider } = props;
  const {
    environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled,
  } = config;
  const {
    amount, fromContractAddress, toContractAddress,
  } = params;
  const { checkout } = swapState;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const getDexOverrides = useCallback(async () => {
    const remoteConfig = new RemoteConfig({ environment });
    const remoteConfigResult: RemoteConfigResult = await remoteConfig.load();
    return remoteConfigResult;
  }, [environment]);

  const swapWidgetSetup = useCallback(async () => {
    swapDispatch({
      payload: {
        type: SwapActions.SET_CHECKOUT,
        checkout: new Checkout({
          baseConfig: { environment },
        }),
      },
    });
  }, [environment]);

  useEffect(() => {
    if (web3Provider) {
      swapDispatch({
        payload: {
          type: SwapActions.SET_PROVIDER,
          provider: web3Provider,
        },
      });
    }
  }, [web3Provider]);

  useEffect(() => {
    (async () => {
      if (!checkout || !web3Provider) return;

      const network = await checkout.getNetworkInfo({
        provider: web3Provider,
      });

      let overrides: ExchangeOverrides | undefined;
      try {
        overrides = (await getDexOverrides()).dex?.overrides;
      } catch (err: any) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SharedViews.ERROR_VIEW,
              error: err,
            },
          },
        });
      }

      const exchange = new Exchange(new ExchangeConfiguration({
        chainId: network.chainId,
        baseConfig: new ImmutableConfiguration({ environment }),
        overrides,
      }));

      swapDispatch({
        payload: {
          type: SwapActions.SET_EXCHANGE,
          exchange,
        },
      });

      const tokenBalances = await checkout.getAllBalances({
        provider: web3Provider,
        walletAddress: await web3Provider.getSigner().getAddress(),
        chainId: network.chainId,
      });

      const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
        {
          chainId: network.chainId,
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
          type: SwapActions.SET_PROVIDER,
          provider: web3Provider,
        },
      });

      swapDispatch({
        payload: {
          type: SwapActions.SET_NETWORK,
          network,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SWAP },
        },
      });
    })();
  }, [checkout, web3Provider]);

  useEffect(() => {
    swapWidgetSetup();
  }, [swapWidgetSetup]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }} bottomSheetContainerId="bottom-sheet-container">
      <ViewContext.Provider value={viewReducerValues}>
        <SwapContext.Provider value={swapReducerValues}>
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}
          {viewState.view.type === SwapWidgetViews.SWAP && (
            <CryptoFiatProvider environment={environment}>
              <SwapCoins
                fromAmount={viewState.view.data?.fromAmount ?? amount}
                fromContractAddress={viewState.view.data?.fromContractAddress ?? fromContractAddress}
                toContractAddress={viewState.view.data?.toContractAddress ?? toContractAddress}
              />
            </CryptoFiatProvider>
          )}
          {viewState.view.type === SwapWidgetViews.IN_PROGRESS && (
            <SwapInProgress
              transactionResponse={viewState.view.data.transactionResponse}
              swapForm={viewState.view.data.swapForm}
            />
          )}
          {viewState.view.type === SwapWidgetViews.APPROVE_ERC20 && (
            <ApproveERC20Onboarding data={viewState.view.data} />
          )}
          {viewState.view.type === SwapWidgetViews.SUCCESS && (
            <StatusView
              statusText={success.text}
              actionText={success.actionText}
              onRenderEvent={
                () => sendSwapSuccessEvent(
                  (viewState.view as SwapSuccessView).data.transactionHash,
                )
              }
              onActionClick={sendSwapWidgetCloseEvent}
              statusType={StatusType.SUCCESS}
              testId="success-view"
            />
          )}
          {viewState.view.type === SwapWidgetViews.FAIL && (
          <StatusView
            statusText={failed.text}
            actionText={failed.actionText}
            onRenderEvent={() => sendSwapFailedEvent('Transaction failed')}
            onActionClick={() => {
              if (viewState.view.type === SwapWidgetViews.FAIL) {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                      type: SwapWidgetViews.SWAP,
                      data: viewState.view.data,
                    },
                  },
                });
              }
            }}
            statusType={StatusType.FAILURE}
            onCloseClick={sendSwapWidgetCloseEvent}
            testId="fail-view"
          />
          )}
          {viewState.view.type === SwapWidgetViews.PRICE_SURGE && (
            <StatusView
              statusText={rejected.text}
              actionText={rejected.actionText}
              onRenderEvent={() => sendSwapRejectedEvent('Price surge')}
              onActionClick={() => {
                if (viewState.view.type === SwapWidgetViews.PRICE_SURGE) {
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: {
                        type: SwapWidgetViews.SWAP,
                        data: viewState.view.data,
                      },
                    },
                  });
                }
              }}
              statusType={StatusType.WARNING}
              onCloseClick={sendSwapWidgetCloseEvent}
              testId="price-surge-view"
            />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={actionText}
              onActionClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: SwapWidgetViews.SWAP },
                  },
                });
              }}
              onCloseClick={sendSwapWidgetCloseEvent}
            />
          )}
          {viewState.view.type === SharedViews.TOP_UP_VIEW && (
            <TopUpView
              widgetEvent={IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT}
              showOnrampOption={isOnRampEnabled}
              showSwapOption={isSwapEnabled}
              showBridgeOption={isBridgeEnabled}
              onCloseButtonClick={sendSwapWidgetCloseEvent}
            />
          )}
        </SwapContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
