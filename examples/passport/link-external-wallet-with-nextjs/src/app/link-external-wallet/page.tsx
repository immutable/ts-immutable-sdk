'use client';
import React, { useState, useEffect } from 'react';
import { Button, Stack, Heading, Box, Body } from '@biom3/react';
import Link from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LinkExternalWalletPage() {
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passportAddress, setPassportAddress] = useState<string | null>(null);
  const [externalWalletAddress, setExternalWalletAddress] = useState<string | null>(null);
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        if (!passportInstance) return;
        
        const userProfile = await passportInstance.getUserInfo();
        if (userProfile) {
          setIsLoggedIn(true);

          // Get Passport address
          const passportProvider = await passportInstance.connectEvm();
          if (passportProvider) {
            const accounts = await passportProvider.request({ method: "eth_requestAccounts" });
            if (accounts && accounts.length > 0) {
              setPassportAddress(accounts[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!passportInstance) return;
      
      await passportInstance.login();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to login with Passport. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectExternalWallet = async () => {
    setConnectLoading(true);
    try {
      // This is a simplified example. In a real implementation, you would:
      // 1. Use a library like wagmi or web3modal to connect to external wallets
      // 2. Get the wallet address from the connected wallet
      
      // For demonstration, we'll simulate connecting to an external wallet
      const simulatedAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      setExternalWalletAddress(simulatedAddress);
      setConnectLoading(false);
    } catch (error) {
      console.error("Error connecting external wallet:", error);
      setErrorMessage("Failed to connect external wallet. Please try again.");
      setConnectLoading(false);
    }
  };

  const linkWallet = async () => {
    if (!passportInstance || !passportAddress || !externalWalletAddress) {
      setErrorMessage("Missing required information. Please ensure you're logged in and have connected an external wallet.");
      return;
    }

    setLinkingStatus('linking');
    try {
      // In a real implementation, you would:
      // 1. Generate a nonce - in a real app you'd use a proper nonce generator
      const nonce = Math.random().toString(36).substring(2, 15);
      
      // 2. Get a signature from the external wallet using EIP-712
      // This would be done using the connected wallet's signing method
      // For example, with wagmi: const signature = await signTypedDataAsync({...})
      
      // 3. Link the external wallet to Passport
      // This is a simplified version as we can't actually sign with a real external wallet in this example
      console.log("Would link wallet with parameters:", {
        type: "metamask", // This would be the actual connector.id in a real implementation
        walletAddress: externalWalletAddress,
        signature: "0xsimulated_signature", // This would be a real signature in a real implementation
        nonce: nonce
      });
      
      // In a real implementation with actual signature:
      /*
      const result = await passportInstance.linkExternalWallet({
        type: connectorId, // from wallet connection library (e.g., connector.id in wagmi)
        walletAddress: externalWalletAddress,
        signature: signature,
        nonce: nonce
      });
      */
      
      // Simulate successful linking
      setTimeout(() => {
        setLinkingStatus('success');
      }, 1500);
    } catch (error) {
      console.error("Error linking wallet:", error);
      setErrorMessage("Failed to link wallet. Please try again.");
      setLinkingStatus('error');
    }
  };

  if (!isLoggedIn) {
    return (
      <Stack gap="lg" alignItems="center" style={{ padding: '2rem', maxWidth: '800px', textAlign: 'center' }}>
        <Heading size="medium" className="mb-1">
          Link External Wallet
        </Heading>
        
        <Body>You need to log in with Immutable Passport first to link an external wallet.</Body>
        
        <Button 
          onClick={handleLogin} 
          variant="primary" 
          disabled={loading}
          style={{ minWidth: '200px' }}
        >
          {loading ? 'Logging in...' : 'Login with Passport'}
        </Button>
        
        <Link href="/" passHref>
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" alignItems="center" style={{ padding: '2rem', maxWidth: '800px', textAlign: 'center' }}>
      <Heading size="medium" className="mb-1">
        Link External Wallet
      </Heading>
      
      <Box style={{ marginBottom: '1rem', textAlign: 'left', width: '100%' }}>
        <Body weight="bold">Passport Address:</Body>
        <Body style={{ wordBreak: 'break-all' }}>{passportAddress || 'Loading...'}</Body>
      </Box>

      {!externalWalletAddress ? (
        <Box style={{ width: '100%', marginBottom: '1rem' }}>
          <Button 
            onClick={connectExternalWallet}
            variant="primary"
            disabled={connectLoading}
            style={{ marginTop: '1rem' }}
          >
            {connectLoading ? 'Connecting...' : 'Connect External Wallet'}
          </Button>
        </Box>
      ) : (
        <Box style={{ marginBottom: '1rem', textAlign: 'left', width: '100%' }}>
          <Body weight="bold">External Wallet Address:</Body>
          <Body style={{ wordBreak: 'break-all' }}>{externalWalletAddress}</Body>
          
          {linkingStatus === 'idle' && (
            <Button 
              onClick={linkWallet}
              variant="primary"
              style={{ marginTop: '1rem' }}
            >
              Link Wallet to Passport
            </Button>
          )}
          
          {linkingStatus === 'linking' && (
            <Box style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="loading-spinner"></div>
              <Body>Linking wallet...</Body>
            </Box>
          )}
          
          {linkingStatus === 'success' && (
            <Box style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '4px' }}>
              <Body>Wallet linked successfully!</Body>
            </Box>
          )}
          
          {linkingStatus === 'error' && errorMessage && (
            <Box style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px' }}>
              <Body>{errorMessage}</Body>
              <Button 
                onClick={linkWallet}
                variant="primary"
                style={{ marginTop: '1rem' }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {errorMessage && linkingStatus !== 'error' && (
        <Box style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px', width: '100%' }}>
          <Body>{errorMessage}</Body>
        </Box>
      )}
      
      <Link href="/" passHref>
        <Button variant="secondary" style={{ marginTop: '1rem' }}>Back to Home</Button>
      </Link>
    </Stack>
  );
} 