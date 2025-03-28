'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Heading, Button, Stack, Box } from '@biom3/react';
import Link from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import { BrowserProvider } from 'ethers';
import { Provider } from '@imtbl/sdk/passport';

interface ProviderState {
  connected: boolean;
  address: string | null;
  chainId: string | null;
  announced: boolean;
}

export default function LoginWithPassportProviderAnnounce() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerState, setProviderState] = useState<ProviderState>({
    connected: false,
    address: null,
    chainId: null,
    announced: false
  });
  
  // Use a ref to keep track of the provider for cleanup
  const providerRef = useRef<Provider | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (!passportInstance) return;
      
      try {
        const user = await passportInstance.getUserInfo();
        if (user) {
          setIsLoggedIn(true);
          
          // Try to get provider if already logged in
          try {
            const provider = await passportInstance.connectEvm({
              announceProvider: true
            });
            
            // Store provider reference for cleanup
            providerRef.current = provider;
            
            setupProviderListeners(provider);
            
            // Use provider.request to get address and chainId
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            const chainId = await provider.request({ method: 'eth_chainId' });
            
            setProviderState({
              connected: true,
              address: accounts[0] || null,
              chainId: chainId,
              announced: true
            });
          } catch (providerErr) {
            console.warn('Provider not available yet:', providerErr);
          }
        }
      } catch (err) {
        console.error('Error checking login status:', err);
      }
    };

    checkLoginStatus();
    
    // Cleanup function to handle component unmount
    return () => {
      cleanupProviderListeners();
    };
  }, []);
  
  // Cleanup function for provider event listeners
  const cleanupProviderListeners = () => {
    if (providerRef.current) {
      const provider = providerRef.current;
      
      // Remove all event listeners
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('disconnect', handleDisconnect);
      
      console.log('Cleaned up provider event listeners');
    }
  };
  
  // Event handler functions (defined outside setupProviderListeners for cleanup)
  const handleAccountsChanged = (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    setProviderState(prev => ({
      ...prev,
      address: accounts[0] || null
    }));
  };
  
  const handleChainChanged = (chainId: string) => {
    console.log('Chain changed:', chainId);
    setProviderState(prev => ({
      ...prev,
      chainId
    }));
  };
  
  const handleDisconnect = () => {
    console.log('Provider disconnected');
    setProviderState(prev => ({
      ...prev,
      connected: false,
      address: null,
      chainId: null
    }));
  };

  // Handle login with provider announce
  const handleLogin = async () => {
    if (!passportInstance) {
      setError('Passport instance not initialized');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Log in with Passport
      await passportInstance.login();
      setIsLoggedIn(true);
      
      // Connect to EVM with provider announce enabled (default)
      // #doc passport-provider-announce
      const provider = await passportInstance.connectEvm({
        announceProvider: true // This is the default, but we're being explicit
      });
      // #enddoc passport-provider-announce
      
      // Store provider reference for cleanup
      providerRef.current = provider;
      
      // Set up event listeners for provider state changes
      setupProviderListeners(provider);
      
      // Update state with initial provider info using provider.request
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      setProviderState({
        connected: true,
        address: accounts[0] || null,
        chainId: chainId,
        announced: true
      });
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login: ' + (err instanceof Error ? err.message : String(err)));
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up event listeners for the provider
  const setupProviderListeners = (provider: Provider) => {
    // Listen for account changes
    provider.on('accountsChanged', handleAccountsChanged);

    // Listen for chain changes
    provider.on('chainChanged', handleChainChanged);

    // Listen for disconnect events
    provider.on('disconnect', handleDisconnect);
  };

  // Handle logout
  const handleLogout = async () => {
    if (!passportInstance) return;
    
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setProviderState({
        connected: false,
        address: null,
        chainId: null,
        announced: false
      });
      
      // Clean up listeners on logout
      cleanupProviderListeners();
      providerRef.current = null;
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <Stack className="flex flex-col items-center p-4 gap-2">
      <Heading size="medium" className="mb-4">
        Login with Passport Provider Announce
      </Heading>
      
      <Box className="p-2 rounded-md w-full max-w-[600px] mb-4">
        <p className="text-md">
          This example demonstrates how to use the Passport Provider Announce feature,
          which enables wallet discovery via EIP-6963. When enabled, Passport will announce 
          its provider to the browser, allowing other applications to discover it.
        </p>
      </Box>
      
      {error && (
        <Box className="p-2 bg-red-100 rounded-md w-full max-w-[600px] mb-4">
          <p className="text-red-500">{error}</p>
        </Box>
      )}
      
      <Stack className="flex flex-col gap-4 items-center w-full max-w-[600px]">
        {!isLoggedIn ? (
          <Button 
            variant="primary" 
            onClick={handleLogin}
            className={`w-full ${isLoading ? 'opacity-50' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Login with Passport'}
          </Button>
        ) : (
          <>
            <Box className="p-4 bg-green-100 rounded-md w-full">
              <p className="text-green-600 font-bold mb-2">Successfully logged in!</p>
              {providerState.connected && (
                <div>
                  <p className="font-bold mb-1">Provider Status:</p>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li><p>Connected: {providerState.connected ? 'Yes' : 'No'}</p></li>
                    <li><p>Announced: {providerState.announced ? 'Yes' : 'No'}</p></li>
                    <li><p>Address: {providerState.address || 'Not available'}</p></li>
                    <li><p>Chain ID: {providerState.chainId || 'Not available'}</p></li>
                  </ul>
                </div>
              )}
            </Box>
            <Button variant="primary" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </>
        )}
        
        <Link href="/" style={{ width: '100%' }}>
          <Button variant="secondary" className="w-full">Back to Home</Button>
        </Link>
      </Stack>
    </Stack>
  );
} 