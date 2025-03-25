'use client';

import React, { useState, useEffect } from 'react';
import { Button, Heading, Stack } from '@biom3/react';
import { passportInstance } from '../utils/setupDefault';

// Simple loading indicator component to replace Spinner
const LoadingIndicator = ({ size = 'medium' }) => {
  const style = {
    display: 'inline-block',
    width: size === 'large' ? '40px' : size === 'medium' ? '30px' : '20px',
    height: size === 'large' ? '40px' : size === 'medium' ? '30px' : '20px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />
      <div style={style} data-testid="loading-indicator" data-size={size}></div>
    </>
  );
};

export default function EventHandlingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<Array<{event: string, data: string, timestamp: number}>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper function to add event to history
  const logEvent = (event: string, data: any) => {
    setEventHistory(prev => [
      { 
        event,
        data: typeof data === 'object' ? JSON.stringify(data) : String(data),
        timestamp: Date.now()
      },
      ...prev
    ].slice(0, 10)); // Keep only the 10 most recent events
  };

  // Initial connection check
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Use type assertion to tell TypeScript that passportInstance has a provider property
        const passport = passportInstance as any;
        if (passport?.provider) {
          const isAuthed = await passport.isAuthenticated();
          
          if (isAuthed) {
            const accounts = await passport.provider.request({ method: 'eth_accounts' });
            if (accounts?.length > 0) {
              setAccount(accounts[0]);
              setIsConnected(true);
              
              // Get chain ID
              const chainId = await passport.provider.request({ method: 'eth_chainId' });
              setChainId(chainId);
            }
          }
        }
      } catch (error) {
        console.error('Connection check error:', error);
        setErrorMessage(`Connection check error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkConnection();
  }, []);

  // Set up event listeners when component mounts
  useEffect(() => {
    // Use type assertion to tell TypeScript that passportInstance has a provider property
    const passport = passportInstance as any;
    if (!passport?.provider) {
      console.warn('Passport provider not available');
      return;
    }

    const provider = passport.provider;

    // Define event handlers
    const handleConnect = (connectInfo: any) => {
      console.log('Connected:', connectInfo);
      setIsConnected(true);
      logEvent('connect', connectInfo);
    };

    const handleDisconnect = (error: any) => {
      console.log('Disconnected:', error);
      setIsConnected(false);
      setAccount(null);
      setChainId(null);
      logEvent('disconnect', error?.message || 'Disconnected');
    };

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected their account
        setIsConnected(false);
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
      logEvent('accountsChanged', accounts);
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      setChainId(chainId);
      logEvent('chainChanged', chainId);
    };

    const handleMessage = (message: any) => {
      console.log('Message received:', message);
      logEvent('message', message);
    };

    // Add event listeners
    try {
      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('message', handleMessage);
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      setErrorMessage(`Error setting up event listeners: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Cleanup function to remove event listeners
    return () => {
      try {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('message', handleMessage);
      } catch (error) {
        console.error('Error cleaning up event listeners:', error);
      }
    };
  }, []); // Empty dependency array to only run once on mount

  // Handle login
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await passportInstance.login();
      logEvent('login', 'Login initiated');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(`Login error: ${error instanceof Error ? error.message : String(error)}`);
      logEvent('login-error', error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await passportInstance.logout();
      setIsConnected(false);
      setAccount(null);
      setChainId(null);
      logEvent('logout', 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setErrorMessage(`Logout error: ${error instanceof Error ? error.message : String(error)}`);
      logEvent('logout-error', error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle requesting a chain change
  const handleSwitchChain = async () => {
    // Use type assertion to tell TypeScript that passportInstance has a provider property
    const passport = passportInstance as any;
    if (!passport?.provider) return;
    
    try {
      // Switch between Testnet and Mainnet
      const targetChainId = chainId === '0x5' ? '0x1' : '0x5';
      
      await passport.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      logEvent('switchChain', `Requested switch to chain ${targetChainId}`);
    } catch (error) {
      console.error('Switch chain error:', error);
      setErrorMessage(`Switch chain error: ${error instanceof Error ? error.message : String(error)}`);
      logEvent('switchChain-error', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Stack direction="column" gap="large" alignItems="center" style={{ padding: '2rem', maxWidth: '800px' }}>
      <Heading size="xxLarge">Passport Event Handling Demo</Heading>
      
      <p>
        This page demonstrates how to listen for and respond to Passport events.
        Connect your wallet to see events in real-time.
      </p>

      {errorMessage && (
        <div style={{ 
          backgroundColor: '#FFEBEE', 
          color: '#B71C1C', 
          padding: '1rem', 
          borderRadius: '4px',
          width: '100%'
        }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <Stack direction="column" gap="medium" style={{ width: '100%' }}>
        <div style={{ 
          backgroundColor: '#F5F5F5', 
          padding: '1rem', 
          borderRadius: '4px', 
          width: '100%'
        }}>
          <h3>Connection Status</h3>
          <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          <p><strong>Account:</strong> {account || 'None'}</p>
          <p><strong>Chain ID:</strong> {chainId || 'None'}</p>
        </div>

        <Stack direction="row" gap="medium">
          {isLoading ? (
            <LoadingIndicator size="medium" />
          ) : isConnected ? (
            <>
              <Button variant="secondary" onClick={handleSwitchChain}>
                Switch Chain
              </Button>
              <Button variant="primary" onClick={handleLogout}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleLogin}>
              Connect with Passport
            </Button>
          )}
        </Stack>

        <div style={{ 
          backgroundColor: '#F5F5F5', 
          padding: '1rem', 
          borderRadius: '4px', 
          width: '100%',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3>Event History</h3>
          {eventHistory.length === 0 ? (
            <p>No events recorded yet. Connect your wallet to see events.</p>
          ) : (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {eventHistory.map((entry, index) => (
                <li key={`${entry.event}-${entry.timestamp}-${index}`} style={{ 
                  borderBottom: '1px solid #E0E0E0', 
                  padding: '0.5rem 0' 
                }}>
                  <strong>{entry.event}</strong> - {new Date(entry.timestamp).toLocaleTimeString()}
                  <pre style={{ 
                    backgroundColor: '#ECEFF1', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    overflowX: 'auto',
                    fontSize: '0.85rem'
                  }}>
                    {entry.data}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Stack>
    </Stack>
  );
} 