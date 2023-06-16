import {
  CheckoutWidgets,
  ConnectReact,
  WalletReact,
  WidgetTheme,
  UpdateConfig,
  CheckoutWidgetsConfig,
  SetProvider,
  CheckoutWidgetTagNames,
} from '@imtbl/checkout-widgets';
import { useConnectWidget } from './useConnectWidget.hook';
import { useWalletWidget } from './useWalletWidget.hook';
import { Environment } from '@imtbl/config';
import { useEffect } from 'react';

export const Marketplace = () => {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  const { showConnectWidget, provider,providerName, setShowConnectWidget } =
    useConnectWidget();

  const { showWalletWidget, setShowWalletWidget } = useWalletWidget();

  function openConnectWidget() {
    setShowConnectWidget(true);
  }

  function openWalletWidget() {
    setShowWalletWidget(true);
  }

  useEffect(() => {
    if (provider && showWalletWidget) SetProvider(CheckoutWidgetTagNames.WALLET, provider)
  }, [provider, showWalletWidget])

  return (
    <div>
      <h1>Sample Marketplace Orchestrator</h1>
      {!provider && (
        <button onClick={openConnectWidget}>Connect Wallet</button>
      )}
      {showConnectWidget && <ConnectReact />}
      {provider && !showWalletWidget && (
        <button onClick={openWalletWidget}>My Wallet</button>
      )}
      {showWalletWidget && provider && (
        <WalletReact />
      )}
      {showWalletWidget && providerName && !provider && (
        <WalletReact />
      )}
    </div>
  );
};
