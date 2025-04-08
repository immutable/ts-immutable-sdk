'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Heading, Stack, Body } from '@biom3/react';
import { passportInstance } from '../utils/setupLogoutSilent';
import { passport } from '@imtbl/sdk';
import { Provider, ProviderEvent } from '@imtbl/sdk/passport';


export default function EventHandlingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [provider, setProvider] = useState<Provider | undefined>(undefined);
  const [events, setEvents] = useState<Array<{event: string, data: string, timestamp: string}>>([]);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountsState, setAccountsState] = useState<string[]>([]);

  // Add a new event to the event log
  const logEvent = useCallback((eventName: string, data: any) => {
    setEvents(prev => [
      {
        event: eventName,
        data: JSON.stringify(data, null, 2),
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ].slice(0, 10)); // Keep only the last 10 events
  }, []);

  // Handler for accountsChanged event
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    console.log('accounts changed:', accounts);
    setAccountsState(accounts);
    logEvent(ProviderEvent.ACCOUNTS_CHANGED, { accounts });
    
    if (accounts.length === 0) {
      // User has disconnected their account
      setIsLoggedIn(false);
      setAddress('');
    } else {
      setAddress(accounts[0]);
    }
  }, [logEvent]);

  // Initialize provider on mount
  useEffect(() => {
    const fetchPassportProvider = async () => {
      const provider = await passportInstance.connectEvm();
      setProvider(provider);
    };
    
    fetchPassportProvider();
  }, []);

  // Set up accountsChanged event listener
  useEffect(() => {
    if (!provider) return;
    
    // Register event listener
    provider.on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
    
    // Log that event listener was registered
    logEvent('provider_event_registered', { event: ProviderEvent.ACCOUNTS_CHANGED });
    
    // Cleanup function to remove event listener
    return () => {
      provider.removeListener(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
    };
  }, [provider, handleAccountsChanged, logEvent]);

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
          setAccountsState(accounts);
          // Log the accounts change manually since the event might not fire
          logEvent(ProviderEvent.ACCOUNTS_CHANGED, { accounts });
        }
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
      }
      
      setIsLoggedIn(true);
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
      setAccountsState([]);
    } catch (error) {
      console.error('Logout error:', error);
      logEvent('logout_error', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current chain info
  const getChainInfo = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
    } catch (error) {
      console.error('Chain info error:', error);
      logEvent('chain_info_error', error);
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
        setAccountsState(accounts);
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
        
          <Button 
            onClick={requestAccounts}
            disabled={loading}
            variant="tertiary"
          >
            Request Accounts
          </Button>

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