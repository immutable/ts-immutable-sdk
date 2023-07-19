/* eslint-disable react/jsx-no-constructed-context-values */

import { Web3Provider } from '@ethersproject/providers';
import { BiomeCombinedProviders } from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { useCallback, useEffect, useReducer } from 'react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  sendConnectWidgetCloseEvent,
  sendConnectFailedEvent,
  sendConnectSuccessEvent,
} from './ConnectWidgetEvents';
import {
  ConnectActions,
  ConnectContext,
  connectReducer,
  initialConnectState,
} from './context/ConnectContext';
import { ConnectWidgetView, ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ConnectWallet } from './views/ConnectWallet';
import { ReadyToConnect } from './views/ReadyToConnect';
import { LoadingView } from '../../views/loading/LoadingView';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  ConnectTargetLayer, getL2ChainId, getTargetLayerChainId, WidgetTheme,
} from '../../lib';
import { ErrorView } from '../../views/error/ErrorView';
import { text } from '../../resources/text/textConfig';
import { useProviderEventSubscriptions } from '../../lib/hooks/useProviderEventSubscriptions';
import { SwitchNetwork } from '../../views/switch-network/SwitchNetwork';
import { ImmutableNetworkHero } from '../../components/Hero/ImmutableNetworkHero';

export interface ConnectWidgetProps {
  params?: ConnectWidgetParams;
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews;
  sendCloseEventOverride?: () => void;
}

export interface ConnectWidgetParams {
  targetLayer?: ConnectTargetLayer
  web3Provider?: Web3Provider;
}

export function ConnectWidget(props: ConnectWidgetProps) {
  const { config, sendCloseEventOverride, params } = props;
  const { targetLayer, web3Provider } = params ?? {}; // nullish operator handles if params is undefined
  const { deepLink = ConnectWidgetViews.CONNECT_WALLET } = props;
  const { environment, theme } = config;
  const errorText = text.views[SharedViews.ERROR_VIEW].actionText;

  const [connectState, connectDispatch] = useReducer(connectReducer, initialConnectState);
  const { sendCloseEvent, provider } = connectState;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const { view } = viewState;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  // const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2; // TODO: Refactor this out

  const checkout = new Checkout({ baseConfig: { environment } });
  const targetChainId = getTargetLayerChainId(checkout.config, targetLayer ?? ConnectTargetLayer.LAYER2);

  useProviderEventSubscriptions({ provider });

  useEffect(() => {
    if (!web3Provider) return;

    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
  }, [web3Provider]);

  useEffect(() => {
    setTimeout(() => {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_CHECKOUT,
          checkout,
        },
      });

      connectDispatch({
        payload: {
          type: ConnectActions.SET_SEND_CLOSE_EVENT,
          sendCloseEvent: sendCloseEventOverride ?? sendConnectWidgetCloseEvent,
        },
      });
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: deepLink,
          } as ConnectWidgetView,
        },
      });
    }, 200);
  }, [deepLink, sendCloseEventOverride, environment]);

  useEffect(() => {
    if (viewState.view.type !== SharedViews.ERROR_VIEW) return;
    sendConnectFailedEvent(viewState.view.error.message);
  }, [viewState]);

  const switchNetwork = useCallback(async () => {
    if (!provider) return;

    // No try catch around these calls as errors are caught in the SwitchNetwork view
    const switchRes = await checkout.switchNetwork({
      provider,
      chainId: getL2ChainId(checkout.config),
    });
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: switchRes.provider,
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.SUCCESS,
        },
      },
    });
  }, [provider, connectDispatch, viewDispatch]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      {/* TODO: The object passed as the value prop to the Context provider changes every render.
          To fix this consider wrapping it in a useMemo hook. */}
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {view.type === SharedViews.LOADING_VIEW && (
              <LoadingView loadingText="Connecting" />
            )}
            {view.type === ConnectWidgetViews.CONNECT_WALLET && (
              <ConnectWallet />
            )}
            {view.type === ConnectWidgetViews.READY_TO_CONNECT && (
              <ReadyToConnect targetChainId={targetChainId} />
            )}
            {view.type === SharedViews.SWITCH_NETWORK && (
              <SwitchNetwork
                heroContent={<ImmutableNetworkHero />}
                switchNetwork={switchNetwork}
                onClose={sendCloseEvent}
                switchToZkEVM
              />
            )}
            {view.type === ConnectWidgetViews.SUCCESS && provider && (
              <ConnectLoaderSuccess>
                <StatusView
                  statusText="Connection secure"
                  actionText="Continue"
                  onActionClick={() => sendCloseEvent()}
                  onRenderEvent={() => sendConnectSuccessEvent(provider)}
                  statusType={StatusType.SUCCESS}
                  testId="success-view"
                />
              </ConnectLoaderSuccess>
            )}
            {((view.type === ConnectWidgetViews.SUCCESS && !provider)
            || view.type === SharedViews.ERROR_VIEW)
              && (
                <ErrorView
                  actionText={errorText}
                  onActionClick={() => {
                    viewDispatch({
                      payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                          type: ConnectWidgetViews.CONNECT_WALLET,
                        } as ConnectWidgetView,
                      },
                    });
                  }}
                  onCloseClick={() => sendCloseEvent()}
                />
              )}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
