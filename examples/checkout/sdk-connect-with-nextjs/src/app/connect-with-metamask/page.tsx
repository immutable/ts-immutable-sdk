"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/sdk/checkout';
import { Button, Heading, Body, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function ConnectWithMetamask() {

const [provider, setProvider] = useState<Web3Provider>();
const [walletProviderName, setWalletProviderName] = useState<WalletProviderName>();

// setup the loading state to enable/disable buttons when loading
const [loading, setLoadingState] = useState<boolean>(false);

const connectWithMetamask = async () => {
  // disable button while loading
  setLoadingState(true);
  // #doc create-metamask-provider
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const response = await checkoutSDK.createProvider({ walletProviderName });
  // #enddoc create-metamask-provider
  setProvider(response.provider)
  setWalletProviderName(response.walletProviderName)
  setLoadingState(false);
}
  return (<>
    <Heading size="medium" className="mb-1">Connect with Metamask</Heading>
    <Button 
    className="mb-1"
    size="medium" 
    onClick={connectWithMetamask}
    disabled={loading}>
      Connect with MetaMask
    </Button>
        
    {loading
        ? <Body>Loading...</Body>
        : (
          <Body>
            Connected Provider:
            {(provider && walletProviderName) ? ` ${walletProviderName}` : ' (not connected)'}
          </Body>
        )}
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
  </>);
}
  