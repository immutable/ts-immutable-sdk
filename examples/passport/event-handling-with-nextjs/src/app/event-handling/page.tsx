'use client';
import React, { useEffect, useState } from 'react';
import { Button, Heading, Stack, Text } from '@biom3/react';
import { passportInstance } from '../utils/setupDefault';
import Link from 'next/link';

export default function EventHandlingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [eventLogs, setEventLogs] = useState<{ type: string, data: string, timestamp: number }[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addEventLog = (type: string, data: string) => {
    setEventLogs(prevLogs => [
      { type, data, timestamp: Date.now() },
      ...prevLogs.slice(0, 19) // Keep only the 20 most recent logs
    ]);
  };
  
  // Function to handle connection
  const handleConnect = async () => {
    try {
      setLoading(true);
      // Use the login method to connect to Passport
      await passportInstance.login();
      setLoading(false);
    } catch (error) {
      console.error('Connection error:', error);
      addEventLog('error', `Connection error: ${error}`);
      setLoading(false);
    }
  };

  // Function to handle disconnection
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      // Use the logout method to disconnect from Passport
      await passportInstance.logout();
      setLoading(false);
    } catch (error) {
      console.error('Disconnection error:', error);
      addEventLog('error', `Disconnection error: ${error}`);
      setLoading(false);
    }
  };

  // Setup event listeners when the component mounts
  useEffect(() => {
    // Check if provider exists before setting up event listeners
    if (!passportInstance.provider) {
      console.warn('Provider not available');
      return;
    }

    // Setup listener for connection changes
    const handleConnectEvent = () => {
      setIsConnected(true);
      addEventLog('connect', 'Connected to Passport');
    };

    // Setup listener for disconnection
    const handleDisconnectEvent = () => {
      setIsConnected(false);
      setCurrentAccount(null);
      setCurrentChainId(null);
      addEventLog('disconnect', 'Disconnected from Passport');
    };

    // Setup listener for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      const account = accounts.length > 0 ? accounts[0] : null;
      setCurrentAccount(account);
      addEventLog('accountsChanged', `Accounts changed: ${accounts.join(', ')}`);
    };

    // Setup listener for chain changes
    const handleChainChanged = (chainId: string) => {
      setCurrentChainId(chainId);
      addEventLog('chainChanged', `Chain changed: ${chainId}`);
    };

    // Get initial connection state if provider exists
    if (passportInstance.provider.connected) {
      setIsConnected(true);
      
      // Try to get the current account and chain ID
      passportInstance.provider.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        })
        .catch(error => {
          console.error('Failed to get accounts:', error);
        });
        
      passportInstance.provider.request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          setCurrentChainId(chainId);
        })
        .catch(error => {
          console.error('Failed to get chain ID:', error);
        });
    }

    // Add event listeners
    try {
      passportInstance.provider.on('connect', handleConnectEvent);
      passportInstance.provider.on('disconnect', handleDisconnectEvent);
      passportInstance.provider.on('accountsChanged', handleAccountsChanged);
      passportInstance.provider.on('chainChanged', handleChainChanged);
      
      addEventLog('setup', 'Event listeners registered');
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      addEventLog('error', `Error setting up event listeners: ${error}`);
    }

    // Clean up event listeners when component unmounts
    return () => {
      try {
        if (passportInstance.provider) {
          passportInstance.provider.removeListener('connect', handleConnectEvent);
          passportInstance.provider.removeListener('disconnect', handleDisconnectEvent);
          passportInstance.provider.removeListener('accountsChanged', handleAccountsChanged);
          passportInstance.provider.removeListener('chainChanged', handleChainChanged);
          
          addEventLog('cleanup', 'Event listeners removed');
        }
      } catch (error) {
        console.error('Error cleaning up event listeners:', error);
      }
    };
  }, []);

  return (
    <div className="event-container">
      <Stack direction="column" gap="large">
        <Link href="/" passHref>
          <Button variant="secondary" size="small">Back to Home</Button>
        </Link>
        
        <Heading size="large">Immutable Passport Event Handling</Heading>
        
        <Stack direction="column" gap="medium">
          <Text variant="body1">
            This example demonstrates how to properly handle Passport events and manage connection state.
          </Text>
          
          <Stack direction="row" gap="small">
            <Text variant="body1">Connection Status:</Text>
            <Text variant="body1" style={{ fontWeight: 'bold', color: isConnected ? 'green' : 'red' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </Stack>
          
          {currentAccount && (
            <Stack direction="row" gap="small">
              <Text variant="body1">Current Account:</Text>
              <Text variant="body1" style={{ fontWeight: 'bold' }}>
                {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
              </Text>
            </Stack>
          )}
          
          {currentChainId && (
            <Stack direction="row" gap="small">
              <Text variant="body1">Current Chain ID:</Text>
              <Text variant="body1" style={{ fontWeight: 'bold' }}>
                {currentChainId}
              </Text>
            </Stack>
          )}
          
          <Stack direction="row" gap="medium">
            <Button 
              variant="primary" 
              onClick={handleConnect} 
              disabled={isConnected || loading}
            >
              {loading ? 'Connecting...' : 'Connect to Passport'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleDisconnect} 
              disabled={!isConnected || loading}
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </Stack>
          
          <Heading size="medium">Event Log</Heading>
          <div className="event-log">
            {eventLogs.length === 0 ? (
              <Text variant="body2">No events logged yet</Text>
            ) : (
              eventLogs.map((log, index) => (
                <div key={index} className="event-item">
                  <Text variant="body2">
                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.type}: {log.data}
                  </Text>
                </div>
              ))
            )}
          </div>
        </Stack>
      </Stack>
    </div>
  );
} 