'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Heading, Stack, Body, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupLogoutSilent';
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
      setChainId(''); // Clear chainId on disconnect
    } else {
      setAddress(accounts[0]);
      // Potentially fetch chainId again if needed, or assume it hasn't changed
    }
  }, [logEvent]);

  // Initialize provider on mount
  useEffect(() => {
    const fetchPassportProvider = async () => {
      // Check if user is already logged in
      const user = await passportInstance.getUserInfo();
      if (user) {
        const provider = await passportInstance.connectEvm();
        setProvider(provider);
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setAccountsState(accounts);
            logEvent('initial_accounts', { accounts });
            const chainId = await provider.request({ method: 'eth_chainId' });
            setChainId(chainId);
            logEvent('initial_chain_id', { chainId });
          }
        }
        setIsLoggedIn(true);
      } else {
        // Optionally connectEvm even if not logged in to set up listeners early
        // const provider = await passportInstance.connectEvm();
        // setProvider(provider);
      }
    };
    
    fetchPassportProvider();
  }, [logEvent]); // Added logEvent dependency

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
      logEvent('login_error', { message: error instanceof Error ? error.message : String(error) });
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
      setProvider(undefined); // Clear provider on logout
      logEvent('logout_success', {}); // Log successful logout
    } catch (error) {
      console.error('Logout error:', error);
      logEvent('logout_error', { message: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">Passport SDK - Event Handling Example</Heading>
      
      {/* Buttons Section */}
      
      {!isLoggedIn && (
        <Button 
          onClick={handleLogin} 
          disabled={loading}
          className="mb-1"
          size="medium"
        >
          Login {loading ? '...' : ''}
        </Button>
      )}
      {isLoggedIn && (
        <Button 
          onClick={handleLogout} 
          disabled={loading}
          className="mb-1"
          size="medium"
        >
          {loading ? 'Logging out...' : 'Logout'} 
        </Button>
      )}

      {/* State Data Table */}
      {(isLoggedIn || accountsState.length > 0) && (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Key</Table.Cell>
                <Table.Cell>Value</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell>{isLoggedIn ? 'Logged In' : 'Logged Out'}</Table.Cell>
              </Table.Row>
              {address && (
                <Table.Row>
                  <Table.Cell>Address</Table.Cell>
                  <Table.Cell><code>{address}</code></Table.Cell>
                </Table.Row>
              )}
              {chainId && (
                <Table.Row>
                  <Table.Cell>Chain ID</Table.Cell>
                  <Table.Cell><code>{chainId}</code></Table.Cell>
                </Table.Row>
              )}
               {accountsState.length > 0 && (
                <Table.Row>
                  <Table.Cell>Accounts ({accountsState.length})</Table.Cell>
                  <Table.Cell>
                    <div style={{ maxHeight: '100px', overflowY: 'auto'}}>
                      {accountsState.map((account, idx) => (
                        <div key={idx} style={{ marginBottom: "4px" }}>
                          <code>{account}</code> {idx === 0 && <span style={{ fontSize: "12px", color: "#666" }}>(active)</span>}
                        </div>
                      ))}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </>
      )}
      <br />
      {/* Event Log Section */}
      <>
        <Heading size="small">Event Log:</Heading>
        <div className="event-log" style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          width: '100%'
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
                  {/* Use a more distinct tag style */}
                  <span style={{ 
                    backgroundColor: '#e0e0e0', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {event.event}
                  </span>
                  <Body size="small" color="secondary">{event.timestamp}</Body>
                </Stack>
                <pre style={{ 
                  marginTop: '8px', 
                  overflow: 'auto',
                  fontSize: '12px',
                  backgroundColor: '#fff', // White background for pre
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #eee'
                }}>
                  {event.data}
                </pre>
              </div>
            ))
          )}
        </div>
      </>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
} 