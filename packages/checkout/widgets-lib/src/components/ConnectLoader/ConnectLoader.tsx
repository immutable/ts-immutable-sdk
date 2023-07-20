import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  GetNetworkParams,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import React, {
  useCallback, useEffect, useReducer, useState,
} from 'react';
import {
  ConnectEventType, ConnectionSuccess, IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
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
  WidgetTheme, ConnectTargetLayer, getTargetLayerChainId,
} from '../../lib';
import { useInterval } from '../../lib/hooks/useInterval';
import { SharedViews } from '../../context/view-context/ViewContext';
import { addProviderAccountsListener, removeProviderEventListeners } from '../../lib/providerEvents';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  closeEvent: () => void;
  widgetConfig: StrongCheckoutWidgetsConfig;
}

export interface ConnectLoaderParams {
  targetLayer?: ConnectTargetLayer;
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
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
  const { connectionStatus, deepLink } = connectLoaderState;
  const { targetLayer, walletProvider } = params;
  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const biomeTheme: BaseTokens = widgetConfig.theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [hasWeb3Provider, setHasWeb3Provider] = useState<boolean | undefined>();
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(params.web3Provider);

  const [attempts, setAttempts] = useState<number>(0);

  // Check if Web3Provider injected, otherwise load the widget without the provider after several attempts
  let clearInterval: () => void;
  const checkIfWeb3ProviderSet = () => {
    const maxAttempts = 9;

    if (params.web3Provider) {
      const isWeb3Provider = Checkout.isWeb3Provider(params.web3Provider);
      if (isWeb3Provider) {
        setWeb3Provider(params.web3Provider);
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

  /** Handle account change events and reload widget when changed */
  useEffect(() => {
    if (!web3Provider) {
      return () => {};
    }

    function handleAccountsChanged(e: any) {
      if (e.length === 0) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED,
            deepLink: ConnectWidgetViews.READY_TO_CONNECT,
          },
        });
        return;
      }

      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
          connectionStatus: ConnectionStatus.NOT_CONNECTED,
          deepLink: ConnectWidgetViews.SUCCESS,
        },
      });
    }

    addProviderAccountsListener(web3Provider, handleAccountsChanged);

    return () => {
      removeProviderEventListeners(
        web3Provider,
        handleAccountsChanged,
        () => {},
      );
    };
  }, [web3Provider]);

  useEffect(() => {
    if (window === undefined) {
      // eslint-disable-next-line no-console
      console.error('missing window object: please run Checkout client side');
      return () => {};
    }
    if (hasWeb3Provider === undefined) return () => {};

    (async () => {
      if (!walletProvider && !web3Provider) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED_NO_PROVIDER,
            deepLink: ConnectWidgetViews.CONNECT_WALLET,
          },
        });
        return;
      }

      const checkout = new Checkout({ baseConfig: { environment: widgetConfig.environment } });

      try {
        if (!web3Provider && walletProvider) {
          const { provider } = await checkout.createProvider({
            walletProvider,
          });
          setWeb3Provider(provider);
          return;
        }

        if (!web3Provider) {
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
          provider: web3Provider,
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

        const currentNetworkInfo = await checkout.getNetworkInfo({ provider: web3Provider } as GetNetworkParams);

        // if unsupported network or current network is not the target network
        const targetChainId = getTargetLayerChainId(checkout.config, targetLayer ?? ConnectTargetLayer.LAYER2);
        if (!currentNetworkInfo.isSupported || currentNetworkInfo.chainId !== targetChainId) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.CONNECTED_WRONG_NETWORK,
              deepLink: SharedViews.SWITCH_NETWORK,
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

          setWeb3Provider(eventData.provider);

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
  }, [widgetConfig.environment, web3Provider, walletProvider, hasWeb3Provider]);

  const childrenWithProvider = useCallback(
    (childrenWithoutProvider:React.ReactNode) =>
      // eslint-disable-next-line
      React.Children.map(childrenWithoutProvider, (child) => 
        // eslint-disable-next-line
        React.cloneElement(child as React.ReactElement, { web3Provider })),
    [web3Provider],
  );

  const getProvider = useCallback(
    () => web3Provider,
    [web3Provider],
  );

  return (
    <>
      {connectionStatus === ConnectionStatus.LOADING && (
        <BiomeCombinedProviders theme={{ base: biomeTheme }}>
          <LoadingView loadingText="Connecting" />
        </BiomeCombinedProviders>
      )}
      {(connectionStatus === ConnectionStatus.NOT_CONNECTED_NO_PROVIDER
        || connectionStatus === ConnectionStatus.NOT_CONNECTED
        || connectionStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK) && (
        <ConnectLoaderContext.Provider
          // TODO: The object passed as the value prop to the Context provider (at line 131) changes every render.
          // To fix this consider wrapping it in a useMemo hook.
          // eslint-disable-next-line react/jsx-no-constructed-context-values
          value={{ connectLoaderState, connectLoaderDispatch }}
        >
          <ConnectWidget
            config={widgetConfig}
            params={{ ...params, targetLayer: networkToSwitchTo, web3Provider: getProvider() }}
            deepLink={deepLink}
            sendCloseEventOverride={closeEvent}
          />
        </ConnectLoaderContext.Provider>
      )}
      {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
        childrenWithProvider(children)
      )}
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
