import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import {
  Checkout,
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
  WalletNetworkSwitch,
  WidgetTheme, WidgetType, ProviderEventType, ProviderUpdated, WidgetConfiguration, WidgetProperties
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { passport } from './passport';
import { LanguageSelector } from './LanguageSelector';

// Create one instance of Checkout and inject Passport
const checkout = new Checkout({
  baseConfig: {
    environment: Environment.SANDBOX,
    publishableKey: 'pk_imapik-test-pCHFU0GpQImZx9UzSnU3',
  },
  passport,
})

export const MainPage = () => {
  const widgetsFactory = useMemo(() => new WidgetsFactory(
    checkout,
    {
      theme: WidgetTheme.DARK,
      walletConnect: {
        projectId: '938b553484e344b1e0b4bb80edf8c362',
        metadata: {
          name: 'Marketplace Orchestrator',
          description: '',
          url: 'http://localhost:3000/marketplace-orchestrator',
          icons: []
        }
      }
    }), [checkout]);

  const connectWidget = useMemo(() => widgetsFactory.create(WidgetType.CONNECT), [widgetsFactory]);
  const walletWidget = useMemo(() => widgetsFactory.create(WidgetType.WALLET), [widgetsFactory]);
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE), [widgetsFactory]);
  const swapWidget = useMemo(() => widgetsFactory.create(WidgetType.SWAP), [widgetsFactory]);
  const onRampWidget = useMemo(() => widgetsFactory.create(WidgetType.ONRAMP), [widgetsFactory]);

  connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => { connectWidget.unmount() });
  walletWidget.addListener(WalletEventType.CLOSE_WIDGET, () => { walletWidget.unmount() });
  bridgeWidget.addListener(BridgeEventType.CLOSE_WIDGET, () => { bridgeWidget.unmount() });
  swapWidget.addListener(SwapEventType.CLOSE_WIDGET, () => swapWidget.unmount());
  onRampWidget.addListener(OnRampEventType.CLOSE_WIDGET, () => { onRampWidget.unmount() });

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(undefined);

  useEffect(() => {
    connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.addListener(ConnectEventType.SUCCESS, (eventData: ConnectionSuccess) => {
      setWeb3Provider(eventData.provider);
    });
    walletWidget.addListener(WalletEventType.NETWORK_SWITCH, (eventData: WalletNetworkSwitch) => {
      setWeb3Provider(eventData.provider)
    });
    swapWidget.addListener(ProviderEventType.PROVIDER_UPDATED, (data: ProviderUpdated) => {
      console.log("swap widget provider updated", data)
    });
  }, [connectWidget, walletWidget, swapWidget]);

  // Orchestration
  useEffect(() => {
    walletWidget.addListener(OrchestrationEventType.REQUEST_BRIDGE, (eventData: RequestBridgeEvent) => {
      walletWidget.unmount();
      bridgeWidget.mount('bridge-target', { tokenAddress: eventData.tokenAddress, amount: eventData.amount });
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_SWAP, (data: RequestSwapEvent) => {
      walletWidget.unmount();
      swapWidget.mount('swap-target', { fromTokenAddress: data.fromTokenAddress, amount: data.amount });
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: RequestOnrampEvent) => {
      walletWidget.unmount();
      onRampWidget.mount('onramp-target', { tokenAddress: data.tokenAddress, amount: data.amount });
    })
    bridgeWidget.addListener(OrchestrationEventType.REQUEST_SWAP, () => {
      bridgeWidget.unmount();
      swapWidget.mount('swap-target');
    });
    bridgeWidget.addListener(OrchestrationEventType.REQUEST_ONRAMP, () => {
      bridgeWidget.unmount();
      onRampWidget.mount('onramp-target');
    });
  }, [walletWidget, bridgeWidget, onRampWidget, swapWidget]);

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    connectWidget.mount('connect-target');
  }, [connectWidget])

  const openWalletWidget = useCallback(() => {
    walletWidget.mount('wallet-target');
  }, [walletWidget])

  const openBridgeWidget = useCallback(() => {
    bridgeWidget.mount('bridge-target')
  }, [bridgeWidget])

  const openSwapWidget = useCallback(() => {
    swapWidget.mount('swap-target')
  }, [swapWidget])

  const openOnRampWidget = useCallback(() => {
    onRampWidget.mount('onramp-target')
  }, [onRampWidget, web3Provider])

  const logout = useCallback(async () => {
    await passport.logout();
  }, [passport])

  const updateLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
    const languageUpdate: WidgetProperties<any> = { config: { language } } as WidgetProperties<any>;
    connectWidget.update(languageUpdate);
    walletWidget.update(languageUpdate);
    bridgeWidget.update(languageUpdate);
    swapWidget.update(languageUpdate);
    onRampWidget.update(languageUpdate);
  }, [onRampWidget, web3Provider])

  return (
    <Box sx={{ minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6' }}>
      <Box sx={{ width: '100%', padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading>Immutable Checkout Marketplace</Heading>
        <Box sx={{ padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'base.spacing.x6', alignItems: 'center' }}>
          <Button onClick={openConnectWidget}>Connect</Button>
          <Button onClick={openWalletWidget}>Wallet</Button>
          <Button onClick={openSwapWidget}>Swap</Button>
          <Button onClick={openBridgeWidget}>Bridge</Button>
          <Button onClick={openOnRampWidget}>On-ramp</Button>
          <LanguageSelector onLanguageChange={(language: string) => updateLanguage(language)} language={selectedLanguage} />
        </Box>
        {passport && web3Provider && (web3Provider.provider as any)?.isPassport && <Button onClick={logout}>Passport Logout</Button>}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 'base.spacing.x3', flexWrap: 'wrap' }}>
        <div id="connect-target"></div>
        <div id="wallet-target"></div>
        <div id="swap-target"></div>
        <div id="bridge-target"></div>
        <div id="onramp-target"></div>
      </Box>
    </Box>
  );
}
