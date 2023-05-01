import { BiomeThemeProvider } from '@biom3/react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
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
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/ViewContext';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
import { ConnectWallet } from './components/connect-wallet/ConnectWallet';
import { ConnectResult } from './components/connect-result/ConnectResult';
import { SuccessView } from '../../components/Success/SuccessView';
import { ReadyToConnect } from './components/ready-to-connect/ReadyToConnect';
import { SwitchNetwork } from './views/SwitchNetwork';

export interface ConnectWidgetProps {
  params: ConnectWidgetParams;
  theme: WidgetTheme;
}

export interface ConnectWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function ConnectWidget(props: ConnectWidgetProps) {
  const { theme } = props;
  const [connectState, connectDispatch] = useReducer(
    connectReducer,
    initialConnectState
  );
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  useEffect(() => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_CHECKOUT,
        checkout: new Checkout(),
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
      },
    });
  }, []);

  useEffect(() => {
    switch (viewState.view.type) {
      case ConnectWidgetViews.FAIL:
        sendConnectFailedEvent(viewState.view.error.message);
        break;
    }
  }, [viewState]);

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {viewState.view.type === ConnectWidgetViews.CONNECT_WALLET && (
              <ConnectWallet />
            )}
            {viewState.view.type === ConnectWidgetViews.READY_TO_CONNECT && (
              <ReadyToConnect />
            )}
            {viewState.view.type === ConnectWidgetViews.SUCCESS && (
              <SuccessView
                successText="Connection secure"
                actionText="Continue"
                successEventAction={() =>
                  sendConnectSuccessEvent(ConnectionProviders.METAMASK)
                }
                onActionClick={() => sendCloseWidgetEvent()}
              />
            )}
            {viewState.view.type === ConnectWidgetViews.FAIL && (
              <ConnectResult />
            )}
            {viewState.view.type === ConnectWidgetViews.SWITCH_NETWORK && (
              <SwitchNetwork />
            )}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
