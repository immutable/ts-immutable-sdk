import {
  useEffect,
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useState,
} from 'react';
import {
  DexConfig, TokenFilterTypes, IMTBLWidgetEvents, SwapWidgetParams,
} from '@imtbl/checkout-sdk';
import { ImmutableConfiguration } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { useTranslation } from 'react-i18next';
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
import { DEFAULT_BALANCE_RETRY_POLICY, getL2ChainId } from '../../lib';
import { StatusView } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
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
import { getAllowedBalances } from '../../lib/balance';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';

export type SwapWidgetInputs = SwapWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

export function SwapWidget({
  amount,
  fromTokenAddress,
  toTokenAddress,
  config,
}: SwapWidgetInputs) {
  const { t } = useTranslation();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    environment,
    theme,
    isOnRampEnabled,
    isSwapEnabled,
    isBridgeEnabled,
  } = config;

  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });
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

  const loadBalances = useCallback(async (): Promise<boolean> => {
    if (!checkout) throw new Error('loadBalances: missing checkout');
    if (!provider) throw new Error('loadBalances: missing provider');

    try {
      const tokensAndBalances = await getAllowedBalances({
        checkout,
        provider,
        allowTokenListType: TokenFilterTypes.SWAP,
      });

      // Why? Check getAllowedBalances
      if (tokensAndBalances === undefined) return false;

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
    } catch (err: any) {
      if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(err)) {
        showErrorView(err, loadBalances);
        return false;
      }
    }

    return true;
  }, [checkout, provider]);

  useEffect(() => {
    (async () => {
      if (!checkout || !provider) return;

      const network = await checkout.getNetworkInfo({ provider });

      // If the provider's network is not the correct network, return out of this and let the
      // connect loader handle the switch network functionality
      if (network.chainId !== getL2ChainId(checkout.config)) return;

      let dexConfig: DexConfig | undefined;
      try {
        dexConfig = (
          (await checkout.config.remote.getConfig('dex')) as DexConfig
        );
      } catch (err: any) {
        showErrorView(err);
        return;
      }

      const exchange = new Exchange({
        chainId: network.chainId,
        baseConfig: new ImmutableConfiguration({ environment }),
        secondaryFees: dexConfig.secondaryFees,
        overrides: dexConfig.overrides,
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
    <ViewContext.Provider value={viewReducerValues}>
      <SwapContext.Provider value={swapReducerValues}>
        <CryptoFiatProvider environment={environment}>
          {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
          )}
          {viewState.view.type === SwapWidgetViews.SWAP && (
          <SwapCoins
            theme={theme}
            fromAmount={viewState.view.data?.fromAmount ?? amount}
            fromTokenAddress={
                  viewState.view.data?.fromTokenAddress
                  ?? fromTokenAddress
                }
            toTokenAddress={
                  viewState.view.data?.toTokenAddress ?? toTokenAddress
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
            statusText={t('views.SWAP.success.text')}
            actionText={t('views.SWAP.success.actionText')}
            onRenderEvent={() => {
              page({
                userJourney: UserJourney.SWAP,
                screen: 'SwapSuccess',
                extras: {
                  fromTokenAddress: viewState.view.data?.fromTokenAddress,
                  fromAmount: viewState.view.data?.fromAmount,
                  toTokenAddress: viewState.view.data?.toTokenAddress,
                  toAmount: viewState.view.data?.toAmount,
                },
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
            statusText={t('views.SWAP.failed.text')}
            actionText={t('views.SWAP.failed.actionText')}
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
            statusText={t('views.SWAP.rejected.text')}
            actionText={t('views.SWAP.rejected.actionText')}
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
            actionText={t('views.ERROR_VIEW.actionText')}
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
              analytics={{ userJourney: UserJourney.SWAP }}
              checkout={checkout}
              provider={provider}
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
  );
}
