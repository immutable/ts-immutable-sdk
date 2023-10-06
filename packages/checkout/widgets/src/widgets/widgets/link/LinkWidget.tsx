import { BiomeCombinedProviders } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
// import { MetaMaskIMXProvider, ProviderConfiguration } from '@imtbl/provider';
// import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { MetaMaskIMXProvider, ProviderConfiguration } from '@imtbl/provider';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TestLinkView } from './views/TestLinkView';
import { ErrorView } from '../../views/error/ErrorView';
import { LoadingView } from '../../views/loading/LoadingView';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { text } from '../../resources/text/textConfig';
// import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { widgetTheme } from '../../lib/theme';

export interface WalletWidgetProps {
  config: StrongCheckoutWidgetsConfig,
}

export function LinkWidget(props: WalletWidgetProps) {
  const errorActionText = text.views[SharedViews.ERROR_VIEW].actionText;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;
  // const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const {
    config: {
      environment, theme,
    },
  } = props;

  const { connectLoaderState: { checkout, provider } } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  // const [walletState, walletDispatch] = useReducer(
  //   walletReducer,
  //   initialWalletState,
  // );

  // const walletReducerValues = useMemo(
  //   () => ({ walletState, walletDispatch }),
  //   [walletState, walletDispatch],
  // );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  /* Set Config into WalletState */
  // useEffect(() => {
  //   walletDispatch({
  //     payload: {
  //       type: WalletActions.SET_SUPPORTED_TOP_UPS,
  //       supportedTopUps: {
  //         isBridgeEnabled,
  //         isSwapEnabled,
  //         isOnRampEnabled,
  //       },
  //     },
  //   });
  // }, [isBridgeEnabled, isSwapEnabled, isOnRampEnabled, environment]);

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

      const imxProvider = await MetaMaskIMXProvider.connect(new ProviderConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
      }));

      console.log(fetch('https://api.sandbox.x.immutable.com/v3/orders')
        .then((resp) => resp.json())
        .then((val) => console.log(val)));

      console.log(imxProvider);

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
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <CryptoFiatProvider environment={environment}>
          {/* <WalletContext.Provider value={walletReducerValues}> */}
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}
          {viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (
            <TestLinkView />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={errorActionText}
              onActionClick={errorAction}
              onCloseClick={() => console.log('close')}
            />
          )}
          {/* </WalletContext.Provider> */}
        </CryptoFiatProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
