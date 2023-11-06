import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Passport } from '@imtbl/passport';
import { passportConfig } from './passportConfig';
import {  WidgetsFactory } from '@imtbl/checkout-widgets';
import { Checkout,
  ConnectEventType,
  ConnectionSuccess, 
  OrchestrationEventType,
  RequestBridgeEvent, 
  BridgeEventType,
  RequestOnrampEvent, 
  OnRampEventType,
  RequestSwapEvent, 
  SwapEventType,
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
    isOnRampEnabled: true,
    passport,
  }), []);
  const widgetsFactory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);

  const connectWidget = useMemo(() => widgetsFactory.create(WidgetType.CONNECT, {}), [widgetsFactory]);
  const walletWidget = useMemo(() => widgetsFactory.create(WidgetType.WALLET, {}), [widgetsFactory]);
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE, {}), [widgetsFactory]);
  const swapWidget = useMemo(() => widgetsFactory.create(WidgetType.SWAP, {}), [widgetsFactory]);
  const onRampWidget = useMemo(() => widgetsFactory.create(WidgetType.ONRAMP, {}), [widgetsFactory]);

  connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => {connectWidget.unmount()});
  walletWidget.addListener(WalletEventType.CLOSE_WIDGET, () => {walletWidget.unmount()});
  bridgeWidget.addListener(BridgeEventType.CLOSE_WIDGET, () => {bridgeWidget.unmount()});
  swapWidget.addListener(SwapEventType.CLOSE_WIDGET, () => swapWidget.unmount());
  onRampWidget.addListener(OnRampEventType.CLOSE_WIDGET, () => {onRampWidget.unmount()});

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);

  useEffect(() => {
    connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.addListener(ConnectEventType.SUCCESS, (eventData: ConnectionSuccess) => {
      setWeb3Provider(eventData.provider);
    });
    walletWidget.addListener(WalletEventType.NETWORK_SWITCH, (eventData: WalletNetworkSwitchEvent) => {
      setWeb3Provider(eventData.provider)
    })
  }, [connectWidget, walletWidget]);

  // Orchestration
  useEffect(() => {
    walletWidget.addListener(OrchestrationEventType.REQUEST_BRIDGE, (eventData: RequestBridgeEvent) => {
      walletWidget.unmount();
      bridgeWidget.mount('bridge-target', {fromContractAddress: eventData.tokenAddress, amount: eventData.amount, web3Provider});
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_SWAP, (data: RequestSwapEvent) => {
      walletWidget.unmount();
      swapWidget.mount('swap-target', {fromContractAddress: data.fromTokenAddress, amount: data.amount, web3Provider});
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: RequestOnrampEvent) => {
      walletWidget.unmount();
      onRampWidget.mount('onramp-target', {contractAddress: data.tokenAddress, amount: data.amount, web3Provider});
    })
  }, [walletWidget, bridgeWidget, onRampWidget, swapWidget, web3Provider]);

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    connectWidget.mount('connect-target', {});
  }, [connectWidget])

  const openWalletWidget = useCallback(() => {
    walletWidget.mount('wallet-target', {});
  }, [walletWidget])

  const openBridgeWidget = useCallback(() => {
    bridgeWidget.mount('bridge-target', {})
  }, [bridgeWidget])

  const openSwapWidget = useCallback(() => {
    swapWidget.mount('swap-target', {})
  }, [swapWidget])

  const openOnRampWidget = useCallback(() => {
    onRampWidget.mount('onramp-target', {})
  }, [onRampWidget, web3Provider])

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
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 'base.spacing.x3', flexWrap: 'wrap'}}>
        <div id="connect-target"></div>
          <div id="wallet-target"></div>
          <div id="swap-target"></div>
          <div id="bridge-target"></div>
          <div id="onramp-target"></div>
          {/* <Box sx={{display: 'flex', flexDirection: 'row', gap: 'base.spacing.x4', flexWrap: 'wrap'}}>
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
          </Box> */}
      </Box>
    </Box>
  );
}
