'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Heading,
  Table,
  Link,
  Stack,
} from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassportPKCE() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Event handlers
  const handleAccountsChanged = (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    setAccountAddress(accounts[0] || null);
  };

  const handleChainChanged = (chainId: string) => {
    console.log('Chain changed:', chainId);
    // Reload the page when chain changes per MetaMask recommendation
    window.location.reload();
  };

  const handleConnect = (connectInfo: { chainId: string }) => {
    console.log('Connected to chain:', connectInfo);
  };

  const handleDisconnect = (errorMsg: { code: number; message: string }) => {
    console.log('Disconnected:', errorMsg);
    setIsLoggedIn(false);
    setAccountAddress(null);
    setIdToken(null);
  };

  // Use effect to add event listeners for wallet events
  useEffect(() => {
    const setupEventListeners = async () => {
      if (!passportInstance) return;

      try {
        const provider = await passportInstance.connectEvm();
        
        if (provider) {
          // Add event listeners
          provider.on('accountsChanged', handleAccountsChanged);
          provider.on('chainChanged', handleChainChanged);
          provider.on('connect', handleConnect);
          provider.on('disconnect', handleDisconnect);
        }
      } catch (setupError) {
        console.error('Error setting up event listeners:', setupError);
      }
      
      // Check if we're already logged in
      try {
        const userInfo = await passportInstance.getUserInfo();
        if (userInfo) {
          setIsLoggedIn(true);
          // Get account address if available
          const provider = await passportInstance.connectEvm();
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAccountAddress(accounts[0] || null);
            setIdToken(userInfo.sub || null);
          }
        }
      } catch (loginCheckError) {
        // User not logged in, ignore silently
      }
    };

    setupEventListeners();

    // Cleanup event listeners on unmount
    return () => {
      const cleanup = async () => {
        if (!passportInstance) return;
        
        try {
          const provider = await passportInstance.connectEvm();
          if (provider) {
            provider.removeListener('accountsChanged', handleAccountsChanged);
            provider.removeListener('chainChanged', handleChainChanged);
            provider.removeListener('connect', handleConnect);
            provider.removeListener('disconnect', handleDisconnect);
          }
        } catch (cleanupError) {
          console.error('Error removing event listeners:', cleanupError);
        }
      };
      
      cleanup();
    };
  }, []);

  const loginWithPassportPKCE = async () => {
    if (!passportInstance) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // #doc passport-pkce-login
      await passportInstance.loginWithPKCEFlow();
      const userInfo = await passportInstance.getUserInfo();
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      // #enddoc passport-pkce-login
      
      if (accounts && userInfo) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        setIdToken(userInfo.sub || null);
      } else {
        setIsLoggedIn(false);
      }
    } catch (loginError) {
      console.error('Error connecting to Passport with PKCE:', loginError);
      setIsLoggedIn(false);
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!passportInstance) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAccountAddress(null);
      setIdToken(null);
    } catch (logoutError) {
      console.error('Error logging out:', logoutError);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack alignItems="center" gap="4">
      <Heading size="medium" className="mb-1">
        Login with Passport PKCE
      </Heading>
      
      {error && (
        <p className="text-red-500 mb-1">
          {error}
        </p>
      )}
      
      <Stack direction="row" gap="2" className="mb-2">
        <Button
          size="medium"
          onClick={loginWithPassportPKCE}
          disabled={isLoggedIn || isLoading}
        >
          {isLoading ? (isLoggedIn ? 'Logged In' : 'Loading...') : isLoggedIn ? 'Logged In' : 'Login'}
        </Button>
        
        {isLoggedIn && (
          <Button
            size="medium"
            variant="secondary"
            onClick={logout}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        )}
      </Stack>

      <Table className="mb-2">
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
            <Table.Cell><b>User ID</b></Table.Cell>
            <Table.Cell>{idToken ? `${idToken.substring(0, 20)}...` : 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      
      <NextLink href="/" passHref legacyBehavior>
        <Link>Return to Home</Link>
      </NextLink>
    </Stack>
  );
} 