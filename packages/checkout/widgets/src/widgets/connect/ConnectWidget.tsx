import { BiomeThemeProvider } from '@biom3/react'
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web'
import { WidgetTheme } from '@imtbl/checkout-ui-types'
import { sendConnectFailedEvent, sendConnectSuccessEvent} from './ConnectWidgetEvents'
import { OtherWallets } from './components/other-wallets/OtherWallets';
import { ChooseNetwork } from './components/choose-network/ChooseNetwork';
import { useEffect, useReducer } from 'react'
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens'
import { ConnectActions, ConnectContext, connectReducer, initialConnectState } from './context/ConnectContext'
import { initialViewState, ViewActions, ViewContext, viewReducer } from '../../context/ViewContext';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
import { ConnectWallet } from './components/connect-wallet/ConnectWallet';
import { ConnectResult } from './components/connect-result/ConnectResult';
import { SuccessScreen } from '../../components/Success/SuccessScreen';

export interface ConnectWidgetProps {
  params: ConnectWidgetParams;
  theme: WidgetTheme;
}

export interface ConnectWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function ConnectWidget(props:ConnectWidgetProps) {
  const { theme } = props;
  const [connectState, connectDispatch] = useReducer(connectReducer, initialConnectState);
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const biomeTheme:BaseTokens = (theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()) ? onDarkBase : onLightBase;

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
          type: ConnectWidgetViews.CONNECT_WALLET
        }
      },
    });
  }, []);

  useEffect(() => {
    switch (viewState.view.type) {
      case ConnectWidgetViews.SUCCESS:
        sendConnectSuccessEvent(ConnectionProviders.METAMASK);
        break;
      case ConnectWidgetViews.FAIL:
        sendConnectFailedEvent(viewState.view.error.message);
        break;
    }
  }, [viewState])

  return (
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {viewState.view.type === ConnectWidgetViews.CONNECT_WALLET && <ConnectWallet />}
            {viewState.view.type === ConnectWidgetViews.OTHER_WALLETS && <OtherWallets />}
            {viewState.view.type === ConnectWidgetViews.CHOOSE_NETWORKS && <ChooseNetwork />}
            {viewState.view.type === ConnectWidgetViews.SUCCESS && <SuccessScreen successText='Connection secure' actionText='Continue'/>}
            {viewState.view.type === ConnectWidgetViews.FAIL && <ConnectResult />}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  )
}
