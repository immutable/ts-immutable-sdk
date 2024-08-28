"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/sdk/checkout';

export default function ConnectWithMetamask() {

const [provider, setProvider] = useState<Web3Provider>();
const [walletProviderName, setWalletProviderName] = useState<WalletProviderName>();

// setup the loading state to enable/disable buttons when loading
const [loading, setLoadingState] = useState<boolean>(false);

const connectWithMetamask = async () => {
  // disable button while loading
  setLoadingState(true);
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const response = await checkoutSDK.createProvider({ walletProviderName });
  console.log('response', response)
  setProvider(response.provider)
  setWalletProviderName(response.walletProviderName)
  setLoadingState(false);
}
  return (<>
    <h1>Connect with MetaMask</h1>
    {!provider && 
        <button
        onClick={connectWithMetamask}
        disabled={loading}
      >
        Connect with Metamask
      </button>
    }
    {loading
        ? <p>Loading...</p>
        : (
          <p>
            Connected Provider:
            {(provider && walletProviderName) ? ` ${walletProviderName}` : ' (not connected)'}
          </p>
        )}
      <a href="/" className="underline">Return to Examples</a>
  </>);
}
  