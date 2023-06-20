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

  const targetChainId = getTargetLayerChainId(targetLayer ?? ConnectTargetLayer.LAYER2, widgetConfig.environment);

  const biomeTheme: BaseTokens = widgetConfig.theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [hasWeb3Provider, setHasWeb3Provider] = useState<boolean | undefined>();
  const [hasCheckedProvider, setHasCheckedProvider] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(params.web3Provider);
  const checkProvider = () => {
    if (!hasCheckedProvider) setHasCheckedProvider(true);
    let timer: number;
    let attempts = 0;
    const maxAttempts = 9;

    const attemptToSetProvider = () => {
      (() => {
        if (web3Provider) {
          const isWeb3Res = Checkout.isWeb3Provider(web3Provider);
          if (isWeb3Res) {
            setHasWeb3Provider(true);
            return;
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          window.clearInterval(timer);
          setHasWeb3Provider(false);
        }
      })();
    };

    timer = window.setInterval(attemptToSetProvider, 10);
    attemptToSetProvider();
  };

  useEffect(() => {
    if (hasWeb3Provider === undefined) {
      checkProvider();
      return;
    }
    const checkConnection = async (checkout: Checkout) => {
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

      try {
        if (!web3Provider && walletProvider) {
          const { provider } = await checkout.createProvider({
            walletProvider,
          });
          setWeb3Provider(provider);
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
        if (!currentNetworkInfo.isSupported || currentNetworkInfo.chainId !== targetChainId) {
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
    };

    const checkout = new Checkout({ baseConfig: { environment: widgetConfig.environment } });

    checkConnection(checkout);

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
