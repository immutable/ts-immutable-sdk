import {
  CheckConnectionResult,
  Checkout,
  ConnectionProviders,
} from '@imtbl/checkout-sdk-web';
import { useMemo, useState } from 'react';

function checkConnection() {
  const checkout = useMemo(() => new Checkout(), []);
  const [checkConnectResult, setCheckConnectResult] =
    useState<CheckConnectionResult>();

  async function checkMyConnection() {
    const checkConnect = await checkout.checkIsWalletConnected({
      providerPreference: ConnectionProviders.METAMASK,
    });
    setCheckConnectResult(checkConnect);
    console.log('isConnected: ', checkConnect);
  }

  return (
    <div>
      <h1>Check connnection</h1>
      <button onClick={checkMyConnection}>Check Wallet Connection</button>
      {checkConnectResult && (
        <div>
          <p>
            Connected:{' '}
            <strong>{checkConnectResult.isConnected.toString()}</strong>
          </p>
          <p>Wallet Address: {checkConnectResult.walletAddress}</p>
        </div>
      )}
    </div>
  );
}

export default checkConnection;
