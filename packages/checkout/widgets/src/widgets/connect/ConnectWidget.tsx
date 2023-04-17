import { BiomeThemeProvider, Button, Body, Box } from '@biom3/react'
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web'
import { WidgetTheme } from '@imtbl/checkout-ui-types'
import { sendConnectFailedEvent, sendConnectSuccessEvent} from './ConnectWidgetEvents'
import { ConnectWallet } from './components/connect-wallet/ConnectWallet';
import { OtherWallets } from './components/other-wallets/OtherWallets';
import { ChooseNetwork } from './components/choose-network/ChooseNetwork';
import { useEffect, useReducer, useState } from 'react'
import { 
  ActiveStyle, 
  BackButtonStyle, 
  ConnectWidgetStyle, 
  InactiveStyle, 
  WidgetHeaderStyle 
} from './ConnectStyles'
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens'
import { Actions, ConnectContext, connectReducer, initialState } from './context/ConnectContext'

export enum ConnectWidgetViews {
  CONNECT_WALLET = "CONNECT_WALLET",
  PASSPORT = "PASSPORT",
  OTHER_WALLETS = "OTHER_WALLETS",
  CHOOSE_NETWORKS = "CHOOSE_NETWORKS",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export interface ConnectWidgetProps {
  params: ConnectWidgetParams;
  theme: WidgetTheme;
}

export interface ConnectWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function ConnectWidget(props:ConnectWidgetProps) {
  const [state, dispatch] = useReducer(connectReducer, initialState);

  const { theme } = props;

  const [currentView, setView] = useState(ConnectWidgetViews.CONNECT_WALLET)

  const biomeTheme:BaseTokens = (theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()) ? onLightBase : onDarkBase

  useEffect(() => {
    dispatch({
      payload: {
        type: Actions.SET_CHECKOUT,
        checkout: new Checkout(),
      },
    });
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateView = async (view:ConnectWidgetViews, err?:any) => {
    setView(view)
    if (view === ConnectWidgetViews.SUCCESS) {
      sendConnectSuccessEvent(ConnectionProviders.METAMASK)
      return
    }
    if (view === ConnectWidgetViews.FAIL) {
      sendConnectFailedEvent(err.message);
      return
    }
  }

  const goBack = async () => {
    if ([ConnectWidgetViews.OTHER_WALLETS, ConnectWidgetViews.PASSPORT].includes(currentView)) {
      setView(ConnectWidgetViews.CONNECT_WALLET)
      return
    }
    if ([ConnectWidgetViews.CHOOSE_NETWORKS].includes(currentView)) {
      setView(ConnectWidgetViews.OTHER_WALLETS)
      return
    }
    if ([ConnectWidgetViews.SUCCESS, ConnectWidgetViews.FAIL].includes(currentView)) {
      setView(ConnectWidgetViews.CONNECT_WALLET)
      return
    }
  }

  return (
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ConnectContext.Provider value={{ state: state, dispatch: dispatch }}>
        <Box sx={ConnectWidgetStyle}>
          <Box sx={WidgetHeaderStyle}>
            <Box sx={BackButtonStyle}>
            <Button 
              testId='back-button'
              sx={(currentView === ConnectWidgetViews.CONNECT_WALLET) ? InactiveStyle : ActiveStyle}
              onClick={() => goBack()}>Back</Button>
            </Box>  
            <Box>
              <Button 
              testId='close-button'
              onClick={() => updateView(ConnectWidgetViews.FAIL, new Error("User closed the connect widget"))}>x</Button>
            </Box>
          </Box>       

          <Box 
            testId="connect-wallet" 
            sx={(currentView === ConnectWidgetViews.CONNECT_WALLET) ? ActiveStyle : InactiveStyle}>
            <ConnectWallet updateView={updateView} />
          </Box>
          <Box 
            testId="other-wallets" 
            sx={(currentView === ConnectWidgetViews.OTHER_WALLETS) ? ActiveStyle : InactiveStyle}>
            <OtherWallets updateView={updateView} />
          </Box>
          <Box 
            testId="choose-networks" 
            sx={(currentView === ConnectWidgetViews.CHOOSE_NETWORKS) ? ActiveStyle : InactiveStyle}>
            <ChooseNetwork updateView={updateView} />
          </Box>
          <Box 
            testId="fail"
            sx={(currentView === ConnectWidgetViews.FAIL) ? ActiveStyle : InactiveStyle}>
            <Body style={{color:'#FFF'}}>User did not connect</Body>
          </Box>
          <Box 
            testId="success"
            sx={(currentView === ConnectWidgetViews.SUCCESS) ? ActiveStyle : InactiveStyle}>
            <Body style={{color:'#FFF'}}>User connected</Body>
          </Box>
        </Box>
      </ConnectContext.Provider>
    </BiomeThemeProvider>
  )
}
