import { Web3Provider } from '@ethersproject/providers';
import { useConnectWidget } from "./useConnectWidget";
import { useWalletWidget } from "./useWalletWidget";
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useSwapWidget } from "./useSwapWidget";
import { useBridgeWidget } from "./useBridgeWidget";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { WidgetContext, hideAllWidgets } from "./WidgetProvider";
import { ImtblWidgets } from "./ImtblWidgets";
import { Networks, Passport } from '@imtbl/passport';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Config } from '@imtbl/core-sdk';
import { Checkout } from '@imtbl/checkout-sdk';
import { passportModuleConfig } from './Marketplace';



export const MainPage = ({passport}: any) => {
  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  
  const checkout = new Checkout({baseConfig: {environment: Environment.SANDBOX}});

  // This is used to create the Passport zkEVM provider in Marketplace and inject provider into the widgets
  // useEffect(() => {
  //   if(passport) {
  //     // @ts-ignore TODO ID-926 Remove once method is public
  //     const passportZkEVMProvider = passport?.connectEvm();
  //     // console.log(await passportZkEVMProvider.request({method: 'eth_accounts', params: []}))
  //     setWeb3Provider(new Web3Provider(passportZkEVMProvider));
  //   }
  // }, [passport]);


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
    setShowWidgets({...hideAllWidgets, showConnect: {show: true, data: {}}});
  }, [setShowWidgets])

  const openWalletWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showWallet: {show: true, data: {}}});
  }, [setShowWidgets])

  const openSwapWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showSwap: {show: true, data: {}}});
  }, [setShowWidgets])

  const openBridgeWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showBridge: {show: true, data: {}}});
  }, [setShowWidgets])

  const handleBuyClick = () => {
    alert("you can buy now");
  }

  const cardKeys = useMemo(() => [140142,241916,345112,205410],[]);

  const logout = useCallback(async () => {
    console.log('logout clicked')
    await passport.logout();
  },[passport])

  return(
    <Box sx={{minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6'}}>
      <Box sx={{width: '100%',padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}>
        <Heading>Immutable Checkout Marketplace</Heading>
        <Heading>Proof Of Concept</Heading>
        </Box>
        {!web3Provider && (
        <Button onClick={openConnectWidget}>Connect Wallet</Button>
      )}
      {web3Provider && <Button onClick={openWalletWidget}>My Wallet</Button>}
      {web3Provider && <Button onClick={openSwapWidget}>Open Swap</Button>}
      {/* 
      <Button onClick={openBridgeWidget}>Open Bridge</Button> */}
      {passport && web3Provider && (web3Provider.provider as any)?.isPassport && <Button onClick={logout}>Passport Logout</Button>}
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
            passport={passport}
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
