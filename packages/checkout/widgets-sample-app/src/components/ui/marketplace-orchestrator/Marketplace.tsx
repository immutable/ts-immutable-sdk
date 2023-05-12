import {
  CheckoutWidgets,
  ConnectReact,
  WidgetConnectionProviders,
  WalletReact,
  WidgetTheme,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { useEffect, useMemo, useState } from 'react';
import { useConnectWidget } from './useConnectWidget.hook';
import { useWalletWidget } from './useWalletWidget.hook';
import { Environment } from '@imtbl/config';

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

  const { showConnectWidget, providerPreference, setShowConnectWidget } =
    useConnectWidget();

  const { showWalletWidget, setShowWalletWidget } = useWalletWidget();

  function openConnectWidget() {
    setShowConnectWidget(true);
  }

  function openWalletWidget() {
    setShowWalletWidget(true);
  }

  return (
    <div>
      <h1>Sample Marketplace Orchestrator</h1>
      {!providerPreference && (
        <button onClick={openConnectWidget}>Connect Wallet</button>
      )}
      {showConnectWidget && <ConnectReact />}
      {providerPreference && !showWalletWidget && (
        <button onClick={openWalletWidget}>My Wallet</button>
      )}
      {showWalletWidget && (
        <WalletReact
          providerPreference={providerPreference as WidgetConnectionProviders}
        />
      )}
    </div>
  );
};
