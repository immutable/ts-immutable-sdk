/* eslint-disable react/jsx-no-constructed-context-values */

import { Web3Provider } from '@ethersproject/providers';
import { BiomeCombinedProviders } from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { useEffect, useReducer } from 'react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { Passport } from '@imtbl/passport';
import {
  sendCloseWidgetEvent,
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
import { SwitchNetworkZkEVM } from './views/SwitchNetworkZkEVM';
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
  ConnectTargetLayer, getTargetLayerChainId, WidgetTheme,
} from '../../lib';
import { SwitchNetworkEth } from './views/SwitchNetworkEth';
import { ErrorView } from '../../views/error/ErrorView';
import { text } from '../../resources/text/textConfig';

export interface ConnectWidgetProps {
  params?: ConnectWidgetParams;
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews;
  sendCloseEventOverride?: () => void;
}

export interface ConnectWidgetParams {
  targetLayer?: ConnectTargetLayer
  web3Provider?: Web3Provider;
  passport?: Passport;
}

export function ConnectWidget(props: ConnectWidgetProps) {
  const { config, sendCloseEventOverride, params } = props;
  const { targetLayer, web3Provider, passport } = params ?? {}; // nullish operator handles if params is undefined
  const { deepLink = ConnectWidgetViews.CONNECT_WALLET } = props;
  const { environment, theme } = config;
  const errorText = text.views[SharedViews.ERROR_VIEW].actionText;

  const [connectState, connectDispatch] = useReducer(connectReducer, initialConnectState);
  const { sendCloseEvent, provider, walletProviderName } = connectState;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const { view } = viewState;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const checkout = new Checkout({ baseConfig: { environment } });
  const targetChainId = getTargetLayerChainId(checkout.config, targetLayer ?? ConnectTargetLayer.LAYER2);

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
    if (!passport) return;

    connectDispatch({
      payload: {
        type: ConnectActions.SET_PASSPORT,
        passport,
      },
    });
  }, [passport]);

  useEffect(() => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_CHECKOUT,
        checkout,
      },
    });

    connectDispatch({
      payload: {
        type: ConnectActions.SET_SEND_CLOSE_EVENT,
        sendCloseEvent: sendCloseEventOverride ?? sendCloseWidgetEvent,
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
  }, [deepLink, sendCloseEventOverride, environment]);

  useEffect(() => {
    if (viewState.view.type !== SharedViews.ERROR_VIEW) return;
    sendConnectFailedEvent(viewState.view.error.message);
  }, [viewState]);

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
            {view.type === ConnectWidgetViews.SWITCH_NETWORK && networkToSwitchTo === ConnectTargetLayer.LAYER2 && (
              <SwitchNetworkZkEVM />
            )}
            {view.type === ConnectWidgetViews.SWITCH_NETWORK && networkToSwitchTo === ConnectTargetLayer.LAYER1 && (
              <SwitchNetworkEth />
            )}
            {view.type === ConnectWidgetViews.SUCCESS && provider && (
              <ConnectLoaderSuccess>
                <StatusView
                  statusText="Connection secure"
                  actionText="Continue"
                  onActionClick={() => sendCloseEvent()}
                  onRenderEvent={() => sendConnectSuccessEvent(provider, walletProviderName ?? undefined)}
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
