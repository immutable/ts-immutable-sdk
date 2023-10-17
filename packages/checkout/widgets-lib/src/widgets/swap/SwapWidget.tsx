import {
  useEffect,
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useState,
} from 'react';
import { BiomeCombinedProviders } from '@biom3/react';
import { DexConfig, TokenFilterTypes } from '@imtbl/checkout-sdk';
import { ImmutableConfiguration } from '@imtbl/config';
import { Exchange, ExchangeOverrides } from '@imtbl/dex-sdk';
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
  ErrorView as ErrorViewType,
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import {
  SwapSuccessView,
  SwapWidgetViews,
} from '../../context/view-context/SwapViewContextTypes';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../../lib';
import { StatusView } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
import { text } from '../../resources/text/textConfig';
import { ErrorView } from '../../views/error/ErrorView';
import {
  sendSwapFailedEvent,
  sendSwapRejectedEvent,
  sendSwapSuccessEvent,
  sendSwapWidgetCloseEvent,
} from './SwapWidgetEvents';
import { SwapInProgress } from './views/SwapInProgress';
import { ApproveERC20Onboarding } from './views/ApproveERC20Onboarding';
import { TopUpView } from '../../views/top-up/TopUpView';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  GetAllowedBalancesResultType,
  getAllowedBalances,
} from '../../lib/balance';
import { widgetTheme } from '../../lib/theme';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
// import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';
// import { ServiceType } from '../../views/error/serviceTypes';

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  config: StrongCheckoutWidgetsConfig;
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

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { params, config } = props;
  const {
    environment,
    theme,
    isOnRampEnabled,
    isSwapEnabled,
    isBridgeEnabled,
  } = config;
  const { amount, fromContractAddress, toContractAddress } = params;

  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [swapState, swapDispatch] = useReducer(swapReducer, initialSwapState);

  const { page } = useAnalytics();

  const [errorViewLoading, setErrorViewLoading] = useState(false);

  const swapReducerValues = useMemo(
    () => ({ swapState, swapDispatch }),
    [swapState, swapDispatch],
  );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  const showErrorView = useCallback(
    (error: any, tryAgain?: () => Promise<boolean>) => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            tryAgain,
            error,
          },
        },
      });
    },
    [viewDispatch],
  );

  const showSwapView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SwapWidgetViews.SWAP },
      },
    });
  }, [viewDispatch]);

  const loadBalances = async (): Promise<boolean> => {
    if (!checkout) throw new Error('loadBalances: missing checkout');
    if (!provider) throw new Error('loadBalances: missing provider');

    let tokensAndBalances: GetAllowedBalancesResultType = {
      allowList: { tokens: [] },
      allowedBalances: [],
    };
    try {
      tokensAndBalances = await getAllowedBalances({
        checkout,
        provider,
        allowTokenListType: TokenFilterTypes.SWAP,
      });
    } catch (err: any) {
      if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(err)) {
        showErrorView(err, loadBalances);
        return false;
      }
    }

    swapDispatch({
      payload: {
        type: SwapActions.SET_ALLOWED_TOKENS,
        allowedTokens: tokensAndBalances.allowList.tokens,
      },
    });

    swapDispatch({
      payload: {
        type: SwapActions.SET_TOKEN_BALANCES,
        tokenBalances: tokensAndBalances.allowedBalances,
      },
    });

    return true;
  };

  useEffect(() => {
    (async () => {
      if (!checkout || !provider) return;

      const network = await checkout.getNetworkInfo({ provider });

      // If the provider's network is not supported, return out of this and let the
      // connect loader handle the switch network functionality
      if (!network.isSupported) return;

      let overrides: ExchangeOverrides | undefined;
      try {
        overrides = (
          (await checkout.config.remote.getConfig('dex')) as DexConfig
        ).overrides;
      } catch (err: any) {
        showErrorView(err);
        return;
      }

      const exchange = new Exchange({
        chainId: network.chainId,
        baseConfig: new ImmutableConfiguration({ environment }),
        overrides,
      });

      swapDispatch({
        payload: {
          type: SwapActions.SET_EXCHANGE,
          exchange,
        },
      });

      swapDispatch({
        payload: {
          type: SwapActions.SET_NETWORK,
          network,
        },
      });

      if (!(await loadBalances())) return;

      showSwapView();
    })();
  }, [checkout, provider]);

  return (
    <BiomeCombinedProviders
      theme={{ base: themeReducerValue }}
      bottomSheetContainerId="bottom-sheet-container"
    >
      <ViewContext.Provider value={viewReducerValues}>
        <SwapContext.Provider value={swapReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewState.view.type === SharedViews.LOADING_VIEW && (
              <LoadingView loadingText={loadingText} />
            )}
            {viewState.view.type === SwapWidgetViews.SWAP && (
              <SwapCoins
                fromAmount={viewState.view.data?.fromAmount ?? amount}
                fromContractAddress={
                  viewState.view.data?.fromContractAddress
                  ?? fromContractAddress
                }
                toContractAddress={
                  viewState.view.data?.toContractAddress ?? toContractAddress
                }
              />
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
                onRenderEvent={() => {
                  page({
                    userJourney: UserJourney.SWAP,
                    screen: 'SwapSuccess',
                  });
                  sendSwapSuccessEvent(
                    eventTarget,
                    (viewState.view as SwapSuccessView).data.transactionHash,
                  );
                }}
                onActionClick={() => sendSwapWidgetCloseEvent(eventTarget)}
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
            )}
            {viewState.view.type === SwapWidgetViews.FAIL && (
              <StatusView
                statusText={failed.text}
                actionText={failed.actionText}
                onRenderEvent={() => {
                  page({
                    userJourney: UserJourney.SWAP,
                    screen: 'SwapFailed',
                  });
                  sendSwapFailedEvent(eventTarget, 'Transaction failed');
                }}
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
                onCloseClick={() => sendSwapWidgetCloseEvent(eventTarget)}
                testId="fail-view"
              />
            )}
            {viewState.view.type === SwapWidgetViews.PRICE_SURGE && (
              <StatusView
                statusText={rejected.text}
                actionText={rejected.actionText}
                onRenderEvent={() => {
                  page({
                    userJourney: UserJourney.SWAP,
                    screen: 'PriceSurge',
                  });
                  sendSwapRejectedEvent(eventTarget, 'Price surge');
                }}
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
                onCloseClick={() => sendSwapWidgetCloseEvent(eventTarget)}
                testId="price-surge-view"
              />
            )}
            {viewState.view.type === SharedViews.ERROR_VIEW && (
              <ErrorView
                actionText={actionText}
                onActionClick={async () => {
                  setErrorViewLoading(true);
                  const data = viewState.view as ErrorViewType;

                  if (!data.tryAgain) {
                    showSwapView();
                    setErrorViewLoading(false);
                    return;
                  }

                  if (await data.tryAgain()) showSwapView();
                  setErrorViewLoading(false);
                }}
                onCloseClick={() => sendSwapWidgetCloseEvent(eventTarget)}
                errorEventActionLoading={errorViewLoading}
              />
            )}
            {viewState.view.type === SharedViews.TOP_UP_VIEW && (
              <TopUpView
                widgetEvent={IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT}
                showOnrampOption={isOnRampEnabled}
                showSwapOption={isSwapEnabled}
                showBridgeOption={isBridgeEnabled}
                onCloseButtonClick={() => sendSwapWidgetCloseEvent(eventTarget)}
              />
            )}
          </CryptoFiatProvider>
        </SwapContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
