'use client';
import { checkout } from "@imtbl/sdk";
import { checkoutSDK } from "../utils/setupDefault";
import { useState } from "react";
import { Button, Heading, Body, Link, Table } from "@biom3/react";
import NextLink from "next/link";
import { BrowserProvider } from "ethers";

export default function ConnectWithMetamask() {
  const [isConnected, setIsConnected] = useState<boolean>();
  const [chainName, setChainName] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [nativeCurrency, setNativeCurrency] = useState<string>();
  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);
  const [connectedProvider, setConnectedProvider] = useState<BrowserProvider>();
  const [supportedNetworks, setSupportedNetworks] = useState<string[]>();
  const [switchNetworkLoading, setSwitchNetworkLoading] = useState<boolean>(false);

  const updateNetworkInfo = async (provider: BrowserProvider) => {
    try {
      // #doc get-network-details
      // Get the network details
      const info = await checkoutSDK.getNetworkInfo({ provider });
      // #enddoc get-network-details
      setChainName(info.name);
      setChainId(info.chainId.toString());
      setNativeCurrency(info.nativeCurrency?.symbol || 'N/A');
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to update network info:", error);
      setChainName(undefined);
      setChainId(undefined);
      setNativeCurrency(undefined);
      setIsConnected(false);
    }
  };

  const connectWithMetamask = async () => {
    // disable button while loading
    setLoadingState(true);

    // #doc create-metamask-provider
    // Create a provider given one of the default wallet provider names
    const walletProviderName = checkout.WalletProviderName.METAMASK;
    const providerRes = await checkoutSDK.createProvider({
      walletProviderName,
    });
    // #enddoc create-metamask-provider

    await updateNetworkInfo(providerRes.provider);

    // #doc connect-metamask-provider-perms
    // Get the current network information
    // Pass through requestWalletPermissions to request the user's wallet permissions
    const connectRes = await checkoutSDK.connect({
      provider: providerRes.provider,
      requestWalletPermissions: true,
    });
    // #enddoc connect-metamask-provider-perms

    setConnectedProvider(connectRes.provider);

    // #doc check-is-connected
    // Check if the provider if a BrowserProvider
    const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
      provider: providerRes.provider,
    });
    // #enddoc check-is-connected
    setIsConnected(isConnectedRes.isConnected);

    // #doc supported-networks
    // Get the list of default supported networks
    const type = checkout.NetworkFilterTypes.ALL;
    const supportedNetworks = await checkoutSDK.getNetworkAllowList({ type });
    setSupportedNetworks(supportedNetworks.networks.map(network => network.name));
    // #enddoc supported-networks

    setLoadingState(false);
  };

  const switchToImmutableZkEVMTestnet = async () => {
    setSwitchNetworkLoading(true);
    try {
      if (!connectedProvider) {
        throw new Error("No connected provider found");
      }

      // #doc switch-network
      // Switch to Immutable zkEVM Testnet and update the provider
      const chainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET;
      const switchResponse = await checkoutSDK.switchNetwork({ provider: connectedProvider, chainId });
      
      // Update the provider
      setConnectedProvider(switchResponse.provider);      
      // #enddoc switch-network
      await updateNetworkInfo(switchResponse.provider);
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setSwitchNetworkLoading(false);
    }
  };

  const switchToSepoliaTestnet = async () => {
    setSwitchNetworkLoading(true);
    try {
      if (!connectedProvider) {
        throw new Error("No connected provider found");
      }
      const chainId = checkout.ChainId.SEPOLIA;
      const switchResponse = await checkoutSDK.switchNetwork({ provider: connectedProvider, chainId });
      setConnectedProvider(switchResponse.provider);
      await updateNetworkInfo(switchResponse.provider);
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setSwitchNetworkLoading(false);
    }
  }
  return (
    <>
      <Heading size="medium" className="mb-1">
        Switch Network
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={async () => await connectWithMetamask()}
        disabled={loading}
      >
        Connect MetaMask
      </Button>
      <Button
        className="mb-1"
        size="medium"
        onClick={switchToSepoliaTestnet}
        disabled={!connectedProvider || switchNetworkLoading}
      >
        Switch to Sepolia Testnet
      </Button>
      <Button
        className="mb-1"
        size="medium"
        onClick={switchToImmutableZkEVMTestnet}
        disabled={!connectedProvider || switchNetworkLoading}
      >
        Switch to Immutable zkEVM Testnet
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
            <Table.Cell>
              <b>Is Connected</b>
            </Table.Cell>
            <Table.Cell>
              {isConnected ? `${isConnected}` : " (not connected)"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <b>Chain Name</b>
            </Table.Cell>
            <Table.Cell>
              {chainName ? `${chainName}` : " (not connected)"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
            <b>Supported Networks</b>
            </Table.Cell>
            <Table.Cell>
              {supportedNetworks && supportedNetworks.length > 0 ? (
                <ul>
                  {supportedNetworks.map((network, index) => (
                    <li key={index}>{network}</li>
                  ))}
                </ul>
              ) : (
                " (not connected)"
              )}
            </Table.Cell>
           </Table.Row>
          <Table.Row>
            <Table.Cell>
              <b>Chain ID</b>
            </Table.Cell>
            <Table.Cell>
              {chainId ? chainId : " (not connected)"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <b>Native Currency</b>
            </Table.Cell>
            <Table.Cell>
              {nativeCurrency ? nativeCurrency : " (not connected)"}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
