/* eslint-disable */ 
import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Box, Button, MenuItem, VerticalMenu } from "@biom3/react";
import { CheckoutWidgets, ConnectEventType, ConnectReact, ConnectionFailed, ConnectionSuccess, IMTBLWidgetEvents, OrchestrationEventType, WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import SwapUI from './components/ui/swap/swap';
import WalletUI from './components/ui/wallet/wallet';
import BridgeUI from './components/ui/bridge/bridge';

function App() {

  const [showConnect, setShowConnect] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);
  const [route, setRoute] = useState<String>('home');

  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const openConnectWidget = useCallback(() => {
    setShowConnect(!showConnect);
  }, [showConnect])

  const clickSwap = useCallback(() => {
    setRoute('swap')
  }, [])

  const clickHome = useCallback(() => {
    setRoute('home')
  }, [])

  const clickBridge = useCallback(() => {
    setRoute('bridge')

  }, [])

  const clickBalance = useCallback(() => {
    setRoute('wallet')

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
          <Box sx={{padding: '18px', flexGrow: 1}} onClick={clickHome}>
            <img src="images/logo.png" />
          </Box>
          <Box sx={{padding: '16px'}}>
            <Button onClick={openConnectWidget}>Connect Wallet</Button>
          </Box>
        </Box>
        <Box sx={{flexGrow: 1}}>
          <Box sx={{display: 'flex', flexDirection:'row'}}>
            <Box sx={{paddingLeft: '16px'}}>
            <VerticalMenu sx={{marginTop: '16px'}}>
              <MenuItem onClick={clickBalance}>
                <MenuItem.Label>Balances</MenuItem.Label>
                <MenuItem.Icon icon="Tokens" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Buy</MenuItem.Label>
                <MenuItem.Icon icon="Dollar" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Offramp</MenuItem.Label>
                <MenuItem.Icon icon="Dollar" />
              </MenuItem>
              <MenuItem onClick={clickSwap}>
                <MenuItem.Label>Swap</MenuItem.Label>
                <MenuItem.Icon icon="Exchange" />
              </MenuItem>
              <MenuItem onClick={clickBridge}>
                <MenuItem.Label>Bridge</MenuItem.Label>
                <MenuItem.Icon icon="Swap" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Transfer</MenuItem.Label>
                <MenuItem.Icon icon="Minting" />
              </MenuItem>
            </VerticalMenu> 
            <VerticalMenu sx={{marginTop: '16px'}}>
              <MenuItem onClick={clickBalance}>
                <MenuItem.Label>Items</MenuItem.Label>
                <MenuItem.Icon icon="Dashboard" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Transfer</MenuItem.Label>
                <MenuItem.Icon icon="Minting" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Consolidate</MenuItem.Label>
                <MenuItem.Icon icon="Sparkle" />
              </MenuItem>
            </VerticalMenu> 
            <VerticalMenu sx={{marginTop: '16px'}}>
              <MenuItem onClick={clickBalance}>
                <MenuItem.Label>Rewards</MenuItem.Label>
                <MenuItem.Icon icon="Trophy" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Stake</MenuItem.Label>
                <MenuItem.Icon icon="Sword" />
              </MenuItem>
              <MenuItem>
                <MenuItem.Label>Points</MenuItem.Label>
                <MenuItem.Icon icon="ImxRewards" />
              </MenuItem>
            </VerticalMenu> 
            </Box>
            <Box sx={{backgroundColor: '#1F1F1F', flexGrow:1}}>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Box sx={{marginTop: '16px'}}>
                {route === 'swap' && (
                  <SwapUI />
                )}
                {route === 'bridge' && (
                  <BridgeUI />
                )}
                {route === 'wallet' && (
                  <WalletUI />
                )}
                </Box>
              </Box>  
            </Box>    
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
