import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetNetworkParams,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import React, {
  useCallback, useEffect, useMemo, useReducer, useState,
} from 'react';
import {
  ConnectEventType, ConnectionSuccess, IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
import { Passport } from '@imtbl/passport';
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
  WidgetTheme,
  ConnectTargetLayer,
  addAccountsChangedListener,
  addChainChangedListener,
  removeAccountsChangedListener,
  removeChainChangedListener,
} from '../../lib';
import { useInterval } from '../../lib/hooks/useInterval';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  closeEvent: () => void;
  widgetConfig: StrongCheckoutWidgetsConfig;
}

export interface ConnectLoaderParams {
  targetLayer?: ConnectTargetLayer;
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider;
  passport?: Passport;
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
    connectionStatus, deepLink, checkout, provider,
  } = connectLoaderState;
  const {
    targetLayer, walletProvider, allowedChains, passport,
  } = params;
  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const biomeTheme: BaseTokens = widgetConfig.theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [hasWeb3Provider, setHasWeb3Provider] = useState<boolean | undefined>();

  const [attempts, setAttempts] = useState<number>(0);

  // Check if Web3Provider injected, otherwise load the widget without the provider after several attempts
  let clearInterval: () => void;
  const checkIfWeb3ProviderSet = () => {
    const maxAttempts = 9;

    if (params.web3Provider) {
      const isWeb3Provider = Checkout.isWeb3Provider(params.web3Provider);
      if (isWeb3Provider) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: params.web3Provider,
          },
        });

        setHasWeb3Provider(true);
        clearInterval();
        return;
      }
    }

    if (attempts >= maxAttempts) {
      setHasWeb3Provider(false);
      clearInterval();
      return;
    }

    setAttempts(attempts + 1);
  };
  clearInterval = useInterval(() => checkIfWeb3ProviderSet(), 10);

  /** Handle wallet events as per EIP-1193 spec
   * - listen for account changed manually in wallet
   * - listen for network/chain changed manually in wallet
   */
  useEffect(() => {
    if (!provider) return () => {};

    function handleAccountsChanged(e: string[]) {
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
        // trigger a re-load of the connectLoader so that the widget re loads with a new provider
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: new Web3Provider(provider!.provider),
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
  }, [provider]);

  useEffect(() => {
    connectLoaderDispatch({
      payload: {
        type: ConnectLoaderActions.SET_CHECKOUT,
        checkout: new Checkout({ baseConfig: { environment: widgetConfig.environment } }),
      },
    });
  }, [widgetConfig]);

  useEffect(() => {
    if (window === undefined) {
      // eslint-disable-next-line no-console
      console.error('missing window object: please run Checkout client side');
      return () => {};
    }
    if (hasWeb3Provider === undefined) return () => {};

    (async () => {
      if (!checkout) return;
      if (!walletProvider && !provider) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED_NO_PROVIDER,
            deepLink: ConnectWidgetViews.CONNECT_WALLET,
          },
        });
        return;
      }

      try {
        if (!provider && walletProvider) {
          const createProviderResult = await checkout.createProvider({
            walletProvider,
          });
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.SET_PROVIDER,
              provider: createProviderResult.provider,
            },
          });
          return;
        }

        if (!provider) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.NOT_CONNECTED_NO_PROVIDER,
              deepLink: ConnectWidgetViews.CONNECT_WALLET,
            },
          });
          return;
        }

        // at this point web3Provider has been either created or parsed in

        const { isConnected } = await checkout.checkIsWalletConnected({
          provider,
        });

        if (!isConnected) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.NOT_CONNECTED,
              deepLink: ConnectWidgetViews.READY_TO_CONNECT,
            },
          });
          return;
        }

        const currentNetworkInfo = await checkout.getNetworkInfo({ provider } as GetNetworkParams);

        // if unsupported network or current network is not in the allowed chains
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
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.ERROR,
            },
          });
      }
    }) as EventListener;

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
  }, [checkout, provider, walletProvider, hasWeb3Provider]);

  const childrenWithProvider = useCallback(
    (childrenWithoutProvider:React.ReactNode) =>
      // eslint-disable-next-line
      React.Children.map(childrenWithoutProvider, (child) => 
        // eslint-disable-next-line
        React.cloneElement(child as React.ReactElement, { web3Provider: provider })),
    [provider],
  );

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
            params={{
              ...params, targetLayer: networkToSwitchTo, web3Provider: provider, passport,
            }}
            deepLink={deepLink}
            sendCloseEventOverride={closeEvent}
          />
        )}
        {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
          childrenWithProvider(children)
        )}
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
