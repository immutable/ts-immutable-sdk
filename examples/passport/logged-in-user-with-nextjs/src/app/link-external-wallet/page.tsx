'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import { generateNonce } from 'siwe';
import { useConnect, useSignTypedData, useAccount, useDisconnect } from 'wagmi';
import { config } from '../utils/wagmiConfig';
import { injected, metaMask } from 'wagmi/connectors';
import { immutableZkEvmTestnet } from 'wagmi/chains';

export default function LinkExternalWallet() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [externalWalletAddress, setExternalWalletAddress] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkingStatus, setLinkingStatus] = useState<string>('');
  const [linkingError, setLinkingError] = useState<string | null>(null);
  
  const { connectAsync, connectors } = useConnect({
    config
  });
  const connector = connectors[0];
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    setLinkingError(null);
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    }
  };

  const connectWallet = async () => {
    setLinkingError(null);
    if (!isLoggedIn) {
      setLinkingError('Please log in with Passport first');
      return;
    }

    try {
      // Use metaMask connector specifically instead of generic injected
      const result = await connectAsync({ connector: metaMask() });
      if (result?.accounts?.[0]) {
        setWalletConnected(true);
        setExternalWalletAddress(result.accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setLinkingError('Failed to connect wallet');
    }
  };

  const linkWallet = async () => {
    if (!passportInstance || !isLoggedIn || !walletConnected || !externalWalletAddress || !accountAddress) {
      setLinkingError('Please ensure you are logged in and have connected an external wallet');
      return;
    }

    setIsLinking(true);
    setLinkingStatus('Generating signature...');
    setLinkingError(null);

    try {
      // Generate a nonce for the signature
      const nonce = generateNonce();
      // Ensure addresses are in the correct format - lowercase 0x-prefixed
      const formattedExternalWalletAddress = externalWalletAddress.toLowerCase() as `0x${string}`;
      const formattedPassportAddress = accountAddress.toLowerCase() as `0x${string}`;
      
      // Sign the message using EIP-712
      const signature = await signTypedDataAsync({
        domain: {
          chainId: BigInt(1)
        },
        types: {
          EIP712Domain: [
            {
              name: "chainId",
              type: "uint256"
            }
          ],
          LinkWallet: [
            {
              name: "walletAddress",
              type: "address"
            },
            {
              name: "immutablePassportAddress",
              type: "address"
            },
            {
              name: "condition",
              type: "string"
            },
            {
              name: "nonce",
              type: "string"
            }
          ]
        },
        primaryType: "LinkWallet",
        message: {
          walletAddress: formattedExternalWalletAddress,
          immutablePassportAddress: formattedPassportAddress,
          condition: "I agree to link this wallet to my Immutable Passport account.",
          nonce
        }
      });

      setLinkingStatus('Linking wallet...');
      
      // Call the linkExternalWallet method to link the wallet
      const result = await passportInstance.linkExternalWallet({
        type: "External",
        walletAddress: formattedExternalWalletAddress,
        signature,
        nonce
      });
      
      setLinkingStatus('Wallet linked successfully!');
      setIsLinking(false);
    } catch (error: any) {
      console.error('Error linking wallet:', error);
      setLinkingError(error?.message || 'Failed to link wallet');
      setLinkingStatus('');
      setIsLinking(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Link External Wallet
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithPassport}
        disabled={isLoggedIn}>
        {isLoggedIn ? 'Logged In' : 'Login'}
      </Button>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Attribute</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Is Logged In</b></Table.Cell>
            <Table.Cell>{isLoggedIn ? 'Yes' : 'No'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Account Address</b></Table.Cell>
            <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>External Wallet</b></Table.Cell>
            <Table.Cell>{externalWalletAddress || 'Not connected'}</Table.Cell>
          </Table.Row>
          {linkingStatus && (
            <Table.Row>
              <Table.Cell><b>Status</b></Table.Cell>
              <Table.Cell>{linkingStatus}</Table.Cell>
            </Table.Row>
          )}
          {linkingError && (
            <Table.Row>
              <Table.Cell><b>Error</b></Table.Cell>
              <Table.Cell>{linkingError}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      

        <Button
          size="medium"
          onClick={connectWallet}
          disabled={!isLoggedIn || walletConnected}>
          Connect Wallet
        </Button>

        {walletConnected && (
          <Button
            size="medium"
            onClick={linkWallet}
            className="mt-6"
            disabled={isLinking || !isLoggedIn || !walletConnected}>
            {isLinking ? 'Linking...' : 'Link Wallet'}
          </Button>
        )}

      
      <div className="mt-4">
        <Link rc={<NextLink href="/" />}>Return to Examples</Link>
      </div>
    </>
  );
}
