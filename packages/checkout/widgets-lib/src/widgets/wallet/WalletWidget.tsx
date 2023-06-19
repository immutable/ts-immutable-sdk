import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  Checkout,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { useEffect, useReducer } from 'react';
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

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  config: StrongCheckoutWidgetsConfig,
  web3Provider?: Web3Provider
}

export interface WalletWidgetParams {
  providerName?: WalletProviderName;
  web3Provider?: Web3Provider
}

export function WalletWidget(props: WalletWidgetProps) {
  const { params, config, web3Provider } = props;
  const { providerName } = params;

  const {
    environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled,
  } = config;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState,
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

  useEffect(() => {
    (async () => {
      if (!checkout || !web3Provider) return;

      const getNetworkResult = await checkout.getNetworkInfo({
        provider: web3Provider,
      });

      const network = getNetworkResult;

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
    })();
  }, [providerName, checkout]);

  const errorAction = () => {
    // TODO: please remove or if necessary keep the eslint ignore
    // eslint-disable-next-line no-console
    console.log('Something went wrong');
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      {/* TODO: please fix */}
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <CryptoFiatProvider>
          {/* TODO: please fix */}
          {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
          <WalletContext.Provider value={{ walletState, walletDispatch }}>
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
