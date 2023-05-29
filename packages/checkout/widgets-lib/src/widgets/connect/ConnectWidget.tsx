/* eslint-disable react/jsx-no-constructed-context-values */

import { BiomeCombinedProviders } from '@biom3/react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { useEffect, useReducer } from 'react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
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
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ConnectWallet } from './views/ConnectWallet';
import { ConnectResult } from './views/ConnectResult';
import { ReadyToConnect } from './views/ReadyToConnect';
import { SwitchNetworkZkEVM } from './views/SwitchNetworkZkEVM';
import { LoadingView } from '../../components/Loading/LoadingView';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  BaseViews,
} from '../../context/view-context/ViewContext';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  ConnectTargetLayer, getTargetLayerChainId, WidgetTheme,
} from '../../lib';
import { SwitchNetworkEth } from './views/SwitchNetworkEth';

export interface ConnectWidgetProps {
  // TODO: 'params' PropType is defined but prop is never used
  // eslint-disable-next-line react/no-unused-prop-types
  params: ConnectWidgetParams;
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews.CONNECT_WALLET;
  sendCloseEventOverride?: () => void;
}

export interface ConnectWidgetParams {
  targetLayer?: ConnectTargetLayer
  providerPreference?: ConnectionProviders;
}

export function ConnectWidget(props: ConnectWidgetProps) {
  const {
    config, deepLink, sendCloseEventOverride, params: { targetLayer },
  } = props;
  const { environment, theme } = config;
  const [connectState, connectDispatch] = useReducer(
    connectReducer,
    initialConnectState,
  );
  const { sendCloseEvent } = connectState;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const { view } = viewState;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const targetChainId = getTargetLayerChainId(targetLayer ?? ConnectTargetLayer.LAYER2, environment);

  useEffect(() => {
    setTimeout(() => {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_CHECKOUT,
          checkout: new Checkout({
            baseConfig: { environment },
          }),
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
            type: deepLink ?? ConnectWidgetViews.CONNECT_WALLET,
          },
        },
      });
    }, 200);
  }, [deepLink, sendCloseEventOverride, environment]);

  useEffect(() => {
    if (viewState.view.type === ConnectWidgetViews.FAIL) {
      sendConnectFailedEvent(viewState.view.reason);
    }
  }, [viewState]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      {/* TODO: The object passed as the value prop to the Context provider changes every render.
          To fix this consider wrapping it in a useMemo hook. */}
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {view.type === BaseViews.LOADING_VIEW && (
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
            {view.type === ConnectWidgetViews.SUCCESS && (
              <ConnectLoaderSuccess>
                <StatusView
                  statusText="Connection secure"
                  actionText="Continue"
                  onActionClick={() => sendCloseEvent()}
                  onRenderEvent={() => sendConnectSuccessEvent(ConnectionProviders.METAMASK)}
                  statusType={StatusType.SUCCESS}
                  testId="success-view"
                />
              </ConnectLoaderSuccess>
            )}
            {view.type === ConnectWidgetViews.FAIL && <ConnectResult />}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
