import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Passport } from '@imtbl/passport';
import { passportConfig } from './passportConfig';
import {  WidgetsFactory } from '@imtbl/checkout-widgets';
import { BridgeEventType, Checkout, ConnectEventType, ConnectionFailed, ConnectionSuccess, OrchestrationEventType, RequestBridgeEvent, WalletEventType, WalletNetworkSwitchEvent, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export const MainPage = () => {
  const passport = useMemo(() => new Passport(passportConfig), [passportConfig]);

  const checkout = useMemo(() => new Checkout({
    baseConfig: {environment: Environment.SANDBOX},
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true
  }), []);
  const widgetsFactory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);

  const connectWidget = useMemo(() => widgetsFactory.create(WidgetType.CONNECT, {passport}), [widgetsFactory]);
  const walletWidget = useMemo(() => widgetsFactory.create(WidgetType.WALLET, {passport}), [widgetsFactory]);
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE, {passport}), [widgetsFactory]);
  
  connectWidget.on(ConnectEventType.CLOSE_WIDGET, () => {connectWidget.destroy()});
  walletWidget.on(WalletEventType.CLOSE_WIDGET, () => {walletWidget.destroy()});
  bridgeWidget.on(BridgeEventType.CLOSE_WIDGET, () => {bridgeWidget.destroy()});

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);

  useEffect(() => {
    connectWidget.on(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.on(ConnectEventType.SUCCESS, (eventData: ConnectionSuccess) => {
      walletWidget.update({params: {web3Provider: eventData.provider}})
      walletWidget.mount('widget-target')
      setWeb3Provider(eventData.provider);
    });
  }, [connectWidget, walletWidget]);
  
  useEffect(() => {
    walletWidget.on(WalletEventType.NETWORK_SWITCH, (eventData: WalletNetworkSwitchEvent) => {
      bridgeWidget.update({params: {web3Provider: eventData.provider}})
      setWeb3Provider(eventData.provider)
    })
    walletWidget.on(OrchestrationEventType.REQUEST_BRIDGE, (eventData: RequestBridgeEvent) => {
      walletWidget.unmount();
      bridgeWidget.update({params: {fromContractAddress: eventData.tokenAddress, amount: eventData.amount}})
      bridgeWidget.mount('widget-target');
    })
  }, [walletWidget, bridgeWidget]);

  const setPassportProvider = useCallback(() => {
    if(passport) {
      const passportzkEVMProvider = passport?.connectEvm();
      setWeb3Provider(new Web3Provider(passportzkEVMProvider));
    }
  }, [passport]);

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    connectWidget.mount('widget-target');
  }, [connectWidget])

  const openWalletWidget = useCallback(() => {
    walletWidget.mount('widget-target');
  }, [walletWidget])

  const openBridgeWidget = useCallback(() => {
    bridgeWidget.mount('widget-target')
  }, [bridgeWidget])

  const handleBuyClick = () => {
    alert("you can buy now");
  }

  const cardKeys = useMemo(() => [140142,241916,345112,205410],[]);

  const logout = useCallback(async () => {
    await passport.logout();
  },[passport])

  return(
    <Box sx={{minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6'}}>
      <Box sx={{width: '100%',padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading>Immutable Checkout Marketplace</Heading>
        <Button onClick={openConnectWidget}>Connect Wallet</Button>
        <Button onClick={openWalletWidget}>Open Wallet</Button>
      <Button onClick={openBridgeWidget}>Open Bridge</Button>
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
          <div id="widget-target"></div>
        </GridBox>  
      </Box>
    </Box>
  );
}
