"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState } from 'react';
import { WalletInfo } from '@imtbl/sdk/checkout';
import { Button, Heading, Body, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function ConnectWithMetamask() {

const [wallets, setWallets] = useState<WalletInfo[]>();

// setup the loading state to enable/disable buttons when loading
const [loading, setLoadingState] = useState<boolean>(false);

const connectWithMetamask = async () => {
  // disable button while loading
  setLoadingState(true);

  // #doc get-wallet-allow-list
  // Get the list of default supported providers
  const type = checkout.WalletFilterTypes.ALL;
  const response = await checkoutSDK.getWalletAllowList({ type });
  // #enddoc get-wallet-allow-list
  
  setWallets(response.wallets)
  setLoadingState(false);
}
  return (<>
    <Heading size="medium" className="mb-1">Get Supported Wallet Providers</Heading>
    <Button 
    className="mb-1"
    size="medium" 
    onClick={connectWithMetamask}
    disabled={loading}>
      Fetch Wallet Providers
    </Button>
        
    {loading
        ? <Body>Loading...</Body>
        : (
          <Body>
            Supported Wallet Providers:
            {!wallets && ' (not fetched)'}
            {(wallets) && (
              <ul>
                {wallets.map((wallet, index) => (
                  <li key={index}>{wallet.walletProviderName}</li>
                ))}
              </ul>
            )}
          </Body>
        )}
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
  </>);
}
  