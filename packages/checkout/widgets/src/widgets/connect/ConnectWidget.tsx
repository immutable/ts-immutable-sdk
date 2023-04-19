import { BiomeThemeProvider, Button, Body, Box } from '@biom3/react'
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web'
import { WidgetTheme } from '@imtbl/checkout-ui-types'
import { sendConnectFailedEvent, sendConnectSuccessEvent} from './ConnectWidgetEvents'
import { ConnectWallet } from './components/connect-wallet/ConnectWallet';
import { OtherWallets } from './components/other-wallets/OtherWallets';
import { ChooseNetwork } from './components/choose-network/ChooseNetwork';
import { useEffect, useReducer } from 'react'
import { 
  ActiveStyle, 
  BackButtonStyle, 
  ConnectWidgetStyle, 
  InactiveStyle, 
  WidgetHeaderStyle 
} from './ConnectStyles'
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens'
<<<<<<< main
import { ConnectActions, ConnectContext, connectReducer, initialConnectState } from './context/ConnectContext'
import { initialViewState, ViewActions, ViewContext, viewReducer } from '../../context/ViewContext';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';
=======
import { Actions, ConnectContext, connectReducer, initialState } from './context/ConnectContext'
import { Layout } from '../../components/Layout';

export enum ConnectWidgetViews {
  CONNECT_WALLET = "CONNECT_WALLET",
  PASSPORT = "PASSPORT",
  OTHER_WALLETS = "OTHER_WALLETS",
  CHOOSE_NETWORKS = "CHOOSE_NETWORKS",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}
>>>>>>> WT-1252 Reusable Layout Component

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

  const goBack = async () => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK
      }
    });
  }

  return (
    <BiomeThemeProvider theme={{base: biomeTheme}}>
<<<<<<< main
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        <ConnectContext.Provider value={{ connectState, connectDispatch }}>
=======
      <ConnectContext.Provider value={{ state: state, dispatch: dispatch }}>
        <Layout header={<>Header</>} footer={<>Footer</>}>
>>>>>>> WT-1252 Reusable Layout Component
          <Box sx={ConnectWidgetStyle}>
            <Box sx={WidgetHeaderStyle}>
              <Box sx={BackButtonStyle}>
              <Button 
                testId='back-button'
<<<<<<< main
                sx={(viewState.view.type === ConnectWidgetViews.CONNECT_WALLET) ? InactiveStyle : ActiveStyle}
=======
                sx={(currentView === ConnectWidgetViews.CONNECT_WALLET) ? InactiveStyle : ActiveStyle}
>>>>>>> WT-1252 Reusable Layout Component
                onClick={() => goBack()}>Back</Button>
              </Box>  
              <Box>
                <Button 
                testId='close-button'
<<<<<<< main
                onClick={() => 
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: {
                        type: ConnectWidgetViews.FAIL,
                        error: new Error('User closed the connect widget')
                      }
                    }
                  })                
                }>x</Button>
              </Box>
            </Box>       
            <Box 
              testId="connect-wallet" 
              sx={(viewState.view.type === ConnectWidgetViews.CONNECT_WALLET) ? ActiveStyle : InactiveStyle}
            >
              <ConnectWallet />
            </Box>
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
=======
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
>>>>>>> WT-1252 Reusable Layout Component
              <Body style={{color:'#FFF'}}>User did not connect</Body>
            </Box>
            <Box 
              testId="success"
<<<<<<< main
              sx={(viewState.view.type === ConnectWidgetViews.SUCCESS) ? ActiveStyle : InactiveStyle}
            >
              <Body style={{color:'#FFF'}}>User connected</Body>
            </Box>
          </Box>
        </ConnectContext.Provider>
      </ViewContext.Provider>
=======
              sx={(currentView === ConnectWidgetViews.SUCCESS) ? ActiveStyle : InactiveStyle}>
              <Body style={{color:'#FFF'}}>User connected</Body>
            </Box>
          </Box>
        </Layout>
      </ConnectContext.Provider>
>>>>>>> WT-1252 Reusable Layout Component
    </BiomeThemeProvider>
  )
}
