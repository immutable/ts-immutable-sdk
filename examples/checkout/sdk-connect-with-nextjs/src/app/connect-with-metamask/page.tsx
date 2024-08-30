"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectResult, WalletInfo, WalletProviderName } from '@imtbl/sdk/checkout';
import { Button, Heading, Body, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function ConnectWithMetamask() {

const [provider, setProvider] = useState<Web3Provider>();
const [walletProviderName, setWalletProviderName] = useState<WalletProviderName>();
const [supportedWallets, setWsupportedWallets] = useState<WalletInfo[]>();
const [connectedProvider, setConnectedProvider] = useState<Web3Provider>();
const [isValidProvider, setIsValidProvider] = useState<boolean>();

// setup the loading state to enable/disable buttons when loading
const [loading, setLoadingState] = useState<boolean>(false);

const connectWithMetamask = async () => {
  // disable button while loading
  setLoadingState(true);

  // #doc get-wallet-allow-list
  const type = checkout.WalletFilterTypes.ALL;
  const allowListRes = await checkoutSDK.getWalletAllowList({ type });
  // #enddoc get-wallet-allow-list

  setWsupportedWallets(allowListRes.wallets);

  // #doc create-metamask-provider
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const providerRes = await checkoutSDK.createProvider({ walletProviderName });
  // #enddoc create-metamask-provider
  
  setProvider(providerRes.provider);
  setWalletProviderName(providerRes.walletProviderName);

  // #doc connect-metamask-provider-perms
  const connectRes = await checkoutSDK.connect({ 
    provider: providerRes.provider,
    requestWalletPermissions: true,
   });
  // #enddoc connect-metamask-provider-perms

  setConnectedProvider(connectRes.provider);
  
  // #doc check-is-valid-provider
  const isProviderRes = await checkout.Checkout.isWeb3Provider(providerRes.provider);
  // #enddoc check-is-valid-provider

  setIsValidProvider(isProviderRes);

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
        : (<>
          <Body>
            <b>Supported Wallets: </b>
            {!supportedWallets && ' (not fetched)'}
            {supportedWallets && (
              supportedWallets.map((wallet, index) => (
                <span key={index}>{wallet.walletProviderName}, </span>
              ))
            )}
          </Body>
          <Body>
            <b>Created Provider: </b>
            {(provider && walletProviderName) ? ` ${walletProviderName}` : ' (not created)'}
          </Body>
          <Body>
            <b>Connected to Network: </b>
            {(connectedProvider) ? `chainId ${connectedProvider._network.chainId}` : ' (not connected)'}
          </Body>
          <Body>
            <b>Is Valid Provider: </b>
            {(isValidProvider) ? `${isValidProvider}` : ' (not validated)'}
          </Body>
        </>)}
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
  </>);
}
  