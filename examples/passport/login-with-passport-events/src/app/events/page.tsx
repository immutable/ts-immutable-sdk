'use client';

import { useState, useEffect } from 'react';
import { Button, Heading, Link, Table } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

// Local type definition for event logging
type EventLog = {
  eventType: string;
  timestamp: string;
  data?: any;
};

export default function EventHandlingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  
  // Function to log events
  const logEvent = (eventType: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEventLog: EventLog = {
      eventType,
      timestamp,
      data: data || null,
    };
    
    setEventLogs((prevLogs) => [newEventLog, ...prevLogs].slice(0, 10)); // Keep only the latest 10 logs
  };

  // Handler for login button
  const loginWithPassport = async () => {
    if (!passportInstance) return;
    
    try {
      logEvent('Login attempt started');
      
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        logEvent('Login completed', { address: accounts[0] });
      } else {
        setIsLoggedIn(false);
        logEvent('Login failed', { reason: 'No accounts returned' });
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
      logEvent('Login error', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  // Handler for logout button
  const logoutFromPassport = async () => {
    if (!passportInstance) return;
    
    try {
      logEvent('Logout attempt started');
      
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAccountAddress(null);
      
      logEvent('Logout completed');
    } catch (error) {
      console.error('Error during logout:', error);
      logEvent('Logout error', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  // Setting up event listeners
  useEffect(() => {
    if (!passportInstance) return;
    
    logEvent('Setting up event listeners');
    
    // Use type assertion to access internal properties
    const passport = passportInstance as any;
    
    const loginHandler = () => {
      logEvent('Login event detected');
      
      // After login event, check the current account
      if (passport.provider) {
        passport.provider.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setIsLoggedIn(true);
              setAccountAddress(accounts[0]);
              logEvent('Account detected after login', { address: accounts[0] });
            }
          })
          .catch((error: any) => {
            console.error('Error fetching accounts after login event:', error);
          });
      }
    };

    const logoutHandler = () => {
      logEvent('Logout event detected');
      setIsLoggedIn(false);
      setAccountAddress(null);
    };
    
    const accountsChangedHandler = (accounts: string[]) => {
      logEvent('Accounts changed', { accounts });
      
      if (accounts && accounts.length > 0) {
        setAccountAddress(accounts[0]);
      } else {
        setIsLoggedIn(false);
        setAccountAddress(null);
      }
    };
    
    // Add event listeners using the provider
    if (passport.provider) {
      passport.provider.on('connect', loginHandler);
      passport.provider.on('accountsChanged', accountsChangedHandler);
      passport.provider.on('disconnect', logoutHandler);
      
      // Check initial state
      passport.provider.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setIsLoggedIn(true);
            setAccountAddress(accounts[0]);
            logEvent('Initial account detected', { address: accounts[0] });
          }
        })
        .catch((error: any) => {
          console.error('Error fetching initial accounts:', error);
        });
    }
    
    // Clean up event listeners when component unmounts
    return () => {
      logEvent('Cleaning up event listeners');
      
      if (passport.provider) {
        passport.provider.removeListener('connect', loginHandler);
        passport.provider.removeListener('accountsChanged', accountsChangedHandler);
        passport.provider.removeListener('disconnect', logoutHandler);
      }
    };
  }, []);

  return (
    <div>
      <Heading size="medium" className="mb-1">
        Passport SDK Event Handling
      </Heading>
      
      <h2 className="mb-1">Authentication Status</h2>
      
      <div className="mb-1" style={{ display: 'flex', gap: '1rem' }}>
        <Button 
          onClick={loginWithPassport}
          disabled={isLoggedIn}
          size="medium"
        >
          Login with Passport
        </Button>
        
        <Button 
          onClick={logoutFromPassport}
          disabled={!isLoggedIn}
          size="medium"
        >
          Logout
        </Button>
      </div>
      
      <Table className="mb-1">
        <Table.Head>
          <Table.Row>
            <Table.Cell>Property</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Login Status</b></Table.Cell>
            <Table.Cell>{isLoggedIn ? 'Logged In' : 'Logged Out'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Account Address</b></Table.Cell>
            <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      
      <h2 className="mb-1">Event Log</h2>
      
      <Table className="mb-1">
        <Table.Head>
          <Table.Row>
            <Table.Cell>Time</Table.Cell>
            <Table.Cell>Event</Table.Cell>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {eventLogs.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>No events recorded yet. Try logging in or out.</Table.Cell>
            </Table.Row>
          ) : (
            eventLogs.map((log, index) => (
              <Table.Row key={index}>
                <Table.Cell>{log.timestamp}</Table.Cell>
                <Table.Cell>{log.eventType}</Table.Cell>
                <Table.Cell>{log.data ? JSON.stringify(log.data) : 'N/A'}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
      
      <Link rc={<NextLink href="/" />} className="mb-1">
        Return to Home
      </Link>
    </div>
  );
} 