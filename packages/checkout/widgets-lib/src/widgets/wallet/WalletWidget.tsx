import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  Checkout,
} from '@imtbl/checkout-sdk';
import {
  useEffect, useMemo, useReducer,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
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
import { text } from '../../resources/text/textConfig';

export interface WalletWidgetProps {
  config: StrongCheckoutWidgetsConfig,
  web3Provider?: Web3Provider
}

export function WalletWidget(props: WalletWidgetProps) {
  const { config, web3Provider } = props;
  const errorActionText = text.views[SharedViews.ERROR_VIEW].actionText;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

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

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState,
  );
  const walletReducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
  );

  useEffect(() => {
    if (web3Provider) {
      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider: web3Provider,
        },
      });
    }
  }, [web3Provider]);

  const { checkout } = walletState;

  /* Set Checkout and config into WalletState */
  useEffect(() => {
    walletDispatch({
      payload: {
        type: WalletActions.SET_CHECKOUT,
        checkout: new Checkout({ baseConfig: { environment } }),
      },
    });

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

  const initialiseWallet = async () => {
    if (!checkout || !web3Provider) return;

    try {
      const network = await checkout.getNetworkInfo({
        provider: web3Provider,
      });

      /* If the provider's network is not supported, return out of this and let the
      connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider: web3Provider,
        },
      });

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
    }
  };

  useEffect(() => {
    if (!checkout || !web3Provider) return;
    (async () => {
      initialiseWallet();
    })();
  }, [checkout, web3Provider]);

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
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <CryptoFiatProvider environment={environment}>
          <WalletContext.Provider value={walletReducerValues}>
            {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
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
              actionText={errorActionText}
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
