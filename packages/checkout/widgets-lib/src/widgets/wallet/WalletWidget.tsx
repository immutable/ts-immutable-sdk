import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
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
import { WidgetTheme } from '../../lib';
import { CoinInfo } from './views/CoinInfo';
import { TopUpView } from '../../views/top-up/TopUpView';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';

export interface WalletWidgetProps {
  config: StrongCheckoutWidgetsConfig,
}

export function WalletWidget(props: WalletWidgetProps) {
  const { config } = props;

  const {
    environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled,
  } = config;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState,
  );
  const walletReducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
  );

  /* Set Config into WalletState */
  useEffect(() => {
    walletDispatch({
      payload: {
        type: WalletActions.SET_SUPPORTED_TOP_UPS,
        supportedTopUps: {
          isBridgeEnabled,
          isSwapEnabled,
          isOnRampEnabled,
        },
      },
    });
  }, [isBridgeEnabled, isSwapEnabled, isOnRampEnabled, environment]);

  useEffect(() => {
    (async () => {
      if (!checkout || !provider) return;

      const network = await checkout.getNetworkInfo({
        provider,
      });

      /* If the provider's network is not supported, return out of this and let the
      connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_NETWORK,
          network,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: WalletWidgetViews.WALLET_BALANCES },
        },
      });
    })();
  }, [checkout, provider]);

  const errorAction = () => {
    // TODO: please remove or if necessary keep the eslint ignore
    // eslint-disable-next-line no-console
    console.log('Something went wrong');
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <CryptoFiatProvider environment={environment}>
          <WalletContext.Provider value={walletReducerValues}>
            {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText="Loading" />
            )}
            {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (
            <WalletBalances />
            )}
            {viewState.view.type === WalletWidgetViews.SETTINGS && <Settings />}
            {viewState.view.type === WalletWidgetViews.COIN_INFO && (
            <CoinInfo />
            )}
            {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText="Try again"
              onActionClick={errorAction}
              onCloseClick={sendWalletWidgetCloseEvent}
            />
            )}
            {viewState.view.type === SharedViews.TOP_UP_VIEW && (
            <TopUpView
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              showOnrampOption={isOnRampEnabled}
              showSwapOption={isSwapEnabled}
              showBridgeOption={isBridgeEnabled}
              onCloseButtonClick={sendWalletWidgetCloseEvent}
            />
            )}
          </WalletContext.Provider>
        </CryptoFiatProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
