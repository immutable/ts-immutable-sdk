import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Passport } from '@imtbl/passport';
import { passportConfig } from './passportConfig';
import {  WidgetsFactory } from '@imtbl/checkout-widgets';
import { Checkout,
  ConnectEventType,
  ConnectionSuccess, OrchestrationEventType,
  RequestBridgeEvent, BridgeEventType,
  RequestOnrampEvent, OnRampEventType,
  RequestSwapEvent, SwapEventType,
  WalletEventType,
  WalletNetworkSwitchEvent,
  WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
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
  const swapWidget = useMemo(() => widgetsFactory.create(WidgetType.SWAP, {passport}), [widgetsFactory]);
  const onRampWidget = useMemo(() => widgetsFactory.create(WidgetType.ONRAMP, {passport}), [widgetsFactory]);

  connectWidget.on(ConnectEventType.CLOSE_WIDGET, () => {connectWidget.destroy()});
  walletWidget.on(WalletEventType.CLOSE_WIDGET, () => {walletWidget.destroy()});
  bridgeWidget.on(BridgeEventType.CLOSE_WIDGET, () => {bridgeWidget.destroy()});
  swapWidget.on(SwapEventType.CLOSE_WIDGET, () => swapWidget.destroy());
  onRampWidget.on(OnRampEventType.CLOSE_WIDGET, () => {onRampWidget.destroy()});

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);

  useEffect(() => {
    connectWidget.on(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.on(ConnectEventType.SUCCESS, (eventData: ConnectionSuccess) => {
      setWeb3Provider(eventData.provider);
    });
    walletWidget.on(WalletEventType.NETWORK_SWITCH, (eventData: WalletNetworkSwitchEvent) => {
      setWeb3Provider(eventData.provider)
    })
  }, [connectWidget, walletWidget]);

  useEffect(() => {
    walletWidget.update({params: {web3Provider}})
  }, [web3Provider])


  // Orchestration
  useEffect(() => {
    walletWidget.on(OrchestrationEventType.REQUEST_BRIDGE, (eventData: RequestBridgeEvent) => {
      walletWidget.unmount();
      bridgeWidget.update({params: {fromContractAddress: eventData.tokenAddress, amount: eventData.amount, web3Provider}})
      bridgeWidget.mount('widget-target');
    })
    walletWidget.on(OrchestrationEventType.REQUEST_SWAP, (eventData: RequestSwapEvent) => {
      walletWidget.unmount();
      swapWidget.update({params: {fromContractAddress: eventData.fromTokenAddress, amount: eventData.amount, web3Provider}})
      swapWidget.mount('widget-target');
    })
    walletWidget.on(OrchestrationEventType.REQUEST_ONRAMP, (eventData: RequestOnrampEvent) => {
      walletWidget.unmount();
      onRampWidget.update({params: {contractAddress: eventData.tokenAddress, amount: eventData.amount, web3Provider}})
      onRampWidget.mount('widget-target');
    })
  }, [walletWidget, bridgeWidget, onRampWidget, swapWidget, web3Provider]);

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

  const openSwapWidget = useCallback(() => {
    swapWidget.mount('widget-target')
  }, [bridgeWidget])

  const openOnRampWidget = useCallback(() => {
    onRampWidget.mount('widget-target')
  }, [onRampWidget])

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
        <Box sx={{padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'base.spacing.x6', alignItems: 'center'}}>
          <Button onClick={openConnectWidget}>Connect</Button>
          <Button onClick={openWalletWidget}>Wallet</Button>
          <Button onClick={openSwapWidget}>Swap</Button>
          <Button onClick={openBridgeWidget}>Bridge</Button>
          <Button onClick={openOnRampWidget}>On-ramp</Button>
      </Box>
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
