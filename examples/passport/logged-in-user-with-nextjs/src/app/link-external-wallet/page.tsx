'use client';

import { useState, useEffect } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import { generateNonce } from 'siwe';
import { Provider } from '@imtbl/sdk/passport';

// Define a type for the window.ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LinkExternalWallet() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [externalWalletAddress, setExternalWalletAddress] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkingStatus, setLinkingStatus] = useState<string>('');
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [linkedAddresses, setLinkedAddresses] = useState<string[]>([]);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMetaMaskInstalled(!!window.ethereum);
    }
  }, []);

  // fetch the Passport provider from the Passport instance
  const [passportProvider, setPassportProvider] = useState<Provider>();

  useEffect(() => {
    const fetchPassportProvider = async () => {
      const passportProvider = await passportInstance.connectEvm();
      setPassportProvider(passportProvider);
    };
    fetchPassportProvider();
  }, []);

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
      if (typeof window === 'undefined' || !window.ethereum) {
        setLinkingError('MetaMask not installed. Please install MetaMask to continue.');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setExternalWalletAddress(accounts[0]);
      } else {
        throw new Error('No accounts found');
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

    let linkedAddresses = await passportInstance.getLinkedAddresses();
    if (linkedAddresses.includes(externalWalletAddress)) {
      setLinkedAddresses(linkedAddresses);
      setLinkingStatus('Wallet already linked');
      setIsLinking(false);
      return;
    }

    try {
      // Generate a nonce for the signature
      const nonce = generateNonce();
      // Ensure addresses are in the correct format - lowercase 0x-prefixed
      const metamaskAddress = externalWalletAddress.toLowerCase() as `0x${string}`;
      const passportAddress = accountAddress.toLowerCase() as `0x${string}`;
      
      const dataToSign = {
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
        domain: {
          chainId: 1, // Must be set to 1 for Ethereum Mainnet
        },
        message: {
          walletAddress: metamaskAddress,
          immutablePassportAddress: passportAddress,
          condition: "I agree to link this wallet to my Immutable Passport account.",
          nonce
        }
      }

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      let signature: string;

      try {
         // Metamask must be connected to Ethereum Mainnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // chainId must be in hexadecimal format
        });

        // Now request the signature
        signature = await window.ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [metamaskAddress, JSON.stringify(dataToSign)]
        });

      } catch (error) {
        console.error('Error signing message:', error);
        setLinkingError('Failed to sign message');
        setLinkingStatus('Make sure you have MetaMask installed and connected to Ethereum Mainnet');
        setIsLinking(false);
        return
      }
     
      setLinkingStatus('Linking wallet...');
      
      // Call the linkExternalWallet method to link the wallet
      const result = await passportInstance.linkExternalWallet({
        type: "External",
        walletAddress: metamaskAddress,
        signature,
        nonce
      });
      
      linkedAddresses = await passportInstance.getLinkedAddresses();
      setLinkedAddresses(linkedAddresses);
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

      <div className="mb-1">    
        {!isLoggedIn ? (
          <Button
            size="medium"
            onClick={loginWithPassport}>
            Login with Passport
          </Button>
        ) : (
          <>
            {!walletConnected && (
              <Button
                size="medium"
                onClick={connectWallet}
                disabled={walletConnected || !isMetaMaskInstalled}>
                Connect Metamask
              </Button>
            )}

            {walletConnected && (
              <Button
                size="medium"
                onClick={linkWallet}
                disabled={isLinking || !walletConnected}>
                {isLinking ? 'Linking...' : 'Link Wallet'}
              </Button>
            )}
          </>
        )}
      </div>
      

      <Table className="mb-1">
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
            <Table.Cell><b>MetaMask Available</b></Table.Cell>
            <Table.Cell>{isMetaMaskInstalled ? 'Yes' : 'No'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>External Wallet</b></Table.Cell>
            <Table.Cell>{externalWalletAddress || 'Not connected'}</Table.Cell>
          </Table.Row>
          
          {linkedAddresses.length > 0 && (
            <Table.Row>
              <Table.Cell><b>Linked Addresses</b></Table.Cell>
              <Table.Cell>{linkedAddresses.join(', ')}</Table.Cell>
            </Table.Row>
          )}
          {linkingError && (
            <Table.Row>
              <Table.Cell><b>Error</b></Table.Cell>
              <Table.Cell>{linkingError}</Table.Cell>
            </Table.Row>
          )}
          {linkingStatus && (
            <Table.Row>
              <Table.Cell><b>Message</b></Table.Cell>
              <Table.Cell>{linkingStatus}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      
      <div className="mt-1">
        <Link rc={<NextLink href="/" />}>Return to Examples</Link>
      </div>
    </>
  );
}
