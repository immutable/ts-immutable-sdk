import {
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-ui-types';
import { useEffect, useMemo, useState } from 'react';
import { useConnectWidget } from './useConnectWidget.hook';
import { useWalletWidget } from './useWalletWidget.hook';

export const Marketplace = () => {
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
      {showConnectWidget && (
        <imtbl-connect providerPreference="" theme="dark"></imtbl-connect>
      )}
      {providerPreference && !showWalletWidget && (
        <button onClick={openWalletWidget}>My Wallet</button>
      )}
      {showWalletWidget && (
        <imtbl-wallet
          providerPreference={providerPreference}
          theme="dark"
        ></imtbl-wallet>
      )}
    </div>
  );
};
