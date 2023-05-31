import { BiomeCombinedProviders } from '@biom3/react';
import {
  Checkout,
  ConnectionProviders,
  GetNetworkParams,
} from '@imtbl/checkout-sdk';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useReducer } from 'react';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
  connectLoaderReducer,
  initialConnectLoaderState,
} from '../../context/connect-loader-context/ConnectLoaderContext';
import { LoadingView } from '../Loading/LoadingView';
import { ConnectWidget } from '../../widgets/connect/ConnectWidget';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ErrorView } from '../Error/ErrorView';
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
  providerPreference?: ConnectionProviders;
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
  const { connectionStatus } = connectLoaderState;
  const { targetLayer, providerPreference } = params;

  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const targetChainId = getTargetLayerChainId(targetLayer ?? ConnectTargetLayer.LAYER2, widgetConfig.environment);

  const biomeTheme: BaseTokens = widgetConfig.theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  useEffect(() => {
    const checkConnection = async (checkout: Checkout) => {
      if (!providerPreference) {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED,
          },
        });
        return;
      }

      try {
        const { isConnected } = await checkout.checkIsWalletConnected({
          providerPreference,
        });

        if (!isConnected) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.NOT_CONNECTED,
            },
          });
          return;
        }

        const { provider } = await checkout.connect({
          providerPreference,
        });

        const currentNetworkInfo = await checkout.getNetworkInfo({ provider } as GetNetworkParams);

        // if unsupported network or current network is not the target network
        if (!currentNetworkInfo.isSupported || currentNetworkInfo.chainId !== targetChainId) {
          connectLoaderDispatch({
            payload: {
              type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
              connectionStatus: ConnectionStatus.CONNECTED_WRONG_NETWORK,
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
  }, [providerPreference, widgetConfig.environment]);

  return (
    <>
      {connectionStatus === ConnectionStatus.LOADING && (
        <BiomeCombinedProviders theme={{ base: biomeTheme }}>
          <LoadingView loadingText="Connecting" />
        </BiomeCombinedProviders>
      )}
      {(connectionStatus === ConnectionStatus.NOT_CONNECTED
        || connectionStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK) && (
        <ConnectLoaderContext.Provider
          // TODO: The object passed as the value prop to the Context provider (at line 131) changes every render.
          // To fix this consider wrapping it in a useMemo hook.
          // eslint-disable-next-line react/jsx-no-constructed-context-values
          value={{ connectLoaderState, connectLoaderDispatch }}
        >
          <ConnectWidget
            config={widgetConfig}
            params={{ ...params, targetLayer: networkToSwitchTo }}
            deepLink={ConnectWidgetViews.CONNECT_WALLET}
            sendCloseEventOverride={closeEvent}
          />
        </ConnectLoaderContext.Provider>
      )}
      {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
        children
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
