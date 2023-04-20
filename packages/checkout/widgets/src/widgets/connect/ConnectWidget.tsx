import { BiomeThemeProvider, Body, Box } from '@biom3/react'
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web'
import { WidgetTheme } from '@imtbl/checkout-ui-types'
import { sendConnectFailedEvent, sendConnectSuccessEvent} from './ConnectWidgetEvents'
import { OtherWallets } from './components/other-wallets/OtherWallets';
import { ChooseNetwork } from './components/choose-network/ChooseNetwork';
import { useEffect, useReducer } from 'react'
import { 
  ActiveStyle, 
  InactiveStyle, 
} from './ConnectStyles'
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens'
import { ConnectActions, ConnectContext, connectReducer, initialConnectState } from './context/ConnectContext'
import { initialViewState, ViewActions, ViewContext, viewReducer } from '../../context/ViewContext';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
import { ConnectWallet } from './components/connect-wallet/ConnectWallet';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/HeaderNavigation';
import { FooterLogo } from '../../components/Footer/FooterLogo';
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

  const biomeTheme:BaseTokens = (theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()) ? onLightBase : onDarkBase;

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

  useEffect(() => {
    console.log("Connect Widget current view ", viewState.view.type);
  }, [viewState.view.type])

  const renderOutcome = () => {
    return (
    <SimpleLayout 
      header={
        <HeaderNavigation
          showClose
          showBack
        />
      }
      footer={<FooterLogo />}
      >
        {viewState.view.type === ConnectWidgetViews.SUCCESS && <Body style={{color:'#FFF'}}>User connected</Body>}
        {viewState.view.type === ConnectWidgetViews.FAIL && <Body style={{color:'#FFF'}}>User did not connect</Body>}
    </SimpleLayout>)
  }

  return (
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          <>
            {viewState.view.type === ConnectWidgetViews.CONNECT_WALLET && 
              <ConnectWallet />
            }
            {viewState.view.type === ConnectWidgetViews.OTHER_WALLETS && 
              <OtherWallets />
            }
            {viewState.view.type === ConnectWidgetViews.CHOOSE_NETWORKS && 
              <ChooseNetwork />
            }
            {(viewState.view.type === ConnectWidgetViews.SUCCESS || viewState.view.type === ConnectWidgetViews.FAIL) && renderOutcome()}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  )
}
