import { Web3Provider } from '@ethersproject/providers';
import { useConnectWidget } from "./useConnectWidget";
import { useWalletWidget } from "./useWalletWidget";
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useSwapWidget } from "./useSwapWidget";
import { useBridgeWidget } from "./useBridgeWidget";
import { useCallback, useContext, useMemo, useState } from "react";
import { WidgetContext, hideAllWidgets } from "./WidgetProvider";
import { ImtblWidgets } from "./ImtblWidgets";

export const MainPage = () => {
  
  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|null>(null);

  // widget context state for showing/hiding widgets
  const {showWidgets: {
    showConnect,
    showWallet,
    showSwap,
    showBridge
  }, setShowWidgets} = useContext(WidgetContext);

  // hooks for each widget set up event listeners and orchestration logic
  useConnectWidget(setWeb3Provider);
  useWalletWidget(setWeb3Provider);
  useSwapWidget(setDoneSwap);
  useBridgeWidget();

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showConnect: true});
  }, [setShowWidgets])

  const openWalletWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showWallet: true});
  }, [setShowWidgets])

  const handleBuyClick = () => {
    alert("you can buy now");
  }

  const cardKeys = useMemo(() => [140142,241916,345112,205410],[]);

  return(
    <Box sx={{minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6'}}>
      <Box sx={{width: '100%',padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading>Immutable Checkout Marketplace</Heading>
        {!web3Provider && (
        <Button onClick={openConnectWidget}>Connect Wallet</Button>
      )}
      {web3Provider && (
        <Button onClick={openWalletWidget}>My Wallet</Button>
      )}
      </Box>
      <Box sx={{paddingX: 'base.spacing.x4'}}>
        <GridBox minColumnWidth="40%">
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 'base.spacing.x4', flexWrap: 'wrap'}}>
              {cardKeys.map((val) => (
                <Box key={val} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <Card sx={{width: '240px', marginBottom: 'base.spacing.x2'}}>
                  <Card.Title>Illuvitars</Card.Title>
                  <Card.Caption>Illuvium</Card.Caption>
                  <Card.FramedImage imageUrl="https://web-illuvium-static.s3.us-east-2.amazonaws.com/img/illuvitars/illuvitars_marketplace_icon.png" />
                  <Card.AssetImage imageUrl={`https://api.illuvium-game.io/gamedata/illuvitars/portrait/${val}/render`} />
                  </Card>
                  <Button variant={doneSwap ? "primary" : "tertiary"} disabled={!doneSwap} onClick={handleBuyClick}>Buy</Button>
                </Box>
              ))}
          </Box>
          <ImtblWidgets 
            web3Provider={web3Provider} 
            showConnect={showConnect} 
            showWallet={showWallet} 
            showSwap={showSwap} 
            showBridge={showBridge} 
          />
        </GridBox>
      </Box>
    </Box>
  );
}
