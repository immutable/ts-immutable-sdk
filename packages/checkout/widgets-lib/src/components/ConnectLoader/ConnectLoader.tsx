import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetNetworkParams,
  WalletProviderName,

  ConnectEventType, ConnectionSuccess, ConnectTargetLayer, IMTBLWidgetEvents, CheckoutErrorType,
} from '@imtbl/checkout-sdk';
import { BaseTokens } from '@biom3/design-tokens';
import React, {
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { widgetTheme } from 'lib/theme';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
  connectLoaderReducer,
  initialConnectLoaderState,
} from '../../context/connect-loader-context/ConnectLoaderContext';
import { LoadingView } from '../../views/loading/LoadingView';
import { ConnectWidget } from '../../widgets/connect/ConnectWidget';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ErrorView } from '../../views/error/ErrorView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  addAccountsChangedListener,
  addChainChangedListener,
  removeAccountsChangedListener,
  removeChainChangedListener,
} from '../../lib';
import { useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { identifyUser } from '../../lib/analytics/identifyUser';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  closeEvent: () => void;
  widgetConfig: StrongCheckoutWidgetsConfig;
}

export interface ConnectLoaderParams {
  targetLayer?: ConnectTargetLayer;
  walletProviderName?: WalletProviderName;
  web3Provider?: Web3Provider;
  checkout: Checkout;
  allowedChains: ChainId[];
}

