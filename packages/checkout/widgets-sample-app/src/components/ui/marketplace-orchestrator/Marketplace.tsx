import {
  CheckoutWidgets,
  ConnectEventType,
  ConnectWidgetReact,
  ConnectionFailed,
  ConnectionProviders,
  ConnectionSuccess,
  IMTBLWidgetEvents,
  WalletWidgetReact,
  WidgetTheme,
} from '@imtbl/checkout-widgets';
import { useEffect, useMemo, useState } from 'react';
import { useConnectWidget } from './useConnectWidget.hook';
import { useWalletWidget } from './useWalletWidget.hook';

export const Marketplace = () => {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
  const {
    showConnectWidget,
    providerPreference,
    setShowConnectWidget,
    setProviderPreference,
  } = useConnectWidget();

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
      {showConnectWidget && <ConnectWidgetReact />}
      {providerPreference && !showWalletWidget && (
        <button onClick={openWalletWidget}>My Wallet</button>
      )}
      {showWalletWidget && (
        <WalletWidgetReact
          providerPreference={providerPreference as ConnectionProviders}
        />
      )}
    </div>
  );
};
