import { BiomeThemeProvider } from '@biom3/react';
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
import { WidgetTheme } from '../../lib';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  closeEvent: () => void;
  widgetConfig: StrongCheckoutWidgetsConfig;
}

export interface ConnectLoaderParams {
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
  const { providerPreference } = params;

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

        const isSupportedNetwork = (
          await checkout.getNetworkInfo({ provider } as GetNetworkParams)
        ).isSupported;

        if (!isSupportedNetwork) {
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

    // @ts-ignore
    // TODO: Checkout interface expects 0 arguments but got 1
    const checkout = new Checkout({ baseConfig: { environment: widgetConfig.environment } });
    checkConnection(checkout);
  }, [providerPreference, widgetConfig.environment]);

  return (
    <>
      {connectionStatus === ConnectionStatus.LOADING && (
        <BiomeThemeProvider theme={{ base: biomeTheme }}>
          <LoadingView loadingText="Connecting" />
        </BiomeThemeProvider>
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
            params={params}
            deepLink={ConnectWidgetViews.CONNECT_WALLET}
            sendCloseEventOverride={closeEvent}
          />
        </ConnectLoaderContext.Provider>
      )}
      {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
        children
      )}
      {connectionStatus === ConnectionStatus.ERROR && (
        <BiomeThemeProvider theme={{ base: biomeTheme }}>
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
        </BiomeThemeProvider>
      )}
    </>
  );
}
