import { BiomeThemeProvider } from '@biom3/react';
import {
  Checkout,
  ConnectionProviders,
  GetNetworkParams,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
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
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
import { ErrorView } from '../Error/ErrorView';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  theme: WidgetTheme;
  closeEvent: () => void;
}

export interface ConnectLoaderParams {
  providerPreference?: ConnectionProviders;
}

export const ConnectLoader = ({
  children,
  params,
  theme,
  closeEvent,
}: ConnectLoaderProps) => {
  const [connectLoaderState, connectLoaderDispatch] = useReducer(
    connectLoaderReducer,
    initialConnectLoaderState
  );
  const { connectionStatus } = connectLoaderState;

  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  useEffect(() => {
    const checkConnection = async (checkout: Checkout) => {
      try {
        const { isConnected } = await checkout.checkIsWalletConnected({
          providerPreference: ConnectionProviders.METAMASK,
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
          providerPreference: ConnectionProviders.METAMASK,
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

    const checkout = new Checkout();
    checkConnection(checkout);
  }, []);

  return (
    <>
      {connectionStatus === ConnectionStatus.LOADING && (
        <BiomeThemeProvider theme={{ base: biomeTheme }}>
          <LoadingView loadingText={'Connecting'} />
        </BiomeThemeProvider>
      )}
      {(connectionStatus === ConnectionStatus.NOT_CONNECTED ||
        connectionStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK) && (
        <ConnectLoaderContext.Provider
          value={{ connectLoaderState, connectLoaderDispatch }}
        >
          <ConnectWidget
            params={params}
            theme={theme}
            deepLink={ConnectWidgetViews.CONNECT_WALLET}
            sendCloseEventOverride={closeEvent}
          />
        </ConnectLoaderContext.Provider>
      )}
      {connectionStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
        <>{children}</>
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
};
