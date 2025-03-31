'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link, TextInput, Card } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

type LinkedWallet = {
  type: string;
  walletAddress: string;
  linkedAt: string;
};

// The response from SDK may have different field names
type LinkedWalletResponse = {
  type?: string;
  wallet_address?: string;
  linked_at?: string;
};

export default function LinkExternalWallet() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string>('External');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [linkedWallet, setLinkedWallet] = useState<LinkedWallet | null>(null);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
      setError('Failed to login with Passport');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkExternalWallet = async () => {
    if (!passportInstance) return;
    if (!isLoggedIn) {
      setError('You need to login first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Verify all required fields are filled
      if (!walletType || !walletAddress || !signature || !nonce) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }
      
      // Validate wallet address format
      if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError('Invalid wallet address format. Must start with 0x followed by 40 hex characters.');
        setIsLoading(false);
        return;
      }
      
      // Call the linkExternalWallet method on the Passport SDK
      const result = await passportInstance.linkExternalWallet({
        type: walletType,
        walletAddress: walletAddress,
        signature: signature,
        nonce: nonce
      }) as LinkedWalletResponse;
      
      // Set linked wallet data
      setLinkedWallet({
        type: result.type || walletType,
        walletAddress: result.wallet_address || walletAddress,
        linkedAt: result.linked_at || new Date().toISOString()
      });
      
      // Clear input fields on success
      setWalletType('External');
      setWalletAddress('');
      setSignature('');
      setNonce('');
      
      setSuccess('External wallet linked successfully!');
    } catch (error: any) {
      console.error('Error linking external wallet:', error);
      setError(error?.message || 'Failed to link external wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a random nonce for convenience
  const generateNonce = () => {
    const randomNonce = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setNonce(randomNonce);
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
        disabled={isLoggedIn || isLoading}>
        {isLoading ? 'Loading...' : isLoggedIn ? 'Logged In' : 'Login'}
      </Button>
      
      {isLoggedIn && (
        <Card className="mb-4">
          <Heading size="small" className="mb-1">Link an External Wallet</Heading>
          
          <div className="mb-2">
            <p className="mb-1 font-medium">Wallet Type</p>
            <TextInput
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
              placeholder="io.metamask or External"
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be the EIP-6963 rdns value. If unavailable, use &quot;External&quot; or &quot;WalletConnect&quot;.
            </p>
          </div>
          
          <div className="mb-2">
            <p className="mb-1 font-medium">Wallet Address</p>
            <TextInput
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-2">
            <p className="mb-1 font-medium">Signature</p>
            <TextInput
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="0x..."
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be an EIP-712 signature from the wallet being linked
            </p>
          </div>
          
          <div className="mb-2">
            <p className="mb-1 font-medium">Nonce</p>
            <div className="flex gap-2">
              <TextInput
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                placeholder="Unique identifier for signature"
                className="flex-grow"
                disabled={isLoading}
              />
              <Button 
                size="small"
                onClick={generateNonce}
                disabled={isLoading}>
                Generate
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
              {success}
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <Button
              size="medium"
              onClick={handleLinkExternalWallet}
              disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Link Wallet'}
            </Button>
          </div>
        </Card>
      )}
      
      {linkedWallet && (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Attribute</Table.Cell>
              <Table.Cell>Value</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell><b>Wallet Type</b></Table.Cell>
              <Table.Cell>{linkedWallet.type}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Wallet Address</b></Table.Cell>
              <Table.Cell>{linkedWallet.walletAddress}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Linked At</b></Table.Cell>
              <Table.Cell>{linkedWallet.linkedAt}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )}
      
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
} 