"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState } from 'react';
import { WalletInfo, WalletProviderName } from '@imtbl/sdk/checkout';
import { Button, Heading, Link, Table } from '@biom3/react';
import NextLink from 'next/link';
import { BrowserProvider } from 'ethers';

export default function ConnectWithMetamask() {

const [provider, setProvider] = useState<BrowserProvider>();
const [walletProviderName, setWalletProviderName] = useState<WalletProviderName>();
const [supportedWallets, setSupportedWallets] = useState<WalletInfo[]>();
const [connectedProvider, setConnectedProvider] = useState<BrowserProvider>();
const [isValidProvider, setIsValidProvider] = useState<boolean>();
const [isConnected, setIsConnected] = useState<boolean>();
const [walletAddress, setWalletAddress] = useState<string>();

// setup the loading state to enable/disable buttons when loading
const [loading, setLoadingState] = useState<boolean>(false);

const connectWithMetamask = async (connectWithPerms:boolean) => {
  // disable button while loading
  setLoadingState(true);

  // #doc get-wallet-allow-list
  // Get the list of default supported providers
  const type = checkout.WalletFilterTypes.ALL;
  const allowListRes = await checkoutSDK.getWalletAllowList({ type });
  // #enddoc get-wallet-allow-list

  setSupportedWallets(allowListRes.wallets);

  // #doc create-metamask-provider
  // Create a provider given one of the default wallet provider names
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const providerRes = await checkoutSDK.createProvider({ walletProviderName });
  // #enddoc create-metamask-provider
  
  setProvider(providerRes.provider);
  setWalletProviderName(providerRes.walletProviderName);

  // #doc check-is-valid-provider
  // Check if the provider if a BrowserProvider
  const isProviderRes = checkout.Checkout.isWrappedBrowserProvider(providerRes.provider);
  // #enddoc check-is-valid-provider

  setIsValidProvider(isProviderRes);

  if (connectWithPerms) {
    // #doc connect-metamask-provider-perms
    // Get the current network information
    // Pass through requestWalletPermissions to request the user's wallet permissions
    const connectRes = await checkoutSDK.connect({ 
      provider: providerRes.provider,
      requestWalletPermissions: true,
    });
    // #enddoc connect-metamask-provider-perms

    setConnectedProvider(connectRes.provider);
  } else {
    // #doc connect-metamask-provider
    // Get the current network information
    const connectRes = await checkoutSDK.connect({
      provider: providerRes.provider
    });
    // #enddoc connect-metamask-provider

    setConnectedProvider(connectRes.provider);
  }
  
  // #doc check-is-connected
  // Check if the provider if a BrowserProvider
  const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
    provider: providerRes.provider
  });
  // #enddoc check-is-connected

  setIsConnected(isConnectedRes.isConnected);
  setWalletAddress(isConnectedRes.walletAddress);

  setLoadingState(false);
}
  return (<>
    <Heading 
    size="medium" 
    className="mb-1">
      Connect with Metamask
      </Heading>
    <Button 
    className="mb-1"
    size="medium" 
    onClick={async () => await connectWithMetamask(true)}
    disabled={loading}>
      Connect MetaMask with Permissions
    </Button>

    <Button 
    className="mb-1"
    size="medium" 
    onClick={async () => await connectWithMetamask(false)}
    disabled={loading}>
      Connect MetaMask without Permissions
    </Button>
        
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>Item</Table.Cell>
          <Table.Cell>Value</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell><b>Supported Wallets</b></Table.Cell>
          <Table.Cell>
            {!supportedWallets && ' (not fetched)'}
            {supportedWallets && (
              supportedWallets.map((wallet, index) => (
                <span key={index}>{wallet.walletProviderName}, </span>
              ))
            )}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><b>Created Provider</b></Table.Cell>
          <Table.Cell>
            {(provider && walletProviderName) ? ` ${walletProviderName}` : ' (not created)'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><b>Is Valid Provider</b></Table.Cell>
          <Table.Cell>
            {(isValidProvider) ? `${isValidProvider}` : ' (not validated)'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><b>Connected to Network</b></Table.Cell>
          <Table.Cell>
            {(connectedProvider) ? `chainId ${connectedProvider._network.chainId}` : ' (not connected)'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><b>Is Connected</b></Table.Cell>
          <Table.Cell>
            {(isConnected) ? `${isConnected}` : ' (not connected)'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><b>Wallet Address</b></Table.Cell>
          <Table.Cell>
          {(walletAddress) ? `${walletAddress}` : ' (not connected)'}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
    <br />
    <Link rc={<NextLink href="/" />}>Return to Examples</Link>
  </>);
}
  