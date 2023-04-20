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
import { ConnectAWallet } from './components/connect-a-wallet/ConnectAWallet';
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

  return (
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
          {/** We want to move towards this pattern with each view being conditionally
           * rendered based upon the current viewState
           * These views are components which are made up of a layout and content components
           * and handle the behaviour of the view 
           */}
          {viewState.view.type === ConnectWidgetViews.CONNECT_WALLET && 
            <ConnectAWallet />
          }
          <Box 
            testId="other-wallets" 
            sx={(viewState.view.type === ConnectWidgetViews.OTHER_WALLETS) ? ActiveStyle : InactiveStyle}
          >
            <OtherWallets />
          </Box>
          <Box 
            testId="choose-networks" 
            sx={(viewState.view.type === ConnectWidgetViews.CHOOSE_NETWORKS) ? ActiveStyle : InactiveStyle}
          >
            <ChooseNetwork />
          </Box>
          <Box 
            testId="fail"
            sx={(viewState.view.type === ConnectWidgetViews.FAIL) ? ActiveStyle : InactiveStyle}
          >
            <Body style={{color:'#FFF'}}>User did not connect</Body>
          </Box>
          <Box 
            testId="success"
            sx={(viewState.view.type === ConnectWidgetViews.SUCCESS) ? ActiveStyle : InactiveStyle}
          >
            <Body style={{color:'#FFF'}}>User connected</Body>
          </Box>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeThemeProvider>
  )
}
