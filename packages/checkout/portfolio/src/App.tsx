/* eslint-disable */ 
import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Box, Button, MenuItem, VerticalMenu } from "@biom3/react";
import { CheckoutWidgets, ConnectEventType, ConnectReact, ConnectionFailed, ConnectionSuccess, IMTBLWidgetEvents, OrchestrationEventType, WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { useNavigate } from 'react-router-dom';

function App() {

  const [showConnect, setShowConnect] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);

  const navigate = useNavigate();

  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const openConnectWidget = useCallback(() => {
    setShowConnect(!showConnect);
  }, [showConnect])

  const clickSwap = useCallback(() => {
    navigate("/swap")
    console.log('clickSwap')
  }, [])

  const clickBridge = useCallback(() => {
    navigate("/bridge")
    console.log('clickBridge')
  }, [])

  const clickBalance = useCallback(() => {
    navigate("/balance")
    console.log('clickBalance')
  }, [])
  

  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          setWeb3Provider(eventData.provider);
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed;
          console.log(eventData.reason);
          break;
        }
        case ConnectEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as ConnectionFailed;
          setShowConnect(false);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;

    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
      handleConnectEvent
    );
    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    };
  }, []);

  return (
    <div>
      <Box sx={{display: 'flex', flexDirection:'column', height: '100vh'}}>
        <Box sx={{minWidth: '100vw', minHeight: '80px', backgroundColor: '#161616', display: 'flex'}}>
          <Box sx={{padding: '18px', flexGrow: 1}}>
            <img src="images/logo.png" />
          </Box>
          <Box sx={{padding: '16px'}}>
            <Button onClick={openConnectWidget}>Connect Wallet</Button>
          </Box>
        </Box>
        <Box sx={{width: '287px', backgroundColor: '#161616', flexGrow: 1}}>
          <Box sx={{display: 'flex', flexDirection:'row'}}>
            <VerticalMenu>
              <MenuItem onClick={clickBalance}>
                <MenuItem.Label>Balances</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Buy</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Offramp</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
              <MenuItem onClick={clickSwap}>
                <MenuItem.Label>Swap</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
              <MenuItem onClick={clickBridge}>
                <MenuItem.Label>Bridge</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Transfer</MenuItem.Label>
                <MenuItem.Icon icon="AirDrop" />
              </MenuItem>
            </VerticalMenu> 
            <Box sx={{backgroundColor: '#1F1F1F'}}></Box>    
          </Box>
          
        </Box>
        {showConnect && (<Box sx={{position: 'absolute', right: '16px', top: '96px'}}>
          <ConnectReact />
        </Box>)}
      </Box>
    </div>
  );
}

export default App;
