'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, Stack, Body, Badge } from '@biom3/react';
import { passportInstance } from '../utils/setupDefault';
import { passport } from '@imtbl/sdk';

// Define the event constants as specified in Immutable documentation
const ProviderEvent = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message'
};

export default function EventHandlingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [events, setEvents] = useState<Array<{event: string, data: string, timestamp: string}>>([]);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountsState, setAccountsState] = useState<string[]>([]);
  // Add a new event to the event log
  const logEvent = (eventName: string, data: any) => {
    // Get a readable event name for display
    let displayEventName = eventName;
    
    // Map enum constants to readable names if needed
    if (eventName === ProviderEvent.ACCOUNTS_CHANGED) displayEventName = 'accountsChanged';
    if (eventName === ProviderEvent.CHAIN_CHANGED) displayEventName = 'chainChanged';
    if (eventName === ProviderEvent.CONNECT) displayEventName = 'connect';
    if (eventName === ProviderEvent.DISCONNECT) displayEventName = 'disconnect';
    if (eventName === ProviderEvent.MESSAGE) displayEventName = 'message';
    
    setEvents(prev => [
      {
        event: displayEventName,
        data: JSON.stringify(data, null, 2),
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ].slice(0, 10)); // Keep only the last 10 events
  };

  // Check login status on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userProfile = await passportInstance.getUserInfo();
        if (userProfile) {
          setIsLoggedIn(true);
          
          // Get provider and user info
          const provider = await passportInstance.connectEvm();
          setProvider(provider);
          
          if (provider) {
            // Get accounts
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              // Keep accountsState in sync
              setAccountsState(accounts);
            }
            
            // Get chain ID
            const chainId = await provider.request({ method: 'eth_chainId' });
            setChainId(chainId);
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, []);

  // Setup event listeners when provider is available
  useEffect(() => {
    if (!provider) return;
    
    const handleConnect = (connectInfo: any) => {
      logEvent('connect', connectInfo);
      setIsLoggedIn(true);
    };
    
    const handleDisconnect = (error: any) => {
      logEvent('disconnect', error);
      setIsLoggedIn(false);
      setAddress('');
      setChainId('');
    };
    
    const handleChainChanged = (chainId: string) => {
      logEvent('chainChanged', { chainId });
      setChainId(chainId);
      
      // Optional: Reload the page when chain changes to ensure all state is fresh
      // window.location.reload();
    };
    
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('accounts', accounts);
      setAccountsState(accounts);
      logEvent('accountsChanged', { accounts });
      if (accounts.length === 0) {
        // User has disconnected their account
        setIsLoggedIn(false);
        setAddress('');
      } else {
        setAddress(accounts[0]);
      }
    };
    
    const handleMessage = (message: any) => {
      logEvent('message', message);
    };
    
    // Register event listeners using ProviderEvent enum from SDK
    provider.on(ProviderEvent.CONNECT, handleConnect);
    provider.on(ProviderEvent.DISCONNECT, handleDisconnect);
    provider.on(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
    provider.on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
    provider.on(ProviderEvent.MESSAGE, handleMessage);
    
    // Log that event listeners were registered
    logEvent('listeners_registered', { 
      events: [
        ProviderEvent.CONNECT,
        ProviderEvent.DISCONNECT,
        ProviderEvent.CHAIN_CHANGED,
        ProviderEvent.ACCOUNTS_CHANGED,
        ProviderEvent.MESSAGE
      ]
    });
    
    // Cleanup function to remove event listeners
    return () => {
      if (provider) {
        provider.removeListener(ProviderEvent.CONNECT, handleConnect);
        provider.removeListener(ProviderEvent.DISCONNECT, handleDisconnect);
        provider.removeListener(ProviderEvent.CHAIN_CHANGED, handleChainChanged);
        provider.removeListener(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
        provider.removeListener(ProviderEvent.MESSAGE, handleMessage);
      }
    };
  }, [provider]); // Only re-run when provider changes

  // Handle login
  const handleLogin = async () => {
    try {
      setLoading(true);
      await passportInstance.login();
      
      // After login, get the provider
      const provider = await passportInstance.connectEvm();
      setProvider(provider);
      
      if (provider) {
        // Get accounts
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          // Manually update accountsState since the event might not fire during initial login
          setAccountsState(accounts);
          
          // Manually log the accounts information as if the event fired
          logEvent(ProviderEvent.ACCOUNTS_CHANGED, { accounts });
        }
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
      }
      
      setIsLoggedIn(true);
      logEvent('login', { success: true });
    } catch (error) {
      console.error('Login error:', error);
      logEvent('login_error', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAddress('');
      setChainId('');
      // Clear accounts state on logout
      setAccountsState([]);
      logEvent('logout', { success: true });
    } catch (error) {
      console.error('Logout error:', error);
      logEvent('logout_error', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger a custom event (switch chain request)
  const requestChainSwitch = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      // Request to switch to Ethereum mainnet (chain ID 0x1)
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
      logEvent('request_chain_switch', { chainId: '0x1' });
    } catch (error) {
      console.error('Chain switch error:', error);
      logEvent('chain_switch_error', error);
    } finally {
      setLoading(false);
    }
  };

  // Manually request accounts
  const requestAccounts = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      logEvent('request_accounts', { accounts });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error('Request accounts error:', error);
      logEvent('request_accounts_error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="space.large">
      <Heading>Passport SDK - Event Handling Example</Heading>
      
      <Stack gap="space.medium">
        <Body>Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</Body>
        
        {isLoggedIn && address && (
          <Stack gap="space.small">
            <Body weight="bold">Connected Account:</Body>
            <code>{address}</code>
          </Stack>
        )}
        
        {isLoggedIn && chainId && (
          <Stack gap="space.small">
            <Body weight="bold">Chain ID:</Body>
            <code>{chainId}</code>
          </Stack>
        )}
        {accountsState && accountsState.length > 0 && (
          <Stack gap="space.small">
            <Body weight="bold">Accounts:</Body>
            <div>
              {accountsState.map((account, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  <code>{account}</code> {idx === 0 && <span style={{ fontSize: "12px", color: "#666" }}>(active)</span>}
                </div>
              ))}
            </div>
          </Stack>
        )}
      </Stack>
      
      <Stack direction="row" gap="space.medium">
        <Button 
          onClick={handleLogin} 
          disabled={isLoggedIn || loading}
        >
          Login {loading && !isLoggedIn ? '...' : ''}
        </Button>
        <Button 
          onClick={handleLogout} 
          disabled={!isLoggedIn || loading}
          variant="secondary"
        >
          Logout {loading && isLoggedIn ? '...' : ''}
        </Button>
      </Stack>
      
      {isLoggedIn && (
        <Stack direction="row" gap="space.medium">
          <Button 
            onClick={requestChainSwitch}
            disabled={loading}
            variant="tertiary"
          >
            Switch to Ethereum Chain
          </Button>
          <Button 
            onClick={requestAccounts}
            disabled={loading}
            variant="tertiary"
          >
            Request Accounts
          </Button>
        </Stack>
      )}

      <Stack gap="space.medium">
        <Heading size="small">Event Log:</Heading>
        <div className="event-log" style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px'
        }}>
          {events.length === 0 ? (
            <Body>No events logged yet</Body>
          ) : (
            events.map((event, index) => (
              <div key={index} style={{ 
                marginBottom: '12px', 
                padding: '8px', 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px' 
              }}>
                <Stack direction="row" gap="space.xsmall" alignItems="center">
                  <div className="event-tag">{event.event}</div>
                  <Body size="small" color="secondary">{event.timestamp}</Body>
                </Stack>
                <pre style={{ 
                  marginTop: '4px', 
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {event.data}
                </pre>
              </div>
            ))
          )}
        </div>
      </Stack>
    </Stack>
  );
} 