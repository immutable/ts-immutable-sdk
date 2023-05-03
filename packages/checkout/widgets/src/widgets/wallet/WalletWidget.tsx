import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { useEffect, useReducer } from 'react';
import {
  initialWalletState,
  WalletActions,
  WalletContext,
  walletReducer,
} from './context/WalletContext';
import {
  BaseViews,
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/ViewContext';
import { WalletWidgetViews } from '../../context/WalletViewContextTypes';
import { WalletBalances } from './views/WalletBalances';
import { ErrorView } from '../../components/Error/ErrorView';
import { LoadingView } from '../../components/Loading/LoadingView';
import { closeWalletWidget } from './functions/closeWalletWidget';
import { getTokenBalances } from './functions/tokenBalances';

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  theme: WidgetTheme;
}

export interface WalletWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function WalletWidget(props: WalletWidgetProps) {
  const { params, theme } = props;
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialWalletState
  );

  const { checkout } = walletState;

  useEffect(() => {
    const checkout = new Checkout();
    walletDispatch({
      payload: {
        type: WalletActions.SET_CHECKOUT,
        checkout: checkout,
      },
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!checkout) return;

      const { provider, network } = await checkout.connect({
        providerPreference:
          params.providerPreference ?? ConnectionProviders.METAMASK,
      });

      // check here that the user's wallet is on the correct network
      // if on a network we don't support, switch to zkEVM.

      walletDispatch({
        payload: {
          type: WalletActions.SET_PROVIDER,
          provider,
        },
      });

      walletDispatch({
        payload: {
          type: WalletActions.SWITCH_NETWORK,
          network,
          tokenBalances: await getTokenBalances(
            checkout,
            provider,
            network.name,
            network.chainId
          ),
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: WalletWidgetViews.WALLET_BALANCES },
        },
      });
    })();
  }, [params.providerPreference, checkout]);

  const errorAction = () => {
    console.log('Something went wrong');
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
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
              onCloseClick={closeWalletWidget}
            />
          )}
        </WalletContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
