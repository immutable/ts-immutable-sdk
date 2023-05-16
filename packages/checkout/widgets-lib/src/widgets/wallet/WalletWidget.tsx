import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import {
  Checkout,
  ConnectionProviders,
  GetNetworkParams,
} from '@imtbl/checkout-sdk';
import { useEffect, useReducer } from 'react';
import { Environment } from '@imtbl/config';
import {
  initialWalletState,
  TopUpFeature,
  WalletActions,
  WalletContext,
  walletReducer,
} from './context/WalletContext';
import { WalletBalances } from './views/WalletBalances';
import { ErrorView } from '../../components/Error/ErrorView';
import { LoadingView } from '../../components/Loading/LoadingView';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { zkEVMNetwork } from '../../lib/networkUtils';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  BaseViews,
} from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  theme: WidgetTheme;
  environment: Environment;
}

export interface WalletWidgetParams {
  providerPreference?: ConnectionProviders;
  topUpFeatures?: TopUpFeature;
}

export function WalletWidget(props: WalletWidgetProps) {
  const { environment, params, theme } = props;
  const { providerPreference, topUpFeatures } = params;
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState,
  );

  const { checkout } = walletState;

  useEffect(() => {
    const checkout2 = new Checkout({ baseConfig: { environment } });
    walletDispatch({
      payload: {
        type: WalletActions.SET_CHECKOUT,
        checkout: checkout2 as Checkout,
      },
    });

    walletDispatch({
      payload: {
        type: WalletActions.SET_SUPPORTED_TOP_UPS,
        supportedTopUps: { ...topUpFeatures },
      },
    });
  }, [topUpFeatures, environment]);

  useEffect(() => {
    (async () => {
      if (!checkout) return;

      let provider;
      let network;

      const connectResult = await checkout.connect({
        providerPreference: providerPreference ?? ConnectionProviders.METAMASK,
      });

      provider = connectResult.provider;
      network = connectResult.network;

      const isSupportedNetwork = (
        await checkout.getNetworkInfo({ provider } as GetNetworkParams)
      ).isSupported;

      if (!isSupportedNetwork) {
        const result = await checkout.switchNetwork({
          provider,
          chainId: zkEVMNetwork(checkout.config.environment),
        });
        provider = result.provider;
        network = result.network;
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider,
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
  }, [providerPreference, checkout]);

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
            {viewState.view.type === BaseViews.LOADING_VIEW && (
              <LoadingView loadingText="Loading" />
            )}
            {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (
              <WalletBalances />
            )}
            {viewState.view.type === BaseViews.ERROR && (
              <ErrorView
                actionText="Try again"
                onActionClick={errorAction}
                onCloseClick={sendWalletWidgetCloseEvent}
              />
            )}
          </WalletContext.Provider>
        </CryptoFiatProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
