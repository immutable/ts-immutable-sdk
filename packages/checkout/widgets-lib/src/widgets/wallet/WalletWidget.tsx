import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { WalletWidgetParams } from '@imtbl/checkout-sdk';
import {
  initialWalletState,
  WalletActions,
  WalletConfiguration,
  WalletContext,
  walletReducer,
} from './context/WalletContext';
import { WalletBalances } from './views/WalletBalances';
import { ErrorView } from '../../views/error/ErrorView';
import { LoadingView } from '../../views/loading/LoadingView';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  initialViewState,
  SharedViews,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { Settings } from './views/Settings';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CoinInfo } from './views/CoinInfo';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { useBalance } from '../../lib/hooks/useBalance';

export type WalletWidgetInputs = WalletWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
  walletConfig: WalletConfiguration
};

export default function WalletWidget(props: WalletWidgetInputs) {
  const { t } = useTranslation();
  const errorActionText = t('views.ERROR_VIEW.actionText');
  const loadingText = t('views.LOADING_VIEW.text');
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    config: {
      environment,
      isOnRampEnabled,
      isSwapEnabled,
      isBridgeEnabled,
      isAddTokensEnabled,
      theme,
    },
    walletConfig: {
      showDisconnectButton,
      showNetworkMenu,
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
    { ...initialWalletState, walletConfig: { showDisconnectButton, showNetworkMenu } },
  );

  const walletReducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
  );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { balancesLoading, refreshBalances } = useBalance({
    checkout,
    provider,
    refreshCallback: (balances) => {
      walletDispatch({
        payload: {
          type: WalletActions.SET_TOKEN_BALANCES,
          tokenBalances: balances,
        },
      });
    },
    errorCallback: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: new Error('Unable to fetch balances'),
          },
        },
      });
    },
  });

  /* Set Config into WalletState */
  useEffect(() => {
    (async () => {
      if (!checkout) return;

      let checkSwapAvailable = false;
      try {
        checkSwapAvailable = await checkout.isSwapAvailable();
      } catch { /* */ }

      walletDispatch({
        payload: {
          type: WalletActions.SET_SUPPORTED_TOP_UPS,
          supportedTopUps: {
            isBridgeEnabled,
            isSwapEnabled,
            isOnRampEnabled,
            isSwapAvailable: checkSwapAvailable,
            isAddTokensEnabled,
          },
        },
      });
    })();
  }, [isBridgeEnabled, isSwapEnabled, isOnRampEnabled, environment]);

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
      refreshBalances();
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: WalletWidgetViews.WALLET_BALANCES },
        },
      });

      walletDispatch({
        payload: {
          type: WalletActions.SET_NETWORK,
          network,
        },
      });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    }
  };

  useEffect(() => {
    if (!checkout || !provider) return;
    initialiseWallet();
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
            <WalletBalances balancesLoading={balancesLoading} theme={theme} showNetworkMenu={showNetworkMenu} />
          )}
          {viewState.view.type === WalletWidgetViews.SETTINGS
          && (
          <Settings showDisconnectButton={showDisconnectButton} />
          )}
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
        </WalletContext.Provider>
      </CryptoFiatProvider>
    </ViewContext.Provider>
  );
}
