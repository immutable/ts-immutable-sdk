'use client';

import { Button, Heading, Body } from '@biom3/react';
import { useImmutableSession, useLogin, useLogout } from '@imtbl/auth-next-client';
import { connectWallet } from '@imtbl/wallet';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';

function ConnectWithAuthNextContent() {
  const { isAuthenticated, session, getUser } = useImmutableSession();
  const { loginWithPopup, isLoggingIn, error: loginError } = useLogin();
  const { logout, isLoggingOut, error: logoutError } = useLogout();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');

  const handleLogin = async () => {
    try {
      await loginWithPopup(); // Zero config!
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Zero config!
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setWalletError('');
      
      // Connect wallet using getUser from useImmutableSession
      const provider = await connectWallet({
        getUser, // Uses default auth from NextAuth session!
      });

      // Get the wallet address
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      setWalletAddress(accounts[0]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setWalletError(errorMsg);
      console.error('Wallet connection failed:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Heading size="medium" className="mb-1">
        Connect Wallet with Auth-Next (Default Auth)
      </Heading>
      
      <Body size="medium" className="mb-1">
        This example demonstrates using <code>@imtbl/auth-next-client</code> and <code>@imtbl/wallet</code>
        together with zero-config default auth.
      </Body>

      <div style={{ 
        background: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        <strong>Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        {session?.user?.email && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Email:</strong> {session.user.email}
          </div>
        )}
        {walletAddress && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Wallet:</strong> <code>{walletAddress}</code>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <>
          <Button 
            size="medium" 
            className="mb-1"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing in...' : '🔐 Sign In (Zero Config)'}
          </Button>
          {loginError && (
            <div style={{ color: 'red', marginTop: '0.5rem' }}>
              Error: {loginError}
            </div>
          )}
          <Body size="small" className="mb-1" style={{ color: '#666' }}>
            Uses <code>loginWithPopup()</code> with no configuration.
            ClientId and redirectUri are auto-detected!
          </Body>
        </>
      ) : (
        <>
          <Button 
            size="medium" 
            className="mb-1"
            onClick={handleConnectWallet}
            disabled={!!walletAddress}
          >
            {walletAddress ? '✅ Wallet Connected' : '💼 Connect Wallet'}
          </Button>
          
          <Button 
            size="medium" 
            className="mb-1"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : '🚪 Sign Out'}
          </Button>

          {walletError && (
            <div style={{ color: 'red', marginTop: '0.5rem' }}>
              Wallet Error: {walletError}
            </div>
          )}
          {logoutError && (
            <div style={{ color: 'red', marginTop: '0.5rem' }}>
              Logout Error: {logoutError}
            </div>
          )}

          <div style={{ 
            background: '#e8f5e9', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginTop: '1rem'
          }}>
            <strong>✅ Integration Test:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Auth via <code>useImmutableSession()</code></li>
              <li>Wallet via <code>connectWallet(&#123; getUser &#125;)</code></li>
              <li>Zero configuration required!</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConnectWithAuthNext() {
  return (
    <SessionProvider>
      <ConnectWithAuthNextContent />
    </SessionProvider>
  );
}
