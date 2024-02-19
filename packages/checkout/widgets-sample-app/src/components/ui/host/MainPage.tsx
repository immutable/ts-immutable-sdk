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
  WidgetTheme, WidgetType, ProviderEventType, ProviderUpdated, WidgetConfiguration, WidgetProperties, IMTBLWidgetEvents
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
// import { passport } from './passport';
import { LanguageSelector } from './LanguageSelector';
import './MainPage.css';

declare global {
  interface Window {
    Unity: any;
  }
}

function isInIFrame(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // SecurityError is thrown when attempting to access window.top from a cross-origin frame
    return true;
  }
}

// Create one instance of Checkout and connect Passport
console.log('Hello we are in an IFrame', isInIFrame(), 'window.unity', (window as any).Unity);
window.Unity?.log(`Is IFrame: ${isInIFrame()} found Unity`);
if (!isInIFrame() && !window.Unity) {
  window.Unity?.log('Announce Passport');
  // passport.connectEvm();
}
const checkout = new Checkout({
  baseConfig: {
    environment: Environment.SANDBOX,
    publishableKey: 'pk_imapik-test-pCHFU0GpQImZx9UzSnU3',
  }
});

export const MainPage = () => {
  const widgetsFactory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);

  const connectWidget = useMemo(() => widgetsFactory.create(WidgetType.CONNECT), [widgetsFactory]);
  const walletWidget = useMemo(() => widgetsFactory.create(WidgetType.WALLET), [widgetsFactory]);
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE), [widgetsFactory]);
  const swapWidget = useMemo(() => widgetsFactory.create(WidgetType.SWAP), [widgetsFactory]);
  const onRampWidget = useMemo(() => widgetsFactory.create(WidgetType.ONRAMP), [widgetsFactory]);

  window.addEventListener('imtbl-wallet-widget', (event: any) => {
    console.log('Connect Widget closing...', event);
    if (event.detail.type === 'close-widget') {
      window.dispatchEvent(new CustomEvent(ConnectEventType.CLOSE_WIDGET));
      connectWidget.unmount();
    }

    if (event.detail.type === 'open-widget') {
      openWalletWidget();
    }
  });
  walletWidget.addListener(WalletEventType.CLOSE_WIDGET, () => { walletWidget.unmount() });
  bridgeWidget.addListener(BridgeEventType.CLOSE_WIDGET, () => { bridgeWidget.unmount() });
  swapWidget.addListener(SwapEventType.CLOSE_WIDGET, () => swapWidget.unmount());
  onRampWidget.addListener(OnRampEventType.CLOSE_WIDGET, () => { onRampWidget.unmount() });

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(undefined);

  useEffect(() => {
    // connectWidget.addListener('imtbl-wallet-widget' as any, () => {
    //   console.log('Relay event to Unity..');
    //   document.dispatchEvent(new CustomEvent(ConnectEventType.CLOSE_WIDGET));
    //   connectWidget.unmount();
    // });
    // connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => {
    //   console.log('Relay event to Unity..');
    //   document.dispatchEvent(new CustomEvent(ConnectEventType.CLOSE_WIDGET));
    //   connectWidget.unmount();
    // });
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

    walletWidget.mount('wallet-target');
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

  // const logout = useCallback(async () => {
  //   await passport.logout();
  // }, [passport])

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0)' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', flexGrow: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', height: '100%' }}>
        <div id="connect-target"></div>
        <div className="widget" id="wallet-target"></div>
        <div id="swap-target"></div>
        <div id="bridge-target"></div>
        <div id="onramp-target"></div>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
        <Box sx={{ padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'base.spacing.x6', alignItems: 'center' }}>
          <Button onClick={openWalletWidget}>Wallet</Button>
          <LanguageSelector onLanguageChange={(language: string) => updateLanguage(language)} language={selectedLanguage} />
        </Box>
        {/* {passport && web3Provider && (web3Provider.provider as any)?.isPassport && <Button onClick={logout}>Passport Logout</Button>} */}
      </Box>

    </Box>
  );
}
