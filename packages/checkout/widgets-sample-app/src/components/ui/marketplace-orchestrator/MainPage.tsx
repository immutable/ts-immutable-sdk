import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Passport } from '@imtbl/passport';
import { passportConfig } from './passportConfig';
import { Bridge, Connect, WidgetsFactory } from '@imtbl/checkout-widgets';
import { Checkout, ConnectEventType, OrchestrationEventType, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
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
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE, {}), [widgetsFactory]);

  useEffect(() => {
    connectWidget.on(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.on(ConnectEventType.SUCCESS, (data: any) => {
      setWeb3Provider(data.provider)
    });
    connectWidget.on(ConnectEventType.FAILURE, (data) => console.log('Connect Widget failure event', data));
  }, [connectWidget])

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider|undefined>(undefined);

  
  // const [passportInstance, setpassportInstance]= useState<Passport|undefined>(undefined);

  const setPassportProvider = useCallback(() => {
    if(passport) {
      const passportzkEVMProvider = passport?.connectEvm();
      setWeb3Provider(new Web3Provider(passportzkEVMProvider));
    }
  }, [passport]);

  // const passPassportInstance = useCallback(() => {
  //   setpassportInstance(passport)
  // }, [passport]);
  
  // const removePassportInstance = useCallback(() => {
  //   setpassportInstance(undefined);
  // }, []);
  
  // // widget context state for showing/hiding widgets
  // const {showWidgets: {
  //   showConnect,
  //   showWallet,
  //   showSwap,
  //   showBridge,
  //   showOnRamp
  // }, setShowWidgets} = useContext(WidgetContext);

  // // hooks for each widget set up event listeners and orchestration logic
  // useConnectWidget(setWeb3Provider);
  // useWalletWidget(setWeb3Provider);
  // useSwapWidget(setDoneSwap);
  // useBridgeWidget();
  // useOnRampWidget()

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    connectWidget.mount('widget-target');
  }, [connectWidget])

  // const openWalletWidget = useCallback(() => {
  //   setShowWidgets({...hideAllWidgets, showWallet: {show: true, data: {}}});
  // }, [setShowWidgets])

  // const openSwapWidget = useCallback(() => {
  //   setShowWidgets({...hideAllWidgets, showSwap: {show: true, data: {}}});
  // }, [setShowWidgets])

  const openBridgeWidget = useCallback(() => {
    bridgeWidget.mount('widget-target')
  }, [bridgeWidget])

  // const openOnRampWidget = useCallback(() => {
  //   setShowWidgets({...hideAllWidgets, showOnRamp: {show: true, data: {}}});
  // }, [setShowWidgets])

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
        {!web3Provider && (
        <Button onClick={openConnectWidget}>Connect Wallet</Button>
      )}
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
