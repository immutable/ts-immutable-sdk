import {
  useCallback,
  useContext, useEffect, useMemo, useReducer, useState,
} from 'react';
import { GetBalanceResult, IMTBLWidgetEvents, WalletWidgetParams } from '@imtbl/checkout-sdk';
import { DEFAULT_BALANCE_RETRY_POLICY } from 'lib';
import { UserJourney } from 'context/analytics-provider/SegmentAnalyticsProvider';
import {
  initialWalletState,
  WalletActions,
  WalletContext,
  walletReducer,
} from './context/WalletContext';
import { WalletBalances } from './views/WalletBalances';
import { ErrorView } from '../../views/error/ErrorView';
import { LoadingView } from '../../views/loading/LoadingView';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { Settings } from './views/Settings';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CoinInfo } from './views/CoinInfo';
import { TopUpView } from '../../views/top-up/TopUpView';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { text } from '../../resources/text/textConfig';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { getTokenBalances } from './functions/tokenBalances';

export type WalletWidgetInputs = WalletWidgetParams & {
  config: StrongCheckoutWidgetsConfig
};

export function WalletWidget(props: WalletWidgetInputs) {
  const errorActionText = text.views[SharedViews.ERROR_VIEW].actionText;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    config: {
      environment,
      isOnRampEnabled,
      isSwapEnabled,
      isBridgeEnabled,
    },
  } = props;

  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState,
  );

  const walletReducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
  );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const [balancesLoading, setBalancesLoading] = useState(true);

  /* Set Config into WalletState */
  useEffect(() => {
    (async () => {
      if (!checkout) return;

      let checkSwapAvailable;

      try {
        checkSwapAvailable = await checkout.isSwapAvailable();
      } catch (err: any) {
        checkSwapAvailable = false;
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_SUPPORTED_TOP_UPS,
          supportedTopUps: {
            isBridgeEnabled,
            isSwapEnabled,
            isOnRampEnabled,
            isSwapAvailable: checkSwapAvailable,
          },
        },
      });
    })();
  }, [isBridgeEnabled, isSwapEnabled, isOnRampEnabled, environment]);

  const showErrorView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.ERROR_VIEW,
          error: new Error('Unable to fetch balances'),
        },
      },
    });
  }, [viewDispatch]);

  const initialiseWallet = async () => {
    if (!checkout || !provider) return;

    try {
      const network = await checkout.getNetworkInfo({
        provider,
      });

      /* If the provider's network is not supported, return out of this and let the
      connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }

      /** Fetch the user's balances based on their connected provider and correct network */
      setBalancesLoading(true);

      /** Go to Wallet Balances view while it is still loading */
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: WalletWidgetViews.WALLET_BALANCES },
        },
      });

      let balances: GetBalanceResult[] = [];
      try {
        balances = await getTokenBalances(checkout, provider, network.chainId);
        walletDispatch({
          payload: {
            type: WalletActions.SET_TOKEN_BALANCES,
            tokenBalances: balances,
          },
        });
      } catch (error: any) {
        if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(error)) {
          showErrorView();
          return;
        }
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_NETWORK,
          network,
        },
      });
    } catch (error: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    } finally {
      /** always set balances loading false at the end  */
      setBalancesLoading(false);
    }
  };

  useEffect(() => {
    if (!checkout || !provider) return;
    (async () => {
      initialiseWallet();
    })();
  }, [checkout, provider]);

  const errorAction = async () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: WalletWidgetViews.WALLET_BALANCES },
      },
    });
    await initialiseWallet();
  };

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <CryptoFiatProvider environment={environment}>
        <WalletContext.Provider value={walletReducerValues}>
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}
          {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (
            <WalletBalances balancesLoading={balancesLoading} />
          )}
          {viewState.view.type === WalletWidgetViews.SETTINGS && <Settings />}
          {viewState.view.type === WalletWidgetViews.COIN_INFO && (
            <CoinInfo />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={errorActionText}
              onActionClick={errorAction}
              onCloseClick={() => sendWalletWidgetCloseEvent(eventTarget)}
            />
          )}
          {viewState.view.type === SharedViews.TOP_UP_VIEW && (
            <TopUpView
              analytics={{ userJourney: UserJourney.WALLET }}
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              checkout={checkout}
              provider={provider}
              showOnrampOption={isOnRampEnabled}
              showSwapOption={isSwapEnabled}
              showBridgeOption={isBridgeEnabled}
              onCloseButtonClick={() => sendWalletWidgetCloseEvent(eventTarget)}
            />
          )}
        </WalletContext.Provider>
      </CryptoFiatProvider>
    </ViewContext.Provider>
  );
}
