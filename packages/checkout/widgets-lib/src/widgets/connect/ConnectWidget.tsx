import { BiomeThemeProvider } from '@biom3/react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import {
  sendCloseWidgetEvent,
  sendConnectFailedEvent,
  sendConnectSuccessEvent,
} from './ConnectWidgetEvents';
import { useEffect, useReducer } from 'react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  ConnectActions,
  ConnectContext,
  connectReducer,
  initialConnectState,
} from './context/ConnectContext';
import {
  BaseViews,
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/ViewContext';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
import { ConnectWallet } from './views/ConnectWallet';
import { ConnectResult } from './views/ConnectResult';
import { SuccessView } from '../../components/Success/SuccessView';
import { ReadyToConnect } from './views/ReadyToConnect';
import { SwitchNetwork } from './views/SwitchNetwork';
import { LoadingView } from '../../components/Loading/LoadingView';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import { Environment } from '@imtbl/config';

export interface ConnectWidgetProps {
  environment: Environment;
  params: ConnectWidgetParams;
  theme: WidgetTheme;
  deepLink?: ConnectWidgetViews.CONNECT_WALLET;
  sendCloseEventOverride?: () => void;
}

export interface ConnectWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function ConnectWidget(props: ConnectWidgetProps) {
  const { environment, theme, deepLink, sendCloseEventOverride } = props;
  const [connectState, connectDispatch] = useReducer(
    connectReducer,
    initialConnectState
  );
  const { sendCloseEvent } = connectState;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const { view } = viewState;

  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  useEffect(() => {
    setTimeout(() => {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_CHECKOUT,
          checkout: new Checkout({
            baseConfig: { environment: environment },
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
    switch (viewState.view.type) {
      case ConnectWidgetViews.FAIL:
        sendConnectFailedEvent(viewState.view.reason);
        break;
    }
  }, [viewState]);

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {view.type === BaseViews.LOADING_VIEW && (
              <LoadingView loadingText={'Connecting'} />
            )}
            {view.type === ConnectWidgetViews.CONNECT_WALLET && (
              <ConnectWallet />
            )}
            {view.type === ConnectWidgetViews.READY_TO_CONNECT && (
              <ReadyToConnect />
            )}
            {view.type === ConnectWidgetViews.SUCCESS && (
              <ConnectLoaderSuccess>
                <SuccessView
                  successText="Connection secure"
                  actionText="Continue"
                  successEventAction={() =>
                    sendConnectSuccessEvent(ConnectionProviders.METAMASK)
                  }
                  onActionClick={() => sendCloseEvent()}
                />
              </ConnectLoaderSuccess>
            )}
            {view.type === ConnectWidgetViews.FAIL && <ConnectResult />}
            {view.type === ConnectWidgetViews.SWITCH_NETWORK && (
              <SwitchNetwork />
            )}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
