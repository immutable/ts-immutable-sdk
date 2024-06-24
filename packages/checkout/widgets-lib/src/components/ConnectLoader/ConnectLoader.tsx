import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  WalletProviderName,
  CheckoutErrorType,

} from '@imtbl/checkout-sdk';
import React, {
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { ErrorView } from '../../views/error/ErrorView';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
  connectLoaderReducer,
  initialConnectLoaderState,
} from '../../context/connect-loader-context/ConnectLoaderContext';
import { LoadingView } from '../../views/loading/LoadingView';
import ConnectWidget from '../../widgets/connect/ConnectWidget';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { identifyUser } from '../../lib/analytics/identifyUser';

export interface ConnectLoaderProps {
  children?: React.ReactNode;
  params: ConnectLoaderParams;
  closeEvent: () => void;
  widgetConfig: StrongCheckoutWidgetsConfig;
}

export interface ConnectLoaderParams {
  targetChainId: ChainId;
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
  const {
    checkout,
    targetChainId,
    walletProviderName,
    allowedChains,
    web3Provider,
  } = params;

  const [connectLoaderState, connectLoaderDispatch] = useReducer(
    connectLoaderReducer,
    { ...initialConnectLoaderState, checkout }, // set checkout instance here
  );
  const connectLoaderReducerValues = useMemo(() => ({
    connectLoaderState,
    connectLoaderDispatch,
  }), [connectLoaderState, connectLoaderDispatch]);
  const {
    connectionStatus, deepLink, provider,
  } = connectLoaderState;

  const { identify } = useAnalytics();

  const hasNoWalletProviderNameAndNoWeb3Provider = (localProvider?: Web3Provider): boolean => {
    if (!walletProviderName && !localProvider) {
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

  const hasWalletProviderNameAndNoWeb3Provider = async (localProvider?: Web3Provider): Promise<boolean> => {
    try {
      // If the wallet provider name was passed through but the provider was
      // not injected then create a provider using the wallet provider name
      if (!localProvider && walletProviderName) {
        const createProviderResult = await checkout.createProvider({
          walletProviderName,
        });
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: createProviderResult.provider,
          },
        });

        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.NOT_CONNECTED,
            deepLink: ConnectWidgetViews.CONNECT_WALLET,
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

  const isWalletConnected = async (localProvider: Web3Provider): Promise<boolean> => {
    const { isConnected } = await checkout.checkIsWalletConnected({
      provider: localProvider!,
    });
    if (!isConnected) {
      connectLoaderDispatch({
        payload: {
          type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
          connectionStatus: ConnectionStatus.NOT_CONNECTED,
          deepLink: ConnectWidgetViews.CONNECT_WALLET,
        },
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (window === undefined) {
      // eslint-disable-next-line no-console
      console.error('missing window object: please run Checkout client side');
      return;
    }

    (async () => {
      if (!checkout) return;

      if (hasNoWalletProviderNameAndNoWeb3Provider(web3Provider)) return;
      if (await hasWalletProviderNameAndNoWeb3Provider(web3Provider)) return;

      try {
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: web3Provider!,
          },
        });
        // TODO: handle all of the inner try catches with error handling
        // At this point the Web3Provider exists
        // This will bypass the wallet list screen
        const isConnected = (await isWalletConnected(web3Provider!));
        if (!isConnected) return;

        try {
          const currentNetworkInfo = await checkout.getNetworkInfo({ provider: web3Provider! });

          // TODO: do this instead, replace chainId check with below code instead of checkout.getNetworkInfo
          // Also, skip the entire section if it is Passport.
          // const currentChainId = await web3Provider?.getSigner().getChainId();

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
        } catch (err) {
          return;
        }

        try {
          // WT-1698 Analytics - Identify user here then progress to widget
          // TODO: Identify user should be separated out into a use Effect with only the provider (from connect loader state) as dependency
          await identifyUser(identify, web3Provider!);
        } catch (err) {
          return;
        }

        // The user is connected and the widget will be shown
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
          },
        });
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error(err);

        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
            connectionStatus: ConnectionStatus.ERROR,
          },
        });
      }
    })();
  }, [checkout, walletProviderName, web3Provider]);

  return (
    <>
      {(connectionStatus === ConnectionStatus.LOADING) && (
      <LoadingView loadingText="Loading" />
      )}
      <ConnectLoaderContext.Provider value={connectLoaderReducerValues}>
        {(connectionStatus === ConnectionStatus.NOT_CONNECTED_NO_PROVIDER
        || connectionStatus === ConnectionStatus.NOT_CONNECTED
        || connectionStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK) && (
          <ConnectWidget
            config={widgetConfig}
            targetChainId={targetChainId}
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
      )}
    </>
  );
}