export function ConnectLoader({
  children,
  params,
  widgetConfig,
  closeEvent,
}: ConnectLoaderProps) {
  const [connectLoaderState, connectLoaderDispatch] = useReducer(
    connectLoaderReducer,
    initialConnectLoaderState,
  );
  const connectLoaderReducerValues = useMemo(() => ({
    connectLoaderState,
    connectLoaderDispatch,
  }), [connectLoaderState, connectLoaderDispatch]);
  const {
    connectionStatus, deepLink, provider,
  } = connectLoaderState;
  const {
    checkout,
    targetLayer,
    walletProviderName,
    allowedChains,
    web3Provider,
  } = params;
  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const biomeTheme: BaseTokens = widgetTheme(widgetConfig.theme);

  const { identify } = useAnalytics();

  // Set the provider on the context for the widgets
  useEffect(() => {
    if (!web3Provider) {
      return;
    }
    connectLoaderDispatch({
      payload: {
        type: ConnectLoaderActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
  }, [web3Provider]);

  /** Handle wallet events as per EIP-1193 spec
   * - listen for account changed manually in wallet
   * - listen for network/chain changed manually in wallet
   */
  useEffect(() => {
    if (!provider) return () => {};

    async function handleAccountsChanged(e: string[]) {
      if (e.length === 0) {
        // when a user disconnects all accounts, send them back to the connect screen
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED,
            deepLink: ConnectWidgetViews.READY_TO_CONNECT,
          },
        });
      } else {
        const newProvider = new Web3Provider(provider!.provider);
        // WT-1698 Analytics - Identify new user as wallet address has changed
        await identifyUser(identify, newProvider);

        // trigger a re-load of the connectLoader so that the widget re loads with a new provider
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: newProvider,
          },
        });
      }
    }

    function handleChainChanged() {
      // trigger a re-load of the connectLoader so that the widget re loads with a new provider
      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.SET_PROVIDER,
          provider: new Web3Provider(provider!.provider),
        },
      });
    }

    addAccountsChangedListener(provider, handleAccountsChanged);
    addChainChangedListener(provider, handleChainChanged);

    return () => {
      removeAccountsChangedListener(provider, handleAccountsChanged);
      removeChainChangedListener(provider, handleChainChanged);
    };
  }, [provider, identify]);

  useEffect(() => {
    connectLoaderDispatch({
      payload: {
        type: ConnectLoaderActions.SET_CHECKOUT,
        checkout,
      },
    });
  }, []);

  const hasNoWalletProviderNameAndNoWeb3Provider = (): boolean => {
    if (!walletProviderName && !provider) {
      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
          connectionStatus: ConnectionStatus.NOT_CONNECTED_NO_PROVIDER,
          deepLink: ConnectWidgetViews.CONNECT_WALLET,
        },
      });
      return true;
    }
    return false;
  };

  const hasWalletProviderNameAndNoWeb3Provider = async (): Promise<boolean> => {
    try {
      // If the wallet provider name was passed through but the provider was
      // not injected then create a provider using the wallet provider name
      if (!provider && walletProviderName) {
        const createProviderResult = await checkout.createProvider({
          walletProviderName,
        });
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: createProviderResult.provider,
          },
        });
        return true;
      }
    } catch (err: any) {
      if (err.type === CheckoutErrorType.DEFAULT_PROVIDER_ERROR) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED_NO_PROVIDER,
            deepLink: ConnectWidgetViews.CONNECT_WALLET,
          },
        });
        return true;
      }

      // todo: WT-1806 - Show a non-generic error view if the error is due to metamask not being installed
      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
          connectionStatus: ConnectionStatus.ERROR,
        },
      });
      return true;
    }

    return false;
  };

  const isWalletConnected = async (): Promise<boolean> => {
    const { isConnected } = await checkout.checkIsWalletConnected({
      provider: provider!,
    });

    if (!isConnected) {
      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
          connectionStatus: ConnectionStatus.NOT_CONNECTED,
          deepLink: ConnectWidgetViews.READY_TO_CONNECT,
        },
      });
      return false;
    }
    return true;
  };

  const handleConnectEvent = ((event: CustomEvent) => {
    switch (event.detail.type) {
      case ConnectEventType.SUCCESS: {
        const eventData = event.detail.data as ConnectionSuccess;

        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: eventData.provider,
          },
        });
        // WT-1698 Analytics - No need to call Identify here as it is
        // called in the Connect Widget when raising the ConnectSuccess event
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
          },
        });
        break;
      }
      case ConnectEventType.FAILURE: {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.ERROR,

          },
        });
        break;
      }
      default:
    }
  }) as EventListener;

  useEffect(() => {
    if (window === undefined) {
      // eslint-disable-next-line no-console
      console.error('missing window object: please run Checkout client side');
      return () => {};
    }

    (async () => {
      if (!checkout) return;

      if (hasNoWalletProviderNameAndNoWeb3Provider()) return;
      if (await hasWalletProviderNameAndNoWeb3Provider()) return;

      try {
        // At this point the Web3Provider exists
        // This will bypass the wallet list screen
        if (!(await isWalletConnected())) return;

        const currentNetworkInfo = await checkout.getNetworkInfo({ provider } as GetNetworkParams);

        // If unsupported network or current network is not in the allowed chains
        // then show the switch network screen
        if (!currentNetworkInfo.isSupported || !allowedChains.includes(currentNetworkInfo.chainId)) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.CONNECTED_WRONG_NETWORK,
              deepLink: ConnectWidgetViews.SWITCH_NETWORK,
            },
          });
          return;
        }

        // WT-1698 Analytics - Identify user here then progress to widget
        await identifyUser(identify, provider!);

        // The user is connected and the widget will be shown
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
          },
        });
      } catch (err: any) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.ERROR,
          },
        });
      }
    })();

    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
      handleConnectEvent,
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent,
      );
    };
  }, [checkout, walletProviderName, provider]);

  return (
    <>
      {connectionStatus === ConnectionStatus.LOADING && (
        <BiomeCombinedProviders theme={{ base: biomeTheme }}>
          <LoadingView loadingText="Connecting" />
        </BiomeCombinedProviders>
      )}
      <ConnectLoaderContext.Provider value={connectLoaderReducerValues}>
        {(connectionStatus === ConnectionStatus.NOT_CONNECTED_NO_PROVIDER
        || connectionStatus === ConnectionStatus.NOT_CONNECTED
        || connectionStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK) && (
          <ConnectWidget
            config={widgetConfig}
            targetLayer={networkToSwitchTo}
            web3Provider={provider}
            checkout={checkout}
            deepLink={deepLink}
            sendCloseEventOverride={closeEvent}
            allowedChains={allowedChains}
          />
        )}
        {/* If the user has connected then render the widget */}
        {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (children)}
      </ConnectLoaderContext.Provider>
      {connectionStatus === ConnectionStatus.ERROR && (
        <BiomeCombinedProviders theme={{ base: biomeTheme }}>
          <ErrorView
            onCloseClick={closeEvent}
            onActionClick={() => {
              connectLoaderDispatch({
                payload: {
                  type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
                  connectionStatus: ConnectionStatus.NOT_CONNECTED,
                },
              });
            }}
            actionText="Try Again"
          />
        </BiomeCombinedProviders>
      )}
    </>
  );
}
